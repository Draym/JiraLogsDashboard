using System;
using Newtonsoft.Json;
using InternalCustomisationDashboard.Tools;
using InternalCustomisationDashboard.ORM;

namespace InternalCustomisationDashboard.Services
{
    public class TimeDoctorServices
    {
        public bool Auth()
        {
           return TimeDoctorData.Instance.Auth.load();
        }

        public bool ChangeAccount(string conf)
        {
            TimeDoctorData.Instance.Auth.set(JsonConvert.DeserializeObject<TimeDoctorData.TimeDoctorAuth>(conf));
            return true;
        }

        public bool Loggin()
        {
            return TimeDoctorData.Instance.Profile.load();
        }

        /** SINGLETON **/
        private static readonly TimeDoctorServices instance = new TimeDoctorServices();
        static TimeDoctorServices()
        {
        }
        private TimeDoctorServices()
        {
            this.Auth();
        }
        public static TimeDoctorServices Instance
        {
            get
            {
                return instance;
            }
        }
    }
}