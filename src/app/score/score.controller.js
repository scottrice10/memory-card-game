angular.module('memory')
  .controller('ScoreCtrl', function($scope, gameService, computerPlayerService, playerService) {
    'use strict';
    $scope.isComputerTurn = computerPlayerService.isComputerTurn;
    $scope.playerMatches = gameService.playerMatches;
    $scope.computerMatches = gameService.computerMatches;
    $scope.pairs = gameService.pairs;
    $scope.revealedCards = playerService.revealedCards;

    $scope.createNewGame = function(){
      gameService.restartGame();
    };

    $scope.isRedCardLabel = function(card){
      return card.suitName === 'Hearts' || card.suitName === 'Diamonds';
    };

    //init
    $scope.$on('restartGame', function(){
      $scope.isComputerTurn = computerPlayerService.isComputerTurn;
      $scope.playerMatches = gameService.playerMatches;
      $scope.computerMatches = gameService.computerMatches;
      $scope.pairs = gameService.pairs;
      $scope.revealedCards = playerService.revealedCards;
    });

    $scope.$on('revealedCardsUpdated', function(){
      $scope.revealedCards = playerService.revealedCards;
    });

    $scope.$on('computerTurnUpdated', function(){
      $scope.isComputerTurn = computerPlayerService.isComputerTurn;
    });
  });
