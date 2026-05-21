using System.Collections.Generic;
using System.IO;
using iText.IO.Font.Constants;
using iText.Kernel.Colors;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using MerchantFile.Models;

namespace MerchantFile.Services
{
    public class PdfGenerator
    {
        private static readonly Color Accent     = new DeviceRgb(0x1E, 0x40, 0xAF);
        private static readonly Color Ink        = new DeviceRgb(0x0F, 0x17, 0x2A);
        private static readonly Color InkMuted   = new DeviceRgb(0x47, 0x55, 0x69);
        private static readonly Color InkFaint   = new DeviceRgb(0x64, 0x74, 0x8B);
        private static readonly Color InkSoft    = new DeviceRgb(0x94, 0xA3, 0xB8);
        private static readonly Color BorderSoft = new DeviceRgb(0xCB, 0xD5, 0xE1);
        private static readonly Color BorderHair = new DeviceRgb(0xE2, 0xE8, 0xF0);
        private static readonly Color BgSoft     = new DeviceRgb(0xF8, 0xFA, 0xFC);
        private static readonly Color White      = ColorConstants.WHITE;

        /// <summary>
        /// Builds the merged multi-page PDF — one page per row — and writes it to
        /// <paramref name="outputPath"/>. Layout mirrors the DocPage Razor partial
        /// so on-screen previews and the artifact agree.
        /// </summary>
        public void Generate(IEnumerable<ExcelRow> rows, string outputPath)
        {
            var rowList = new List<ExcelRow>(rows);
            int total = rowList.Count;

            using (var fs = new FileStream(outputPath, FileMode.Create, FileAccess.Write))
            using (var writer = new PdfWriter(fs))
            using (var pdf = new PdfDocument(writer))
            {
                var regular = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var bold = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                var mono = PdfFontFactory.CreateFont(StandardFonts.COURIER);
                var monoBold = PdfFontFactory.CreateFont(StandardFonts.COURIER_BOLD);

                if (total == 0)
                {
                    var page = pdf.AddNewPage(PageSize.A4);
                    var c = new PdfCanvas(page);
                    DrawText(c, regular, "No rows to render.", 48, page.GetPageSize().GetHeight() - 80, 12, InkMuted);
                    return;
                }

                for (int i = 0; i < total; i++)
                {
                    var page = pdf.AddNewPage(PageSize.A4);
                    DrawPage(page, rowList[i], i, total, regular, bold, mono, monoBold);
                }
            }
        }

        private void DrawPage(PdfPage page, ExcelRow row, int index, int total,
                              PdfFont regular, PdfFont bold, PdfFont mono, PdfFont monoBold)
        {
            var size = page.GetPageSize();
            float width = size.GetWidth();
            float height = size.GetHeight();
            var c = new PdfCanvas(page);

            // ─── Header band ────────────────────────────────────────────────
            float headerH = 56;
            c.SaveState();
            c.SetFillColor(Accent);
            c.Rectangle(0, height - headerH, width, headerH);
            c.Fill();
            c.RestoreState();

            // Small white square + REGISTRATION FORM
            c.SaveState();
            c.SetFillColor(White);
            c.Rectangle(48, height - headerH / 2f - 5, 10, 10);
            c.Fill();
            c.RestoreState();
            DrawText(c, bold, "REGISTRATION FORM", 64, height - headerH / 2f - 3, 11, White, charSpacing: 0.5f);

            // NO. 0001 (right-aligned visually via right padding from the right edge)
            string no = "NO. " + (index + 1).ToString("0000");
            float noWidth = bold.GetWidth(no, 9);
            DrawText(c, mono, no, width - 48 - noWidth, height - headerH / 2f - 2, 9, new DeviceRgb(255, 255, 255));

            // ─── Body ───────────────────────────────────────────────────────
            float bodyLeft = 48;
            float bodyRight = width - 48;
            float cursorY = height - headerH - 32;

            DrawText(c, regular, "Please verify the following information and sign at the bottom of the page.",
                bodyLeft, cursorY, 10, InkFaint);
            cursorY -= 32;

            cursorY = DrawField(c, regular, bold, mono, monoBold, bodyLeft, bodyRight, cursorY, "FULL NAME", row?.FullName ?? "", placeholder: false, monoValue: false);
            cursorY = DrawField(c, regular, bold, mono, monoBold, bodyLeft, bodyRight, cursorY, "NIK (CARD ID)", row?.Nik ?? "", placeholder: false, monoValue: true);
            cursorY = DrawField(c, regular, bold, mono, monoBold, bodyLeft, bodyRight, cursorY, "DATE OF ISSUE", "—", placeholder: true, monoValue: false);
            cursorY = DrawField(c, regular, bold, mono, monoBold, bodyLeft, bodyRight, cursorY, "PLACE", "—", placeholder: true, monoValue: false);

            // Consent box
            cursorY -= 8;
            float consentH = 50;
            c.SaveState();
            c.SetFillColor(BgSoft);
            c.Rectangle(bodyLeft, cursorY - consentH, bodyRight - bodyLeft, consentH);
            c.Fill();
            c.SetFillColor(Accent);
            c.Rectangle(bodyLeft, cursorY - consentH, 2, consentH);
            c.Fill();
            c.RestoreState();
            DrawText(c, regular, "By signing this form, I confirm that the information above is",
                bodyLeft + 14, cursorY - 18, 9.5f, InkMuted);
            DrawText(c, regular, "accurate and consent to its use for the stated purposes.",
                bodyLeft + 14, cursorY - 32, 9.5f, InkMuted);
            cursorY -= consentH;

            // Signature lines
            cursorY -= 70;
            float sigGap = 24;
            float sigW = (bodyRight - bodyLeft - sigGap) / 2f;
            DrawSignature(c, regular, bodyLeft, cursorY, sigW, "Applicant signature");
            DrawSignature(c, regular, bodyLeft + sigW + sigGap, cursorY, sigW, "Authorized officer");

            // Footer
            DrawText(c, mono, "MerchanTFile · auto-generated", bodyLeft, 30, 8.5f, InkSoft);
            string pageLabel = "Page " + (index + 1) + " of " + total;
            float pageLabelW = mono.GetWidth(pageLabel, 8.5f);
            DrawText(c, mono, pageLabel, bodyRight - pageLabelW, 30, 8.5f, InkSoft);
        }

        private float DrawField(PdfCanvas c, PdfFont regular, PdfFont bold, PdfFont mono, PdfFont monoBold,
                                float left, float right, float topY,
                                string label, string value, bool placeholder, bool monoValue)
        {
            // Uppercase label
            DrawText(c, regular, label, left, topY, 8, InkFaint, charSpacing: 0.6f);

            // Value
            string display = string.IsNullOrEmpty(value) ? "—" : value;
            var valFont = placeholder ? regular : (monoValue ? monoBold : bold);
            float valSize = 13;
            float charSp = monoValue && !placeholder ? 1f : 0f;
            float valueY = topY - 18;
            DrawText(c, valFont, display, left, valueY, valSize, placeholder ? InkSoft : Ink, charSpacing: charSp);

            // Underline
            float ruleY = valueY - 6;
            c.SaveState();
            c.SetStrokeColor(placeholder ? BorderHair : InkSoft);
            c.SetLineWidth(placeholder ? 0.5f : 0.8f);
            if (placeholder)
            {
                c.SetLineDash(new float[] { 2f, 2f }, 0f);
            }
            c.MoveTo(left, ruleY).LineTo(right, ruleY).Stroke();
            c.RestoreState();

            return ruleY - 18;
        }

        private void DrawSignature(PdfCanvas c, PdfFont regular, float x, float y, float w, string caption)
        {
            c.SaveState();
            c.SetStrokeColor(BorderSoft);
            c.SetLineWidth(0.6f);
            c.MoveTo(x, y).LineTo(x + w, y).Stroke();
            c.RestoreState();
            DrawText(c, regular, caption, x, y - 14, 8.5f, InkFaint);
        }

        /// <summary>
        /// Writes a single line of text at an absolute (x, y) position.
        /// y is the text baseline.
        /// </summary>
        private void DrawText(PdfCanvas c, PdfFont font, string text, float x, float y,
                              float size, Color color, float charSpacing = 0f)
        {
            if (string.IsNullOrEmpty(text)) return;
            c.SaveState();
            c.BeginText();
            c.SetFontAndSize(font, size);
            c.SetFillColor(color);
            if (charSpacing != 0f) c.SetCharacterSpacing(charSpacing);
            c.MoveText(x, y);
            c.ShowText(text);
            c.EndText();
            c.RestoreState();
        }
    }
}
