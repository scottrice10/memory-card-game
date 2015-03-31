angular.module('memory')
  .controller('BoardCtrl', function($scope, deckService) {
    'use strict';
    $scope.cards = deckService.deck;

    $scope.$on('restartGame', function(){
      $scope.cards = deckService.deck;
    });
  });
