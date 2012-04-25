// This script licensed under the MIT.
// http://orgachem.mit-license.org

/**
 * @fileoverview Script about a original event.
 * @author orga.chem.job@gmail.com (Orga Chem)
 */

goog.provide('orga.events.PrefixedStorageEvent');
goog.provide('orga.events.PrefixedStorageHandler');
goog.provide('orga.events.PrefixedStorageHandler.EventType');

goog.require('orga.events.StorageEvent');
goog.require('orga.events.StorageHandler');



/**
 * @param {StorageEvent} e A browser storage event. See
 * {@link http://www.w3.org/TR/webstorage/#the-storage-event}.
 * @constructor
 * @extends {orga.events.StorageEvent}
 */
orga.events.PrefixedStorageEvent = function(e) {
  goog.base(this, e.getBrowserEvent());
  var keys = this.key.split('::');
  this.prefix = keys[0];
  this.key = keys[1];
  this.type = orga.events.PrefixedStorageHandler.EventType.STORAGE;
};
goog.inherits(orga.events.PrefixedStorageEvent, orga.events.StorageEvent);


/** @override */
orga.events.PrefixedStorageEvent.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.prefix = null;
};


/**
 * Better storage event listener.
 * <pre>
 * goog.events.listen(window, 'storage', hdnaler);
 * </pre>
 * It can works but event object doe's not has key, oldValue, newValue, etc.
 * You want listener to be able to get these arguments, you should use this.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
orga.events.PrefixedStorageHandler = function(prefix) {
  goog.asserts.assertString(prefix);
  goog.base(this);

  this.prefix_ = prefix;
  if (!orga.events.PrefixedStorageHandler.handler_) {
    orga.events.PrefixedStorageHandler.handler_ =
        new orga.events.StorageHandler();
  }
  this.handler_ = orga.events.PrefixedStorageHandler.handler_;
  this.handler_.addEventListener(
      /* type        */ orga.events.StorageHandler.EventType.STORAGE,
      /* listener    */ this.handleStorage,
      /* opt_capt    */ false,
      /* opt_handler */ this);
};
goog.inherits(orga.events.PrefixedStorageHandler, goog.events.EventTarget);


/**
 * @enum {string}
 */
orga.events.PrefixedStorageHandler.EventType = {
  /** @const */
  STORAGE: 'prefixedstorage'
};


/**
 * @private
 */
orga.events.PrefixedStorageHandler.handler_ = null;


/** @override */
orga.events.PrefixedStorageHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  delete this.prefix_;
  this.handler_.dispose();
  delete this.handler_;
};


/**
 * @protected
 * @param {orga.events.StorageEvent} e A wraped storage event.
 */
orga.events.PrefixedStorageHandler.prototype.handleStorage = function(e) {
  var newE = new orga.events.PrefixedStorageEvent(e);
  if (newE.key && newE.prefix === this.prefix_) this.dispatchEvent(newE);
};
