using System.Web.Mvc;
using MerchantFile.Services;

namespace MerchantFile.Controllers
{
    public class HomeController : Controller
    {
        private readonly JobStore _store = new JobStore();

        public ActionResult Index()
        {
            ViewBag.RecentJobs = _store.GetRecent(4);
            return View();
        }
    }
}
