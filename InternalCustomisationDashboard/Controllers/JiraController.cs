using Atlassian.Jira;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace InternalCustomiationDashboard.Controllers
{
    public class JiraController : ApiController
    {
        private readonly Services.JiraServices _JiraService;

        public JiraController()
        {
            _JiraService = new Services.JiraServices();
        }

        [HttpGet()]
        [ActionName("GetProjects")]
        public Object GetProjects()
        {
            try
            {
                return _JiraService.getProjects();
            }
            catch (Exception e)
            {
                Debug.WriteLine("exception: " + e.Message);
                return e;
            }
        }

        [HttpGet()]
        [ActionName("GetProject")]
        public Object GetProject(string name)
        {
            try
            {
                return _JiraService.getProject(name);
            }
            catch (Exception e)
            {
                Debug.WriteLine("exception: " + e.Message);
                return e;
            }
        }

        [HttpGet()]
        [ActionName("GetIssues")]
        public Object GetIssues(string jqlSearch, int maxValues, int? page)
        {
            try
            {
                var result = _JiraService.getIssues(jqlSearch, maxValues, (page.HasValue ? page.Value : 1));
                return result;
            }
            catch (Exception e)
            {
                Debug.WriteLine("exception: " + e.Message);
                return e;
            }
        }

        [HttpGet()]
        [ActionName("GetIssue")]
        public Object GetIssue(string key)
        {
            try
            {
                return _JiraService.getIssue(key);
            }
            catch (Exception e)
            {
                Debug.WriteLine("exception: " + e.Message);
                return e;
            }
        }
    }
}
