using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
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
            string url = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml";

            WebRequest request = WebRequest.Create(url);
            WebResponse response = request.GetResponse();

            StreamReader responseStream = new StreamReader(response.GetResponseStream());

            var ms = new MemoryStream();
            responseStream.BaseStream.CopyTo(ms);

            return File(ms.ToArray(), "text/xml");
        }
    }
}