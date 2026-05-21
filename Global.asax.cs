using System;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using MerchantFile.Services;

namespace MerchantFile
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Sweep job folders older than 24h on every cold start.
            try { new JobStore().GarbageCollect(TimeSpan.FromHours(24)); }
            catch { /* best-effort */ }
        }
    }
}
