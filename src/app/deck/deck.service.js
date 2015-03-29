angular.module('memory')
  .factory('deckService', function(cardFactory) {
    'use strict';
    var deck = function() {
      var suits = ['Spades', 'Diamonds', 'Clubs', 'Hearts'];
      var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      var deck = [];

      suits.forEach(function(suit) {
        values.forEach(function(value) {
          deck.push(cardFactory.create(value, suit));
        });
      });

      return deck;
    };

    function shuffleDeck(deck) {
      for(var i=0;i<deck.length;i++){
        var rand = i + Math.floor(Math.random() * (deck.length - i));
        var oldSpot = deck[i];

        deck[i] = deck[rand];
        deck[rand] = oldSpot;
      }

      return deck;
    }

    return shuffleDeck(deck);
  });
