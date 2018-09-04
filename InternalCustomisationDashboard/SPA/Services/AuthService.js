var Auth = function (RequestApi, $window) {

    // Public API here
    return {
        TimeDoctor: function () {
            RequestApi.GET("TimeDoctor/Auth", function (response) {
                $window.open(response.data, '_blank');
            }, function (error) {
                console.log("error:", error);
            });
        }
    }
}
Auth.$inject = ['RequestApi', '$window'];