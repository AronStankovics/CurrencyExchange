using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;

namespace CurrencyExchange.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetCurrencyXml()
        {
            return File("~/Views/eurofxref-hist-90d.xml", "text/xml");
        }
    }
}