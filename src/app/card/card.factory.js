angular.module('memory')
  .factory('cardFactory', function() {
    'use strict';
    var card = {};

    card.create = function(value, suit, suitImg) {
      return {
        revealed: false,
        visited: false,
        removed: false,
        value: value.toString(),
        suitName: suit,
        suitImg: suitImg,
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
