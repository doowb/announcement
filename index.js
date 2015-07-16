/*!
 * announcement <https://github.com/doowb/announcement>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var slice = require('array-slice');
var CommandHandler = require('./lib/command-handler');

module.exports = Announcement;

/**
 * Main entry point of Announcement eventOrCommand emitter/aggregator
 *
 * ```js
 * var Announcement = require('announcement');
 * var announcement = new Announcment();
 * ```
 *
 * @api public
 */

function Announcement () {
  if (!(this instanceof Announcement)) {
    return new Announcement();
  }
  this.events = {};
  this.handlers = [];
}

/**
 * Register a listener for an eventOrCommand.
 *
 * ```js
 * announcement.on('user-registration', function (user) {
 *   // do something with user
 * });
 *
 * var UserRegistrationCommand = function () {};
 * announcement.on(UserRegistrationCommand, function (userRegCmd) {
 *   // userRegCmd will be an instance of UserRegistrationCommand
 *   // do something with userRegCmd
 * });
 * ```
 *
 * @param  {String|Function} `eventOrCommand` Event type to listen for.
 * @param  {Function} `cb` Callback invoked when `eventOrCommand` type is emitted.
 * @return {Function} Original callback function or handler function to use to remove listener.
 * @api public
 */

Announcement.prototype.on = function(eventOrCommand, cb) {
  if (typeof eventOrCommand === 'string') {
    var listeners = this.events[eventOrCommand] || (this.events[eventOrCommand] = []);
    listeners.push(cb);
    return cb;
  }
  var commandHandler = new CommandHandler(eventOrCommand, cb);
  this.handlers.push(commandHandler);
  return commandHandler;
};

/**
 * Asynchronously emit an eventOrCommand and additional data.
 *
 * ```js
 * // emit string event
 * announcement.emit('user-registered', { username: 'doowb' });
 *
 * // emit typed Command
 * var userRegCmd = new UserRegistrationCommand();
 * userRegCmd.user = { username: 'doowb' };
 * announcement.emit(userRegCmd);
 * ```
 *
 * @param  {String|Object} `eventOrCommand` Event string or instance of a Command to emit.
 * @api public
 */

Announcement.prototype.emit = function(eventOrCommand) {
  var args = slice(arguments, 1);
  if (typeof eventOrCommand === 'string') {
    var listeners = this.events[eventOrCommand];
    if (listeners) {
      var len = listeners.length;
      var i = 0;
      while (len--) {
        process.nextTick(function () {
          listeners[i++].apply(null, args);
        });
      }
    }
  } else {
    var handlers = this.handlers;
    var len = handlers.length;
    var i = 0;
    while (len--) {
      process.nextTick(function () {
        handlers[i++].handle(eventOrCommand);
      });
    }
  }
};
