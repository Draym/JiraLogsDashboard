var RequestApi = function ($http) {

    var api_url = "api/";

    function createParametersUrl(parameters) {
        var url = "";

        if (parameters != null && typeof parameters === 'object') {
            url += "?";
            var passed = false;

            angular.forEach(parameters, function (value, key) {
                if (passed) {
                    url += "&";
                }
                url += key + "=" + value;
                passed = true;
            });
        }

        return url;
    }

    function withData(method, url, data, success, failure, parameters) {
        $http({
            method: method,
            url: api_url + url + createParametersUrl(parameters),
            data: data,
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(
          function (response) {
              // success callback
              if (response.data != null && response.data.success == true) {
                  success(response);
              } else {
                  failure(response);
              }
          },
          function (response) {
              // failure callback
              failure(response);
          }
        );
    }

    function noData(method, url, success, failure, parameters) {
        $http({
            method: method,
            url: api_url + url + createParametersUrl(parameters),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(
          function (response) {
              // success callback
              if (response.data != null && ((response.data.success != null && response.data.success == true) || response.data.success == null)) {
                  success(response);
              } else {
                  failure(response);
              }
          },
          function (response) {
              // failure callback
              failure(response);
          }
        );
    }

    // Public API here
    return {
        POST: function (url, data, success, failure, parameters) {
            withData("POST", url, data, success, failure, parameters);
        },
        GET: function (url, success, failure, parameters) {
            noData("GET", url, success, failure, parameters);
        }
    };
}

RequestApi.$inject = ['$http'];