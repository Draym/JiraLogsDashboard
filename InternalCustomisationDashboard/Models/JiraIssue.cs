using Atlassian.Jira;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InternalCustomisationDashboard.Models
{
    public class JiraIssue
    {
        public JiraIssue(Atlassian.Jira.Issue issue)
        {
            this.Assignee = issue.Assignee;
            this.Created = issue.Created;
            this.CustomFields = issue.CustomFields;
            this.DueDate = issue.DueDate;
            this.Labels = issue.Labels;
            this.Priority = issue.Priority;
            this.Project = issue.Project;
            this.Reporter = issue.Reporter;
            this.Resolution = issue.Resolution;
            this.ResolutionDate = issue.ResolutionDate;
            this.SecurityLevel = issue.SecurityLevel;
            this.Status = issue.Status;
            this.Summary = issue.Summary;
            this.TimeTrackingData = issue.TimeTrackingData;
            this.Type = issue.Type;
            this.Updated = issue.Updated;
            this.Votes = issue.Votes;
            this.Components = issue.Components;
        }

        public string Assignee { get; }
        public DateTime? Created { get; }
        public CustomFieldValueCollection CustomFields { get; }
        public DateTime? DueDate { get; }
        public IssueLabelCollection Labels { get; }
        public IssuePriority Priority { get; }
        public string Project { get; }
        public string Reporter { get; }
        public IssueResolution Resolution { get; }
        public DateTime? ResolutionDate { get; }
        public IssueSecurityLevel SecurityLevel { get; }
        public IssueStatus Status { get; }
        public string Summary { get; }
        public IssueTimeTrackingData TimeTrackingData { get; }
        public IssueType Type { get; }
        public DateTime? Updated { get; }
        public long? Votes { get; }
        public ProjectComponentCollection Components { get; }
    }
}