var ConfigScreenCtrl = function ($scope, RequestApi, Auth, $location) {

    $scope.UI = {};
    $scope.JiraAuth = { url: "", username: "", password: "" }
    $scope.Jira = { Data: { Users: [], Projects: [] }, Selected: { selectedUsers: [], project: "CST" }, Account: {} };
    $scope.TDoctor = { Data: { Users: [] }, Selected: { selectedUsers: [], user: {} } };

    /** COLOR PICKER **/
    $scope.options = {
        format: 'rgb',
        alpha: false,
        saturation: false,
        lightness: false,
        restrictToFormat: true,
        allowEmpty: false,
    };

    $scope.colorEventApi = {
        onChange: function (api, color, $event) {
            saveJiraUsers();
        },
        onBlur: function (api, color, $event) { },
        onOpen: function (api, color, $event) { },
        onClose: function (api, color, $event) { },
        onClear: function (api, color, $event) { },
        onReset: function (api, color, $event) { },
        onDestroy: function (api, color) { },
    };

    /** BUTTONS **/

    $scope.moveToDashboards = function () {
        $location.path("/");
    }

    /** EVENT **/
    $scope.selectProject = function () {
        console.log($scope.Jira.Selected);

        RequestApi.POST("Jira/SetProject", {}, function (response) {
            console.log("J.sP:", response);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        }, { project: $scope.Jira.Selected.project });
    }

    $scope.addJiraUser = function (user) {
        console.log(user)
        for (var i = 0; i < $scope.Jira.Selected.selectedUsers.length; ++i) {
            if ($scope.Jira.Selected.selectedUsers[i].user_id === user.user_id) {
                return;
            }
        }
        $scope.Jira.Selected.selectedUsers.push(user);
        console.log("add user in TDoctor > " + user.user_id);
        saveJiraUsers();
    }
    $scope.deleteJiraUser = function (user) {
        for (var i = 0; i < $scope.Jira.Selected.selectedUsers.length; ++i) {
            if ($scope.Jira.Selected.selectedUsers[i].user_id === user.user_id) {
                $scope.Jira.Selected.selectedUsers.splice(i, 1);
                console.log("remove user from TDoctor > " + user.user_id);
                --i;
            }
        }
        saveJiraUsers();
    }

    $scope.addTDUser = function (user) {
        console.log(user)
        for (var i = 0; i < $scope.TDoctor.Selected.selectedUsers.length; ++i) {
            if ($scope.TDoctor.Selected.selectedUsers[i].user_id === user.user_id) {
                return;
            }
        }
        $scope.TDoctor.Selected.selectedUsers.push(user);
        console.log("add user in TDoctor > " + user.user_id);
        saveTDUsers();
    }
    $scope.deleteTDUser = function (user) {
        for (var i = 0; i < $scope.TDoctor.Selected.selectedUsers.length; ++i) {
            if ($scope.TDoctor.Selected.selectedUsers[i].user_id === user.user_id) {
                $scope.TDoctor.Selected.selectedUsers.splice(i, 1);
                console.log("remove user from TDoctor > " + user.user_id);
                --i;
            }
        }
        saveTDUsers();
    }

    /** AUTH **/
    $scope.authTimeDoctor = function () {
        Auth.TimeDoctor(initTDoctor);
    }
    $scope.authJira = function () {
        console.log($scope.Jira);
        Auth.Jira($scope.JiraAuth, function (response) {
            $("#loginJira").modal('hide');

            $scope.Jira.Account.username = $scope.JiraAuth.username;
            $scope.Jira.Account.url = $scope.JiraAuth.url;

            initTDoctor()
        }, function (error) {
            $("#loginJiraAlert").show();

            $scope.Jira.Account.username = "username";
            $scope.Jira.Account.url = "url";
        });
    }

    /** DATA JIRA **/
    var getJiraConfig = function (callbacks) {
        RequestApi.GET("Jira/GetProfile", function (response) {
            console.log("J.Config:", response);
            $scope.Jira.Selected = response.data;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    var getJiraAccount = function (callbacks) {
        RequestApi.GET("Jira/GetAccount", function (response) {
            console.log("J.Account:", response);
            $scope.Jira.Account = response.data;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    var getJiraUsers = function (callbacks) {
        if (!$scope.Jira.Selected.project) {
            return;
        }
        RequestApi.GET("Jira/GetUsers", function (response) {
            console.log("J.Users:", response);
            $scope.Jira.Data.Users = response.data;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        }, { project: $scope.Jira.Selected.project });
    }
    var getJiraProjects = function (callbacks) {
        RequestApi.GET("Jira/GetProjects", function (response) {
            console.log("J.Projects:", response);
            $scope.Jira.Data.Projects = response.data;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    var saveJiraUsers = function (callbacks) {
        RequestApi.POST("Jira/SetTeamUsers", { selectedUsers: $scope.Jira.Selected.selectedUsers }, function (response) {
            console.log("J.SetUsers:", response);
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }

    /** DATA TIME DOCTOR **/
    var getTimeDoctorConfig = function (callbacks) {
        RequestApi.GET("TimeDoctor/GetProfile", function (response) {
            console.log("TD.Config:", response);
            $scope.TDoctor.Selected = response.data;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    var getTimeDoctorUsers = function (callbacks) {
        RequestApi.GET("TimeDoctor/GetUsers", function (response) {
            var data = JSON.parse(response.data);
            console.log("TD.Users:", data);
            data.users[0].guichecked = true;
            $scope.TDoctor.Data.Users = data.users;
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    var saveTDUsers = function (callbacks) {
        console.log($scope.TDoctor.Selected.selectedUsers);
        RequestApi.POST("TimeDoctor/SetTeamUsers", $scope.TDoctor.Selected.selectedUsers, function (response) {
            console.log("TD.SetUsers:", response);
            triggerCallback(callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }

    /** TOOLS **/
    var triggerCallback = function (callbacks) {
        if (callbacks && callbacks[0]) {
            var callback = callbacks.shift();
            callback(callbacks);
        } else {
            $scope.isBusy = false;
        }
    }

    /** INIT **/
    var initTDoctor = function () {
        getTimeDoctorConfig([getTimeDoctorUsers]);
    }

    var initJira = function () {
        getJiraConfig([getJiraAccount, getJiraProjects, getJiraUsers]);
    }

    $scope.init = function () {
        initTDoctor();
        initJira();
    }

    $scope.init();
};
