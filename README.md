# Handoff: MerchanTFile Web App (Variation B — Guided Wizard)

A document-merge tool that fills a template with rows from an Excel spreadsheet and outputs a print-ready PDF. Built for internal admin staff in an ASP.NET MVC 5 (.NET Framework 4.7.2) codebase.

---

## ⚠️ About the design files

The files under `prototype/` are **HTML/React design references** showing the intended look-and-feel and user flow. They are **not** production code to copy directly.

Your task is to **recreate these designs as Razor views (`.cshtml`) inside the existing ASP.NET MVC 5 project** at `https://github.com/barnimd/MerchanTFile`, using the codebase's existing libraries:

- **Bootstrap 5.2.3** (already in `Content/`) — use Bootstrap's grid, cards, forms, modals, buttons. The prototype uses custom CSS but every layout maps cleanly to Bootstrap utilities.
- **jQuery 3.7.0** (already in `Scripts/`) — use for client-side interactions (drag-drop, AJAX uploads, preview pagination).
- **Razor + C# controllers** — server-side flow.

You may also add **one new NuGet package each** for Excel reading and PDF generation (see "Backend implementation" below).

## Fidelity

**High-fidelity.** Colors, spacing, typography, and interactions are final. Reproduce the layouts in Bootstrap as closely as you can. The font (`Geist` / `Geist Mono`) is loaded from Google Fonts — keep it.

---

## What the app does

1. **Admin uploads a template file** (a PDF or Word document) that contains placeholders like `{{name}}` and `{{nik}}` where data should be inserted.
2. **Admin uploads an Excel file** with two columns: `Full Name` and `NIK` (Indonesian national ID card number).
3. **The system reads each row** of the Excel, generates one PDF page per row by replacing the placeholders with that row's values.
4. **Admin previews** the merged pages before downloading.
5. **Admin downloads** a single multi-page PDF (one page per row) and prints it.

A 5-row Excel produces a 5-page PDF.

---

## Tech stack & where things go

The repo already has:

```
MerchantFile.sln
MerchantFile.csproj                 (.NET Framework 4.7.2, MVC 5.2.9)
App_Start/                          BundleConfig, FilterConfig, RouteConfig
Content/                            Bootstrap 5.2.3 + Site.css
Controllers/HomeController.cs       Index / About / Contact
Scripts/                            jQuery 3.7.0 + Bootstrap 5 bundle
Views/Home/                         Index.cshtml, About.cshtml, Contact.cshtml
Views/Shared/_Layout.cshtml         Master layout
```

### Files you'll add or change

```
Controllers/
  HomeController.cs                 ← keep, modify Index to redirect or be the new Home
  GenerateController.cs             ← NEW — wizard steps + file uploads + preview + download

Models/
  GenerateJobViewModel.cs           ← NEW — holds uploaded files, parsed rows, job id
  ExcelRow.cs                       ← NEW — { string FullName; string Nik; }
  RecentJob.cs                      ← NEW — for dashboard list

Services/                           ← NEW folder
  IExcelReader.cs / ExcelReader.cs  ← NEW — reads .xlsx → IEnumerable<ExcelRow>
  IPdfGenerator.cs / PdfGenerator.cs ← NEW — fills template, returns byte[]
  IJobStore.cs / JobStore.cs        ← NEW — saves uploaded files + generated PDFs to App_Data/jobs/<jobId>/

Views/
  Shared/_Layout.cshtml             ← MODIFY — see "Layout" below
  Home/Index.cshtml                 ← REPLACE — landing page (see "Screen 1")
  Generate/                         ← NEW folder
    Wizard.cshtml                   ← NEW — the 4-step wizard shell (see "Screen 2-5")
    _StepTemplate.cshtml            ← NEW — partial, step 1
    _StepData.cshtml                ← NEW — partial, step 2
    _StepPreview.cshtml             ← NEW — partial, step 3
    _StepDone.cshtml                ← NEW — partial, step 4
    _DataTable.cshtml               ← NEW — partial, Excel data preview
    _DocPage.cshtml                 ← NEW — partial, the filled template preview

Content/
  site.css                          ← MODIFY — add custom tokens (see "Design Tokens")

App_Data/jobs/                      ← NEW — runtime storage for uploaded files + outputs
```

---

## Backend implementation

### NuGet packages to add

```powershell
Install-Package ClosedXML            # Reads .xlsx — works on .NET Framework 4.7.2
Install-Package itext7               # PDF generation + AcroForm field filling (AGPL — use only if you accept the license)
# OR
Install-Package PdfSharp             # MIT — simpler, no AcroForm filling
Install-Package MigraDoc.Rendering   # MIT — companion for richer layout
```

**Recommended pairing:** **ClosedXML** + **iText7**. ClosedXML is the cleanest Excel reader for .NET Framework. iText7 lets you either (a) fill AcroForm field names if the template is a true PDF form, or (b) do text replacement on raw PDF content streams. If iText's AGPL license is a blocker, swap to **PdfSharp + MigraDoc** and have admins author templates in MigraDoc-friendly markup, or use **DocX** + **LibreOffice headless** for Word templates.

### Template strategy — pick ONE

The design assumes **option A** (text-placeholder substitution). It's the simplest workflow for admin staff and matches the prototype's hint copy.

| Strategy | Template format | How sub works | Library |
|---|---|---|---|
| **A. Text placeholders** ⭐ | PDF or DOCX with `{{name}}` `{{nik}}` typed inline | Read template bytes, find/replace placeholder strings | iText7 (PDF) or DocX (Word) |
| B. PDF AcroForm fields | PDF with named form fields `name`, `nik` | Set field values, flatten | iText7 |
| C. Razor → HTML → PDF | A `.cshtml` template per document type | Render Razor with model, convert HTML to PDF | RazorEngine + DinkToPdf / PuppeteerSharp |

If you go with **A**:
- Read template into memory once per job.
- For each Excel row, clone the bytes, run `Regex.Replace(content, @"\{\{name\}\}", row.FullName)`, append to a master PDF (iText7's `PdfMerger`).
- Output one PDF file with N pages.

### Excel reading (ClosedXML)

```csharp
public IEnumerable<ExcelRow> Read(Stream xlsxStream)
{
    using (var wb = new XLWorkbook(xlsxStream))
    {
        var ws = wb.Worksheets.First();
        // Header row is row 1; find columns by name (case-insensitive)
        var headerRow = ws.Row(1);
        int nameCol = FindCol(headerRow, "Full Name", "Nama", "Nama Lengkap");
        int nikCol  = FindCol(headerRow, "NIK", "Card ID", "ID");
        var rows = ws.RowsUsed().Skip(1);
        foreach (var r in rows)
        {
            yield return new ExcelRow
            {
                FullName = r.Cell(nameCol).GetString().Trim(),
                Nik      = r.Cell(nikCol).GetString().Trim()
            };
        }
    }
}
```

Validation rules to enforce:
- `FullName` not empty.
- `Nik` is exactly 16 digits (Indonesian KTP/NIK format).
- Surface row-level errors back to step 2 ("Row 3 — NIK must be 16 digits").

### Controller actions (sketch)

```csharp
public class GenerateController : Controller
{
    public ActionResult Wizard(int step = 1, string jobId = null) { ... }

    [HttpPost]
    public ActionResult UploadTemplate(HttpPostedFileBase file)
    {
        // Save to App_Data/jobs/<newJobId>/template.{ext}
        // Detect placeholders, return JSON { jobId, placeholders: ["name","nik"] }
    }

    [HttpPost]
    public ActionResult UploadExcel(string jobId, HttpPostedFileBase file)
    {
        // Save to App_Data/jobs/<jobId>/data.xlsx
        // Read + validate via IExcelReader
        // Return JSON { rows: [...], errors: [...] }
    }

    public ActionResult PreviewPage(string jobId, int page)
    {
        // Render single page as PNG or inline PDF
        return File(bytes, "image/png");
    }

    public ActionResult Download(string jobId)
    {
        var bytes = _pdf.GenerateAll(jobId);
        return File(bytes, "application/pdf", $"{jobId}.pdf");
    }
}
```

The wizard can be a single Razor page that swaps partials based on `step`, with jQuery + AJAX driving the file uploads so the user doesn't lose state between steps. Alternatively, server-render each step at `/Generate/Wizard/1`, `/2`, etc. and persist `jobId` in `TempData` or a hidden field.

---

## Design tokens

Add these to `Content/site.css` (or a new `Content/merchantfile.css`):

```css
:root {
  --mf-accent: #1E40AF;           /* Primary blue — buttons, links, focus */
  --mf-accent-12: #1E40AF1F;      /* 12% tint — hover backgrounds, badges */
  --mf-accent-08: #1E40AF14;      /* 8%  tint — active-nav backgrounds */
  --mf-accent-06: #1E40AF0F;      /* 6%  tint — drop-zone hover */

  --mf-ink:        #0F172A;       /* slate-900 — primary text */
  --mf-ink-muted:  #475569;       /* slate-600 — secondary text */
  --mf-ink-faint:  #64748B;       /* slate-500 — captions, helper text */
  --mf-ink-soft:   #94A3B8;       /* slate-400 — placeholders, disabled */

  --mf-bg:         #FFFFFF;       /* card surfaces */
  --mf-bg-app:     #FBFCFD;       /* page background under wizard */
  --mf-bg-soft:    #F8FAFC;       /* table headers, footers */
  --mf-bg-tint:    #F1F5F9;       /* search input, badges */

  --mf-border:     #E2E8F0;       /* card borders, dividers */
  --mf-border-soft:#F1F5F9;       /* row dividers inside cards */

  --mf-success:    #16A34A;
  --mf-success-bg: #DCFCE7;
  --mf-danger:     #DC2626;
  --mf-danger-bg:  #FEE2E2;
  --mf-info:       #0369A1;
  --mf-info-bg:    #F0F9FF;
  --mf-info-border:#BAE6FD;

  --mf-radius-sm: 6px;
  --mf-radius-md: 8px;
  --mf-radius-lg: 10px;
  --mf-radius-xl: 12px;

  --mf-shadow-card: 0 1px 0 rgba(15,23,42,0.04);

  --mf-font-sans: 'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mf-font-mono: 'Geist Mono', ui-monospace, 'SFMono-Regular', monospace;
}

body {
  font-family: var(--mf-font-sans);
  color: var(--mf-ink);
  background: var(--mf-bg-app);
  -webkit-font-smoothing: antialiased;
}

code, .mf-mono { font-family: var(--mf-font-mono); }
```

In `_Layout.cshtml`, add the Google Fonts link in `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type scale

| Use | size / weight | example |
|---|---|---|
| Page title (H1)        | 30px / 600 / -0.6 tracking | "Fill your template…" |
| Section title (H2)     | 22px / 600 / -0.4          | "Upload your template" |
| Card title             | 16px / 600                 | "Recent activity" |
| Body                   | 14px / 400                 | paragraphs |
| Small / meta           | 12-13px / 400-500          | helper text |
| Caption / uppercase    | 11px / 500 / 0.6 tracking  | "DATA PREVIEW" |
| Monospace (NIK, IDs)   | 13px / Geist Mono / 1 letter-spacing | NIK numbers, JOB-0142 |

### Spacing

8-point grid: `4 · 8 · 12 · 16 · 20 · 24 · 28 · 36 · 48`. Cards use 16-24px padding. Page gutters: 36px desktop.

---

## Layout (`_Layout.cshtml`)

Replace the boilerplate Bootstrap navbar with a slim 60px header:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [Logo] MerchanTFile · Document generator       [Home] [New job]    [Hist] │
│                                                                  [Avatar] │
├───────────────────────────────────────────────────────────────────────────┤
│ @RenderBody()                                                             │
└───────────────────────────────────────────────────────────────────────────┘
```

- Header: white, 1px bottom border `#E2E8F0`, padding `0 36px`.
- Logo: 28×28 rounded square in `--mf-accent`, white "M" + dot inside (see `I.Logo` in `prototype/shared.jsx`).
- Nav items: 13px, 500 weight; active state = inset 2px bottom border in `--mf-accent` + 600 weight.
- Avatar: 32×32 circle, `--mf-accent` background, white initials.

---

## Screen 1 — Home / Dashboard (`Views/Home/Index.cshtml`)

**Path:** `/` (or `/Home/Index`)

**Purpose:** Landing page. Explains what the tool does and lets the admin start a new job or revisit a recent one.

**Layout:** Centered column, `max-width: 920px`, page padding `48px 36px 56px`.

### 1a. Hero card

A single white card, `border-radius: 12px`, `border: 1px solid #E2E8F0`, padding 36px. Inside:

- Small pill badge top-left: background `#1E40AF10`, color `--mf-accent`, text "✦ Excel → PDF in three steps", 11px font, 4×10px padding, 999px radius.
- **H1**: "Fill your template with spreadsheet data, page by page." — 30px / 600 / -0.6 tracking / 1.15 line-height, max-width 540px.
- **Sub**: "Upload a template, drop in an Excel file, preview the result, then download a print-ready PDF — one page per row." — 15px / `--mf-ink-muted` / 1.5.
- **Buttons row**:
  - Primary: "Start a new job" → `/Generate/Wizard?step=1`. Solid `--mf-accent`, 44px tall, 22px horizontal padding, → icon right.
  - Secondary: "How it works" — opens a modal explaining placeholder templates (see "Help modal" below).
- **Background accent**: radial gradient `radial-gradient(circle at 70% 50%, #1E40AF15, transparent 60%)` on a 280px right strip — purely decorative.

### 1b. Three step cards (3-column grid, 14px gap, 24px below hero)

Each card: white, 10px radius, 1px border, 20px padding. Inside each:

| # | Title | Description | Icon |
|---|---|---|---|
| 01 | Upload template | "A PDF or Word file with placeholders for Name and NIK." | document text |
| 02 | Drop your Excel | "Two columns: Full Name and NIK. Each row becomes one page." | spreadsheet |
| 03 | Preview & download | "Check the result, then save the full PDF in one click." | download arrow |

Card header row: icon in a 36×36 rounded square (`--mf-accent-12` bg, `--mf-accent` foreground) on the left, mono "0N" number on the right (11px / 600 / `--mf-ink-soft`).

### 1c. Recent activity table

Section header (16px / 600 "Recent activity") + "View all" link (12px / 500 / `--mf-accent`) → `/Generate/History`.

Wrapper: white card, 10px radius, 1px border.

Each row: 14px×18px padding, flex with `gap: 16px`. Top border on rows 2+.

- **Status pill**: 34×34 rounded square. Success: `#DCFCE7` bg, `#16A34A` ✓ icon. Failed: `#FEF2F2` bg, `#DC2626` ✕ icon.
- **Middle**: filename (13.5px / 500), then `{rows} rows · {jobId}` (12px / muted).
- **Right**: relative timestamp ("2 hours ago", 12px muted).
- **Action**: ghost button "Re-download" (13px) with download icon.

Sample data (see `RecentJobs` in `prototype/shared.jsx`):

| JobId | File | Rows | Status | When |
|---|---|---|---|---|
| JOB-0142 | pendaftaran_jan_2026.xlsx | 24 | completed | 2 hours ago |
| JOB-0141 | anggota_baru_q4.xlsx | 87 | completed | Yesterday |
| JOB-0140 | data_peserta_seminar.xlsx | 12 | completed | 2 days ago |
| JOB-0139 | registration_form.xlsx | 56 | completed | 3 days ago |

---

## Screen 2 — Wizard shell (`Views/Generate/Wizard.cshtml`)

**Path:** `/Generate/Wizard?step={1-4}&jobId={guid}`

**Purpose:** The 4-step focused flow. Admin completes one step at a time.

### Stepper bar (top, full width)

- Background: white, `border-bottom: 1px solid #E2E8F0`.
- Inner: `max-width: 920px`, padding `24px 36px`.
- 4 step nodes evenly spaced, connected by a 2px horizontal line.

Each node = vertical stack:
- **Circle** (32×32, 999px radius):
  - Completed (i < currentStep): solid `--mf-accent` background, white check icon.
  - Active (i == currentStep): white background, `--mf-accent` text, `2px solid --mf-accent` border.
  - Upcoming (i > currentStep): white background, `--mf-ink-soft` text, `2px solid #E2E8F0` border.
- **Label** (12.5px, weight 500 normally / 600 active): "Template", "Data", "Preview", "Download".
- **Sub-label** (11px, `--mf-ink-soft`): "PDF or Word", "Excel file", "Check pages", "Save PDF".

Connector line between nodes: 2px tall, gray normally, `--mf-accent` once that step is past.

### Step container

Below the stepper: padding `32px 36px 56px`, centered `max-width: 720px`.

Each step has:
1. **Step header** (`<StepHeader>` in prototype):
   - H2 title (22px / 600 / -0.4 tracking)
   - Subtitle (14px / muted / 1.5)
2. **White card** (`border-radius: 12px`, `border: 1px solid #E2E8F0`, padding 28px) containing the step's body.
3. **Footer row** below the card, `margin-top: 22px`, flex `justify-content: space-between`:
   - Left: secondary/back button.
   - Right: primary forward button (disabled until valid).

---

## Screen 3 — Step 1: Upload template

**Step header:** "Upload your template" / "The document we'll fill in for each row. Add placeholders like `{{name}}` and `{{nik}}` where the data should go."

**Card body — empty state (drop zone):**

A large clickable region, full width, 44px vertical padding, centered content stack with 12px gap:
- 64×64 circle, `#F1F5F9` bg, `--mf-ink-muted` icon (document); on hover → `--mf-accent-12` bg + `--mf-accent` icon.
- Title "Drop your template here" — 16px / 600.
- Subtitle "Or click to browse — PDF or Word, up to 10 MB" — 13px / muted.
- Outline button "Browse files" — white bg, 1px border, 8×16px padding, ↑ upload icon.

Border: `2px dashed #CBD5E1`. On hover: dashed border becomes `--mf-accent`, background becomes `--mf-accent-06`. 200ms transition on all.

**Card body — uploaded state:**

A "FilePill" row (84px tall, `#F8FAFC` background, 1px border, 10px radius, 16px padding, flex `gap: 14px`):
- Icon tile: 44×44, white bg, 1px border, 8px radius, `--mf-accent` icon (document).
- Middle: filename (14px / 600), then "184 KB · 1 page · 2 placeholders found" (12px / muted).
- Success badge ("Uploaded", green tone).
- Remove button: 32×32 transparent, `--mf-ink-soft` trash icon.

Below the pill, an **info banner** (margin-top: 18px, 14px padding, `--mf-info-bg`, 1px `--mf-info-border`, 8px radius, flex):
- Blue info icon (✓ in circle) on the left.
- Text: "We detected **2 placeholders** in your template: `{{name}}` and `{{nik}}`. Make sure your Excel has matching column names." Inline code uses white bg + light-blue border.

**Footer buttons:**
- Secondary "Cancel" (ghost) → returns to home.
- Primary "Continue →" (disabled until file uploaded) → step 2.

---

## Screen 4 — Step 2: Upload Excel data

**Step header:** "Upload your Excel data" / "Each row generates one PDF page. We'll match column names to template placeholders."

**Card body — empty state:** Same drop zone pattern as step 1, but with a spreadsheet icon, title "Drop your spreadsheet here", subtitle ".xlsx, .xls, or .csv — up to 10 MB".

**Card body — uploaded state:**

1. **File pill** (same component, with the spreadsheet icon and "32 KB · Sheet1 · 5 rows").
2. **Data preview** (margin-top: 18px):
   - Header row: small caption "DATA PREVIEW" (12px / uppercase / 0.6 tracking / muted) on left, green badge "All 5 rows valid" on right.
   - Table: 1px border, 8px radius wrapper, full width.
     - Header row: `#F8FAFC` background, columns `#`, `Full Name`, `NIK`. Each header right of `#` has an inline tag showing the placeholder mapping — e.g. "Full Name → `{{name}}`" where the arrow tag is a small 10px pill in `--mf-accent-12` bg / `--mf-accent` text.
     - Body rows: 10px×14px padding, 1px top border per row. `#` column is mono / muted. Name column is 500 weight. NIK column is mono with 1px letter-spacing.

**Sample rows** (use as seed data for testing):

| # | Full Name | NIK |
|---|---|---|
| 1 | Ahmad Saputra | 3201234567890123 |
| 2 | Siti Rahmawati | 3201234567890124 |
| 3 | Budi Hartono | 3275019876543210 |
| 4 | Dewi Lestari | 3273011122334455 |
| 5 | Andi Wijaya | 3174051122334477 |

**Footer buttons:**
- Secondary "← Back" → step 1.
- Primary "Generate preview →" → step 3.

---

## Screen 5 — Step 3: Preview pages

**Step header:** "Preview your output" / "5 pages ready. Click any thumbnail to inspect."

**Two-column grid** (`grid-template-columns: 180px 1fr`, 14px gap):

### Left column — thumbnail rail
Vertical stack, 8px gap. One button per page:
- Container: 6px padding, 8px radius, `2px solid` border. Default border `#E2E8F0`; selected border `--mf-accent`.
- Content: flex with 8px gap.
  - 56×84px miniature of the filled page (see "Document preview component" below) on the left.
  - Right: "P.N" mono / muted on top (11px), then the row's name (12px / 500, truncated).

### Right column — main preview card

White, 12px radius, 1px border, 24px padding.

- **Top toolbar** (flex, space-between, margin-bottom: 16px):
  - Left: `[←]  3 of 5  [→]` — 28×28 outline buttons (1px border, 6px radius, white bg), with mono page counter between them.
  - Right: "**{name}** · {nik}" — name 500 weight, separator dot, NIK in mono.
- **Preview area**: `#F8FAFC` background, 8px radius, 12px padding, centered. Contains the rendered page at 340px wide (see component below).

**Footer buttons:**
- Secondary "← Back" → step 2.
- Primary "Download 5-page PDF" with ↓ download icon → step 4 + triggers download.

---

## Screen 6 — Step 4: Done

**Centered column**, top padding 20px.

1. **Success badge**: 64×64 circle, `#DCFCE7` bg, `#16A34A` ✓ icon centered.
2. **H2** "All done!" — 24px / 600 / -0.4 tracking.
3. **Subtitle** "Your PDF is ready — 5 pages, 1.2 MB." — 14px / muted.
4. **File card** (max-width 460px, 12px radius, 18px padding, flex with 14px gap):
   - 44×44 red-tinted PDF icon (`#FEF2F2` bg, `#DC2626` icon).
   - Filename (14px / 600) + meta "5 pages · saved to Downloads" (12px / muted).
   - Primary "Open" button.
5. **Footer buttons row** (28px top, centered, 10px gap):
   - Secondary "Back to home" → `/`.
   - Ghost "+ Start another" → resets wizard to step 1.

---

## Document preview component

The mini-rendered page used both as thumbnails and in the main preview. Implement as a Razor partial `_DocPage.cshtml` that takes `(string name, string nik, int pageIndex, int total, int width)` and scales internally — every dimension is a fraction of `width`.

**Aspect ratio:** A4 portrait (`height = width × 297 / 210`).

**Composition** (see `DocPage` in `prototype/shared.jsx` for exact math):

1. **Header band** — `--mf-accent` background, height = 14% of width. Inside, white "REGISTRATION FORM" label + a small white square icon on the left, mono "NO. 0001" form number on the right.
2. **Body** (padding = 8% of width):
   - Intro line "Please verify the following information and sign at the bottom of the page." — 2.8% of width font / muted.
   - Four labeled fields:
     - **Full Name** — value from row, 3.4% font, 600 weight, solid dark gray underline.
     - **NIK (Card ID)** — mono, 1px letter-spacing, 600 weight, solid underline.
     - **Date of Issue** — placeholder "—", light gray, dashed underline.
     - **Place** — placeholder "—", light gray, dashed underline.
   - Field labels are uppercase, 2.2% font, 0.6 tracking, muted.
3. **Consent box** — `#F8FAFC` background, left border 2px in `--mf-accent`, 2.4% font, muted, 0.5×pad padding.
4. **Two signature lines** at bottom — flex row, 1px solid `#CBD5E1` underlines, "Applicant signature" / "Authorized officer" captions.
5. **Footer pagination** — mono, 2% font, `--mf-ink-soft`: "MerchanTFile · auto-generated" left, "Page N of M" right.

The same component renders the final filled PDF (at PDF resolution) and the on-screen previews (smaller widths). You can either:
- Render the partial server-side to HTML, then snapshot via PuppeteerSharp / DinkToPdf, or
- Re-implement the same layout in iText7 using its layout API.

---

## Buttons (Bootstrap-compatible)

The prototype defines four button styles. Map them to Bootstrap with a couple of `.mf-btn-*` overrides:

| Style | Background | Text | Border | Usage |
|---|---|---|---|---|
| `.btn-mf-primary`   | `--mf-accent` | `#fff` | `1px solid --mf-accent` | Primary actions |
| `.btn-mf-secondary` | `#fff` | `--mf-ink` | `1px solid --mf-border` | Cancel, back |
| `.btn-mf-ghost`     | transparent | `--mf-ink-muted` | none | "View all", subtle actions |
| `.btn-mf-danger`    | `#fff` | `#DC2626` | `1px solid #FECACA` | Destructive |

Sizes:
- `sm`: 6×12px padding, 12px font, 28px tall.
- `md` (default): 8×16px padding, 13px font, 36px tall.
- `lg`: 12×22px padding, 14px font, 44px tall.

All buttons: 6px radius, 500 weight, `gap: 8px`, inline-flex for icon support.

---

## Badges

Small inline pills, 2×8px padding, 999px radius, 11px font, 500 weight, with a 6×6 dot prefix.

| Tone | Background | Text color | Dot |
|---|---|---|---|
| success | `#DCFCE7` | `#15803D` | `#22C55E` |
| failed  | `#FEE2E2` | `#B91C1C` | `#EF4444` |
| pending | `#FEF3C7` | `#A16207` | `#EAB308` |
| info    | `#DBEAFE` | `#1E40AF` | `#3B82F6` |
| neutral | `#F1F5F9` | `#475569` | `#94A3B8` |

---

## Help modal — "How it works"

Triggered from "How it works" on the home page. Bootstrap modal, 560px wide. Title: "Preparing your template". Body: a 3-step illustrated explainer:

1. **Open your template** in Word or your PDF editor.
2. **Type `{{name}}` and `{{nik}}`** where the data should go. Curly braces are mandatory.
3. **Save and upload.** MerchanTFile finds the placeholders and replaces them on each page.

Below the steps, show a tiny rendered example: "Hello, **{{name}}**. Your ID is **{{nik}}**." → "Hello, **Ahmad Saputra**. Your ID is **3201234567890123**." Use the same accent color highlights as the data preview table.

---

## Interactions & client-side behavior

### File drag & drop

Both drop zones accept either click-to-browse or drag-and-drop. Use jQuery:

```js
$('.mf-dropzone')
  .on('dragenter dragover', e => { e.preventDefault(); $(e.currentTarget).addClass('mf-dropzone--hover'); })
  .on('dragleave drop',     e => { e.preventDefault(); $(e.currentTarget).removeClass('mf-dropzone--hover'); });
$('.mf-dropzone').on('drop', e => {
  const file = e.originalEvent.dataTransfer.files[0];
  uploadFile(file); // FormData + $.ajax POST to /Generate/UploadTemplate or /UploadExcel
});
```

### Validation feedback

After Excel upload, if `Nik` fails the 16-digit check on row 3:
- Replace the success badge with `failed` tone "1 error in 5 rows".
- Highlight the offending row background `#FEF2F2` and show an inline error icon + tooltip on the cell.
- Disable the "Generate preview" button.

### Loading states

- During upload: drop zone collapses to a 60px-tall row showing "Uploading {filename}…" + a thin Bootstrap progress bar in `--mf-accent`.
- During PDF generation (after step 2 → 3): skeleton thumbnails on the left, big skeleton page on the right, all using a 1.5s pulse animation between `#F1F5F9` and `#E2E8F0`.

### Preview navigation

- Click any thumbnail → main preview swaps.
- `←` / `→` arrows in the toolbar (and physical arrow keys when the preview pane is focused) advance.
- Page counter (`3 of 5`) is mono and never changes width as numbers grow — use `font-variant-numeric: tabular-nums`.

### Job lifetime

Each upload creates a server-side job folder `App_Data/jobs/{guid}/` containing `template.{ext}`, `data.xlsx`, and (after generation) `output.pdf`. Garbage-collect jobs older than 24h on app start.

---

## State management

Keep server-side state simple. Pass `jobId` (GUID) between steps in either:
- The query string (`?jobId=…`), OR
- A hidden form field rendered by the layout.

On step submit, the controller validates the job's current state and either accepts the step's data or redirects back to the earliest incomplete step.

Client-side state per step (selected thumbnail, drag-hover) lives in jQuery — no need for a SPA framework. If the team wants something more modern later, the prototype is React-shaped and would port cleanly to Razor + a small React island on the wizard page only.

---

## Assets

- **Logo**: A 32×32 rounded square (7px corner radius) in `--mf-accent`. Inside, in white: an `M` rendered as a 4-stroke polyline (M9,22 L9,10 L13,16 L17,10 L17,22) plus a 2.5-radius white dot centered at (22.5, 20). The full SVG is at the bottom of `prototype/shared.jsx` (`I.Logo`). Save it to `Content/img/logo.svg`.
- **Favicon**: Already in the repo at `/favicon.ico`. Replace with a version derived from the new logo when time allows.
- **Icons**: Use the same Lucide-style stroke icons used in the prototype (`I.*` in `prototype/shared.jsx`). All 24×24 viewBox, 1.8 stroke-width, `currentColor` stroke. Either inline as `<svg>` partials, or bring in the [Lucide static icons](https://lucide.dev) (~1KB each) and reference by class.
- **Sample files for testing**: include `App_Data/samples/registration_form.pdf` (template with placeholders) and `App_Data/samples/pendaftaran_jan_2026.xlsx` (5-row Excel) so devs can run the flow end-to-end without authoring their own.

---

## Acceptance criteria

The implementation is "done" when:

1. The home page (`/`) matches Screen 1 — hero, 3 step cards, recent activity. Recent activity reads from the latest 4 entries in `App_Data/jobs/`.
2. Clicking "Start a new job" navigates to `/Generate/Wizard?step=1` and the wizard works end-to-end with the sample files above.
3. Uploading `pendaftaran_jan_2026.xlsx` produces a 5-page PDF where:
   - Page 1's "Full Name" reads "Ahmad Saputra" and "NIK" reads "3201234567890123".
   - Footer of every page reads "Page N of 5".
4. The preview screen renders a faithful thumbnail of each page that visibly matches what's in the downloaded PDF.
5. NIK validation rejects rows whose NIK is not exactly 16 digits, with a row-level error message.
6. The visual styling uses the exact tokens listed under "Design Tokens" — no other shades of blue, gray, or border colors.
7. Works in Chrome and Edge at 1280×800 minimum.

---

## Files in this bundle

```
prototype/
  MerchanTFile.html         The interactive prototype (open in any modern browser)
  shared.jsx                Sample data, icons, DocPage component, buttons, badges
  variation-a.jsx           Alternative direction (admin dashboard) — for reference
  variation-b.jsx           ⭐ The selected design — the wizard flow you are recreating
  design-canvas.jsx         Canvas wrapper that lays the two variations side-by-side
  browser-window.jsx        Browser chrome wrapper used in the canvas
  tweaks-panel.jsx          In-canvas controls for accent/density toggling
```

Open `prototype/MerchanTFile.html` in a browser to interact with the live design. Variation B (right side of the canvas) is the spec; Variation A is included only as a "what we considered and rejected" reference.

---

## Open questions for the team

These weren't decided during design and should be confirmed before implementation lands:

1. **Authentication.** The screens show a logged-in "Rina Hadi" admin. Is there an existing identity provider (Windows auth? Forms auth? Azure AD?) or should a stub login be added?
2. **Template authoring.** Will admins author templates in Word, then export to PDF, then upload the PDF? Or upload Word directly and have the server convert? (Word direct is easier for admins but needs LibreOffice headless or Aspose for conversion.)
3. **Multi-template library.** Out of scope today, but the dashboard hints at a future "saved templates" feature. Worth designing the data model with that in mind (e.g., `Templates` table keyed by name).
4. **iText7 licensing.** AGPL. Confirm acceptable, otherwise swap to PdfSharp/MigraDoc.
5. **NIK is a sensitive identifier.** Confirm encryption-at-rest requirements for `App_Data/jobs/` and a retention policy (the spec assumes 24h auto-purge).
