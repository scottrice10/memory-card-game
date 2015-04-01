/* jshint strict:false, globalstrict:false */
/* global describe, it, beforeEach, inject, module */
describe('gameService', function () {
  var gameService;

  beforeEach(module('memory'));

  beforeEach(function() {
    inject(function($injector) {
      gameService = $injector.get('gameService');
    });
  });

  it('should add new boards on add()', function () {
  });
});
