using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using InternalCustomisationDashboard.Models.AuthData;

namespace InternalCustomisationDashboard.Tools
{
    public sealed class TimeDoctorData
    {
        public TimeDoctorToken token;
        public TimeDoctorProfile profile;


        /** SINGLETON **/
        private static readonly TimeDoctorData m_instance = null;

        public static TimeDoctorData Instance
        {
            get
            {
                return m_instance;
            }
        }

        static TimeDoctorData()
        {
            m_instance = new TimeDoctorData();
        }

        private TimeDoctorData()
        {
        }
    }
}