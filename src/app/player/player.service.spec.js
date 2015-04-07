"use strict";

describe("playerService", function () {
  var computerPlayerService, httpBackend, rootScope, playerService, $q;

  beforeEach(module("memory"));

  beforeEach(inject(function (_$rootScope_, _computerPlayerService_, _playerService_, $httpBackend, _$q_) {
    computerPlayerService = _computerPlayerService_;
    playerService = _playerService_;
    httpBackend = $httpBackend;
    rootScope = _$rootScope_;
    $q = _$q_;
  }));

  it('is now a lot easier', function() {
    var card = {
      rankName: "Ace",
      removed: false,
      revealed: false,
      suitImg: "♠",
      suitName: "Spades",
      value: "1",
      visited: true
    };

    playerService.cardsVisitedMap = [];

    var deferredSuccessUpdateCardsVisitedMap = $q.defer();
    var deferredSuccessUpdateRemainingCards = $q.defer();

    spyOn(playerService, 'updateCardsVisitedMap').and.returnValue(deferredSuccessUpdateCardsVisitedMap.promise);
    spyOn(playerService, 'updateRemainingCards').and.returnValue(deferredSuccessUpdateRemainingCards.promise);

    playerService.updateCardsVisitedMap(card);

    expect(playerService.updateCardsVisitedMap).toHaveBeenCalled();
    expect(playerService.updateCardsVisitedMap).toHaveBeenCalledWith(card);
  });

});
