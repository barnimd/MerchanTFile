using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MerchantFile.Models;
using MerchantFile.Services;

namespace MerchantFile.Controllers
{
    public class GenerateController : Controller
    {
        private readonly JobStore _store = new JobStore();
        private readonly ExcelReader _excel = new ExcelReader();
        private readonly TemplateScanner _scanner = new TemplateScanner();
        private readonly PdfGenerator _pdf = new PdfGenerator();

        private static readonly string[] AllowedTemplateExts = { ".pdf", ".docx" };
        private static readonly string[] AllowedDataExts = { ".xlsx", ".xls" };
        private const long MaxUploadBytes = 10 * 1024 * 1024;

        public ActionResult Wizard(int step = 1, string jobId = null, int page = 0, string reset = null)
        {
            if (step < 1) step = 1;
            if (step > 4) step = 4;

            JobMeta meta = null;
            if (!string.IsNullOrEmpty(jobId)) meta = _store.Load(jobId);

            if (meta == null)
            {
                if (step != 1)
                {
                    return RedirectToAction("Wizard", new { step = 1 });
                }
                // step 1 with no jobId — create a fresh draft so subsequent posts have somewhere to write.
                jobId = _store.NewJob();
                meta = _store.Load(jobId);
            }

            if (!string.IsNullOrEmpty(reset))
            {
                ResetJobState(meta, reset);
                return RedirectToAction("Wizard", new { step, jobId = meta.Id });
            }

            // Guard against skipping ahead.
            if (step >= 2 && string.IsNullOrEmpty(meta.TemplateFileName))
            {
                return RedirectToAction("Wizard", new { step = 1, jobId = meta.Id });
            }
            if (step >= 3 && string.IsNullOrEmpty(meta.DataFileName))
            {
                return RedirectToAction("Wizard", new { step = 2, jobId = meta.Id });
            }

            var vm = new GenerateJobViewModel
            {
                Step = step,
                JobId = meta.Id,
                Meta = meta,
                SelectedPage = page
            };
            return View("Wizard", vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult UploadTemplate(string jobId, HttpPostedFileBase file)
        {
            if (string.IsNullOrEmpty(jobId) || !_store.Exists(jobId))
            {
                jobId = _store.NewJob();
            }
            var meta = _store.Load(jobId);

            if (file == null || file.ContentLength == 0)
            {
                TempData["WizardError"] = "Please pick a template file.";
                return RedirectToAction("Wizard", new { step = 1, jobId });
            }
            if (file.ContentLength > MaxUploadBytes)
            {
                TempData["WizardError"] = "Template is larger than 10 MB.";
                return RedirectToAction("Wizard", new { step = 1, jobId });
            }
            var ext = (Path.GetExtension(file.FileName) ?? "").ToLowerInvariant();
            if (!AllowedTemplateExts.Contains(ext))
            {
                TempData["WizardError"] = "Template must be a PDF or DOCX file.";
                return RedirectToAction("Wizard", new { step = 1, jobId });
            }

            var dir = _store.GetJobDir(jobId);
            // Wipe any prior template files so re-upload doesn't leave orphans.
            foreach (var f in Directory.EnumerateFiles(dir, "template.*")) { try { System.IO.File.Delete(f); } catch { } }
            var savePath = Path.Combine(dir, "template" + ext);
            file.SaveAs(savePath);

            var scan = _scanner.Scan(savePath);
            meta.TemplateFileName = Path.GetFileName(file.FileName);
            meta.TemplateFileSize = file.ContentLength;
            meta.TemplatePageCount = scan.PageCount;
            meta.Placeholders = scan.Placeholders;
            meta.Status = "template-uploaded";
            _store.Save(meta);

            if (!string.IsNullOrEmpty(scan.Error))
            {
                TempData["WizardError"] = scan.Error;
            }
            return RedirectToAction("Wizard", new { step = 1, jobId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult UploadExcel(string jobId, HttpPostedFileBase file)
        {
            if (string.IsNullOrEmpty(jobId) || !_store.Exists(jobId))
            {
                TempData["WizardError"] = "Session expired — please re-upload the template.";
                return RedirectToAction("Wizard", new { step = 1 });
            }
            var meta = _store.Load(jobId);
            if (string.IsNullOrEmpty(meta.TemplateFileName))
            {
                return RedirectToAction("Wizard", new { step = 1, jobId });
            }

            if (file == null || file.ContentLength == 0)
            {
                TempData["WizardError"] = "Please pick an Excel file.";
                return RedirectToAction("Wizard", new { step = 2, jobId });
            }
            if (file.ContentLength > MaxUploadBytes)
            {
                TempData["WizardError"] = "Spreadsheet is larger than 10 MB.";
                return RedirectToAction("Wizard", new { step = 2, jobId });
            }
            var ext = (Path.GetExtension(file.FileName) ?? "").ToLowerInvariant();
            if (!AllowedDataExts.Contains(ext))
            {
                TempData["WizardError"] = "Spreadsheet must be .xlsx or .xls.";
                return RedirectToAction("Wizard", new { step = 2, jobId });
            }

            var dir = _store.GetJobDir(jobId);
            foreach (var f in Directory.EnumerateFiles(dir, "data.*")) { try { System.IO.File.Delete(f); } catch { } }
            var savePath = Path.Combine(dir, "data" + ext);
            file.SaveAs(savePath);

            ExcelReadResult result;
            using (var fs = new FileStream(savePath, FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                result = _excel.Read(fs);
            }

            if (!string.IsNullOrEmpty(result.FatalError))
            {
                TempData["WizardError"] = result.FatalError;
                return RedirectToAction("Wizard", new { step = 2, jobId });
            }

            meta.DataFileName = Path.GetFileName(file.FileName);
            meta.DataFileSize = file.ContentLength;
            meta.SheetName = result.SheetName;
            meta.Rows = result.Rows;
            meta.ValidRowCount = result.ValidCount;
            meta.ErrorRowCount = result.ErrorCount;
            meta.Status = "data-uploaded";
            _store.Save(meta);

            return RedirectToAction("Wizard", new { step = 2, jobId });
        }

        public ActionResult Download(string jobId)
        {
            if (string.IsNullOrEmpty(jobId) || !_store.Exists(jobId))
            {
                return HttpNotFound();
            }
            var meta = _store.Load(jobId);
            if (meta == null || meta.Rows == null || meta.Rows.Count == 0)
            {
                return HttpNotFound("Nothing to download — upload a spreadsheet first.");
            }

            var dir = _store.GetJobDir(jobId);
            var outPath = Path.Combine(dir, "output.pdf");

            // Regenerate when output is missing OR stale relative to the data file.
            var dataPath = Directory.EnumerateFiles(dir, "data.*").FirstOrDefault();
            bool needsBuild = !System.IO.File.Exists(outPath);
            if (!needsBuild && dataPath != null)
            {
                needsBuild = System.IO.File.GetLastWriteTimeUtc(dataPath) > System.IO.File.GetLastWriteTimeUtc(outPath);
            }
            if (needsBuild)
            {
                _pdf.Generate(meta.Rows, outPath);
                meta.OutputFileSize = new FileInfo(outPath).Length;
                meta.HasOutput = true;
                meta.Status = "completed";
                _store.Save(meta);
            }

            var bytes = System.IO.File.ReadAllBytes(outPath);
            var fname = SanitizeFileName(Path.GetFileNameWithoutExtension(meta.DataFileName ?? jobId)) + ".pdf";
            return File(bytes, "application/pdf", fname);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Cancel(string jobId)
        {
            if (!string.IsNullOrEmpty(jobId))
            {
                _store.Delete(jobId);
            }
            return RedirectToAction("Index", "Home");
        }

        public ActionResult History()
        {
            ViewBag.Jobs = _store.GetAll();
            return View();
        }

        private void ResetJobState(JobMeta meta, string what)
        {
            var dir = _store.GetJobDir(meta.Id);
            if (what == "template" || what == "all")
            {
                foreach (var f in Directory.EnumerateFiles(dir, "template.*"))
                {
                    try { System.IO.File.Delete(f); } catch { }
                }
                meta.TemplateFileName = null;
                meta.TemplateFileSize = 0;
                meta.TemplatePageCount = 0;
                meta.Placeholders.Clear();
                // Template change invalidates data + output.
                what = "all";
            }
            if (what == "data" || what == "all")
            {
                foreach (var f in Directory.EnumerateFiles(dir, "data.*"))
                {
                    try { System.IO.File.Delete(f); } catch { }
                }
                meta.DataFileName = null;
                meta.DataFileSize = 0;
                meta.SheetName = null;
                meta.Rows.Clear();
                meta.ValidRowCount = 0;
                meta.ErrorRowCount = 0;

                var outPath = Path.Combine(dir, "output.pdf");
                if (System.IO.File.Exists(outPath)) { try { System.IO.File.Delete(outPath); } catch { } }
                meta.HasOutput = false;
                meta.OutputFileSize = 0;
            }
            meta.Status = "draft";
            _store.Save(meta);
        }

        private static string SanitizeFileName(string s)
        {
            if (string.IsNullOrEmpty(s)) return "merchantfile";
            foreach (var c in Path.GetInvalidFileNameChars()) s = s.Replace(c, '_');
            return s;
        }
    }
}
