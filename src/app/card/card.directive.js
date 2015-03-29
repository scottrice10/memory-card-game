angular.module('memory')
  .directive('memCard', function memCard() {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        card: '='
      },
      templateUrl: 'card/card.html',
      link: function memCardLink(scope, element) {
        var setCard = function() {
          element.css('background', 'url(assets/card-back.png) no-repeat');
        };

        scope.flip = function(card) {
          if(card.removed){
            return;
          }

          card.revealed = !card.revealed;

          if(card.revealed) {
            element.css('background', 'url(assets/cards/' + card.rankName.toString().toLowerCase() + '-' + card.suitName.toString().toLowerCase() + '.png) no-repeat');
            element.addClass('revealed');

            scope.addToRevealedCards(card, function(isTurnOver, isRemove) {
              if(isTurnOver) {
                var revealed = jQuery('.revealed');
                if(!isRemove) {
                  revealed.css('background', 'url(assets/card-back.png) no-repeat');
                }

                revealed.removeClass('revealed');
              }
            });
          } else {
            setCard();
            element.removeClass('revealed');

            scope.removeFromRevealedCards(card);
          }
        };

        //init
        setCard();
      },
      controller: function memCardController($scope, gameService) {
        $scope.addToRevealedCards = gameService.addToRevealedCards;
        $scope.removeFromRevealedCards = gameService.removeFromRevealedCards;
      }
    };
  });
