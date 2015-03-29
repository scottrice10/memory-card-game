angular.module('memory')
  .config(function($stateProvider) {
    'use strict';
    $stateProvider
      .state('board', {
        url: '/',
        templateUrl: '/memory/board/board.html',
        controller: 'BoardCtrl'
      });
  });
