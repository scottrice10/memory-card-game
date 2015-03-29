angular.module('memory')
  .config(function($stateProvider) {
    'use strict';
    $stateProvider
      .state('score', {
        templateUrl: '/memory/score/score.html',
        controller: 'ScoreCtrl'
      });
  });
