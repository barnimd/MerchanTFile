using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;

namespace MerchantFile.Services
{
    public class TemplateScanResult
    {
        public int PageCount { get; set; }
        public List<string> Placeholders { get; set; } = new List<string>();
        public string Error { get; set; }
    }

    public class TemplateScanner
    {
        private static readonly Regex PlaceholderRx = new Regex(@"\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}", RegexOptions.Compiled);

        public TemplateScanResult Scan(string filePath)
        {
            var ext = (Path.GetExtension(filePath) ?? "").ToLowerInvariant();
            if (ext == ".pdf") return ScanPdf(filePath);
            if (ext == ".docx") return ScanDocx(filePath);
            return new TemplateScanResult { Error = "Unsupported template type — use PDF or DOCX." };
        }

        private TemplateScanResult ScanPdf(string filePath)
        {
            var result = new TemplateScanResult();
            try
            {
                using (var reader = new PdfReader(filePath))
                using (var pdf = new PdfDocument(reader))
                {
                    result.PageCount = pdf.GetNumberOfPages();
                    var found = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    for (int i = 1; i <= pdf.GetNumberOfPages(); i++)
                    {
                        var text = PdfTextExtractor.GetTextFromPage(pdf.GetPage(i));
                        foreach (Match m in PlaceholderRx.Matches(text ?? ""))
                        {
                            found.Add(m.Groups[1].Value.ToLowerInvariant());
                        }
                    }
                    result.Placeholders = found.ToList();
                }
            }
            catch (Exception ex)
            {
                result.Error = "Could not read PDF: " + ex.Message;
            }
            return result;
        }

        private TemplateScanResult ScanDocx(string filePath)
        {
            var result = new TemplateScanResult();
            try
            {
                using (var zip = ZipFile.OpenRead(filePath))
                {
                    var found = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    var docXml = zip.Entries.FirstOrDefault(e => e.FullName.EndsWith("document.xml", StringComparison.OrdinalIgnoreCase));
                    if (docXml != null)
                    {
                        using (var s = docXml.Open())
                        using (var r = new StreamReader(s, Encoding.UTF8))
                        {
                            var text = r.ReadToEnd();
                            foreach (Match m in PlaceholderRx.Matches(text))
                            {
                                found.Add(m.Groups[1].Value.ToLowerInvariant());
                            }
                        }
                    }
                    result.Placeholders = found.ToList();
                    result.PageCount = 1; // Word page count is non-trivial; approximate.
                }
            }
            catch (Exception ex)
            {
                result.Error = "Could not read DOCX: " + ex.Message;
            }
            return result;
        }
    }
}
