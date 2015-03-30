angular.module('memory')
  .directive('memCard', function memCard() {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        card: '='
      },
      templateUrl: '/memory/card/card.html',
      link: function memCardLink(scope, element) {
        scope.flipCard = function(){
          scope.flip(scope.card, element);
        };

        //init
        scope.hideCard(element);
      },
      controller: function memCardController($scope, gameService) {
        $scope.hideCard = gameService.hideCard;
        $scope.flip = gameService.flip;
      }
    };
  });
