// This script licensed under the MIT.
// http://orgachem.mit-license.org

/**
 * @fileoverview Script about a original event.
 * @author orga.chem.job@gmail.com (Orga Chem)
 */

goog.provide('orga.events.StorageEvent');
goog.provide('orga.events.StorageHandler');
goog.provide('orga.events.StorageEvent.EventType');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.json');



/**
 * @param {StorageEvent|Object} e A browser storage event. See
 * {@link http://www.w3.org/TR/webstorage/#the-storage-event}.
 * It follow {@link goog.storage.Storage} value style.
 * So, only premitive value is available.
 * And try unwrap if the value seems the data from
 * {@link goog.storage.RichStorage},
 * and {@link orga.events.StorageEvent.ENABLE_UNWRAP_TRY} is true.
 * 
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
orga.events.StorageEvent = function(e) {
  goog.base(this, e);
};
goog.inherits(orga.events.StorageEvent, goog.events.BrowserEvent);


/** @type {string} */
orga.events.StorageEvent.prototype.key;


/** @type {?string} */
orga.events.StorageEvent.prototype.oldValue = null;


/** @type {?string} */
orga.events.StorageEvent.prototype.newValue = null;


/** @type {string} */
orga.events.StorageEvent.prototype.url;


/** @type {LocalStorage} */
orga.events.StorageEvent.prototype.storageArea;


/** @type {boolean} */
orga.events.StorageEvent.ENABLE_UNWRAPING_TRY = true;


/** @type {boolean} */
orga.events.StorageEvent.ENABLE_DECRYPTION_TRY = true;


/** @override */
orga.events.StorageEvent.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.oldValue = null;
  this.newValue = null;
  this.url = null;
  this.storageArea = null;

  delete this.key;
  delete this.oldValue;
  delete this.newValue;
  delete this.url;
  delete this.storageArea;
};


/**
 * This events has below properties.
 * Interface SrorageEvent:
 * <ul>
 * <li> readonly attribute DOMString key;
 * <li> readonly attribute DOMString? oldValue;
 * <li> readonly attribute DOMString? newValue;
 * <li> readonly attribute DOMString url;
 * <li> readonly attribute Storage? storageArea;
 * </ul>
 * And, StorageEvent inharits properties from Event:
 * <ul>
 * <li> readonly attribute DOMString        type;
 * <li> readonly attribute EventTarget      target;
 * <li> readonly attribute EventTarget      currentTarget;
 * <li> readonly attribute unsigned short   eventPhase;
 * <li> readonly attribute boolean          bubbles;
 * <li> readonly attribute boolean          cancelable;
 * <li> readonly attribute DOMTimeStamp     timeStamp;
 * </ul>
 * {@link http://www.w3.org/TR/webstorage/#the-storage-event}
 * {@link http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface}
 * @param {Event} e Browser event object.
 * @override
 */
orga.events.StorageEvent.prototype.init = function(e) {
  goog.base(this, 'init', e);
  this.key = e.key;
  var oldValue = this.deserialize_(e.oldValue);
  var newValue = this.deserialize_(e.newValue);
  if (orga.events.StorageEvent.ENABLE_UNWRAPING_TRY) {
    newValue = this.unwrapIfPossible_(newValue);
    oldValue = this.unwrapIfPossible_(oldValue);
  }
  this.oldValue = oldValue;
  this.newValue = newValue;
  this.url = e.url;
  this.storageArea = e.storageArea;
  this.type = orga.events.StorageHandler.EventType.STORAGE;
};


/**
 * @private
 * @param {string} Value A serialized value.
 * @return {*} Deserialized value or null if given null.
 */
orga.events.StorageEvent.prototype.deserialize_ = function(value) {
  if (goog.isNull(value)) return null;
  goog.asserts.assertString(value);
  try {
    return goog.json.parse(value);
  } catch (e) {
    throw goog.storage.ErrorCode.INVALID_VALUE;
  }
};


/**
 * @private
 * @param {?Object} Value A wraped value.
 * @return {*} Unwraped value or null if given null.
 */
orga.events.StorageEvent.prototype.unwrap_ = function(value) {
  if (goog.isNull(value)) return null;
  return goog.storage.RichStorage.Wrapper.unwrap(oldValue);
};


/**
 * @private
 * @param {?Object} Value A wraped value.
 * @return {*} Unwraped (if possible) value or null if given null.
 */
orga.events.StorageEvent.prototype.unwrapIfPossible_ = function(value) {
  if (goog.isNull(value)) return null;
  try {
    return goog.storage.RichStorage.Wrapper.unwrap(value);
  } catch (e) {
    if (e !== goog.storage.ErrorCode.INVALID_VALUE) throw e;
    return value;
  }
};


/**
 * @param {goog.storage.EncryptedStorage} encryptedStorage An encrypted storage
 *    instance that setted the key.
 * @return {*} Deserialized value or null if failed decryption.
 */
orga.events.StorageEvent.prototype.decryptIfPossible = function(
    encryptedStorage) {
  try {
    return this.decrypt(encryptedStorage);
  } catch (e) {
    if (e !== goog.storage.ErrorCode.DECRYPTION_ERROR) throw e;
    return null;
  }
};


/**
 * @param {goog.storage.EncryptedStorage} encryptedStorage An encrypted storage
 *    instance that setted the key.
 * @return {*} Deserialized value or undefined if not found.
 */
orga.events.StorageEvent.prototype.decrypt = function(encryptedStorage) {
  goog.asserts.assertInstanceof(encryptedStorage,
                                goog.storage.EncryptedStorage);
  return encryptedStorage.get(this.key);
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
orga.events.StorageHandler = function() {
  goog.base(this);

  var that = this;
  goog.events.listen(
      /* src         */ window,
      /* type        */ 'storage',
      /* listener    */ this.handleStorage,
      /* opt_capt    */ false,
      /* opt_handler */ this);
};
goog.inherits(orga.events.StorageHandler, goog.events.EventTarget);


/**
 * @enum {string}
 */
orga.events.StorageHandler.EventType = {
  /** @const */
  STORAGE: 'storage'
};


/**
 * @param {StorageEvent} e Storage event.
 */
orga.events.StorageHandler.prototype.handleStorage = function(e) {
  var newE = new orga.events.StorageEvent(e.getBrowserEvent());
  this.dispatchEvent(newE);
};


/** @override */
orga.events.StorageHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.events.unlisten(window, 'storage', this.handleStorage);
};
