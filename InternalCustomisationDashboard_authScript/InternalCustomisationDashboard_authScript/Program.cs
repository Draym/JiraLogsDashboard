using InternalCustomisationDashboard_authScript.Tools;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InternalCustomisationDashboard_authScript
{
    class Program
    {
        static void Main(string[] args)
        {
            var url = "http://localhost:49328/api/TimeDoctor/RefreshToken";
            //var url = "/api/TimeDoctor/RefreshToken/api/TimeDoctor/RefreshToken";
            try
            {
                HttpUtils.Get(url);
            } catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.Message);
            }
        }
    }
}
