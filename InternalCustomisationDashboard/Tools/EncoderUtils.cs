using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InternalCustomisationDashboard.Tools
{
    public class EncoderUtils
    {

        public static string encode(string value)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(value);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static string decode(string value)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(value);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }
}