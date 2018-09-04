angular
    .module('app', ['ngRoute',
        'ui.router',
        'ui.bootstrap',
        'selector',
        'chart.js',
        'angularMoment',
        'ngCookies',
        'ngSanitize'])
    .controller('MainCtrl', MainCtrl)
    .service('RequestApi', RequestApi)
    .service('Auth', Auth)
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
          .when('/', {
              templateUrl: '../SPA/Views/Main.html',
              controller: MainCtrl
          })
          .otherwise({
              redirectTo: '/'
          });

        $locationProvider.hashPrefix('');
    });