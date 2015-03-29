angular.module('memory', [
  'ui.router',
  'LocalStorageModule'
])
  .config(function($urlRouterProvider, $locationProvider, $stateProvider) {
    'use strict';
    $stateProvider
      .state('app', {
        url: '/',
        views: {
          // the main template
          '': {
            templateUrl: '/app.html'
          },

          // the child view
          'board@app': {
            controller: 'BoardCtrl',
            templateUrl: '/board/board.html'
          },

          'score@app': {
            controller: 'ScoreCtrl',
            templateUrl: '/score/score.html'
          }
        }
      });

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
