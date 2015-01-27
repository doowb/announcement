/*!
 * announcement <https://github.com/doowb/announcement>
 *
 * Copyright (c) 2015 Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var slice = require('array-slice');
var Handler = require('./lib/handler');

module.exports = Announcement;

/**
 * Main entry point of Announcement event emitter/aggregator
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
 * Register a listener for an event.
 *
 * ```js
 * announcement.on('foo', function (data) {
 *   // do something with data
 * });
 *
 * var FooEvent = function () {};
 * announcement.on(FooEvent, function (data) {
 *   // data will be an instance of FooEvent
 *   // do something with data
 * });
 * ```
 *
 * @param  {String|Function} `event` Event type to listen for.
 * @param  {Function} `cb` Callback invoked when `event` type is emitted.
 * @return {Function} Original callback function or handler function to use to remove listener.
 * @api public
 */

Announcement.prototype.on = function(event, cb) {
  if (typeof event === 'string') {
    var listeners = this.events[event] || (this.events[event] = []);
    listeners.push(cb);
    return cb;
  }
  var handler = new Handler(event, cb);
  this.handlers.push(handler);
  return handler;
};

/**
 * Asynchronously emit an event and additional data.
 *
 * ```js
 * // emit string event
 * announcement.emit('foo', { bar: 'baz' });
 *
 * // emit typed event
 * var foo = new FooEvent();
 * foo.bar = 'baz';
 * announcement.emit(foo);
 * ```
 *
 * @param  {String|Object} `event` Event type to emit.
 * @api public
 */

Announcement.prototype.emit = function(event) {
  var args = slice(arguments, 1);
  if (typeof event === 'string') {
    var listeners = this.events[event];
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
        handlers[i++].handle(event);
      });
    }
  }
};
