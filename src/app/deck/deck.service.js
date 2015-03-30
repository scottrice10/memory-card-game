angular.module('memory')
  .factory('deckService', function($q, cardFactory, localStorageService) {
    'use strict';
    var deck = {};
    deck.deck = localStorageService.get('mem.deck') ? localStorageService.get('mem.deck') : newDeck();

    deck.newDeck = function() {
      return newDeck();
    };

    deck.updateDeck = function(callback) {
      var deferred = $q.defer();
      deck.deck = callback(deck.deck);
      localStorageService.set('mem.deck', deck.deck);

      deferred.resolve();
      return deferred.promise;
    };

    function sortedDeck() {
      var suits = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
      var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      var deck = [];

      suits.forEach(function(suit) {
        values.forEach(function(value) {
          deck.push(cardFactory.create(value, suit));
        });
      });

      return deck;
    }

    function shuffleDeck(deck) {
      for(var i = 0; i < deck.length; i++) {
        var rand = i + Math.floor(Math.random() * (deck.length - i));
        var oldSpot = deck[i];

        deck[i] = deck[rand];
        deck[rand] = oldSpot;
      }

      return deck;
    }

    function newDeck() {
      deck.deck = shuffleDeck(sortedDeck());
      localStorageService.set('mem.deck', deck.deck);
      return deck.deck;
    }

    return deck;
  });
