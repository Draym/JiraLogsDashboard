using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InternalCustomisationDashboard.Models
{
    public class BaseResponse
    {
        public bool isSuccess;
        public Object data;
        public string errMessage;

        public BaseResponse(bool isSuccess, Object value, string errMessage)
        {
            this.errMessage = errMessage;
            this.isSuccess = isSuccess;
            this.data = value;
        }
    }

    public class SuccessResponse : BaseResponse
    {
        public SuccessResponse(object value) : base(true, value, null)
        {
        }
    }
    public class ErrorResponse : BaseResponse
    {
        public ErrorResponse(string errMessage) : base(false, null, errMessage)
        {
        }

        public ErrorResponse(Exception ex) : base(false, null, ex.Message)
        {
            if (ex.InnerException != null)
            {
                this.errMessage = ex.InnerException.Message;
            }
        }
    }
}