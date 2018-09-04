using InternalCustomisationDashboard.Tools;
using Newtonsoft.Json;

namespace InternalCustomisationDashboard.Models.AuthData
{
    public class TimeDoctorToken
    {
        public string access_token;
        public int expires_in;
        public string token_type;
        public string refresh_token;
    }

    public class TimeDoctorProfile
    {
        public User user;

        public class User
        {
            public string user_id;
            public string company_id;
        }
    }

    public class JiraProfile
    {
        public string url;
        public string username;
        public string password;

        public JiraProfile get()
        {
            var result = new JiraProfile();
            result.url = this.url;
            result.username = this.username;
            result.password = EncoderUtils.decode(this.password);
            return result;
        }

        public void save(string path)
        {
            var result = new JiraProfile();
            result.url = this.url;
            result.username = this.username;
            result.password = EncoderUtils.decode(this.password);

            FileUtils.WriteFile(path, JsonConvert.SerializeObject(result));
        }
    }
}