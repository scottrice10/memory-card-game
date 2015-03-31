angular.module('memory')
  .service('gameService', function($rootScope, $q, $timeout, localStorageService, deckService) {
    'use strict';
    var game = {};
    game.pause = false;
    game.isComputerTurn = localStorageService.get('mem.isComputerTurn') ? localStorageService.get('mem.isComputerTurn') : false;
    game.revealedCards = localStorageService.get('mem.revealedCards') ? localStorageService.get('mem.revealedCards') : [];
    game.remainingCards = localStorageService.get('mem.remainingCards') ? localStorageService.get('mem.remainingCards') : angular.copy(deckService.deck);
    game.cardsVisitedMap = localStorageService.get('mem.cardsVisitedMap') ? localStorageService.get('mem.cardsVisitedMap') : {};
    game.computerMatches = localStorageService.get('mem.computerMatches') ? localStorageService.get('mem.computerMatches') : [];
    game.playerMatches = localStorageService.get('mem.playerMatches') ? localStorageService.get('mem.playerMatches') : [];
    game.pairs = localStorageService.get('mem.pairs') ? localStorageService.get('mem.pairs') : [];

    game.restartGame = function() {
      game.pause = false;
      game.isComputerTurn = false;
      localStorageService.set('mem.isComputerTurn', false);
      game.revealedCards = [];
      localStorageService.set('mem.revealedCards', []);
      game.remainingCards = angular.copy(deckService.deck);
      localStorageService.set('mem.remainingCards', game.remainingCards);
      game.cardsVisitedMap = {};
      localStorageService.set('mem.cardsVisitedMap', {});
      game.computerMatches = [];
      localStorageService.set('mem.computerMatches', []);
      game.playerMatches = [];
      localStorageService.set('mem.playerMatches', []);
      game.pairs = [];
      localStorageService.set('mem.pairs', []);

      deckService.deck = deckService.newDeck();

      $rootScope.$broadcast('restartGame');
    };

    game.hideCard = function(element) {
      element.css('background', 'url(assets/card-back.png) no-repeat');
    };

    game.flip = function(card, element) {
      var deferred = $q.defer();
      if(card.removed || !card.value) {
        deferred.resolve();
        return deferred.promise;
      } else {
        card.revealed = true;
        element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
        element.addClass('revealed');

        addToRevealedCards(card).then(function(data) {
          var revealed = jQuery('.revealed');
          if(data.isTurnOver) {
            if(!data.isMatch) {
              revealed.css('background', 'url(assets/card-back.png) no-repeat');

              game.isComputerTurn = !game.isComputerTurn;
              setComputerTurn(game.isComputerTurn);
            }

            game.pause = false;
            revealed.removeClass('revealed');
            deferred.resolve();
          } else {
            deferred.resolve();
          }
        });
      }

      return deferred.promise;
    };

    function addToRevealedCards(card) {
      var deferred = $q.defer();

      //keep track of revealed cards
      game.revealedCards.push(card);
      localStorageService.set('mem.revealedCards', game.revealedCards);

      console.log("revealed: ", JSON.stringify(game.revealedCards));

      if(game.revealedCards.length === 2) {
        game.pause = true;

        checkIfMatch()
          .then(function(data) {
            return updateDeck(data.isMatch, data.isGameOver)
          })
          .then(function(data) {
            return updateFlippedCards(data.isMatch, data.isGameOver)
          })
          .then(function(isMatch) {
            deferred.resolve({
              isTurnOver: true,
              isMatch: isMatch
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
    }

    function updateFlippedCards(isMatch, isGameOver) {
      var deferred = $q.defer();
      if(!isGameOver) {
        $timeout(function() {
          deferred.resolve(isMatch);
        }, 1500);
      }

      return deferred.promise;
    }

    function incrementMatchesFound(matchedCard1, matchedCard2, isMatch, isGameOver) {
      var deferred = $q.defer();
      if(game.isComputerTurn) {
        updateNumberOfMatches('computerMatches', matchedCard1, matchedCard2);
      } else {
        updateNumberOfMatches('playerMatches', matchedCard1, matchedCard2);
      }

      game.pairs.push([matchedCard1, matchedCard2]);
      localStorageService.set('mem.pairs', game.pairs);

      deferred.resolve({
        isMatch: isMatch,
        isGameOver: isGameOver
      });

      return deferred.promise;
    }

    function updateDeck(isMatch, isGameOver) {
      var deferred = $q.defer();

      deckService.updateDeck(function(currDeck) {
        for(var i = 0; i < currDeck.length; i++) {

          //find the revealed cards in the deck
          if((currDeck[i].value === game.revealedCards[0].value && currDeck[i].suitName === game.revealedCards[0].suitName) ||
            (currDeck[i].value === game.revealedCards[1].value && currDeck[i].suitName === game.revealedCards[1].suitName)) {

            // if revealed cards are a match, remove them from the deck
            // else reset the revealed cards to be not revealed
            if(isMatch) {
              currDeck[i].value = null;
              currDeck[i].removed = true;
            } else {
              // when turned over, set cards to not revealed
              currDeck[i].revealed = false;
            }
          }
        }

        // empty revealed cards storage containers
        game.revealedCards = [];
        localStorageService.set('mem.revealedCards', []);

        return currDeck;
      }).then(function() {
        deferred.resolve({
          isMatch: isMatch,
          isGameOver: isGameOver
        });
      });

      return deferred.promise;
    }

    function checkIfMatch() {
      var deferred = $q.defer();
      // if revealed cards are a match, increment match count until game should be restarted
      var isMatch = false;
      var isGameOver = false;
      if(game.revealedCards[0].value === game.revealedCards[1].value) {
        isMatch = true;

        incrementMatchesFound(game.revealedCards[0], game.revealedCards[1], isMatch, isGameOver).then(function(data) {
          //if total matches is 26, then game over and needs to be restarted
          if(game.playerMatches.length + game.computerMatches.length === 52) {
            isGameOver = true;

            $q.all([updateNumberOfMatches('playerMatches'), updateNumberOfMatches('computerMatches'), updateCardsVisitedMap()])
              .then(function() {
                return game.restartGame();
              });
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
    }

    function updateNumberOfMatches(label, matchedCard1, matchedCard2) {
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
    }

    function updateRemainingCards(value, suitName) {
      if(value && suitName) {
        for(var i = 0; i < game.remainingCards.length; i++) {
          if(game.remainingCards[i].value === value && game.remainingCards[i].suitName === suitName) {
            game.remainingCards.splice(i, 1);
            return localStorageService.set('mem.remainingCards', game.remainingCards);
          }
        }
      } else {
        game.remainingCards = angular.copy(deckService.deck);
        localStorageService.set('mem.remainingCards', deckService.deck);
      }
    }

    function updateCardsVisitedMap(card, isDelete) {
      var deferred = $q.defer();
      if(card && card.value && isDelete && game.cardsVisitedMap[card.value]) {
        game.cardsVisitedMap[card.value].shift();
      } else if(card && card.value && card.value != "null") {
        updateRemainingCards(card.value, card.suitName);

        if(game.cardsVisitedMap[card.value] && game.cardsVisitedMap[card.value].length > 0) {
          //check whether the card has already been visited
          var cardArray = game.cardsVisitedMap[card.value];
          for(var i = 0; i < cardArray.length; i++) {
            if(cardArray[i].value === card.value && cardArray[i].suitName === card.suitName) {
              break;
            }

            // if the card is not yet in our hashmap, put it in now
            if(i === cardArray.length - 1) {
              game.cardsVisitedMap[card.value].push(card);

              console.log(JSON.stringify(game.cardsVisitedMap));
            }
          }
        } else {
          game.cardsVisitedMap[card.value] = [card];
        }
      } else {
        game.cardsVisitedMap = {};
      }

      localStorageService.set('mem.cardsVisitedMap', game.cardsVisitedMap);
      deferred.resolve(card);
      return deferred.promise;
    }

    function playComputerHand() {
      checkForMatchInVisitedMap().then(function(matchFound) {
        if(matchFound) {
          playComputerHand();
        } else {
          computerSelectCard().then(function() {
            // after computer selects first card, check a second time for match from visited cards
            checkForMatchInVisitedMap().then(function(matchFound) {
              if(matchFound) {
                playComputerHand();
              } else {
                computerSelectCard();
              }
            })
          });
        }
      });
    }

    function computerSelectCard() {
      var deferred = $q.defer();

      var card = null;
      for(var i = 0; i < game.remainingCards.length; i++) {
        if(!game.remainingCards[i].visited && game.remainingCards[i].value) {
          card = game.remainingCards[i];
          break;
        }
      }

      if(card) {
        updateCardsVisitedMap(card).then(function(card) {
          card.visited = true;
          game.flip(card, jQuery('#' + card.value + card.suitName)).then(function() {
            localStorageService.set('mem.remainingCards', game.remainingCards);
            deferred.resolve();
          });
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    function checkForMatchInVisitedMap() {
      var deferred = $q.defer();
      var matchingCard1 = null;
      var matchingCard2 = null;
      for(var key in game.cardsVisitedMap) {
        if(game.cardsVisitedMap.hasOwnProperty(key) && game.cardsVisitedMap[key].length > 1) {
          matchingCard1 = game.cardsVisitedMap[key][0];
          matchingCard1.revealed = false;
          matchingCard2 = game.cardsVisitedMap[key][1];
          matchingCard2.revealed = false;
          break;
        }
      }

      if(matchingCard1 && matchingCard2) {
        // when match, removing matching cards from visited map afterwards
        game.flip(matchingCard1, jQuery('#' + matchingCard1.value + matchingCard1.suitName)).then(function() {
          game.flip(matchingCard2, jQuery('#' + matchingCard2.value + matchingCard2.suitName)).then(function() {
            updateCardsVisitedMap(matchingCard1, true).then(function() {
              updateCardsVisitedMap(matchingCard2, true).then(function() {
                deferred.resolve(true);
              });
            });
          });
        });
      } else {
        deferred.resolve(false);
      }

      return deferred.promise;
    }

    function setComputerTurn(isOn) {
      game.isComputerTurn = isOn;
      localStorageService.set('mem.isComputerTurn', isOn);

      console.log("Computer's turn: ", isOn);

      if(isOn) {
        playComputerHand();
      }
    }

    return game;
  })
;
