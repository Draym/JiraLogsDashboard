using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.Extensions.DependencyInjection;

[assembly: OwinStartup(typeof(InternalCustomiationDashboard.Controllers.Startup))]

namespace InternalCustomiationDashboard.Controllers
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=316888
            
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // Add application services.
            //services.AddSingleton<Services.IDespatchReportService, Services.DespatchReportService>();
        }

    }
}
