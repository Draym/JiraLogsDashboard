var Auth = function (RequestApi, $window) {

    // Public API here
    return {
        TimeDoctor: function () {
            RequestApi.GET("TimeDoctor/Auth", function (response) {
                $window.open(response.data, '_blank');
            }, function (error) {
                console.log("error:", error);
            });
        },
        Jira: function (login, success, error) {
            RequestApi.POST("Jira/Auth", login, function (response) {
                success(response);
            }, function (response) {
                error(response);
            });
        }
    }
}