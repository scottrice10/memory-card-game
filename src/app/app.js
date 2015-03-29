angular.module('memory', [
  'ui.router',
  'LocalStorageModule'
])
  .config(function($urlRouterProvider, $locationProvider) {
    'use strict';
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
