angular.module('memory')
  .controller('AppCtrl', function($scope, gameService) {
    'use strict';

    $scope.createNewGame = function(){
      gameService.restartGame();
    };
  });
