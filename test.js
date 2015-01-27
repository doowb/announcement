'use strict';

var assert = require('assert');
var Announcement = require('./');
var Handler = require('./lib/handler');

describe('announcement', function () {
  var announcement = null;
  beforeEach(function () {
    announcement = new Announcement();
  });

  it('should register events', function () {
    announcement.on('foo', function () {});
    assert(Array.isArray(announcement.events.foo), 'Expected foo to be an Array');
    assert(announcement.events.foo.length === 1, 'Expected foo.length to be 1');
    assert(typeof announcement.events.foo[0] === 'function', 'Expected foo[0] to be a function');
  });

  it('should register handlers', function () {
    var FooEvent = function () {};
    announcement.on(FooEvent, function () {});
    assert(Array.isArray(announcement.handlers), 'Expected handlers to be an Array');
    assert(announcement.handlers.length === 1, 'Expected handlers.length to be 1');
    assert(announcement.handlers[0] instanceof Handler, 'Expected handlers[0] to be an instanceof Handler');
  });

  it('should emit events', function (done) {
    var counter = 0;
    announcement.on('foo', function () { counter++; });
    announcement.emit('foo');
    announcement.emit('foo');
    process.nextTick(function () {
      assert.equal(counter, 2);
      done();
    });
  });

  it('should emit object events', function (done) {
    var FooEvent = function () {
      var counter = 0;
      this.inc = function () {
        counter++;
      };
      this.count = function () {
        return counter;
      }
    };
    var foo = new FooEvent();
    announcement.on(FooEvent, function (message) {
      message.inc();
    });
    announcement.emit(foo);
    announcement.emit(foo);
    process.nextTick(function () {
      assert.equal(foo.count(), 2);
      done();
    });
  });

});
