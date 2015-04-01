angular.module('memory')
  .service('computerPlayerService', function($rootScope, $q, $timeout, localStorageService, deckService, playerService) {
    'use strict';
    var computer = {};
    computer.isComputerTurn = localStorageService.get('mem.isComputerTurn') ? localStorageService.get('mem.isComputerTurn') : false;

    computer.playComputerHand = function(revealedCards) {
      if(revealedCards.length === 0 && playerService.matchesStack.length > 0 && playerService.matchesStack.length % 2 === 0){
        computer.clickCard(playerService.matchesStack.pop());
      } else if(revealedCards.length === 1 && playerService.matchesStack.length % 2 === 1){
        computer.clickCard(playerService.matchesStack.pop());
      } else {
        computer.computerSelectCard();
      }
    };

    computer.computerSelectCard = function() {
      var deferred = $q.defer();
      var card = null;

      if(playerService.remainingCards.length < 20) {
        playerService.resetRemainingCards();
      }

      for(var i = 0; i < playerService.remainingCards.length; i++) {
        if(!playerService.remainingCards[i].visited && playerService.remainingCards[i].value
          && playerService.remainingCards[i].value !== 'null' && !playerService.remainingCards[i].removed) {
          card = playerService.remainingCards[i];
          break;
        }
      }

      if(card) {
        card.visited = true;
        computer.clickCard(card).then(function() {
          playerService.updateCardsVisitedMap(card).then(function() {
            deferred.resolve();
          });
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    computer.checkForMatchInVisitedMap = function() {
      var deferred = $q.defer();
      var matchingCard1 = null;
      var matchingCard2 = null;
      for(var key in playerService.cardsVisitedMap) {
        if(playerService.cardsVisitedMap.hasOwnProperty(key) && playerService.cardsVisitedMap[key].length > 1) {
          matchingCard1 = playerService.cardsVisitedMap[key][0];
          matchingCard1.revealed = false;
          matchingCard2 = playerService.cardsVisitedMap[key][1];
          matchingCard2.revealed = false;
          break;
        }
      }

      if(matchingCard1 && matchingCard2) {
        // when match, removing matching cards from visited map afterwards
        computer.clickCard(matchingCard1).then(function() {
          playerService.updateCardsVisitedMap(matchingCard1, true).then(function() {
            computer.clickCard(matchingCard2).then(function() {
              playerService.updateCardsVisitedMap(matchingCard2, true).then(function() {
                deferred.resolve(true);
              });
            });
          });
        });
      } else {
        deferred.resolve(false);
      }

      return deferred.promise;
    };

    computer.setComputerTurn = function(isOn) {
      computer.isComputerTurn = isOn;
      localStorageService.set('mem.isComputerTurn', isOn);

      // score controller listening for this event
      $rootScope.$broadcast('computerTurnUpdated');
    };

    computer.clickCard = function(card) {
      // this pauses 1 second, then selects a card, then pauses for another second to simulate a real player selecting a card
      // $timeout returns a promise
      return $timeout(function() {
        jQuery('#' + card.value + card.suitName).click();
      }, 1000).then($timeout(function() {
      }, 1000));
    };

    return computer;
  });
