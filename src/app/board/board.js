angular.module('memory')
  .config(function($stateProvider) {
    'use strict';
    $stateProvider
      .state('board', {
        controller: 'BoardCtrl',
        templateUrl: '/memory/board/board.html'
      });
  });
