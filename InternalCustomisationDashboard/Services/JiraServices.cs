using Atlassian.Jira;
using InternalCustomisationDashboard.Models;
using InternalCustomisationDashboard.ORM;
using InternalCustomisationDashboard.Tools;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

namespace InternalCustomiationDashboard.Services
{
    public class JiraServices
    {
        private Jira _jira;

        private void Auth()
        {
            if (!JiraData.Instance.Auth.load())
                return;
            try
            {
                this.JiraAuth(JiraData.Instance.Auth);
            }
            catch (Exception ex)
            {
                JiraData.Instance.Auth.delete();
                Console.WriteLine(ex.Message);
            }
        }

        public void JiraAuth(JiraData.JiraAuth user)
        {
            if (user == null)
                throw new Exception("Login failled: no user provided");
            try
            {
                _jira = Jira.CreateRestClient(user.url, user.username, user.password);

                var check = _jira.Users.GetUserAsync(user.username).Result;

                JiraData.Instance.Auth.set(user);
            }
            catch (Exception ex)
            {
                throw new Exception("Login failled: " + ex.Message);
            }
        }

        public IEnumerable<Project> getProjects()
        {
            return _jira.Projects.GetProjectsAsync().Result;
        }

        public Project getProject(string name)
        {
            return _jira.Projects.GetProjectAsync(name).Result;
        }

        public List<JiraUser> getUsers(string project)
        {
            //return _jira.Users.SearchUsersAsync("username="+project).Result.ToList();
            return _jira.Groups.GetUsersAsync(project).Result.ToList();
        }

        public List<JiraIssue> getIssues(string jqlSearch, int maxValues, int page)
        {
            var response = _jira.Issues.GetIssuesFromJqlAsync(jqlSearch, maxValues, maxValues * (page - 1));
            var issues = response.Result;
            var result = new List<JiraIssue>();
            foreach (var issue in issues)
            {
                result.Add(new JiraIssue(issue));
            }
            return result;
        }

        public JiraIssue getIssue(string key)
        {
            return new JiraIssue(_jira.Issues.GetIssueAsync(key).Result);
        }

        /** SINGLETON **/
        private static readonly JiraServices instance = new JiraServices();
        static JiraServices()
        {
        }
        private JiraServices()
        {
            this.Auth();
        }
        public static JiraServices Instance
        {
            get
            {
                return instance;
            }
        }
    }
}