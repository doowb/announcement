'use strict';

module.exports = CommandHandler;

/**
 * Command handler for typed events/commands.
 *
 * @param {Function} `Command` constructor function used to compare Command types.
 * @param {Function} `handler` callback method to handle the message Command.
 * @api private
 */

function CommandHandler (Command, handler) {
  this.Command = Command;
  this.handler = handler;
};

/**
 * Handle messages of the specified types.
 *
 * @param  {Object} `message` instance of specified Command to handle.
 * @api private
 */

CommandHandler.prototype.handle = function(message) {
  if (message instanceof this.Command) {
    this.handler.call(null, message);
  }
};
