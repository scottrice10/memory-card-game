angular.module('memory')
  .config(function($stateProvider) {
    'use strict';
    $stateProvider
      .state('board', {
        controller: 'BoardCtrl',
        templateUrl: '/board/board.html'
      });
  });
