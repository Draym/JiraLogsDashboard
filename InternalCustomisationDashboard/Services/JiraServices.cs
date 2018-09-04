using Atlassian.Jira;
using InternalCustomisationDashboard.Models;
using InternalCustomisationDashboard.Models.AuthData;
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

        public JiraServices()
        {
            this.JiraAuth();
        }

        public void JiraAuth()
        {
            var saveConf = FileUtils.ReadFile(AppSettings.JiraConf);
            if (saveConf == null)
                throw new Exception("Auth: file " + AppSettings.JiraConf + " hasn't be found");
            var profile = JsonConvert.DeserializeObject<JiraProfile>(saveConf).get();
            
            _jira = Jira.CreateRestClient(profile.url, profile.username, profile.password);
        }

        public List<Project> getProjects()
        {
            return _jira.Projects.GetProjectsAsync().Result.ToList();
        }

        public Project getProject(string name)
        {
            return _jira.Projects.GetProjectAsync(name).Result;
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
    }
}