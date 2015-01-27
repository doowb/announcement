'use strict';

module.exports = Handler;

/**
 * Event handler when using typed events.
 *
 * @param {Function} `type` constructor function for a type to check.
 * @param {Function} `cb` callback method to handle the message type.
 * @api private
 */

function Handler (type, cb) {
  this.type = type;
  this.cb = cb;
};

/**
 * Handle messages of the specified types.
 *
 * @param  {Object} `message` instance of specified type to handle.
 * @api private
 */

Handler.prototype.handle = function(message) {
  if (message instanceof this.type) {
    this.cb.call(null, message);
  }
};
