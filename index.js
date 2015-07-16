/*!
 * announcement <https://github.com/doowb/announcement>
 *
 * Copyright (c) 2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var async = require('async');
var slice = require('array-slice');
var each = require('./lib/async-each');
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
  this.handlers = new Set();
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
 * @param  {String|Function} `eventOrCommand` Event string or instance of a Command to listen for.
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
  this.handlers.add(commandHandler);
  return commandHandler;
};

/**
 * Removes a registered listener or CommandHandler
 * The listener `cb` or the CommandHandler instance need to be the one
 * returned from the `on` method.
 *
 * ```js
 * // register listener
 * var listener = announcement.on('user-registration', function (user) {
 *   console.log(user);
 * });
 * // emit user-registration and see output from listener
 * announcement.emit('user-registration', { username: 'doowb' });
 * //=> { username: 'doowb' }
 *
 * // remove listener
 * announcement.off('user-registration', listener);
 * // emit user-registration and nothing is output
 * announcement.emit('user-registration', { username: 'doowb' });
 * ```
 *
 * @param  {String|Function} `eventOrCommand` Event string or instance of a CommandHandler to turn off.
 * @param  {Function} `cb` Listener function that will be removed.
 * @return {Boolean} `true` if the listener existed before being removed.
 * @api public
 */

Announcement.prototype.off = function(eventOrCommand, cb) {
  if (typeof eventOrCommand === 'string') {
    var listeners = this.events[eventOrCommand];
    if (!listeners || listeners.length === 0) {
      return false;
    }

    var i = listeners.indexOf(cb);
    if (i === -1) {
      return false;
    }

    listeners.splice(i, 1);
    return true;
  }
  return this.handlers.delete(eventOrCommand);
};

/**
 * Register a listener for an event or a command that will only execute once.
 *
 * ```js
 * announcement.once('user-registration', function (user) {
 *   // do something with user
 * });
 *
 * var UserRegistrationCommand = function () {};
 * announcement.once(UserRegistrationCommand, function (userRegCmd) {
 *   // userRegCmd will be an instance of UserRegistrationCommand
 *   // do something with userRegCmd
 * });
 * ```
 *
 * @param  {String|Function} `eventOrCommand` Event string or instance of a Command to listen for.
 * @param  {Function} `cb` Callback invoked when `eventOrCommand` type is emitted.
 * @return {Function} Original callback function or handler function to use to remove listener.
 * @api public
 */

Announcement.prototype.once = function(eventOrCommand, cb) {
  if (typeof eventOrCommand === 'string') {
    var listener = this.on(eventOrCommand, function () {
      this.off(eventOrCommand, listener);
      cb.apply(this, arguments);
    });
    return listener;
  }
  var self = this;
  var cmdHandler = this.on(eventOrCommand, function (msg) {
    self.off(cmdHandler);
    cb(msg);
  });
  return cmdHandler;
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
  var self = this;
  var args = slice(arguments, 1);
  if (this.pending) {
    return process.nextTick(function () {
      self.emit.apply(self, [eventOrCommand].concat(args));
    });
  }
  if (typeof eventOrCommand === 'string') {
    var listeners = this.events[eventOrCommand];
    if (listeners && listeners.length) {
      this.pending = true;
      async.each(listeners, function (listener, next) {
        process.nextTick(function () {
          listener.apply(self, args);
          next();
        });
      }, function () {
        self.pending = false;
      });
    }
  } else {
    this.pending = true;
    each(this.handlers.values(), function (handler, next) {
      process.nextTick(function () {
        handler.handle(eventOrCommand);
        next();
      });
    }, function () {
      self.pending = false;
    });
  }
};
