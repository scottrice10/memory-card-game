angular.module('memory')
  .factory('cardFactory', function() {
    'use strict';
    var card = {};

    card.create = function(value, suit) {
      return {
        revealed: false,
        removed: false,
        value: value,
        suitName: suit,
        rankName: (function() {
          switch(value) {
            case 1:
              return 'Ace';
            case 11:
              return 'Jack';
            case 12:
              return 'Queen';
            case 13:
              return 'King';
            default:
              return value;
          }
        })()
      };
    };

    return card;
  });
