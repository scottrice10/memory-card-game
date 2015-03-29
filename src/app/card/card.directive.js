angular.module('memory')
  .directive('memCard', function memCard () {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        card: '='
      },
      templateUrl: 'card/card.html',
      link: function memCardLink (scope, element) {
        var setCard = function(){
          element.css('background', 'url(assets/card-back.png) no-repeat');
        };

        scope.flip = function(card) {
          card.revealed = !card.revealed;

          if(card.revealed){
            element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
          } else {
            setCard();
          }
        };

        //init
        setCard();
      }
    };
  });
