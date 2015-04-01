angular.module('memory')
  .service('gameService', function($rootScope, $q, $timeout, localStorageService, deckService, computerPlayerService, playerService) {
    'use strict';
    var game = {};
    game.computerMatches = localStorageService.get('mem.computerMatches') ? localStorageService.get('mem.computerMatches') : [];
    game.playerMatches = localStorageService.get('mem.playerMatches') ? localStorageService.get('mem.playerMatches') : [];
    game.pairs = localStorageService.get('mem.pairs') ? localStorageService.get('mem.pairs') : [];

    game.restartGame = function() {
      computerPlayerService.isComputerTurn = false;
      localStorageService.set('mem.isComputerTurn', false);
      playerService.revealedCards = [];
      localStorageService.set('mem.revealedCards', []);
      playerService.remainingCards = angular.copy(deckService.deck);
      localStorageService.set('mem.remainingCards', playerService.remainingCards);
      playerService.cardsVisitedMap = {};
      localStorageService.set('mem.cardsVisitedMap', {});
      game.computerMatches = [];
      localStorageService.set('mem.computerMatches', []);
      game.playerMatches = [];
      localStorageService.set('mem.playerMatches', []);
      game.pairs = [];
      localStorageService.set('mem.pairs', []);
      playerService.matchesStack = [];
      localStorageService.set('mem.matchesStack', []);
      deckService.deck = deckService.newDeck();

      //hide all cards to begin with
      jQuery('mem-card').css('background', 'url(assets/card-back.png) no-repeat');

      $rootScope.$broadcast('restartGame');
    };

    game.hideCard = function(element) {
      element.css('background', 'url(assets/card-back.png) no-repeat');
    };

    game.flip = function(card, element) {
      console.log("card value getting flipped:", card.value + card.suitName);
      var deferred = $q.defer();
      if(card.removed) {
        //if still computer turn, broadcast event to computer player service
        if(computerPlayerService.isComputerTurn) {
          computerPlayerService.playComputerHand(playerService.revealedCards);
        }

        deferred.resolve();
        return deferred.promise;
      } else {
        card.revealed = true;
        element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
        element.addClass('revealed');

        game.addToRevealedCards(card).then(function(data) {
          if(data.isGameOver) {
            deferred.resolve();
          }

          var revealed = jQuery('.revealed');
          if(data.isTurnOver) {
            // empty revealed cards storage containers
            playerService.revealedCards = [];
            localStorageService.set('mem.revealedCards', []);

            if(!data.isMatch) {
              revealed.css('background', 'url(assets/card-back.png) no-repeat');

              // alternate between computer and player turns
              computerPlayerService.isComputerTurn = !computerPlayerService.isComputerTurn;
              computerPlayerService.setComputerTurn(computerPlayerService.isComputerTurn);
            }

            // score controller listening for this event
            $rootScope.$broadcast('revealedCardsUpdated');

            revealed.removeClass('revealed');
          }

          //if still computer turn, broadcast event to computer player service
          if(computerPlayerService.isComputerTurn) {
            computerPlayerService.playComputerHand(playerService.revealedCards);
          }

          deferred.resolve();
        });
      }

      return deferred.promise;
    };

    game.addToRevealedCards = function(card) {
      var deferred = $q.defer();

      //keep track of revealed cards
      playerService.revealedCards.push(card);
      localStorageService.set('mem.revealedCards', playerService.revealedCards);

      // score controller listening for this event
      $rootScope.$broadcast('revealedCardsUpdated');

      if(playerService.revealedCards.length === 2) {
        game.checkIfMatch()
          .then(function(data) {
            return game.updateDeck(data.isMatch, data.isGameOver)
          })
          .then(function(data) {
            return game.updateFlippedCards(data.isMatch, data.isGameOver)
          })
          .then(function(data) {
            deferred.resolve({
              isTurnOver: true,
              isMatch: data.isMatch,
              isGameOVer: data.isGameOVer
            });
          })
      }
      else {
        deferred.resolve({
          isTurnOver: false,
          isMatch: false
        });
      }

      return deferred.promise;
    };

    game.updateFlippedCards = function(isMatch, isGameOver) {
      var deferred = $q.defer();
      if(!isGameOver) {
        $timeout(function() {
          deferred.resolve({
            isMatch: isMatch,
            isGameOver: false
          });
        }, 1500);
      } else {
        deferred.resolve({
          isMatch: false,
          isGameOver: true
        });
      }

      return deferred.promise;
    };

    game.incrementMatchesFound = function(matchedCard1, matchedCard2, isMatch, isGameOver) {
      var deferred = $q.defer();
      if(computerPlayerService.isComputerTurn) {
        game.updateNumberOfMatches('computerMatches', matchedCard1, matchedCard2);
      } else {
        game.updateNumberOfMatches('playerMatches', matchedCard1, matchedCard2);
      }

      game.pairs.push([matchedCard1, matchedCard2]);
      localStorageService.set('mem.pairs', game.pairs);

      deferred.resolve({
        isMatch: isMatch,
        isGameOver: isGameOver
      });

      return deferred.promise;
    };

    game.updateDeck = function(isMatch, isGameOver) {
      var deferred = $q.defer();

      if(isGameOver) {
        deferred.resolve({
          isMatch: isMatch,
          isGameOver: isGameOver
        });
      }

      deckService.updateDeck(function(currDeck) {
        for(var i = 0; i < currDeck.length; i++) {

          //find the revealed cards in the deck
          if(playerService.revealedCards.length > 1 &&
            (currDeck[i].value === playerService.revealedCards[0].value && currDeck[i].suitName === playerService.revealedCards[0].suitName) ||
            (currDeck[i].value === playerService.revealedCards[1].value && currDeck[i].suitName === playerService.revealedCards[1].suitName)) {

            // if revealed cards are a match, remove them from the deck
            // else reset the revealed cards to be not revealed
            if(isMatch) {
              currDeck[i].removed = true;
            } else {
              // when turned over, set cards to not revealed
              currDeck[i].revealed = false;
            }
          }
        }

        return currDeck;
      }).then(function() {
        deferred.resolve({
          isMatch: isMatch,
          isGameOver: isGameOver
        });
      });

      return deferred.promise;
    };

    game.checkIfMatch = function() {
      var deferred = $q.defer();
      // if revealed cards are a match, increment match count until game should be restarted
      var isMatch = false;
      var isGameOver = false;
      if(playerService.revealedCards[0].value === playerService.revealedCards[1].value) {
        isMatch = true;

        game.incrementMatchesFound(playerService.revealedCards[0], playerService.revealedCards[1], isMatch, isGameOver).then(function(data) {
          //if total matches is 26, then game over and needs to be restarted
          if(game.playerMatches.length + game.computerMatches.length === 52) {
            isGameOver = true;
            game.restartGame();
          }

          deferred.resolve({
            isMatch: data.isMatch,
            isGameOver: data.isGameOver
          });
        });
      } else {
        deferred.resolve({
          isMatch: isMatch,
          isGameOver: isGameOver
        });
      }

      return deferred.promise;
    };

    game.updateNumberOfMatches = function(label, matchedCard1, matchedCard2) {
      var deferred = $q.defer();
      if(matchedCard1 && matchedCard2) {
        game[label].push(matchedCard1, matchedCard2);
        localStorageService.set('mem.' + label, game[label]);
      } else {
        game[label] = [];
        localStorageService.set('mem.' + label, []);
      }

      deferred.resolve();
      return deferred.promise;
    };

    return game;
  });
