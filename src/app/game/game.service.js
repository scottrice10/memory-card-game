angular.module('memory')
  .service('gameService', function($timeout, localStorageService, deckService) {
    'use strict';
    var game = {};
    game.pause = false;
    game.isComputerTurn = localStorageService.get('mem.isComputerTurn') ? localStorageService.get('mem.isComputerTurn') : false;
    game.revealedCards = localStorageService.get('mem.revealedCards') ? localStorageService.get('mem.revealedCards') : [];
    game.remainingCards = localStorageService.get('mem.remainingCards') ? localStorageService.get('mem.remainingCards') : angular.copy(deckService.deck);
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
      if(card.removed || card.revealed || game.pause || !card.value) {
        return;
      }

      card.revealed = true;
      element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
      element.addClass('revealed');

      addToRevealedCards(card, function(isMatch) {
        var revealed = jQuery('.revealed');
        if(!isMatch) {
          card.revealed = false;
          revealed.css('background', 'url(assets/card-back.png) no-repeat');
        }

        game.pause = false;
        revealed.removeClass('revealed');

        // change to computer when computer's turn
        if(game.isComputerTurn) {
          playComputerHand();
        }
      });
    };

    function addToRevealedCards(card, callback) {
      // keep track of revealed cards
      game.revealedCards.push(card);
      localStorageService.set('mem.revealedCards', game.revealedCards);

      if(game.revealedCards.length === 2) {
        game.pause = true;

        checkIfMatch(function(isMatch, isGameOver) {
          updateDeck(isMatch);
          updateFlippedCards(isMatch, isGameOver, callback);
        });
      }
    }

    function updateFlippedCards(isMatch, isGameOver, callback) {
      if(!isGameOver) {
        $timeout(function() {
          callback(isMatch);
        }, 1500);
      }
    }

    function incrementMatchesFound(matchedCard1, matchedCard2, isComputerTurn) {
      if(isComputerTurn) {
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
              updateRemainingCards(currDeck[i].value, currDeck[i].suitName);
              currDeck[i].value = null;
              currDeck[i].removed = true;
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

        incrementMatchesFound(game.revealedCards[0], game.revealedCards[1], game.isComputerTurn);

        //if total matches is 26, then game over and needs to be restarted
        if(game.playerMatches.length / 2 > 13 || game.computerMatches.length / 2 > 13) {
          isGameOver = true;

          updateNumberOfMatches('playerMatches');
          updateNumberOfMatches('computerMatches');
          updateCardsVisitedMap();

          return game.restartGame();
        }
      } else {
        game.isComputerTurn = !game.isComputerTurn;
        localStorageService.set('mem.isComputerTurn', game.isComputerTurn);
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

    function updateCardsVisitedMap(card, deleteIndex) {
      if(card && card.value && typeof deleteIndex !== 'undefined' && game.cardsVisitedMap[card.value]) {
        game.cardsVisitedMap[card.value].splice(deleteIndex, 1);
      } else if(card && card.value) {
        if(game.cardsVisitedMap[card.value]) {
          //check whether the card has already been visited
          var cardArray = game.cardsVisitedMap[card.value];
          for(var i = 0; i < cardArray.length; i++) {
            if(cardArray[i].value === card.value && cardArray[i].suitName === card.suitName) {
              break;
            }

            // if the card is not yet in our hashmap, put it in now
            if(i === cardArray.length - 1){
              game.cardsVisitedMap[card.value].push(card);
            }
          }
        } else {
          game.cardsVisitedMap[card.value] = [card];
        }
      } else {
        game.cardsVisitedMap = {};
      }

      localStorageService.set('mem.cardsVisitedMap', game.cardsVisitedMap);
    }

    function playComputerHand() {

      if(checkForMatchInVisitedMap()) {
        return playComputerHand();
      }

      computerSelectCard(function(){
        // after computer selects first card, check a second time for match from visited cards
        if(checkForMatchInVisitedMap()) {
          return playComputerHand();
        }
      });

      computerSelectCard(function(){

      });
    }

    var count = 0;
    function computerSelectCard(callback) {
      for(var i = 0; i < game.remainingCards.length; i++) {
        if(!game.remainingCards[i].visited && game.remainingCards[i].value) {
          console.log("visited card:" + game.remainingCards[i].value + game.remainingCards[i].suitName + " and count: ", count += 1);
          updateCardsVisitedMap(game.remainingCards[i]);
          game.remainingCards[i].visited = true;
          localStorageService.set('mem.remainingCards', game.remainingCards);
          game.flip(game.remainingCards[i], jQuery('#' + game.remainingCards[i].value + game.remainingCards[i].suitName));
          break;
        }
      }

      callback();
    }

    function checkForMatchInVisitedMap() {
      for(var key in game.cardsVisitedMap) {
        if(game.cardsVisitedMap.hasOwnProperty(key) && game.cardsVisitedMap[key].length > 1) {
          var matchingCard1 = game.cardsVisitedMap[key][0];
          var matchingCard2 = game.cardsVisitedMap[key][1];

          if(!matchingCard1.revealed) {
            game.flip(matchingCard1, jQuery('#' + matchingCard1.value + matchingCard1.suitName));
          }

          if(!matchingCard2.revealed) {
            game.flip(matchingCard2, jQuery('#' + matchingCard2.value + matchingCard2.suitName));
          }

          // when match, removing matching cards from visited map afterwards
          updateCardsVisitedMap(matchingCard1, 0);
          updateCardsVisitedMap(matchingCard2, 1);

          return true;
        }
      }

      return false;
    }

    return game;
  });
