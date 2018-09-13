angular
    .module('app', ['ngRoute',
        'ui.router',
        'ui.bootstrap',
        'ui.select',
        'selector',
        'chart.js',
        'color.picker',
        'angularMoment',
        'ngCookies',
        'ngSanitize'])
    .controller('MainCtrl', MainCtrl, ['$scope', 'RequestApi', 'Auth', '$location'])
    .controller('ConfigScreenCtrl', ConfigScreenCtrl, ['$scope', 'RequestApi', 'Auth', '$location'])
    .service('RequestApi', RequestApi, ['$http'])
    .service('Auth', Auth, ['RequestApi', '$window'])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
          .when('/', {
              templateUrl: '../SPA/Views/Main.html',
              controller: MainCtrl
          }).when('/config', {
              templateUrl: '../SPA/Views/ConfigScreen.html',
              controller: ConfigScreenCtrl
          }).otherwise({
              redirectTo: '/'
          });

        $locationProvider.hashPrefix('');
    });