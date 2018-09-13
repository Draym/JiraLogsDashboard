using InternalCustomiationDashboard.Services;
using InternalCustomisationDashboard.Models;
using InternalCustomisationDashboard.ORM;
using System;
using System.Web.Http;

namespace InternalCustomiationDashboard.Controllers
{
    public class JiraController : ApiController
    {
        public JiraController()
        {
        }
        [HttpPost()]
        [ActionName("Auth")]
        public BaseResponse Auth(JiraData.JiraAuth user)
        {
            try
            {
                JiraServices.Instance.JiraAuth(user);
                return new SuccessResponse(true);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetProjects")]
        public BaseResponse GetProjects()
        {
            try
            {
                return new SuccessResponse(JiraServices.Instance.getProjects());
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }
        [HttpGet()]
        [ActionName("GetUsers")]
        public BaseResponse GetUsers(string project)
        {
            try
            {
                return new SuccessResponse(JiraServices.Instance.getUsers(project));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetProject")]
        public BaseResponse GetProject(string name)
        {
            try
            {
                return new SuccessResponse(JiraServices.Instance.getProject(name));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetAllIssues")]
        public BaseResponse GetAllIssues(string jqlSearch, int maxValues, int? page)
        {
            try
            {
                var result = JiraServices.Instance.getIssues(jqlSearch, maxValues, (page.HasValue ? page.Value : 1));
                return new SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetTeamIssues")]
        public BaseResponse GetTeamIssues(string jqlSearch, int maxValues, int? page)
        {
            try
            {
                var result = JiraServices.Instance.getIssues(jqlSearch, maxValues, (page.HasValue ? page.Value : 1));

                result.RemoveAll(item => !JiraData.Instance.Profile.containsUser(item));

                return new SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet()]
        [ActionName("GetIssue")]
        public BaseResponse GetIssue(string key)
        {
            try
            {
                return new SuccessResponse(JiraServices.Instance.getIssue(key));
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
                return new SuccessResponse(JiraData.Instance.Profile.get());
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpGet]
        [ActionName("GetAccount")]
        public BaseResponse GetAccount()
        {
            try
            {
                var auth = JiraData.Instance.Auth.get();

                auth.password = null;
                return new SuccessResponse(auth);
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpPost]
        [ActionName("SetProject")]
        public BaseResponse SetProject([FromUri]string project)
        {
            try
            {
                return new SuccessResponse(JiraData.Instance.Profile.setProject(project));
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }

        [HttpPost]
        [ActionName("SetTeamUsers")]
        public BaseResponse SetTeamUsers(JiraData.JiraProfile request)
        {
            try
            {
                if (request != null && request.selectedUsers != null)
                {
                    return new SuccessResponse(JiraData.Instance.Profile.setUsers(request.selectedUsers));
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
        [ActionName("IsConfigValid")]
        public BaseResponse IsConfigValid()
        {
            try
            {
                return new SuccessResponse(JiraData.Instance.Profile.isValid() && JiraData.Instance.Auth.isValid());
            }
            catch (Exception ex)
            {
                return new ErrorResponse(ex);
            }
        }
    }
}
