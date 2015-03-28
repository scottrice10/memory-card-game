
angular.module('memory', [
  'ngRoute',
  'memory.todo'
])
.config(function ($routeProvider) {
  'use strict';
  $routeProvider
    .when('/todo', {
      controller: 'TodoCtrl',
      templateUrl: '/memory/todo/todo.html'
    })
    .otherwise({
      redirectTo: '/todo'
    });
});
