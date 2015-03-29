angular.module('memory')
  .service('gameService', function($timeout, localStorageService, deckService) {
    'use strict';
    var game = {};
    game.isComputerTurn = false;
    game.revealedCards = localStorageService.get('mem.revealedCards') ? localStorageService.get('mem.revealedCards') : [];
    game.remainingCardsArray = localStorageService.get('mem.remainingCards') ? localStorageService.get('mem.remainingCards') : deckService.deck;
    game.cardsVisitedMap = localStorageService.get('mem.cardsVisitedMap') ? localStorageService.get('mem.cardsVisitedMap') : {};
    game.computerMatches = localStorageService.get('mem.computerMatches') ? localStorageService.get('mem.computerMatches') : [];
    game.playerMatches = localStorageService.get('mem.playerMatches') ? localStorageService.get('mem.playerMatches') : [];

    game.restartGame = function() {
      deckService.newDeck();
    };

    game.hideCard = function(element) {
      element.css('background', 'url(assets/card-back.png) no-repeat');
    };

    game.flip = function(card, element) {
      if(card.removed) {
        return;
      }

      card.revealed = !card.revealed;

      if(card.revealed) {
        element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
        element.addClass('revealed');

        addToRevealedCards(card, function(isMatch) {
          var revealed = jQuery('.revealed');
          if(!isMatch) {
            revealed.css('background', 'url(assets/card-back.png) no-repeat');
          }

          revealed.removeClass('revealed');
        });
      } else {
        game.hideCard(element);
        element.removeClass('revealed');

        removeFromRevealedCards(card);
      }
    };

    function addToRevealedCards(card, callback) {
      // keep track of revealed cards
      game.revealedCards.push(card);
      localStorageService.set('mem.revealedCards', game.revealedCards);

      if(game.revealedCards.length === 2) {
        updateCardsVisitedMap(game.revealedCards[0].value, game.revealedCards[1].suitName);

        checkIfMatch(function(isMatch, isGameOver) {
          updateDeck(isMatch);
          updateFlippedCards(isMatch, isGameOver, callback);

          if(game.isComputerTurn) {
            playComputerHand();
          }
        });
      }
    }

    function removeFromRevealedCards(card) {
      // when flipping a card back to hidden, remove it from array of revealed cards
      for(var i = 0; i < game.revealedCards.length; i++) {
        if(game.revealedCards[i].value === card.value) {
          game.revealedCards.splice(i, 1);
          localStorageService.set('mem.revealedCards', game.revealedCards);
        }
      }
    }

    function updateFlippedCards(isMatch, isGameOver, callback) {
      if(!isGameOver) {
        $timeout(function() {
          callback(isMatch);
        }, 1500);
      }
    }

    function incrementMatchesFound(matchedCard1, matchedCard2) {
      if(game.isComputerTurn) {
        updateNumberOfMatches('computerMatches', matchedCard1, matchedCard2);
      } else {
        updateNumberOfMatches('playerMatches', matchedCard1, matchedCard2);
      }
    }

    function updateDeck(isMatch) {
      // when turn over, set cards to not revealed
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
              updateRemainingCards(i);
            } else {
              currDeck[i].revealed = false;
            }
          }
        }

        // empty revealed cards storage containers
        game.revealedCards = [];
        localStorageService.set('mem.revealedCards', []);

        return currDeck;
      });
    }

    function checkIfMatch(callback) {
      // if revealed cards are a match, increment match count until game should be restarted
      var isMatch = false;
      var isGameOver = false;
      if(game.revealedCards[0].value === game.revealedCards[1].value) {
        isMatch = true;

        incrementMatchesFound(game.revealedCards[0], game.revealedCards[1]);

        //if total matches is 26, then game over and needs to be restarted
        if(game.playerMatches.length > 13 || game.computerMatches.length > 13) {
          isGameOver = true;

          updateNumberOfMatches('playerMatches');
          updateNumberOfMatches('computerMatches');

          return game.restartGame();
        }
      } else {
        game.isComputerTurn = !game.isComputerTurn;
      }

      callback(isMatch, isGameOver);
    }

    function updateNumberOfMatches(label, matchedCard1, matchedCard2) {
      if(matchedCard1 && matchedCard2) {
        game[label].push(matchedCard1, matchedCard2);
        localStorageService.set('mem.' + label, game[label]);
      } else {
        game[label] = [];
        localStorageService.set('mem.' + label, []);
      }
    }

    function updateRemainingCards(indexOfCardToRemove) {
      if(indexOfCardToRemove) {
        game.remainingCards.splice(indexOfCardToRemove, 1);
        localStorageService.set('mem.remainingCards', game.remainingCards);
      } else {
        game.remainingCards = deckService.deck;
        localStorageService.set('mem.remainingCards', deckService.deck);
      }
    }

    function updateCardsVisitedMap(value, suit) {
      if(value && suit) {
        if(game.cardsVisitedMap[value]) {
          game.cardsVisitedMap[value].push(suit)
        } else {
          game.cardsVisitedMap[value] = [suit];
        }

        localStorageService.set('mem.cardsVisitedMap', game.cardsVisitedMap);
      } else {
        game.remainingCards = {};
        localStorageService.set('mem.cardsVisitedMap', {});
      }
    }

    function playComputerHand() {
      if(checkForMatchInVisitedMap()){
       return;
      }

      computerSelectHand();

      // after computer selects first card, check a second time for match from visited cards
      if(checkForMatchInVisitedMap()){
        return;
      }

      computerSelectHand();

      game.isComputerTurn = !game.isComputerTurn;
    }

    function computerSelectHand() {
      for(var i = 0; i < game.remainingCards.length; i++) {
        var card = game.remainingCards[i];
        if(!card.visited){
          updateCardsVisitedMap(card.value, card.suitName);
          game.flip(card, jQuery("#" + card.value + card.suitName));
          break;
        }
      }
    }

    function checkForMatchInVisitedMap(){
      for(var key in game.cardsVisitedMap) {
        if(game.cardsVisitedMap.hasOwnProperty(key) && game.cardsVisitedMap[key].length > 1) {
          var matchingCard1 = game.cardsVisitedMap[key][0];
          var matchingCard2 = game.cardsVisitedMap[key][1];

          game.flip(matchingCard1, jQuery("#" + matchingCard1.value + matchingCard1.suitName));
          game.flip(matchingCard2, jQuery("#" + matchingCard2.value + matchingCard2.suitName));

          return true;
        }
      }

      return false;
    }

    return game;
  });
