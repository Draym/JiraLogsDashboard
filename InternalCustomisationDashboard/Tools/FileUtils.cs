using System;
using System.IO;
using System.Web;

namespace InternalCustomisationDashboard.Tools
{
    public class FileUtils
    {
        public static string ReadFile(string path)
        {
            path = HttpContext.Current.Server.MapPath("~/" + path);
            try
            {
                if (File.Exists(path))
                    return File.ReadAllText(path);
            }
            catch (Exception ex)
            {
                Console.WriteLine("FailRead: [" + path + "] " + ex.Message);
            }
            return null;
        }

        public static void WriteFile(string path, string value)
        {
            path = HttpContext.Current.Server.MapPath("~/" + path);
            try
            {
                File.WriteAllText(path, value);
            }
            catch (Exception ex)
            {
                Console.WriteLine("FailWrite: [" + path + "] {" + value + "} " + ex.Message);
            }
        }
    }
}