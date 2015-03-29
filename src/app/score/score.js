angular.module('memory')
  .config(function($stateProvider) {
    'use strict';
    $stateProvider
      .state('score', {
        templateUrl: '/score/score.html',
        controller: 'ScoreCtrl'
      });
  });
