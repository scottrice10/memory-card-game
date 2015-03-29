angular.module('memory')
  .controller('ScoreCtrl', function($scope, gameService) {
    'use strict';
    $scope.gameService = gameService;
  });
