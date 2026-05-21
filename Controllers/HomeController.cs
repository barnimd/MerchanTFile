using System.Web.Mvc;
using MerchantFile.Services;

namespace MerchantFile.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.RecentJobs = SampleData.RecentJobs;
            return View();
        }
    }
}
