using InternalCustomisationDashboard.Models;
using InternalCustomisationDashboard.Tools;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InternalCustomisationDashboard.ORM
{
    public class JiraData
    {
        public JiraAuth Auth;
        public JiraProfile Profile;

        /** CLASSES **/
        public class JiraAuth
        {
            public string url { get; set; }
            public string username { get; set; }
            public string password { get; set; }

            public JiraAuth get()
            {
                if (!this.isValid())
                    this.load();
                return this;
            }
            public void save()
            {
                var result = new JiraAuth();
                result.url = this.url;
                result.username = this.username;
                result.password = EncoderUtils.encode(this.password);

                FileUtils.WriteFile(AppSettings.JiraAuth, JsonConvert.SerializeObject(result));
            }
            public bool load()
            {
                return this.loadFromDB();
            }
            private bool loadFromDB()
            {
                var data = FileUtils.ReadFile(AppSettings.JiraAuth);
                if (String.IsNullOrEmpty(data))
                {
                    // TODO put log here
                    return false;
                }
                var result = JsonConvert.DeserializeObject<JiraAuth>(data);
                this.url = result.url;
                this.username = result.username;
                this.password = EncoderUtils.decode(result.password);
                return this.isValid();
            }
            public void set(JiraAuth user)
            {
                this.url = user.url;
                this.username = user.username;
                this.password = user.password;
                this.save();
            }
            public void delete()
            {
                this.url = null;
                this.username = null;
                this.password = null;
                this.save();
            }
            public bool isValid()
            {
                return !String.IsNullOrEmpty(this.username);
            }
        }
        public class JiraProfile
        {
            private readonly string specificUserFieldId = "Developer";
            public string project { get; set; }
            public List<User> selectedUsers { get; set; }

            public JiraProfile()
            {
                this.selectedUsers = new List<User>();
            }
            public JiraProfile get()
            {
                if (!this.isValid())
                    this.load();
                return this;
            }
            public void save()
            {
                FileUtils.WriteFile(AppSettings.JiraProfile, JsonConvert.SerializeObject(this));
            }
            public bool load()
            {
                return this.loadFromDB();
            }
            private bool loadFromDB()
            {
                var data = FileUtils.ReadFile(AppSettings.JiraProfile);
                if (data == null)
                {
                    // TODO put log here
                    return false;
                }
                var result = JsonConvert.DeserializeObject<JiraProfile>(data);

                this.project = result.project;
                this.selectedUsers = result.selectedUsers;
                return true;
            }

            public bool setProject(string project)
            {
                this.project = project;
                this.selectedUsers = new List<User>();
                this.save();
                return true;
            }

            public bool setUsers(List<User> users)
            {
                if (project == null)
                    return false;
                this.selectedUsers = users;
                this.save();
                return true;
            }
            public bool isValid()
            {
                return !String.IsNullOrEmpty(this.project);
            }
            public bool containsUser(JiraIssue issue)
            {
                foreach (var user in this.selectedUsers)
                {
                    if (user.full_name == issue.Assignee)
                        return true;
                    else
                    {
                        foreach (var field in issue.CustomFields)
                        {
                            if (field.Name == this.specificUserFieldId)
                            {
                                foreach (var value in field.Values)
                                {
                                    if (value == user.full_name)
                                    {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
                return false;
            }
            public class User
            {
                public string user_id { get; set; }
                public string full_name { get; set; }
                public string color { get; set; }
            }
        }

        /** SINGLETON **/
        private static readonly JiraData instance = new JiraData();
        static JiraData()
        {
        }
        private JiraData()
        {
            this.Auth = new JiraAuth();
            this.Auth.load();
            this.Profile = new JiraProfile();
            this.Profile.load();
        }
        public static JiraData Instance
        {
            get
            {
                return instance;
            }
        }
    }
}