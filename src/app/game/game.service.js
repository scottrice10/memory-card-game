angular.module('memory')
  .service('gameService', function($timeout, localStorageService, deckService) {
    'use strict';
    var game = {};
    game.revealedCards = localStorageService.get('mem.revealed') ? localStorageService.get('mem.revealed') : [];
    game.totalMatchCount = localStorageService.get('mem.totalMatchCount') ? localStorageService.get('mem.totalMatchCount') : 0;

    game.addToRevealedCards = function(card, callback) {
      var isTurnOver = false;
      var isRemove = false;
      var isGameOver = false;

      // keep track of revealed cards
      game.revealedCards.push(card);
      localStorageService.set('mem.revealed', game.revealedCards);

      if(game.revealedCards.length === 2) {
        isTurnOver = true;

        // if revealed cards are a match, increment match count until game should be restarted
        if(game.revealedCards[0].value === game.revealedCards[1].value) {
          isRemove = true;

          // increment total match count
          game.totalMatchCount += 1;
          localStorageService.set('mem.totalMatchCount', game.totalMatchCount);

          //if total matches is 26, then game over and needs to be restarted
          if(game.totalMatchCount === 26) {
            isGameOver = true;
            game.totalMatchCount = 0;
            localStorageService.set('mem.totalMatchCount', game.totalMatchCount);

            game.restartGame();
          }
        }

        // when turn over, set cards to not revealed
        deckService.updateDeck(function(currDeck) {
          for(var i = 0; i < currDeck.length; i++) {

            //find the revealed cards in the deck
            if((currDeck[i].value === game.revealedCards[0].value && currDeck[i].suitName === game.revealedCards[0].suitName) ||
              (currDeck[i].value === game.revealedCards[1].value && currDeck[i].suitName === game.revealedCards[1].suitName)) {

              // if revealed cards are a match, remove them from the deck
              // else reset the revealed cards to be not revealed
              if(isRemove) {
                currDeck[i].value = null;
                currDeck[i].removed = true;
              } else {
                currDeck[i].revealed = false;
              }
            }
          }

          // empty revealed cards storage containers
          game.revealedCards = [];
          localStorageService.set('mem.revealed', []);

          return currDeck;
        });
      }

      if(!isGameOver) {
        $timeout(function() {
          callback(isTurnOver, isRemove);
        }, 2000);
      }
    };

    game.removeFromRevealedCards = function(card) {
      // when flipping a card back to hidden, remove it from array of revealed cards
      for(var i = 0; i < game.revealedCards.length; i++) {
        if(game.revealedCards[i].value === card.value) {
          game.revealedCards.splice(i, 1);
          localStorageService.set('mem.revealed', game.revealedCards);
        }
      }
    };

    game.restartGame = function() {
      deckService.newDeck();
    };

    return game;
  });
