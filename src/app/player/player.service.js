angular.module('memory')
  .service('playerService', function($rootScope, $q, $timeout, localStorageService, deckService) {
    'use strict';
    var player = {};
    player.cardsVisitedMap = localStorageService.get('mem.cardsVisitedMap') ? localStorageService.get('mem.cardsVisitedMap') : {};
    player.revealedCards = localStorageService.get('mem.revealedCards') ? localStorageService.get('mem.revealedCards') : [];
    player.matchesStack = localStorageService.get('mem.matchesStack') ? localStorageService.get('mem.matchesStack') : [];
    player.remainingCards = localStorageService.get('mem.remainingCards') ? localStorageService.get('mem.remainingCards') : angular.copy(deckService.deck);

    player.updateCardsVisitedMap = function(card, isDelete) {
      var deferred = $q.defer();
      if(card && isDelete && player.cardsVisitedMap[card.value]) {
        player.cardsVisitedMap[card.value].shift();
      } else if(card) {
        player.updateRemainingCards(card.value, card.suitName);

        //check whether matching card
        if(player.cardsVisitedMap[card.value] && player.cardsVisitedMap[card.value].length > 0) {
          player.matchesStack.push(card);
          player.matchesStack.push(player.cardsVisitedMap[card.value].pop());
          localStorageService.set('mem.cardsVisitedMap', player.cardsVisitedMap);
          localStorageService.set('mem.matchesStack', player.cardsVisitedMap);
          deferred.resolve(card);
        } else {
          player.cardsVisitedMap[card.value] = [card];
          localStorageService.set('mem.cardsVisitedMap', player.cardsVisitedMap);
          deferred.resolve(card);
        }
      }

      return deferred.promise;
    };

    player.updateRemainingCards = function(value, suitName) {
      for(var i = 0; i < player.remainingCards.length; i++) {
        if(player.remainingCards[i].value === value && player.remainingCards[i].suitName === suitName) {
          player.remainingCards.splice(i, 1);
          return localStorageService.set('mem.remainingCards', player.remainingCards);
        }
      }
    };

    player.resetRemainingCards = function() {
      player.remainingCards = angular.copy(deckService.deck);
      localStorageService.set('mem.remainingCards', player.remainingCards);
    };

    return player;
  });
