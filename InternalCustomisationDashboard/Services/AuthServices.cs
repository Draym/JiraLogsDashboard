using System;
using Newtonsoft.Json;
using InternalCustomisationDashboard.Tools;
using InternalCustomisationDashboard.Models.AuthData;

namespace InternalCustomisationDashboard.Services
{
    public class TimeDoctorServices
    {
        public bool TimeDoctorAuth()
        {
            if (TimeDoctorData.Instance.token == null)
            {
                var saveConf = FileUtils.ReadFile(AppSettings.TimeDoctorConf);
                if (saveConf == null)
                    throw new Exception("Auth: file " + AppSettings.TimeDoctorConf + " hasn't be found");
                TimeDoctorData.Instance.token = JsonConvert.DeserializeObject<TimeDoctorToken>(saveConf);
            }
            else
            {
                string response = HttpUtils.Get("https://webapi.timedoctor.com/oauth/v2/token?client_id=" + AppSettings.TimeDoctorClientId + "&client_secret=" + AppSettings.TimeDoctorSecretId + "&grant_type=refresh_token&refresh_token=" + TimeDoctorData.Instance.token.refresh_token);
                TimeDoctorData.Instance.token = JsonConvert.DeserializeObject<TimeDoctorToken>(response);

                FileUtils.WriteFile(AppSettings.TimeDoctorConf, JsonConvert.SerializeObject(TimeDoctorData.Instance.token));
            }
            return true;
        }

        public bool TimeDoctorAuthChangeAccount(string conf)
        {
            TimeDoctorData.Instance.token = JsonConvert.DeserializeObject<TimeDoctorToken>(conf);
            FileUtils.WriteFile(AppSettings.TimeDoctorConf, JsonConvert.SerializeObject(TimeDoctorData.Instance.token));
            return true;
        }

        public bool TimeDoctorLoggin()
        {
            string response = HttpUtils.Get("https://webapi.timedoctor.com/v1.1/companies?access_token=" + TimeDoctorData.Instance.token.access_token);
            TimeDoctorData.Instance.profile = JsonConvert.DeserializeObject<TimeDoctorProfile>(response);
            return true;
        }
    }
}