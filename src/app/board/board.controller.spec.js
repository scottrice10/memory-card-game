/* jshint strict:false, globalstrict:false */
/* global describe, it, beforeEach, inject, module */
describe('BoardCtrl', function () {
  var boardCtrl,
      scope;

  beforeEach(module('memory'));

  beforeEach(inject(function ($injector) {
    scope = $injector.get('$rootScope');

    boardCtrl = function () {
      return $injector.get('$controller')('BoardCtrl', {'$scope': scope});
    };
  }));

  it('should add new boards on add()', function () {
  });
});
