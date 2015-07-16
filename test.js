'use strict';

var assert = require('assert');
var Announcement = require('./');
var CommandHandler = require('./lib/command-handler');

describe('announcement', function () {
  var announcement = null;
  beforeEach(function () {
    announcement = new Announcement();
  });

  it('should register events', function () {
    announcement.on('user-registered', function () {});
    assert(Array.isArray(announcement.events['user-registered']), 'Expected user-registered to be an Array');
    assert(announcement.events['user-registered'].length === 1, 'Expected user-registered.length to be 1');
    assert(typeof announcement.events['user-registered'][0] === 'function', 'Expected user-registered[0] to be a function');
  });

  it('should register handlers', function () {
    var UserRegistrationCommand = function () {};
    announcement.on(UserRegistrationCommand, function () {});
    assert(Array.isArray(announcement.handlers), 'Expected handlers to be an Array');
    assert(announcement.handlers.length === 1, 'Expected handlers.length to be 1');
    assert(announcement.handlers[0] instanceof CommandHandler, 'Expected handlers[0] to be an instanceof CommandHandler');
  });

  it('should emit events', function (done) {
    var counter = 0;
    announcement.on('user-registered', function () { counter++; });
    announcement.emit('user-registered');
    announcement.emit('user-registered');
    process.nextTick(function () {
      assert.equal(counter, 2);
      done();
    });
  });

  it('should emit object events', function (done) {
    var UserRegistrationCommand = function () {
      var counter = 0;
      this.inc = function () {
        counter++;
      };
      this.count = function () {
        return counter;
      }
    };
    var userRegCmd = new UserRegistrationCommand();
    announcement.on(UserRegistrationCommand, function (cmd) {
      cmd.inc();
    });
    announcement.emit(userRegCmd);
    announcement.emit(userRegCmd);
    process.nextTick(function () {
      assert.equal(userRegCmd.count(), 2);
      done();
    });
  });

});
