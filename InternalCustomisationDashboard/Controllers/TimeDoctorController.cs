using System;
using System.Web.Http;
using InternalCustomisationDashboard.Tools;
using System.Collections.Generic;

namespace InternalCustomisationDashboard.Controllers
{
    public class TimeDoctorController : ApiController
    {
        private Services.TimeDoctorServices _AuthServices;

        public TimeDoctorController()
        {
            this._AuthServices = new Services.TimeDoctorServices();
        }

        [HttpGet()]
        [ActionName("Auth")]
        public string AuthClient()
        {
            return "https://webapi.timedoctor.com/oauth/v2/auth?client_id=" + AppSettings.TimeDoctorClientId + "&response_type=code&redirect_uri=" + AppSettings.BaseUrlApi + "TimeDoctor/AuthCode";
        }

        [HttpGet()]
        [ActionName("AuthCode")]
        public string AuthCode(string code, string state)
        {
            var result = HttpUtils.Get("https://webapi.timedoctor.com/oauth/v2/token?client_id=" + AppSettings.TimeDoctorClientId + "&client_secret=" + AppSettings.TimeDoctorSecretId + "&grant_type=authorization_code&redirect_uri=" + AppSettings.BaseUrlApi + "TimeDoctor/AuthCode&code=" + code);

            this._AuthServices.TimeDoctorAuthChangeAccount(result);
            return result;
        }

        [HttpGet()]
        [ActionName("GetUsers")]
        public Object GetUsers()
        {
            return GetCall("/v1.1/companies/{company}/users?access_token={token}&_format=json");
        }

        [HttpGet()]
        [ActionName("GetTeamUserIds")]
        public Object GetTeamUserIds()
        {
            return new List<string>()
            {
                "145876",
                "1183967",
                "1183969",
                "342922",
                "151074"
            };
        }

        [HttpGet()]
        [ActionName("GetTasks")]
        public Object GetTasks(string userId)
        {
            return GetCall("/v1.1/companies/{company}/users/" + userId + "/tasks?access_token={token}&_format=json");
        }

        [HttpGet()]
        [ActionName("GetWorklogs")]
        public Object GetWorklogs([FromUri]List<string> userIds, string startDate, string endDate, int limit, int page)
        {
            return GetCall("/v1.1/companies/{company}/worklogs?access_token={token}&_format=json&start_date=" + startDate + "&end_date=" + endDate + (userIds == null ? "" : "&user_ids=" + HttpUtils.toUrl(userIds) + "&offset=" + (page - 1) * limit + "&limit=" + limit));
        }

        [HttpGet()]
        [ActionName("RefreshToken")]
        public void RefreshToken()
        {
            this.Auth(true);
        }

        /** TOOLS **/
        public void Auth()
        {
            this.Auth(false);
        }

        protected void Auth(bool force)
        {
            bool newAuth = false;

            if (TimeDoctorData.Instance.token == null || force)
            {
                if (this._AuthServices.TimeDoctorAuth())
                    newAuth = true;
            }
            if (TimeDoctorData.Instance.profile == null || newAuth)
            {
                this._AuthServices.TimeDoctorLoggin();
            }
        }

        protected Object GetCall(string uri)
        {
            try
            {
                if (TimeDoctorData.Instance.token == null || TimeDoctorData.Instance.profile == null)
                    this.Auth();
                uri = AppSettings.BaseTimeDoctorUrlApi + uri.Replace("{token}", TimeDoctorData.Instance.token.access_token).Replace("{company}", TimeDoctorData.Instance.profile.user.company_id);
                return HttpUtils.Get(uri);
            }
            catch (Exception ex)
            {
                if (ex.Message == "Unauthorized" || ex.Message.Contains("Object reference not set to an instance"))
                {
                    this.Auth(true);
                    return HttpUtils.Get(uri);
                }
            }
            return null;
        }
    }
}
