# Implementation checklist

A flat task list mapping the README spec onto concrete files in `barnimd/MerchanTFile`. Tick these off in order — earlier items unblock later ones.

## Phase 0 — Setup

- [ ] Open the solution in Visual Studio 2019+ or Rider.
- [ ] Restore NuGet packages.
- [ ] Build and confirm the default Home/Index page loads at https://localhost:44314/.
- [ ] Install ClosedXML: `Install-Package ClosedXML`
- [ ] Install PDF library (pick one): `Install-Package itext7` **or** `Install-Package PdfSharp` + `Install-Package MigraDoc.Rendering`
- [ ] Create `App_Data/jobs/` folder and add a `.gitkeep`.
- [ ] Create `App_Data/samples/` folder, drop a `registration_form.pdf` template (with `{{name}}` and `{{nik}}` placeholders) and a 5-row `pendaftaran_jan_2026.xlsx` file there for testing.

## Phase 1 — Design system

- [ ] Add Google Fonts `<link>` for Geist + Geist Mono to `Views/Shared/_Layout.cshtml` `<head>`.
- [ ] Create `Content/merchantfile.css` with the design tokens from the README ("Design Tokens" section).
- [ ] Register `merchantfile.css` in `App_Start/BundleConfig.cs` (`StyleBundle("~/Content/css")`).
- [ ] Update `_Layout.cshtml` navbar to match the new header spec (60px tall, logo + nav + avatar).
- [ ] Inline the logo SVG from `prototype/shared.jsx` (the `I.Logo` component) into `Content/img/logo.svg`.
- [ ] Add a `.btn-mf-primary`, `.btn-mf-secondary`, `.btn-mf-ghost`, `.btn-mf-danger` CSS class set to `merchantfile.css`.
- [ ] Add `.mf-badge` + tone modifiers (`--success`, `--failed`, etc.) to `merchantfile.css`.
- [ ] Add `.mf-dropzone` (default + `--hover` modifier) styles.
- [ ] Add `.mf-card` (white, 1px border, 12px radius) base class.

## Phase 2 — Home page (Screen 1)

- [ ] Replace contents of `Views/Home/Index.cshtml` with the hero + 3 step cards + recent activity layout from the README.
- [ ] Create `RecentJob` model and a stub `RecentJobsService` that returns the sample 4-row list from the README.
- [ ] Inject sample jobs into `HomeController.Index` via `ViewBag` or a typed view model.
- [ ] Add a "How it works" Bootstrap modal triggered by the secondary CTA.
- [ ] Confirm the hero matches the prototype (radial gradient decoration, badge, type scale).

## Phase 3 — Wizard shell

- [ ] Create `Controllers/GenerateController.cs` with `Wizard(int step = 1, string jobId = null)` action.
- [ ] Create `Views/Generate/Wizard.cshtml` rendering the stepper bar + body container.
- [ ] Create `_StepIndicator.cshtml` partial (the 4-node stepper with connectors).
- [ ] Switch the body content via `step` parameter, rendering one of the four step partials.
- [ ] Keep `jobId` in the query string between steps; create a new one on first POST.

## Phase 4 — Step 1: Template upload

- [ ] Create `Views/Generate/_StepTemplate.cshtml` with the drop zone + uploaded-state pill + info banner.
- [ ] Add `POST /Generate/UploadTemplate` action accepting `HttpPostedFileBase`.
- [ ] Save file to `App_Data/jobs/{jobId}/template.{ext}`.
- [ ] Detect `{{name}}` and `{{nik}}` placeholders inside the uploaded file (text scan for PDFs via iText7 `PdfTextExtractor`, or string search for `.docx` after unzipping).
- [ ] Return JSON `{ jobId, placeholders: ["name","nik"], fileSize, pageCount }`.
- [ ] Wire jQuery drag-and-drop + AJAX upload to swap empty → uploaded state without page reload.

## Phase 5 — Step 2: Excel upload + data preview

- [ ] Create `Views/Generate/_StepData.cshtml` with drop zone + uploaded-state pill + data table.
- [ ] Create `Services/ExcelReader.cs` (uses ClosedXML).
- [ ] Add `POST /Generate/UploadExcel` action.
- [ ] Read the workbook, find columns by header name (`Full Name` / `Nama` / `Nama Lengkap`, `NIK` / `Card ID` / `ID`).
- [ ] Validate each row: `FullName` non-empty, `Nik` = 16 digits.
- [ ] Return JSON `{ rows: [...], validCount, errors: [{ rowIndex, column, message }] }`.
- [ ] Render the data table with mapping pills (`Full Name → {{name}}`).
- [ ] On error rows: tint background `#FEF2F2`, show inline error icon, disable "Generate preview" button.

## Phase 6 — Step 3: Preview

- [ ] Create `Views/Generate/_StepPreview.cshtml` with the two-column thumbnail-rail + main-preview layout.
- [ ] Create `Views/Generate/_DocPage.cshtml` partial — the filled-template renderer. Takes a row and a `width` parameter; all dimensions derive from `width`.
- [ ] Add `GET /Generate/PreviewPage?jobId=…&page=N` returning either the rendered partial or a PNG snapshot.
- [ ] Wire toolbar `←` / `→` and thumbnail clicks to swap the main preview without full reload (jQuery).
- [ ] Add keyboard support: focus the preview region, listen to arrow keys.
- [ ] Use `font-variant-numeric: tabular-nums` on the page counter so it doesn't jitter.

## Phase 7 — Step 4: Download

- [ ] Create `Services/PdfGenerator.cs`. For each Excel row, clone the template, replace `{{name}}` and `{{nik}}`, append to a master PDF (iText7 `PdfMerger`).
- [ ] Add `GET /Generate/Download?jobId=…` returning the merged file with `Content-Disposition: attachment`.
- [ ] Save the output as `App_Data/jobs/{jobId}/output.pdf` so it can be re-downloaded later.
- [ ] Create `Views/Generate/_StepDone.cshtml` (success icon + file card + back/start-another buttons).
- [ ] Update `RecentJobsService` to enumerate `App_Data/jobs/` and surface the latest 4 on the home page.

## Phase 8 — Polish

- [ ] Loading states: drop-zone collapses to a 60px progress row during upload; skeleton thumbnails + page while step 3 generates.
- [ ] Empty state for "Recent activity" when no jobs exist (centered icon + "Start your first job" CTA).
- [ ] Error toasts (Bootstrap toast container, bottom-right) for server errors.
- [ ] Confirm modal before "Cancel" on the wizard (destroys job folder).
- [ ] Garbage collect `App_Data/jobs/` entries older than 24 hours on `Application_Start`.
- [ ] Replace `favicon.ico` with a version of the new logo.

## Phase 9 — Acceptance test

Run through the 7-point acceptance criteria in `README.md` ("Acceptance criteria" section). All must pass.
