angular.module('memory')
  .controller('ScoreCtrl', function($scope, gameService) {
    'use strict';
    $scope.isComputerTurn = gameService.isComputerTurn;
    $scope.playerMatches = gameService.playerMatches;
    $scope.computerMatches = gameService.computerMatches;
    $scope.pairs = gameService.pairs;

    $scope.createNewGame = function(){
      gameService.restartGame();
    };

    $scope.isRedCardLabel = function(card){
      return card.suitName === 'Hearts' || card.suitName === 'Diamonds';
    };

    //init
    $scope.$on('restartGame', function(){
      $scope.isComputerTurn = gameService.isComputerTurn;
      $scope.playerMatches = gameService.playerMatches;
      $scope.computerMatches = gameService.computerMatches;
      $scope.pairs = gameService.pairs;
    });
  });
