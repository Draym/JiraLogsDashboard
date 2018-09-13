using System;
using System.Web.Http;
using InternalCustomisationDashboard.Tools;
using System.Collections.Generic;
using InternalCustomisationDashboard.ORM;
using InternalCustomisationDashboard.Services;
using InternalCustomisationDashboard.Models;

namespace InternalCustomisationDashboard.Controllers
{
    public class TimeDoctorController : ApiController
    {
        public TimeDoctorController()
        {
        }

        [HttpGet()]
        [ActionName("Auth")]
        public BaseResponse AuthClient()
        {
            return new SuccessResponse("https://webapi.timedoctor.com/oauth/v2/auth?client_id=" + AppSettings.TimeDoctorClientId + "&response_type=code&redirect_uri=" + AppSettings.BaseUrlApi + "TimeDoctor/AuthCode");
        }

        [HttpGet()]
        [ActionName("AuthCode")]
        public BaseResponse AuthCode(string code, string state)
        {
            try
            {
                var result = HttpUtils.Get("https://webapi.timedoctor.com/oauth/v2/token?client_id=" + AppSettings.TimeDoctorClientId + "&client_secret=" + AppSettings.TimeDoctorSecretId + "&grant_type=authorization_code&redirect_uri=" + AppSettings.BaseUrlApi + "TimeDoctor/AuthCode&code=" + code);

                TimeDoctorServices.Instance.ChangeAccount(result);
                return new SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("IsConfigValid")]
        public BaseResponse IsConfigValid()
        {
            try
            {
                this.Auth(false);
                return new SuccessResponse(this.GetTeamUserIds() != null && TimeDoctorData.Instance.Profile.isValid() && TimeDoctorData.Instance.Auth.isValid());
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetUsers")]
        public BaseResponse GetUsers()
        {
            try
            {
                return new SuccessResponse(GetCall("/v1.1/companies/{company}/users?access_token={token}&_format=json"));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetTeamUserIds")]
        public BaseResponse GetTeamUserIds()
        {
            try
            {
                var users = TimeDoctorData.Instance.Profile.selectedUsers;

                return new SuccessResponse((users.Count == 0 ? null : users));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpPost()]
        [ActionName("SetTeamUsers")]
        public BaseResponse SetTeamUsers([FromBody]List<TimeDoctorData.TimeDoctorProfile.User> users)
        {
            try
            {
                if (users != null)
                {
                    return new SuccessResponse(TimeDoctorData.Instance.Profile.setUsers(users));
                }
                else
                {
                    return new ErrorResponse("Error: users is null");
                }
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }

        }

        [HttpGet()]
        [ActionName("GetTasks")]
        public BaseResponse GetTasks(string userId)
        {
            try
            {
                return new SuccessResponse(GetCall("/v1.1/companies/{company}/users/" + userId + "/tasks?access_token={token}&_format=json"));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetWorklogs")]
        public BaseResponse GetWorklogs([FromUri]List<string> userIds, string startDate, string endDate, int limit, int page)
        {
            try
            {
                return new SuccessResponse(GetCall("/v1.1/companies/{company}/worklogs?access_token={token}&_format=json&start_date=" + startDate + "&end_date=" + endDate + (userIds == null ? "" : "&user_ids=" + HttpUtils.toUrl(userIds) + "&offset=" + (page - 1) * limit + "&limit=" + limit)));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("RefreshToken")]
        public BaseResponse RefreshToken()
        {
            try
            {
                this.Auth(true);
                return new SuccessResponse(true);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet]
        [ActionName("GetProfile")]
        public BaseResponse GetProfile()
        {
            try
            {
                return new SuccessResponse(TimeDoctorData.Instance.Profile.get());
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        /** TOOLS **/
        public void Auth()
        {
            this.Auth(false);
        }

        protected void Auth(bool force)
        {
            bool newAuth = false;

            if (!TimeDoctorData.Instance.Auth.isValid() || force)
            {
                if (TimeDoctorServices.Instance.Auth())
                    newAuth = true;
            }
            if (!TimeDoctorData.Instance.Profile.isValid() || newAuth)
            {
                TimeDoctorServices.Instance.Loggin();
            }
        }

        protected Object GetCall(string uri)
        {
            try
            {
                if (!TimeDoctorData.Instance.Auth.isValid() || !TimeDoctorData.Instance.Profile.isValid())
                    this.Auth();
                uri = AppSettings.BaseTimeDoctorUrlApi + uri.Replace("{token}", TimeDoctorData.Instance.Auth.access_token).Replace("{company}", TimeDoctorData.Instance.Profile.user.company_id);
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
