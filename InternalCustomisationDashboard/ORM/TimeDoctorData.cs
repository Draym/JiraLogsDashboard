using InternalCustomisationDashboard.Tools;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InternalCustomisationDashboard.ORM
{
    public class TimeDoctorData
    {
        public TimeDoctorAuth Auth;
        public TimeDoctorProfile Profile;

        /** CLASSES **/
        public class TimeDoctorAuth
        {
            public string access_token { get; set; }
            public int expires_in { get; set; }
            public string token_type { get; set; }
            public string refresh_token { get; set; }

            public TimeDoctorAuth get()
            {
                if (!this.isValid())
                    this.load();
                return this;
            }
            public void save()
            {
                FileUtils.WriteFile(AppSettings.TimeDoctorAuth, JsonConvert.SerializeObject(this));
            }
            public bool load()
            {
                var result = this.loadFromDB();
                if (!result)
                    result = this.loadFromWeb();
                return result;

            }
            private bool loadFromDB()
            {
                try
                {
                    var data = FileUtils.ReadFile(AppSettings.TimeDoctorAuth);
                    if (data == null)
                    {
                        // TODO put log here
                        return false;
                    }
                    var result = JsonConvert.DeserializeObject<TimeDoctorAuth>(data);
                    this.access_token = result.access_token;
                    this.expires_in = result.expires_in;
                    this.refresh_token = result.refresh_token;
                    this.token_type = result.token_type;
                }
                catch (Exception ex)
                {
                    return false;
                }
                return true;
            }
            private bool loadFromWeb()
            {
                try
                {
                    string response = HttpUtils.Get("https://webapi.timedoctor.com/oauth/v2/token?client_id=" + AppSettings.TimeDoctorClientId + "&client_secret=" + AppSettings.TimeDoctorSecretId + "&grant_type=refresh_token&refresh_token=" + this.refresh_token);
                    var result = JsonConvert.DeserializeObject<TimeDoctorAuth>(response);
                    this.access_token = result.access_token;
                    this.expires_in = result.expires_in;
                    this.refresh_token = result.refresh_token;
                    this.token_type = result.token_type;
                    this.save();
                }
                catch (Exception ex)
                {
                    // TODO put log here
                    return false;
                }
                return true;
            }

            public void set(TimeDoctorAuth auth)
            {
                this.expires_in = auth.expires_in;
                this.access_token = auth.access_token;
                this.refresh_token = auth.refresh_token;
                this.token_type = auth.token_type;
                this.save();
            }

            public bool isValid()
            {
                return !String.IsNullOrEmpty(this.access_token);
            }
        }
        public class TimeDoctorProfile
        {
            public User user { get; set; }
            public List<User> selectedUsers { get; set; }

            public TimeDoctorProfile()
            {
                this.selectedUsers = new List<User>();
            }
            public TimeDoctorProfile get()
            {
                if (!this.isValid())
                    this.load();
                return this;
            }
            public void save()
            {
                FileUtils.WriteFile(AppSettings.TimeDoctorProfile, JsonConvert.SerializeObject(this));
            }
            public bool load()
            {
                var result = this.loadFromDB();
                if (!result)
                    result = this.loadFromWeb();
                return result;
            }
            private bool loadFromDB()
            {
                try
                {
                    var data = FileUtils.ReadFile(AppSettings.TimeDoctorProfile);
                    if (data == null)
                        throw new Exception("TimeDoctorProfile: file " + AppSettings.TimeDoctorProfile + " hasn't be found");
                    var result = JsonConvert.DeserializeObject<TimeDoctorProfile>(data);
                    this.user = result.user;
                    this.selectedUsers = result.selectedUsers;
                }
                catch (Exception ex)
                {
                    // TODO put log here
                    return false;
                }
                return this.isValid();
            }
            private bool loadFromWeb()
            {
                try
                {
                    string response = HttpUtils.Get("https://webapi.timedoctor.com/v1.1/companies?access_token=" + TimeDoctorData.Instance.Auth.access_token);
                    var result = JsonConvert.DeserializeObject<TimeDoctorProfile>(response);

                    this.user = result.user;
                    this.save();
                }
                catch (Exception ex)
                {
                    // TODO put log here
                    return false;
                }
                return true;
            }
            public bool setUsers(List<User> users)
            {
                this.selectedUsers = users;
                this.save();
                return true;
            }
            public void setUser(User user)
            {
                this.user = user;
                this.save();
            }
            public bool isValid()
            {
                return this.user != null && !String.IsNullOrEmpty(this.user.company_id);
            }

            public class User
            {
                public string user_id { get; set; }
                public string company_id { get; set; }
                public string company_name { get; set; }
                public string full_name { get; set; }
                public string email { get; set; }
                public string level { get; set; }
            }
        }

        /** SINGLETON **/
        private static readonly TimeDoctorData instance = new TimeDoctorData();
        static TimeDoctorData()
        {
        }
        private TimeDoctorData()
        {
            this.Auth = new TimeDoctorAuth();
            this.Auth.load();
            this.Profile = new TimeDoctorProfile();
            this.Profile.load();
        }
        public static TimeDoctorData Instance
        {
            get
            {
                return instance;
            }
        }
    }
}