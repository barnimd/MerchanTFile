using System;
using System.Text;
using System.Web.Mvc;
using MerchantFile.Models;
using MerchantFile.Services;

namespace MerchantFile.Controllers
{
    public class GenerateController : Controller
    {
        public ActionResult Wizard(int step = 1, string jobId = null, int page = 0)
        {
            if (step < 1) step = 1;
            if (step > 4) step = 4;

            if (string.IsNullOrWhiteSpace(jobId))
            {
                jobId = NewJobId();
            }

            var vm = new GenerateJobViewModel
            {
                Step = step,
                JobId = jobId,
                SelectedPage = page,
                Rows = SampleData.Rows
            };

            // For the prototype the steps are presented as "already uploaded" once
            // the user has advanced past them. The wizard itself is currently a
            // visual demo backed by SampleData; real uploads land here later.
            if (step >= 2)
            {
                vm.TemplateUploaded = true;
                vm.TemplateFileName = "registration_form.pdf";
                vm.TemplateMeta = "184 KB · 1 page · 2 placeholders found";
            }
            if (step >= 3)
            {
                vm.DataUploaded = true;
                vm.DataFileName = "pendaftaran_jan_2026.xlsx";
                vm.DataMeta = "32 KB · Sheet1 · 5 rows";
            }

            return View("Wizard", vm);
        }

        public ActionResult Download(string jobId)
        {
            // Stub: returns a tiny text payload with the same name as the job.
            // Replace with real PDF generation (iText7 / PdfSharp) once the
            // NuGet packages from the README are installed.
            var bytes = Encoding.UTF8.GetBytes(
                "MerchanTFile placeholder PDF\r\n" +
                "Job: " + (jobId ?? "demo") + "\r\n" +
                "Replace this stub with a real generated PDF.");
            return File(bytes, "application/pdf", (jobId ?? "merchantfile") + ".pdf");
        }

        public ActionResult History()
        {
            ViewBag.RecentJobs = SampleData.RecentJobs;
            return View();
        }

        private static string NewJobId()
        {
            // Looks like "JOB-0142" — matches the sample data style in the prototype.
            var rng = new Random();
            return "JOB-" + rng.Next(100, 9999).ToString("0000");
        }
    }
}
