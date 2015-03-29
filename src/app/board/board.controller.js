angular.module('memory')
  .controller('BoardCtrl', function($scope, deckService) {
    'use strict';
    $scope.cards = deckService.deck;
  });
