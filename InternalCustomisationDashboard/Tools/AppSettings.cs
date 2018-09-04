using System;
using System.Configuration;
using System.Globalization;

namespace InternalCustomisationDashboard.Tools
{
    public class AppSettings
    {
        public static string TimeDoctorClientId
        {
            get
            {
                return Setting<string>("TimeDoctorClientId");
            }
        }
        public static string TimeDoctorSecretId
        {
            get
            {
                return Setting<string>("TimeDoctorSecretId");
            }
        }
        public static string TimeDoctorConf
        {
            get
            {
                return Setting<string>("TimeDoctorConf");
            }
        }
        public static string JiraConf
        {
            get
            {
                return Setting<string>("JiraConf");
            }
        }
        public static string BaseUrlApi
        {
            get
            {
                return Setting<string>("BaseUrlApi");
            }
        }
        public static string BaseTimeDoctorUrlApi
        {
            get
            {
                return Setting<string>("BaseTimeDoctorUrlApi");
            }
        }
        private static T Setting<T>(string name)
        {
            string value = ConfigurationManager.AppSettings[name];

            if (value == null)
            {
                throw new Exception(String.Format("Could not find setting '{0}',", name));
            }

            return (T)Convert.ChangeType(value, typeof(T), CultureInfo.InvariantCulture);
        }
    }
}