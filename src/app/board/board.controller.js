angular.module('memory')
  .controller('BoardCtrl', function($scope, deckService, localStorageService) {
    'use strict';
    $scope.cards = localStorageService.get('mem.deck') ? localStorageService.get('mem.deck') : localStorageService.set('mem.deck', deckService());
  });
