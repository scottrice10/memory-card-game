angular.module('memory', [
  'ui.router',
  'LocalStorageModule',
  'ngTouch'
])
  .config(function($urlRouterProvider, $locationProvider, $stateProvider) {
    'use strict';
    $stateProvider
      .state('app', {
        url: '/',
        views: {
          // the main template
          '': {
            controller: 'AppCtrl',
            templateUrl: '/memory/app/app.html'
          },

          // the child view
          'board@app': {
            controller: 'BoardCtrl',
            templateUrl: '/memory/board/board.html'
          },

          'score@app': {
            controller: 'ScoreCtrl',
            templateUrl: '/memory/score/score.html'
          }
        }
      });

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
