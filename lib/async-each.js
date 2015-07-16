'use strict';

module.exports = function (iterator, cb, done) {
  if (typeof done !== 'function') {
    done = function () {};
  }

  function next(err) {
    if (err) return done(err);
    var item = iterator.next();
    if (item.done) return done();
    return cb(item.value, next);
  }

  return next();
};
