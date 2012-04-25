// This script licensed under the MIT.
// http://orgachem.mit-license.org

/**
 * @fileoverview Script about Event handler like
 *    "LazyLoad":http://www.appelsiini.net/projects/lazyload
 * @author orga.chem.job@gmail.com (Orga Chem)
 */

goog.provide('orga.events.LazyloadHandler');
goog.provide('orga.events.LazyloadHandler.EventType');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
orga.events.LazyloadHandler = function(element) {
  goog.base(this);

  goog.events.listenOnce(
    /* src         */ window,
    /* type        */ goog.events.EventType.LOAD,
    /* listener    */ this.handleScroll,
    /* opt_capt    */ false,
    /* opt_handler */ this);

  /** @private */
  this.globalLitstenId_ = goog.events.listen(
    /* src         */ window,
    /* type        */ goog.events.EventType.SCROLL,
    /* listener    */ this.handleScroll,
    /* opt_capt    */ false,
    /* opt_handler */ this);
};
goog.inherits(orga.events.LazyloadHandler, goog.events.EventTarget);


/** @override */
orga.events.LazyloadHandler.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  goog.events.unlistenByKey(this.globalLitstenId_);
  delete this.globalLitstenId_;
};


/**
 * Handling onscroll events.
 */
orga.events.LazyloadHandler.prototype.handleScroll = function() {
  var loadables = goog.dom.getsByClass('orga-loadable-lazyload');
  var visibleAreaBottom = window.scrollY + window.innerHeight;
  goog.array.forEach(loadables, function(loadable) {
    if (loadable.offsetTop <= visibleAreaBottom) {
      loadable.src = loadable.getAttribute('data-src');
      loadable.className = loadable.className.replace('orga-loadable-lazyload',
          'orga-loadable-lazyloaded');
    }
  });
};
