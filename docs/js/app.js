var app = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var freeStyle = createCommonjsModule(function (module, exports) {
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	 * The unique id is used for unique hashes.
	 */
	var uniqueId = 0;
	/**
	 * Tag styles with this string to get unique hashes.
	 */
	exports.IS_UNIQUE = '__DO_NOT_DEDUPE_STYLE__';
	var upperCasePattern = /[A-Z]/g;
	var msPattern = /^ms-/;
	var interpolatePattern = /&/g;
	var escapePattern = /[ !#$%&()*+,./;<=>?@[\]^`{|}~"'\\]/g;
	var propLower = function (m) { return "-" + m.toLowerCase(); };
	/**
	 * CSS properties that are valid unit-less numbers.
	 */
	var cssNumberProperties = [
	    'animation-iteration-count',
	    'box-flex',
	    'box-flex-group',
	    'column-count',
	    'counter-increment',
	    'counter-reset',
	    'flex',
	    'flex-grow',
	    'flex-positive',
	    'flex-shrink',
	    'flex-negative',
	    'font-weight',
	    'line-clamp',
	    'line-height',
	    'opacity',
	    'order',
	    'orphans',
	    'tab-size',
	    'widows',
	    'z-index',
	    'zoom',
	    // SVG properties.
	    'fill-opacity',
	    'stroke-dashoffset',
	    'stroke-opacity',
	    'stroke-width'
	];
	/**
	 * Map of css number properties.
	 */
	var CSS_NUMBER = Object.create(null);
	// Add vendor prefixes to all unit-less properties.
	for (var _i = 0, _a = ['-webkit-', '-ms-', '-moz-', '-o-', '']; _i < _a.length; _i++) {
	    var prefix = _a[_i];
	    for (var _b = 0, cssNumberProperties_1 = cssNumberProperties; _b < cssNumberProperties_1.length; _b++) {
	        var property = cssNumberProperties_1[_b];
	        CSS_NUMBER[prefix + property] = true;
	    }
	}
	/**
	 * Escape a CSS class name.
	 */
	exports.escape = function (str) { return str.replace(escapePattern, '\\$&'); };
	/**
	 * Transform a JavaScript property into a CSS property.
	 */
	function hyphenate(propertyName) {
	    return propertyName
	        .replace(upperCasePattern, propLower)
	        .replace(msPattern, '-ms-'); // Internet Explorer vendor prefix.
	}
	exports.hyphenate = hyphenate;
	/**
	 * Generate a hash value from a string.
	 */
	function stringHash(str) {
	    var value = 5381;
	    var len = str.length;
	    while (len--)
	        value = (value * 33) ^ str.charCodeAt(len);
	    return (value >>> 0).toString(36);
	}
	exports.stringHash = stringHash;
	/**
	 * Transform a style string to a CSS string.
	 */
	function styleToString(key, value) {
	    if (typeof value === 'number' && value !== 0 && !CSS_NUMBER[key]) {
	        return key + ":" + value + "px";
	    }
	    return key + ":" + value;
	}
	/**
	 * Sort an array of tuples by first value.
	 */
	function sortTuples(value) {
	    return value.sort(function (a, b) { return a[0] > b[0] ? 1 : -1; });
	}
	/**
	 * Categorize user styles.
	 */
	function parseStyles(styles, hasNestedStyles) {
	    var properties = [];
	    var nestedStyles = [];
	    var isUnique = false;
	    // Sort keys before adding to styles.
	    for (var _i = 0, _a = Object.keys(styles); _i < _a.length; _i++) {
	        var key = _a[_i];
	        var value = styles[key];
	        if (value !== null && value !== undefined) {
	            if (key === exports.IS_UNIQUE) {
	                isUnique = true;
	            }
	            else if (typeof value === 'object' && !Array.isArray(value)) {
	                nestedStyles.push([key.trim(), value]);
	            }
	            else {
	                properties.push([hyphenate(key.trim()), value]);
	            }
	        }
	    }
	    return {
	        styleString: stringifyProperties(sortTuples(properties)),
	        nestedStyles: hasNestedStyles ? nestedStyles : sortTuples(nestedStyles),
	        isUnique: isUnique
	    };
	}
	/**
	 * Stringify an array of property tuples.
	 */
	function stringifyProperties(properties) {
	    return properties.map(function (_a) {
	        var name = _a[0], value = _a[1];
	        if (!Array.isArray(value))
	            return styleToString(name, value);
	        return value.map(function (x) { return styleToString(name, x); }).join(';');
	    }).join(';');
	}
	/**
	 * Interpolate CSS selectors.
	 */
	function interpolate(selector, parent) {
	    if (selector.indexOf('&') > -1) {
	        return selector.replace(interpolatePattern, parent);
	    }
	    return parent + " " + selector;
	}
	/**
	 * Recursive loop building styles with deferred selectors.
	 */
	function stylize(cache, selector, styles, list, parent) {
	    var _a = parseStyles(styles, !!selector), styleString = _a.styleString, nestedStyles = _a.nestedStyles, isUnique = _a.isUnique;
	    var pid = styleString;
	    if (selector.charCodeAt(0) === 64 /* @ */) {
	        var rule = cache.add(new Rule(selector, parent ? undefined : styleString, cache.hash));
	        // Nested styles support (e.g. `.foo > @media > .bar`).
	        if (styleString && parent) {
	            var style = rule.add(new Style(styleString, rule.hash, isUnique ? "u" + (++uniqueId).toString(36) : undefined));
	            list.push([parent, style]);
	        }
	        for (var _i = 0, nestedStyles_1 = nestedStyles; _i < nestedStyles_1.length; _i++) {
	            var _b = nestedStyles_1[_i], name = _b[0], value = _b[1];
	            pid += name + stylize(rule, name, value, list, parent);
	        }
	    }
	    else {
	        var key = parent ? interpolate(selector, parent) : selector;
	        if (styleString) {
	            var style = cache.add(new Style(styleString, cache.hash, isUnique ? "u" + (++uniqueId).toString(36) : undefined));
	            list.push([key, style]);
	        }
	        for (var _c = 0, nestedStyles_2 = nestedStyles; _c < nestedStyles_2.length; _c++) {
	            var _d = nestedStyles_2[_c], name = _d[0], value = _d[1];
	            pid += name + stylize(cache, name, value, list, key);
	        }
	    }
	    return pid;
	}
	/**
	 * Register all styles, but collect for selector interpolation using the hash.
	 */
	function composeStyles(container, selector, styles, isStyle, displayName) {
	    var cache = new Cache(container.hash);
	    var list = [];
	    var pid = stylize(cache, selector, styles, list);
	    var hash = "f" + cache.hash(pid);
	    var id = displayName ? displayName + "_" + hash : hash;
	    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
	        var _a = list_1[_i], selector_1 = _a[0], style = _a[1];
	        var key = isStyle ? interpolate(selector_1, "." + exports.escape(id)) : selector_1;
	        style.add(new Selector(key, style.hash, undefined, pid));
	    }
	    return { cache: cache, pid: pid, id: id };
	}
	/**
	 * Cache to list to styles.
	 */
	function join(arr) {
	    var res = '';
	    for (var i = 0; i < arr.length; i++)
	        res += arr[i];
	    return res;
	}
	/**
	 * Noop changes.
	 */
	var noopChanges = {
	    add: function () { return undefined; },
	    change: function () { return undefined; },
	    remove: function () { return undefined; }
	};
	/**
	 * Implement a cache/event emitter.
	 */
	var Cache = /** @class */ (function () {
	    function Cache(hash, changes) {
	        if (hash === void 0) { hash = stringHash; }
	        if (changes === void 0) { changes = noopChanges; }
	        this.hash = hash;
	        this.changes = changes;
	        this.sheet = [];
	        this.changeId = 0;
	        this._keys = [];
	        this._children = Object.create(null);
	        this._counters = Object.create(null);
	    }
	    Cache.prototype.add = function (style) {
	        var count = this._counters[style.id] || 0;
	        var item = this._children[style.id] || style.clone();
	        this._counters[style.id] = count + 1;
	        if (count === 0) {
	            this._children[item.id] = item;
	            this._keys.push(item.id);
	            this.sheet.push(item.getStyles());
	            this.changeId++;
	            this.changes.add(item, this._keys.length - 1);
	        }
	        else {
	            // Check if contents are different.
	            if (item.getIdentifier() !== style.getIdentifier()) {
	                throw new TypeError("Hash collision: " + style.getStyles() + " === " + item.getStyles());
	            }
	            var oldIndex = this._keys.indexOf(style.id);
	            var newIndex = this._keys.length - 1;
	            var prevChangeId = this.changeId;
	            if (oldIndex !== newIndex) {
	                this._keys.splice(oldIndex, 1);
	                this._keys.push(style.id);
	                this.changeId++;
	            }
	            if (item instanceof Cache && style instanceof Cache) {
	                var prevChangeId_1 = item.changeId;
	                item.merge(style);
	                if (item.changeId !== prevChangeId_1) {
	                    this.changeId++;
	                }
	            }
	            if (this.changeId !== prevChangeId) {
	                if (oldIndex === newIndex) {
	                    this.sheet.splice(oldIndex, 1, item.getStyles());
	                }
	                else {
	                    this.sheet.splice(oldIndex, 1);
	                    this.sheet.splice(newIndex, 0, item.getStyles());
	                }
	                this.changes.change(item, oldIndex, newIndex);
	            }
	        }
	        return item;
	    };
	    Cache.prototype.remove = function (style) {
	        var count = this._counters[style.id];
	        if (count > 0) {
	            this._counters[style.id] = count - 1;
	            var item = this._children[style.id];
	            var index = this._keys.indexOf(item.id);
	            if (count === 1) {
	                delete this._counters[style.id];
	                delete this._children[style.id];
	                this._keys.splice(index, 1);
	                this.sheet.splice(index, 1);
	                this.changeId++;
	                this.changes.remove(item, index);
	            }
	            else if (item instanceof Cache && style instanceof Cache) {
	                var prevChangeId = item.changeId;
	                item.unmerge(style);
	                if (item.changeId !== prevChangeId) {
	                    this.sheet.splice(index, 1, item.getStyles());
	                    this.changeId++;
	                    this.changes.change(item, index, index);
	                }
	            }
	        }
	    };
	    Cache.prototype.merge = function (cache) {
	        for (var _i = 0, _a = cache._keys; _i < _a.length; _i++) {
	            var id = _a[_i];
	            this.add(cache._children[id]);
	        }
	        return this;
	    };
	    Cache.prototype.unmerge = function (cache) {
	        for (var _i = 0, _a = cache._keys; _i < _a.length; _i++) {
	            var id = _a[_i];
	            this.remove(cache._children[id]);
	        }
	        return this;
	    };
	    Cache.prototype.clone = function () {
	        return new Cache(this.hash).merge(this);
	    };
	    return Cache;
	}());
	exports.Cache = Cache;
	/**
	 * Selector is a dumb class made to represent nested CSS selectors.
	 */
	var Selector = /** @class */ (function () {
	    function Selector(selector, hash, id, pid) {
	        if (id === void 0) { id = "s" + hash(selector); }
	        if (pid === void 0) { pid = ''; }
	        this.selector = selector;
	        this.hash = hash;
	        this.id = id;
	        this.pid = pid;
	    }
	    Selector.prototype.getStyles = function () {
	        return this.selector;
	    };
	    Selector.prototype.getIdentifier = function () {
	        return this.pid + "." + this.selector;
	    };
	    Selector.prototype.clone = function () {
	        return new Selector(this.selector, this.hash, this.id, this.pid);
	    };
	    return Selector;
	}());
	exports.Selector = Selector;
	/**
	 * The style container registers a style string with selectors.
	 */
	var Style = /** @class */ (function (_super) {
	    __extends(Style, _super);
	    function Style(style, hash, id) {
	        if (id === void 0) { id = "c" + hash(style); }
	        var _this = _super.call(this, hash) || this;
	        _this.style = style;
	        _this.hash = hash;
	        _this.id = id;
	        return _this;
	    }
	    Style.prototype.getStyles = function () {
	        return this.sheet.join(',') + "{" + this.style + "}";
	    };
	    Style.prototype.getIdentifier = function () {
	        return this.style;
	    };
	    Style.prototype.clone = function () {
	        return new Style(this.style, this.hash, this.id).merge(this);
	    };
	    return Style;
	}(Cache));
	exports.Style = Style;
	/**
	 * Implement rule logic for style output.
	 */
	var Rule = /** @class */ (function (_super) {
	    __extends(Rule, _super);
	    function Rule(rule, style, hash, id, pid) {
	        if (style === void 0) { style = ''; }
	        if (id === void 0) { id = "a" + hash(rule + "." + style); }
	        if (pid === void 0) { pid = ''; }
	        var _this = _super.call(this, hash) || this;
	        _this.rule = rule;
	        _this.style = style;
	        _this.hash = hash;
	        _this.id = id;
	        _this.pid = pid;
	        return _this;
	    }
	    Rule.prototype.getStyles = function () {
	        return this.rule + "{" + this.style + join(this.sheet) + "}";
	    };
	    Rule.prototype.getIdentifier = function () {
	        return this.pid + "." + this.rule + "." + this.style;
	    };
	    Rule.prototype.clone = function () {
	        return new Rule(this.rule, this.style, this.hash, this.id, this.pid).merge(this);
	    };
	    return Rule;
	}(Cache));
	exports.Rule = Rule;
	/**
	 * The FreeStyle class implements the API for everything else.
	 */
	var FreeStyle = /** @class */ (function (_super) {
	    __extends(FreeStyle, _super);
	    function FreeStyle(hash, debug, id, changes) {
	        if (hash === void 0) { hash = stringHash; }
	        if (debug === void 0) { debug = typeof process !== 'undefined' && process.env['NODE_ENV'] !== 'production'; }
	        if (id === void 0) { id = "f" + (++uniqueId).toString(36); }
	        var _this = _super.call(this, hash, changes) || this;
	        _this.hash = hash;
	        _this.debug = debug;
	        _this.id = id;
	        return _this;
	    }
	    FreeStyle.prototype.registerStyle = function (styles, displayName) {
	        var debugName = this.debug ? displayName : undefined;
	        var _a = composeStyles(this, '&', styles, true, debugName), cache = _a.cache, id = _a.id;
	        this.merge(cache);
	        return id;
	    };
	    FreeStyle.prototype.registerKeyframes = function (keyframes, displayName) {
	        return this.registerHashRule('@keyframes', keyframes, displayName);
	    };
	    FreeStyle.prototype.registerHashRule = function (prefix, styles, displayName) {
	        var debugName = this.debug ? displayName : undefined;
	        var _a = composeStyles(this, '', styles, false, debugName), cache = _a.cache, pid = _a.pid, id = _a.id;
	        var rule = new Rule(prefix + " " + exports.escape(id), undefined, this.hash, undefined, pid);
	        this.add(rule.merge(cache));
	        return id;
	    };
	    FreeStyle.prototype.registerRule = function (rule, styles) {
	        this.merge(composeStyles(this, rule, styles, false).cache);
	    };
	    FreeStyle.prototype.registerCss = function (styles) {
	        this.merge(composeStyles(this, '', styles, false).cache);
	    };
	    FreeStyle.prototype.getStyles = function () {
	        return join(this.sheet);
	    };
	    FreeStyle.prototype.getIdentifier = function () {
	        return this.id;
	    };
	    FreeStyle.prototype.clone = function () {
	        return new FreeStyle(this.hash, this.debug, this.id, this.changes).merge(this);
	    };
	    return FreeStyle;
	}(Cache));
	exports.FreeStyle = FreeStyle;
	/**
	 * Exports a simple function to create a new instance.
	 */
	function create(hash, debug, changes) {
	    return new FreeStyle(hash, debug, undefined, changes);
	}
	exports.create = create;

	});

	unwrapExports(freeStyle);
	var freeStyle_1 = freeStyle.IS_UNIQUE;
	var freeStyle_2 = freeStyle.escape;
	var freeStyle_3 = freeStyle.hyphenate;
	var freeStyle_4 = freeStyle.stringHash;
	var freeStyle_5 = freeStyle.Cache;
	var freeStyle_6 = freeStyle.Selector;
	var freeStyle_7 = freeStyle.Style;
	var freeStyle_8 = freeStyle.Rule;
	var freeStyle_9 = freeStyle.FreeStyle;
	var freeStyle_10 = freeStyle.create;

	var formatting = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	/**
	 * We need to do the following to *our* objects before passing to freestyle:
	 * - For any `$nest` directive move up to FreeStyle style nesting
	 * - For any `$unique` directive map to FreeStyle Unique
	 * - For any `$debugName` directive return the debug name
	 */
	function ensureStringObj(object) {
	    /** The final result we will return */
	    var result = {};
	    var debugName = '';
	    for (var key in object) {
	        /** Grab the value upfront */
	        var val = object[key];
	        /** TypeStyle configuration options */
	        if (key === '$unique') {
	            result[freeStyle.IS_UNIQUE] = val;
	        }
	        else if (key === '$nest') {
	            var nested = val;
	            for (var selector in nested) {
	                var subproperties = nested[selector];
	                result[selector] = ensureStringObj(subproperties).result;
	            }
	        }
	        else if (key === '$debugName') {
	            debugName = val;
	        }
	        else {
	            result[key] = val;
	        }
	    }
	    return { result: result, debugName: debugName };
	}
	exports.ensureStringObj = ensureStringObj;
	// todo: better name here
	function explodeKeyframes(frames) {
	    var result = { $debugName: undefined, keyframes: {} };
	    for (var offset in frames) {
	        var val = frames[offset];
	        if (offset === '$debugName') {
	            result.$debugName = val;
	        }
	        else {
	            result.keyframes[offset] = val;
	        }
	    }
	    return result;
	}
	exports.explodeKeyframes = explodeKeyframes;
	});

	unwrapExports(formatting);
	var formatting_1 = formatting.ensureStringObj;
	var formatting_2 = formatting.explodeKeyframes;

	var utilities = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	/** Raf for node + browser */
	exports.raf = typeof requestAnimationFrame === 'undefined'
	    /**
	     * Make sure setTimeout is always invoked with
	     * `this` set to `window` or `global` automatically
	     **/
	    ? function (cb) { return setTimeout(cb); }
	    /**
	     * Make sure window.requestAnimationFrame is always invoked with `this` window
	     * We might have raf without window in case of `raf/polyfill` (recommended by React)
	     **/
	    : typeof window === 'undefined'
	        ? requestAnimationFrame
	        : requestAnimationFrame.bind(window);
	/**
	 * Utility to join classes conditionally
	 */
	function classes() {
	    var classes = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        classes[_i] = arguments[_i];
	    }
	    return classes.filter(function (c) { return !!c; }).join(' ');
	}
	exports.classes = classes;
	/**
	 * Merges various styles into a single style object.
	 * Note: if two objects have the same property the last one wins
	 */
	function extend() {
	    var objects = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        objects[_i] = arguments[_i];
	    }
	    /** The final result we will return */
	    var result = {};
	    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
	        var object = objects_1[_a];
	        if (object == null || object === false) {
	            continue;
	        }
	        for (var key in object) {
	            /** Falsy values except a explicit 0 is ignored */
	            var val = object[key];
	            if (!val && val !== 0) {
	                continue;
	            }
	            /** if nested media or pseudo selector */
	            if (key === '$nest' && val) {
	                result[key] = result['$nest'] ? extend(result['$nest'], val) : val;
	            }
	            else if ((key.indexOf('&') !== -1 || key.indexOf('@media') === 0)) {
	                result[key] = result[key] ? extend(result[key], val) : val;
	            }
	            else {
	                result[key] = val;
	            }
	        }
	    }
	    return result;
	}
	exports.extend = extend;
	/**
	 * Utility to help customize styles with media queries. e.g.
	 * ```
	 * style(
	 *  media({maxWidth:500}, {color:'red'})
	 * )
	 * ```
	 */
	exports.media = function (mediaQuery) {
	    var objects = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        objects[_i - 1] = arguments[_i];
	    }
	    var mediaQuerySections = [];
	    if (mediaQuery.type)
	        mediaQuerySections.push(mediaQuery.type);
	    if (mediaQuery.orientation)
	        mediaQuerySections.push("(orientation: " + mediaQuery.orientation + ")");
	    if (mediaQuery.minWidth)
	        mediaQuerySections.push("(min-width: " + mediaLength(mediaQuery.minWidth) + ")");
	    if (mediaQuery.maxWidth)
	        mediaQuerySections.push("(max-width: " + mediaLength(mediaQuery.maxWidth) + ")");
	    if (mediaQuery.minHeight)
	        mediaQuerySections.push("(min-height: " + mediaLength(mediaQuery.minHeight) + ")");
	    if (mediaQuery.maxHeight)
	        mediaQuerySections.push("(max-height: " + mediaLength(mediaQuery.maxHeight) + ")");
	    var stringMediaQuery = "@media " + mediaQuerySections.join(' and ');
	    var object = {
	        $nest: (_a = {},
	            _a[stringMediaQuery] = extend.apply(void 0, objects),
	            _a)
	    };
	    return object;
	    var _a;
	};
	var mediaLength = function (value) {
	    return typeof value === 'string' ? value : value + "px";
	};
	});

	unwrapExports(utilities);
	var utilities_1 = utilities.raf;
	var utilities_2 = utilities.classes;
	var utilities_3 = utilities.extend;
	var utilities_4 = utilities.media;

	var typestyle = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });



	/**
	 * Creates an instance of free style with our options
	 */
	var createFreeStyle = function () { return freeStyle.create(
	/** Use the default hash function */
	undefined, 
	/** Preserve $debugName values */
	true); };
	/**
	 * Maintains a single stylesheet and keeps it in sync with requested styles
	 */
	var TypeStyle = /** @class */ (function () {
	    function TypeStyle(_a) {
	        var autoGenerateTag = _a.autoGenerateTag;
	        var _this = this;
	        /**
	         * Insert `raw` CSS as a string. This is useful for e.g.
	         * - third party CSS that you are customizing with template strings
	         * - generating raw CSS in JavaScript
	         * - reset libraries like normalize.css that you can use without loaders
	         */
	        this.cssRaw = function (mustBeValidCSS) {
	            if (!mustBeValidCSS) {
	                return;
	            }
	            _this._raw += mustBeValidCSS || '';
	            _this._pendingRawChange = true;
	            _this._styleUpdated();
	        };
	        /**
	         * Takes CSSProperties and registers it to a global selector (body, html, etc.)
	         */
	        this.cssRule = function (selector) {
	            var objects = [];
	            for (var _i = 1; _i < arguments.length; _i++) {
	                objects[_i - 1] = arguments[_i];
	            }
	            var object = formatting.ensureStringObj(utilities.extend.apply(void 0, objects)).result;
	            _this._freeStyle.registerRule(selector, object);
	            _this._styleUpdated();
	            return;
	        };
	        /**
	         * Renders styles to the singleton tag imediately
	         * NOTE: You should only call it on initial render to prevent any non CSS flash.
	         * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
	         **/
	        this.forceRenderStyles = function () {
	            var target = _this._getTag();
	            if (!target) {
	                return;
	            }
	            target.textContent = _this.getStyles();
	        };
	        /**
	         * Utility function to register an @font-face
	         */
	        this.fontFace = function () {
	            var fontFace = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                fontFace[_i] = arguments[_i];
	            }
	            var freeStyle$$1 = _this._freeStyle;
	            for (var _a = 0, _b = fontFace; _a < _b.length; _a++) {
	                var face = _b[_a];
	                freeStyle$$1.registerRule('@font-face', face);
	            }
	            _this._styleUpdated();
	            return;
	        };
	        /**
	         * Allows use to use the stylesheet in a node.js environment
	         */
	        this.getStyles = function () {
	            return (_this._raw || '') + _this._freeStyle.getStyles();
	        };
	        /**
	         * Takes keyframes and returns a generated animationName
	         */
	        this.keyframes = function (frames) {
	            var _a = formatting.explodeKeyframes(frames), keyframes = _a.keyframes, $debugName = _a.$debugName;
	            // TODO: replace $debugName with display name
	            var animationName = _this._freeStyle.registerKeyframes(keyframes, $debugName);
	            _this._styleUpdated();
	            return animationName;
	        };
	        /**
	         * Helps with testing. Reinitializes FreeStyle + raw
	         */
	        this.reinit = function () {
	            /** reinit freestyle */
	            var freeStyle$$1 = createFreeStyle();
	            _this._freeStyle = freeStyle$$1;
	            _this._lastFreeStyleChangeId = freeStyle$$1.changeId;
	            /** reinit raw */
	            _this._raw = '';
	            _this._pendingRawChange = false;
	            /** Clear any styles that were flushed */
	            var target = _this._getTag();
	            if (target) {
	                target.textContent = '';
	            }
	        };
	        /** Sets the target tag where we write the css on style updates */
	        this.setStylesTarget = function (tag) {
	            /** Clear any data in any previous tag */
	            if (_this._tag) {
	                _this._tag.textContent = '';
	            }
	            _this._tag = tag;
	            /** This special time buffer immediately */
	            _this.forceRenderStyles();
	        };
	        /**
	         * Takes an object where property names are ideal class names and property values are CSSProperties, and
	         * returns an object where property names are the same ideal class names and the property values are
	         * the actual generated class names using the ideal class name as the $debugName
	         */
	        this.stylesheet = function (classes) {
	            var classNames = Object.getOwnPropertyNames(classes);
	            var result = {};
	            for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
	                var className = classNames_1[_i];
	                var classDef = classes[className];
	                if (classDef) {
	                    classDef.$debugName = className;
	                    result[className] = _this.style(classDef);
	                }
	            }
	            return result;
	        };
	        var freeStyle$$1 = createFreeStyle();
	        this._autoGenerateTag = autoGenerateTag;
	        this._freeStyle = freeStyle$$1;
	        this._lastFreeStyleChangeId = freeStyle$$1.changeId;
	        this._pending = 0;
	        this._pendingRawChange = false;
	        this._raw = '';
	        this._tag = undefined;
	        // rebind prototype to TypeStyle.  It might be better to do a function() { return this.style.apply(this, arguments)}
	        this.style = this.style.bind(this);
	    }
	    /**
	     * Only calls cb all sync operations settle
	     */
	    TypeStyle.prototype._afterAllSync = function (cb) {
	        var _this = this;
	        this._pending++;
	        var pending = this._pending;
	        utilities.raf(function () {
	            if (pending !== _this._pending) {
	                return;
	            }
	            cb();
	        });
	    };
	    TypeStyle.prototype._getTag = function () {
	        if (this._tag) {
	            return this._tag;
	        }
	        if (this._autoGenerateTag) {
	            var tag = typeof window === 'undefined'
	                ? { textContent: '' }
	                : document.createElement('style');
	            if (typeof document !== 'undefined') {
	                document.head.appendChild(tag);
	            }
	            this._tag = tag;
	            return tag;
	        }
	        return undefined;
	    };
	    /** Checks if the style tag needs updating and if so queues up the change */
	    TypeStyle.prototype._styleUpdated = function () {
	        var _this = this;
	        var changeId = this._freeStyle.changeId;
	        var lastChangeId = this._lastFreeStyleChangeId;
	        if (!this._pendingRawChange && changeId === lastChangeId) {
	            return;
	        }
	        this._lastFreeStyleChangeId = changeId;
	        this._pendingRawChange = false;
	        this._afterAllSync(function () { return _this.forceRenderStyles(); });
	    };
	    TypeStyle.prototype.style = function () {
	        var freeStyle$$1 = this._freeStyle;
	        var _a = formatting.ensureStringObj(utilities.extend.apply(undefined, arguments)), result = _a.result, debugName = _a.debugName;
	        var className = debugName ? freeStyle$$1.registerStyle(result, debugName) : freeStyle$$1.registerStyle(result);
	        this._styleUpdated();
	        return className;
	    };
	    return TypeStyle;
	}());
	exports.TypeStyle = TypeStyle;
	});

	unwrapExports(typestyle);
	var typestyle_1 = typestyle.TypeStyle;

	var types = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	});

	unwrapExports(types);

	var lib = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	exports.TypeStyle = typestyle.TypeStyle;
	/**
	 * All the CSS types in the 'types' namespace
	 */

	exports.types = types;
	/**
	 * Export certain utilities
	 */

	exports.extend = utilities.extend;
	exports.classes = utilities.classes;
	exports.media = utilities.media;
	/** Zero configuration, default instance of TypeStyle */
	var ts = new typestyle.TypeStyle({ autoGenerateTag: true });
	/** Sets the target tag where we write the css on style updates */
	exports.setStylesTarget = ts.setStylesTarget;
	/**
	 * Insert `raw` CSS as a string. This is useful for e.g.
	 * - third party CSS that you are customizing with template strings
	 * - generating raw CSS in JavaScript
	 * - reset libraries like normalize.css that you can use without loaders
	 */
	exports.cssRaw = ts.cssRaw;
	/**
	 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
	 */
	exports.cssRule = ts.cssRule;
	/**
	 * Renders styles to the singleton tag imediately
	 * NOTE: You should only call it on initial render to prevent any non CSS flash.
	 * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
	 **/
	exports.forceRenderStyles = ts.forceRenderStyles;
	/**
	 * Utility function to register an @font-face
	 */
	exports.fontFace = ts.fontFace;
	/**
	 * Allows use to use the stylesheet in a node.js environment
	 */
	exports.getStyles = ts.getStyles;
	/**
	 * Takes keyframes and returns a generated animationName
	 */
	exports.keyframes = ts.keyframes;
	/**
	 * Helps with testing. Reinitializes FreeStyle + raw
	 */
	exports.reinit = ts.reinit;
	/**
	 * Takes CSSProperties and return a generated className you can use on your component
	 */
	exports.style = ts.style;
	/**
	 * Takes an object where property names are ideal class names and property values are CSSProperties, and
	 * returns an object where property names are the same ideal class names and the property values are
	 * the actual generated class names using the ideal class name as the $debugName
	 */
	exports.stylesheet = ts.stylesheet;
	/**
	 * Creates a new instance of TypeStyle separate from the default instance.
	 *
	 * - Use this for creating a different typestyle instance for a shadow dom component.
	 * - Use this if you don't want an auto tag generated and you just want to collect the CSS.
	 *
	 * NOTE: styles aren't shared between different instances.
	 */
	function createTypeStyle(target) {
	    var instance = new typestyle.TypeStyle({ autoGenerateTag: false });
	    if (target) {
	        instance.setStylesTarget(target);
	    }
	    return instance;
	}
	exports.createTypeStyle = createTypeStyle;
	});

	unwrapExports(lib);
	var lib_1 = lib.TypeStyle;
	var lib_2 = lib.types;
	var lib_3 = lib.extend;
	var lib_4 = lib.classes;
	var lib_5 = lib.media;
	var lib_6 = lib.setStylesTarget;
	var lib_7 = lib.cssRaw;
	var lib_8 = lib.cssRule;
	var lib_9 = lib.forceRenderStyles;
	var lib_10 = lib.fontFace;
	var lib_11 = lib.getStyles;
	var lib_12 = lib.keyframes;
	var lib_13 = lib.reinit;
	var lib_14 = lib.style;
	var lib_15 = lib.stylesheet;
	var lib_16 = lib.createTypeStyle;

	let counter = 0;
	const getId = () => ++counter;

	function isLogMessage(obj) {
	    if (!obj)
	        return false;
	    if (!obj.style || !obj.message)
	        return false;
	    return Object.keys(obj).length === 2;
	}
	function box(message, bgColor = colors.blue, forColor = colors.white) {
	    return {
	        message,
	        style: `color: ${forColor}; background-color: ${bgColor}; border-radius: 0.25em; padding: 0.1em 0.3em`,
	    };
	}
	var colors;
	(function (colors) {
	    colors["red"] = "#db3236";
	    colors["green"] = "#3cba54";
	    colors["orange"] = "#f4c20d";
	    colors["blue"] = "#4885ed";
	    colors["purple"] = "#663096";
	    colors["white"] = "#ffffff";
	    colors["lightGrey"] = "#BBBBBB";
	    colors["grey"] = "#888888";
	    colors["black"] = "#000000";
	})(colors || (colors = {}));
	function createMessage(...messages) {
	    const text = messages.map(m => isLogMessage(m) ? `%c${m.message}%c` : m).join(" ");
	    const styles = [];
	    messages.forEach(m => {
	        if (isLogMessage(m)) {
	            styles.push(m.style);
	            styles.push(undefined);
	        }
	    });
	    return [text, ...styles];
	}
	function log(...messages) {
	    const logItems = createMessage(...messages);
	    console.log(...logItems);
	}
	function logGroup(messages, fn) {
	    const logItems = createMessage(...messages);
	    {
	        console.group(...logItems);
	    }
	    try {
	        return fn();
	    }
	    finally {
	        console.groupEnd();
	    }
	}

	var Gender;
	(function (Gender) {
	    Gender["Male"] = "male";
	    Gender["Female"] = "female";
	})(Gender || (Gender = {}));
	var GenderHelper;
	(function (GenderHelper) {
	    function ensure(gender) {
	        return gender === "female" ? Gender.Female : Gender.Male;
	    }
	    GenderHelper.ensure = ensure;
	    function validate(gender) {
	        if (gender !== Gender.Male && gender !== Gender.Female)
	            return `Invalid gender value: '${gender}'`;
	        return "";
	    }
	    GenderHelper.validate = validate;
	    function isValid(gender) {
	        return !validate(gender);
	    }
	    GenderHelper.isValid = isValid;
	})(GenderHelper || (GenderHelper = {}));

	class Player {
	    constructor(data) {
	        this.id = data.id;
	        this.name = data.name;
	        this.gender = data.gender;
	        this.lastOnline = data.lastOnline;
	    }
	    isOnline(allowedOfflineTimeInSeconds = 0) {
	        return this.lastOnline && allowedOfflineTimeInSeconds
	            ? (Date.now() - this.lastOnline.valueOf()) > allowedOfflineTimeInSeconds * 1000
	            : !this.lastOnline;
	    }
	}
	function isQuizmaster(player) {
	    return !!player && (player.name === "quizmaster" || player.name === "demo");
	}

	var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	function exhaustiveFail(x, dontThrow = false) {
	    if (!(dontThrow))
	        throw new Error(`Unexpected object: ${x}`);
	}
	function assert(value, message) {
	    if (value === null || value === undefined)
	        throw new Error(message || "Value required");
	    return value;
	}
	function subscribeToEvent(element, type, listener, options) {
	    const cpFn = listener.bind(element); // Copy function so multiple subscriptions are unsubscribed in balance
	    // Subscribe
	    element.addEventListener(type, cpFn, options);
	    // return unsubscribe
	    return function unsubscribeFromEvent() {
	        element.removeEventListener(type, cpFn, options);
	    };
	}
	//const eventBox = box("Event", "yellow");
	/** Patch subscribeToEvent for logging */
	/* Because some events are registred by hyperHtml internals, I didn't create a logEvent
	export function logEvent<TSubscribe extends typeof subscribeToEvent>(subscribe: TSubscribe) {

	    return function _logEvent (target, eventType, fn) {

	        // Subscribe
	        const oriUnsubscribe = logGroup([eventBox, eventType, box("ON", colors.green)], () => {
	            return (subscribe as any)( target, eventType, fn);
	        });

	        // Unsubscribe
	        return function _logEventUnsubscribe() {
	            logGroup([eventBox, eventType, box("OFF", colors.red)], () => {
	                oriUnsubscribe();
	            });
	        };
	    } as TSubscribe;
	}*/
	function combineUnsubscribes(unsubscribes) {
	    return () => unsubscribes.reverse().forEach(u => u());
	}
	function groupBy(array, groupBy) {
	    const map = new Map();
	    array.forEach(item => {
	        const key = groupBy(item);
	        if (!map.has(key)) {
	            map.set(key, [item]);
	        }
	        else {
	            map.get(key).push(item);
	        }
	    });
	    return map;
	}
	function getRandom(items) {
	    return items[Math.floor(Math.random() * items.length)];
	}
	function setFocusableChilds(el, enable) {
	    const selectableElements = ["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"];
	    const focusableElements = Array.from(el.querySelectorAll(`${selectableElements.join(",")}, [tabindex]`))
	        .filter(el => el.tabIndex >= 0 || (el.tabIndex === 0 && selectableElements.indexOf(el.tagName) > -1));
	    focusableElements.forEach(el => {
	        if (enable) {
	            if (el.oriTagIndex === undefined)
	                return; // nothing to restore
	            el.tabIndex = el.oriTabIndex; // can set to 0 when default is 0
	            delete el.oriTabIndex;
	        }
	        else {
	            if (el.oriTagIndex !== undefined)
	                return; // already something to restore, don't override
	            el.oriTabIndex = el.tabIndex;
	            el.tabIndex = -1; // disable
	        }
	    });
	}

	var Route;
	(function (Route) {
	    function validate(route) {
	        const r = route;
	        // Validation
	        if (r === "players" ||
	            r === "intro" ||
	            r === "overview" ||
	            r === "bet" ||
	            r === "bet-wait" ||
	            r === "bet-overview" ||
	            r === "question") {
	            return "";
	        }
	        else {
	            exhaustiveFail(r, true);
	            return `Unsupported route value: '${route}'`;
	        }
	    }
	    Route.validate = validate;
	    function isValid(route) {
	        return !validate(route);
	    }
	    Route.isValid = isValid;
	})(Route || (Route = {}));

	var UserId;
	(function (UserId) {
	    function validate(userId) {
	        if (typeof userId !== "string")
	            return "User id must be a string.";
	        if (userId.length > 10)
	            return "User id can be maximum 10 characters long";
	        if (userId.length < 1)
	            return "User id is required.";
	        return "";
	    }
	    UserId.validate = validate;
	    function ensure(userId, dontThrow = false) {
	        const errorMessage = validate(userId);
	        if (errorMessage) {
	            if (dontThrow)
	                return undefined;
	            throw new Error(errorMessage);
	        }
	        return userId.toLowerCase();
	    }
	    UserId.ensure = ensure;
	    function isValid(userId) {
	        return !validate(userId);
	    }
	    UserId.isValid = isValid;
	})(UserId || (UserId = {}));

	var UserName;
	(function (UserName) {
	    function validate(userName) {
	        if (typeof userName !== "string")
	            return "User name must be a string.";
	        if (userName.length > 10)
	            return "User name can be maximum 10 characters long";
	        if (userName.length < 1)
	            return "User name is required.";
	        return "";
	    }
	    UserName.validate = validate;
	    function isValid(userName) {
	        return !validate(userName);
	    }
	    UserName.isValid = isValid;
	    function ensure(userName, dontThrow = false) {
	        const errorMessage = validate(userName);
	        if (errorMessage) {
	            if (dontThrow)
	                return undefined;
	            throw new Error(errorMessage);
	        }
	        return userName;
	    }
	    UserName.ensure = ensure;
	})(UserName || (UserName = {}));

	/// <reference path="firebase.d.ts" />
	var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const config = {
	    apiKey: "AIzaSyCArG_HKB3xWQV8GDwHtZSoptM1tcXMftM",
	    authDomain: "mv-quiz.firebaseapp.com",
	    databaseURL: "https://mv-quiz.firebaseio.com",
	    projectId: "mv-quiz",
	    storageBucket: "mv-quiz.appspot.com",
	    messagingSenderId: "335795130764"
	};
	const fireBaseBox = box("firebase", colors.red);
	firebase.initializeApp(config);
	log(fireBaseBox, config.databaseURL);
	function logFirebaseAsync(message, promise) {
	    const getMessage = (state) => typeof message === "string" ? message : message(state);
	    log(fireBaseBox, box("Pending", colors.grey), getMessage("pending" /* Pending */));
	    return promise.then(function firebaseSetAsyncResolveLogging(v) {
	        log(fireBaseBox, box("Resolved", colors.green), getMessage("resolved" /* Resolved */));
	        return v;
	    }, function firebaseSetAsyncRejectLogging(err) {
	        log(fireBaseBox, box("Rejected", colors.red), getMessage("rejected" /* Rejected */));
	        throw err;
	    });
	}
	function watchConnection(cb) {
	    return watchValue("/.info/connected", val => {
	        cb(!!val);
	    }, true);
	}
	function watchValue(path, cb, shouldLogValue = false) {
	    const database = assert(firebase.database, "Firebase database is required");
	    const ref = database().ref(path);
	    const idBox = box(`#${getId()}`, colors.lightGrey);
	    log(fireBaseBox, box("Watch", colors.orange), idBox, box("ON", colors.green), path);
	    ref.on("value", snapShot => {
	        const value = snapShot ? snapShot.val() : undefined;
	        log(fireBaseBox, box("Watch", colors.orange), idBox, box("VAL", colors.blue), `${path}${shouldLogValue ? `: ${JSON.stringify(value)}` : ""}`);
	        cb(value);
	    });
	    return {
	        dispose() {
	            log(fireBaseBox, box("Watch", colors.orange), idBox, box("OFF", colors.red), path);
	            ref.off();
	        }
	    };
	}
	function watchArray(path, cb, shouldLogValue = false) {
	    const database = assert(firebase.database, "Firebase database is required");
	    const ref = database().ref(path);
	    const idBox = box(`#${getId()}`, colors.lightGrey);
	    log(fireBaseBox, box("Watch", colors.orange), idBox, box("ON", colors.green), path);
	    ref.on("value", snapShot => {
	        const value = snapShot ? snapShot.val() : undefined;
	        const arr = value ? Object.keys(value).map((key) => value[key]) : [];
	        log(fireBaseBox, box("Watch", colors.orange), idBox, box("VAL", colors.blue), `${path} ${shouldLogValue ? `: ${JSON.stringify(value)}` : ""}`);
	        cb(arr);
	    });
	    return {
	        dispose() {
	            log(fireBaseBox, box("Watch", colors.orange), idBox, box("OFF", colors.red), path);
	            ref.off();
	        }
	    };
	}
	class FirebaseDatabase {
	    constructor() {
	        this.loggedOnUsers = {};
	    }
	    watchPlayers(cb) {
	        return watchArray("/players" /* Players */, dbPlayers => {
	            if (dbPlayers) {
	                const players = dbPlayers
	                    .filter(dbPlayer => {
	                    // Skip invalid user names
	                    if (!dbPlayer || !dbPlayer.name)
	                        return false;
	                    const errorMessage = UserName.validate(dbPlayer.name);
	                    if (errorMessage)
	                        console.warn(`Fetched invalid Player with name: ${dbPlayer.name}: ${errorMessage}`);
	                    return !errorMessage;
	                })
	                    .map(dbPlayer => {
	                    return new Player({
	                        id: UserId.ensure(dbPlayer.name),
	                        name: UserName.ensure(dbPlayer.name),
	                        gender: GenderHelper.ensure(dbPlayer.gender),
	                        lastOnline: typeof dbPlayer.lastOnline === "number" ? new Date(dbPlayer.lastOnline) : undefined
	                    });
	                });
	                cb(players);
	            }
	            else {
	                cb([]);
	            }
	        });
	    }
	    logOnAsync(player) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const playerId = UserId.ensure(player.name);
	            const database = assert(firebase.database, "Firebase database is required");
	            const playerRef = database().ref(`${"/players" /* Players */}/${playerId}`);
	            const lastOnlineRef = database().ref(`${"/players" /* Players */}/${playerId}/lastOnline`);
	            return new Promise((resolve, reject) => {
	                if (this.loggedOnUsers[playerId])
	                    this.loggedOnUsers[playerId]();
	                //TODO: Use balancd scope so only one time watched for multiple uses (demo)
	                const unsubscribeConnection = watchConnection(isOnline => {
	                    if (isOnline) {
	                        // On disconnect, store a value
	                        lastOnlineRef.onDisconnect().set(database.ServerValue.TIMESTAMP);
	                        // Add to players
	                        const dbPlayer = {
	                            name: player.name,
	                            gender: player.gender,
	                        };
	                        logFirebaseAsync(`Add player to '${playerRef.path}'`, playerRef.set(dbPlayer).then(() => {
	                            resolve(new Player(Object.assign({}, player, { id: playerId, lastOnline: undefined })));
	                        }, reject));
	                    }
	                }).dispose;
	                this.loggedOnUsers[playerId] = () => {
	                    unsubscribeConnection();
	                    lastOnlineRef.onDisconnect().cancel();
	                };
	            });
	        });
	    }
	    logOffAsync(playerId) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            if (this.loggedOnUsers[playerId])
	                this.loggedOnUsers[playerId]();
	            const database = assert(firebase.database, "Firebase database is required");
	            const lastOnlineRef = database().ref(`${"/players" /* Players */}/${playerId}/lastOnline`);
	            return logFirebaseAsync(`Log off user: '${lastOnlineRef.path}'`, lastOnlineRef.set(database.ServerValue.TIMESTAMP));
	        });
	    }
	    setRouteAsync(route) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const database = assert(firebase.database, "Firebase database is required");
	            return logFirebaseAsync(`Set '${"/route" /* Route */}' to '${route}'`, database().ref("/route" /* Route */).set({
	                page: route
	            }));
	        });
	    }
	    watchRoute(cb) {
	        return watchValue("/route" /* Route */, dbRoute => {
	            const route = dbRoute ? dbRoute.page : "players";
	            const questionNumber = dbRoute ? dbRoute.questionNumber || 0 : 0;
	            if (Route.isValid(route)) {
	                cb(route, questionNumber);
	            }
	            else {
	                cb("players", 0);
	            }
	        }, true);
	    }
	    setMyBetAsync(playerId, questionNumber, myGender, selectedPlayerId, selectedBetAmount) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const database = assert(firebase.database, "Firebase database is required");
	            const playerBetRef = database().ref(`${"/player-bets" /* Bets */}/${questionNumber}/${playerId}`);
	            const myBet = {
	                playerId: selectedPlayerId,
	                amount: selectedBetAmount,
	                gender: myGender
	            };
	            return logFirebaseAsync(`Storing bet of player ${playerId}, question ${questionNumber}`, playerBetRef.set(myBet));
	        });
	    }
	    watchMyBet(playerId, questionNumber, cb) {
	        return watchValue(`${"/player-bets" /* Bets */}/${questionNumber}/${playerId}`, dbMyBet => {
	            const playerId = dbMyBet ? dbMyBet.playerId || undefined : undefined;
	            const amount = dbMyBet ? dbMyBet.amount || undefined : undefined;
	            const gender = dbMyBet ? dbMyBet.gender || undefined : undefined;
	            if (UserId.isValid(playerId) && typeof amount === "number") {
	                cb({ playerId, amount, gender });
	            }
	            else {
	                cb(undefined);
	            }
	        });
	    }
	    watchPlayerBets(questionNumber, cb) {
	        return watchValue(`${"/player-bets" /* Bets */}/${questionNumber}`, bets => {
	            cb(bets || {});
	        });
	    }
	    setTeamBetAsync(questionNumber, teamBets) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const database = assert(firebase.database, "Firebase database is required");
	            const playerBetRef = database().ref(`${"/team-bets" /* TeamBet */}/${questionNumber}`);
	            return playerBetRef.set(teamBets);
	        });
	    }
	    watchTeamBets(questionNumber, cb) {
	        return watchValue(`${"/team-bets" /* TeamBet */}/${questionNumber}`, teamBets => {
	            // TODO: validate
	            cb(teamBets);
	        });
	    }
	    watchScore(cb) {
	        return watchValue(`${"/score" /* Score */}`, (score) => {
	            if (!score)
	                score = {};
	            score.female = score.female === undefined ? 1000 : score.female || 0;
	            score.male = score.male === undefined ? 1000 : score.male || 0;
	            cb(score);
	        });
	    }
	    dropAsync() {
	        const database = assert(firebase.database, "Firebase database is required");
	        return database().ref("/").remove();
	        /*
	        const playersRef = database().ref(`${DatabasePaths.Players}`);
	        const playerBetRef = database().ref(`${DatabasePaths.Bets}`);
	        const scoreRef = database().ref(`${DatabasePaths.Score}`);
	        const teamBetRef = database().ref(`${DatabasePaths.TeamBet}`);
	        const routeRef = database().ref(`${DatabasePaths.Route}`);

	        Promise.all[
	            playersRef.remove(),
	            playerBetRef.remove(),
	            scoreRef.remove(),
	            teamBetRef.remove(),
	            routeRef.remove(),
	        ]);*/
	    }
	}

	const database = new FirebaseDatabase();

	var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const setMyBet = database.setMyBetAsync;
	const setTeamBetAsync = database.setTeamBetAsync;
	function updateTeamBetAsync(questionNumber) {
	    return __awaiter$2(this, void 0, void 0, function* () {
	        let unsubscribe;
	        return new Promise((resolve, reject) => {
	            unsubscribe = database.watchPlayerBets(questionNumber, bets => {
	                // Get all bets
	                const betObjects = Object.keys(bets).map(key => bets[key]);
	                const maleBets = betObjects.filter(b => b.gender === Gender.Male);
	                const maleTeam = {
	                    gender: Gender.Male,
	                    amount: maleBets.length > 0 ? Math.round(maleBets.reduce((prev, curr) => prev + curr.amount, 0) * 100 / maleBets.length) / 100 : 0.15,
	                    playerId: ""
	                };
	                let playerIdCount = 0;
	                groupBy(maleBets, i => i.playerId).forEach((v, k) => {
	                    if (playerIdCount < v.length) {
	                        playerIdCount = v.length;
	                        maleTeam.playerId = k;
	                    }
	                });
	                const femaleBets = betObjects.filter(b => b.gender === Gender.Female);
	                const femaleTeam = {
	                    gender: Gender.Female,
	                    amount: femaleBets.length > 0 ? Math.round(femaleBets.reduce((prev, curr) => prev + curr.amount, 0) * 100 / maleBets.length) / 100 : 0.15,
	                    playerId: ""
	                };
	                playerIdCount = 0;
	                groupBy(femaleBets, i => i.playerId).forEach((v, k) => {
	                    if (playerIdCount < v.length) {
	                        playerIdCount = v.length;
	                        femaleTeam.playerId = k;
	                    }
	                });
	                const teamBets = {
	                    male: maleTeam,
	                    female: femaleTeam
	                };
	                setTeamBetAsync(questionNumber, teamBets).then(resolve, reject);
	            }).dispose;
	        }).then(() => { if (unsubscribe)
	            unsubscribe(); }, () => { if (unsubscribe)
	            unsubscribe(); });
	    });
	}

	/** MobX - (c) Michel Weststrate 2015 - 2018 - MIT Licensed */
	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = Object.setPrototypeOf ||
	    ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	    function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var __assign = Object.assign || function __assign(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	    }
	    return t;
	};















	function __values(o) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
	    if (m) return m.call(o);
	    return {
	        next: function () {
	            if (o && i >= o.length) o = void 0;
	            return { value: o && o[i++], done: !o };
	        }
	    };
	}

	function __read(o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	}

	function __spread() {
	    for (var ar = [], i = 0; i < arguments.length; i++)
	        ar = ar.concat(__read(arguments[i]));
	    return ar;
	}

	var OBFUSCATED_ERROR$$1 = "An invariant failed, however the error is obfuscated because this is an production build.";
	var EMPTY_ARRAY$$1 = [];
	Object.freeze(EMPTY_ARRAY$$1);
	var EMPTY_OBJECT$$1 = {};
	Object.freeze(EMPTY_OBJECT$$1);
	function getNextId$$1() {
	    return ++globalState$$1.mobxGuid;
	}
	function fail$$1(message) {
	    invariant$$1(false, message);
	    throw "X"; // unreachable
	}
	function invariant$$1(check, message) {
	    if (!check)
	        throw new Error("[mobx] " + (message || OBFUSCATED_ERROR$$1));
	}
	/**
	 * Prints a deprecation message, but only one time.
	 * Returns false if the deprecated message was already printed before
	 */
	var deprecatedMessages = [];
	function deprecated$$1(msg, thing) {
	    if (process.env.NODE_ENV === "production")
	        return false;
	    if (thing) {
	        return deprecated$$1("'" + msg + "', use '" + thing + "' instead.");
	    }
	    if (deprecatedMessages.indexOf(msg) !== -1)
	        return false;
	    deprecatedMessages.push(msg);
	    console.error("[mobx] Deprecated: " + msg);
	    return true;
	}
	/**
	 * Makes sure that the provided function is invoked at most once.
	 */
	function once$$1(func) {
	    var invoked = false;
	    return function () {
	        if (invoked)
	            return;
	        invoked = true;
	        return func.apply(this, arguments);
	    };
	}
	var noop$$1 = function () { };
	function unique$$1(list) {
	    var res = [];
	    list.forEach(function (item) {
	        if (res.indexOf(item) === -1)
	            res.push(item);
	    });
	    return res;
	}
	function isObject$$1(value) {
	    return value !== null && typeof value === "object";
	}
	function isPlainObject$$1(value) {
	    if (value === null || typeof value !== "object")
	        return false;
	    var proto = Object.getPrototypeOf(value);
	    return proto === Object.prototype || proto === null;
	}

	function addHiddenProp$$1(object, propName, value) {
	    Object.defineProperty(object, propName, {
	        enumerable: false,
	        writable: true,
	        configurable: true,
	        value: value
	    });
	}
	function addHiddenFinalProp$$1(object, propName, value) {
	    Object.defineProperty(object, propName, {
	        enumerable: false,
	        writable: false,
	        configurable: true,
	        value: value
	    });
	}
	function isPropertyConfigurable$$1(object, prop) {
	    var descriptor = Object.getOwnPropertyDescriptor(object, prop);
	    return !descriptor || (descriptor.configurable !== false && descriptor.writable !== false);
	}
	function assertPropertyConfigurable$$1(object, prop) {
	    if (process.env.NODE_ENV !== "production" && !isPropertyConfigurable$$1(object, prop))
	        fail$$1("Cannot make property '" + prop.toString() + "' observable, it is not configurable and writable in the target object");
	}
	function createInstanceofPredicate$$1(name, clazz) {
	    var propName = "isMobX" + name;
	    clazz.prototype[propName] = true;
	    return function (x) {
	        return isObject$$1(x) && x[propName] === true;
	    };
	}
	function isES6Map$$1(thing) {
	    return thing instanceof Map;
	}
	function getMapLikeKeys$$1(map) {
	    if (isPlainObject$$1(map))
	        return Object.keys(map);
	    if (Array.isArray(map))
	        return map.map(function (_a) {
	            var _b = __read(_a, 1), key = _b[0];
	            return key;
	        });
	    if (isES6Map$$1(map) || isObservableMap$$1(map))
	        return Array.from(map.keys());
	    return fail$$1("Cannot get keys from '" + map + "'");
	}
	function toPrimitive$$1(value) {
	    return value === null ? null : typeof value === "object" ? "" + value : value;
	}

	var $mobx$$1 = Symbol("mobx administration");
	var Atom$$1 = /** @class */ (function () {
	    /**
	     * Create a new atom. For debugging purposes it is recommended to give it a name.
	     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
	     */
	    function Atom$$1(name) {
	        if (name === void 0) { name = "Atom@" + getNextId$$1(); }
	        this.name = name;
	        this.isPendingUnobservation = false; // for effective unobserving. BaseAtom has true, for extra optimization, so its onBecomeUnobserved never gets called, because it's not needed
	        this.isBeingObserved = false;
	        this.observers = new Set();
	        this.diffValue = 0;
	        this.lastAccessedBy = 0;
	        this.lowestObserverState = IDerivationState.NOT_TRACKING;
	    }
	    Atom$$1.prototype.onBecomeUnobserved = function () {
	        // noop
	    };
	    Atom$$1.prototype.onBecomeObserved = function () {
	        /* noop */
	    };
	    /**
	     * Invoke this method to notify mobx that your atom has been used somehow.
	     * Returns true if there is currently a reactive context.
	     */
	    Atom$$1.prototype.reportObserved = function () {
	        return reportObserved$$1(this);
	    };
	    /**
	     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
	     */
	    Atom$$1.prototype.reportChanged = function () {
	        startBatch$$1();
	        propagateChanged$$1(this);
	        endBatch$$1();
	    };
	    Atom$$1.prototype.toString = function () {
	        return this.name;
	    };
	    return Atom$$1;
	}());
	var isAtom$$1 = createInstanceofPredicate$$1("Atom", Atom$$1);
	function createAtom$$1(name, onBecomeObservedHandler, onBecomeUnobservedHandler) {
	    if (onBecomeObservedHandler === void 0) { onBecomeObservedHandler = noop$$1; }
	    if (onBecomeUnobservedHandler === void 0) { onBecomeUnobservedHandler = noop$$1; }
	    var atom = new Atom$$1(name);
	    onBecomeObserved$$1(atom, onBecomeObservedHandler);
	    onBecomeUnobserved$$1(atom, onBecomeUnobservedHandler);
	    return atom;
	}

	function identityComparer(a, b) {
	    return a === b;
	}
	function structuralComparer(a, b) {
	    return deepEqual$$1(a, b);
	}
	function defaultComparer(a, b) {
	    return Object.is(a, b);
	}
	var comparer$$1 = {
	    identity: identityComparer,
	    structural: structuralComparer,
	    default: defaultComparer
	};

	var mobxDidRunLazyInitializersSymbol$$1 = Symbol("mobx did run lazy initializers");
	var mobxPendingDecorators$$1 = Symbol("mobx pending decorators");
	var enumerableDescriptorCache = {};
	var nonEnumerableDescriptorCache = {};
	function createPropertyInitializerDescriptor(prop, enumerable) {
	    var cache = enumerable ? enumerableDescriptorCache : nonEnumerableDescriptorCache;
	    return (cache[prop] ||
	        (cache[prop] = {
	            configurable: true,
	            enumerable: enumerable,
	            get: function () {
	                initializeInstance$$1(this);
	                return this[prop];
	            },
	            set: function (value) {
	                initializeInstance$$1(this);
	                this[prop] = value;
	            }
	        }));
	}
	function initializeInstance$$1(target) {
	    if (target[mobxDidRunLazyInitializersSymbol$$1] === true)
	        return;
	    var decorators = target[mobxPendingDecorators$$1];
	    if (decorators) {
	        addHiddenProp$$1(target, mobxDidRunLazyInitializersSymbol$$1, true);
	        for (var key in decorators) {
	            var d = decorators[key];
	            d.propertyCreator(target, d.prop, d.descriptor, d.decoratorTarget, d.decoratorArguments);
	        }
	    }
	}
	function createPropDecorator$$1(propertyInitiallyEnumerable, propertyCreator) {
	    return function decoratorFactory() {
	        var decoratorArguments;
	        var decorator = function decorate$$1(target, prop, descriptor, applyImmediately
	        // This is a special parameter to signal the direct application of a decorator, allow extendObservable to skip the entire type decoration part,
	        // as the instance to apply the decorator to equals the target
	        ) {
	            if (applyImmediately === true) {
	                propertyCreator(target, prop, descriptor, target, decoratorArguments);
	                return null;
	            }
	            if (process.env.NODE_ENV !== "production" && !quacksLikeADecorator$$1(arguments))
	                fail$$1("This function is a decorator, but it wasn't invoked like a decorator");
	            if (!Object.prototype.hasOwnProperty.call(target, mobxPendingDecorators$$1)) {
	                var inheritedDecorators = target[mobxPendingDecorators$$1];
	                addHiddenProp$$1(target, mobxPendingDecorators$$1, __assign({}, inheritedDecorators));
	            }
	            target[mobxPendingDecorators$$1][prop] = {
	                prop: prop,
	                propertyCreator: propertyCreator,
	                descriptor: descriptor,
	                decoratorTarget: target,
	                decoratorArguments: decoratorArguments
	            };
	            return createPropertyInitializerDescriptor(prop, propertyInitiallyEnumerable);
	        };
	        if (quacksLikeADecorator$$1(arguments)) {
	            // @decorator
	            decoratorArguments = EMPTY_ARRAY$$1;
	            return decorator.apply(null, arguments);
	        }
	        else {
	            // @decorator(args)
	            decoratorArguments = Array.prototype.slice.call(arguments);
	            return decorator;
	        }
	    };
	}
	function quacksLikeADecorator$$1(args) {
	    return (((args.length === 2 || args.length === 3) && typeof args[1] === "string") ||
	        (args.length === 4 && args[3] === true));
	}

	function deepEnhancer$$1(v, _, name) {
	    // it is an observable already, done
	    if (isObservable$$1(v))
	        return v;
	    // something that can be converted and mutated?
	    if (Array.isArray(v))
	        return observable$$1.array(v, { name: name });
	    if (isPlainObject$$1(v))
	        return observable$$1.object(v, undefined, { name: name });
	    if (isES6Map$$1(v))
	        return observable$$1.map(v, { name: name });
	    return v;
	}
	function shallowEnhancer$$1(v, _, name) {
	    if (v === undefined || v === null)
	        return v;
	    if (isObservableObject$$1(v) || isObservableArray$$1(v) || isObservableMap$$1(v))
	        return v;
	    if (Array.isArray(v))
	        return observable$$1.array(v, { name: name, deep: false });
	    if (isPlainObject$$1(v))
	        return observable$$1.object(v, undefined, { name: name, deep: false });
	    if (isES6Map$$1(v))
	        return observable$$1.map(v, { name: name, deep: false });
	    return fail$$1(process.env.NODE_ENV !== "production" &&
	        "The shallow modifier / decorator can only used in combination with arrays, objects and maps");
	}
	function referenceEnhancer$$1(newValue) {
	    // never turn into an observable
	    return newValue;
	}
	function refStructEnhancer$$1(v, oldValue, name) {
	    if (process.env.NODE_ENV !== "production" && isObservable$$1(v))
	        throw "observable.struct should not be used with observable values";
	    if (deepEqual$$1(v, oldValue))
	        return oldValue;
	    return v;
	}

	function createDecoratorForEnhancer$$1(enhancer) {
	    invariant$$1(enhancer);
	    var decorator = createPropDecorator$$1(true, function (target, propertyName, descriptor, _decoratorTarget, decoratorArgs) {
	        if (process.env.NODE_ENV !== "production") {
	            invariant$$1(!descriptor || !descriptor.get, "@observable cannot be used on getter (property \"" + propertyName + "\"), use @computed instead.");
	        }
	        var initialValue = descriptor
	            ? descriptor.initializer
	                ? descriptor.initializer.call(target)
	                : descriptor.value
	            : undefined;
	        asObservableObject$$1(target).addObservableProp(propertyName, initialValue, enhancer);
	    });
	    var res = 
	    // Extra process checks, as this happens during module initialization
	    typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production"
	        ? function observableDecorator() {
	            // This wrapper function is just to detect illegal decorator invocations, deprecate in a next version
	            // and simply return the created prop decorator
	            if (arguments.length < 2)
	                return fail$$1("Incorrect decorator invocation. @observable decorator doesn't expect any arguments");
	            return decorator.apply(null, arguments);
	        }
	        : decorator;
	    res.enhancer = enhancer;
	    return res;
	}

	// Predefined bags of create observable options, to avoid allocating temporarily option objects
	// in the majority of cases
	var defaultCreateObservableOptions$$1 = {
	    deep: true,
	    name: undefined,
	    defaultDecorator: undefined,
	    proxy: true
	};
	Object.freeze(defaultCreateObservableOptions$$1);
	function assertValidOption(key) {
	    if (!/^(deep|name|defaultDecorator|proxy)$/.test(key))
	        fail$$1("invalid option for (extend)observable: " + key);
	}
	function asCreateObservableOptions$$1(thing) {
	    if (thing === null || thing === undefined)
	        return defaultCreateObservableOptions$$1;
	    if (typeof thing === "string")
	        return { name: thing, deep: true, proxy: true };
	    if (process.env.NODE_ENV !== "production") {
	        if (typeof thing !== "object")
	            return fail$$1("expected options object");
	        Object.keys(thing).forEach(assertValidOption);
	    }
	    return thing;
	}
	var deepDecorator$$1 = createDecoratorForEnhancer$$1(deepEnhancer$$1);
	var shallowDecorator = createDecoratorForEnhancer$$1(shallowEnhancer$$1);
	var refDecorator$$1 = createDecoratorForEnhancer$$1(referenceEnhancer$$1);
	var refStructDecorator = createDecoratorForEnhancer$$1(refStructEnhancer$$1);
	function getEnhancerFromOptions(options) {
	    return options.defaultDecorator
	        ? options.defaultDecorator.enhancer
	        : options.deep === false
	            ? referenceEnhancer$$1
	            : deepEnhancer$$1;
	}
	/**
	 * Turns an object, array or function into a reactive structure.
	 * @param v the value which should become observable.
	 */
	function createObservable(v, arg2, arg3) {
	    // @observable someProp;
	    if (typeof arguments[1] === "string") {
	        return deepDecorator$$1.apply(null, arguments);
	    }
	    // it is an observable already, done
	    if (isObservable$$1(v))
	        return v;
	    // something that can be converted and mutated?
	    var res = isPlainObject$$1(v)
	        ? observable$$1.object(v, arg2, arg3)
	        : Array.isArray(v)
	            ? observable$$1.array(v, arg2)
	            : isES6Map$$1(v)
	                ? observable$$1.map(v, arg2)
	                : v;
	    // this value could be converted to a new observable data structure, return it
	    if (res !== v)
	        return res;
	    // otherwise, just box it
	    fail$$1(process.env.NODE_ENV !== "production" &&
	        "The provided value could not be converted into an observable. If you want just create an observable reference to the object use 'observable.box(value)'");
	}
	var observableFactories = {
	    box: function (value, options) {
	        if (arguments.length > 2)
	            incorrectlyUsedAsDecorator("box");
	        var o = asCreateObservableOptions$$1(options);
	        return new ObservableValue$$1(value, getEnhancerFromOptions(o), o.name);
	    },
	    array: function (initialValues, options) {
	        if (arguments.length > 2)
	            incorrectlyUsedAsDecorator("array");
	        var o = asCreateObservableOptions$$1(options);
	        return createObservableArray$$1(initialValues, getEnhancerFromOptions(o), o.name);
	    },
	    map: function (initialValues, options) {
	        if (arguments.length > 2)
	            incorrectlyUsedAsDecorator("map");
	        var o = asCreateObservableOptions$$1(options);
	        return new ObservableMap$$1(initialValues, getEnhancerFromOptions(o), o.name);
	    },
	    object: function (props, decorators, options) {
	        if (typeof arguments[1] === "string")
	            incorrectlyUsedAsDecorator("object");
	        var o = asCreateObservableOptions$$1(options);
	        if (o.proxy === false) {
	            return extendObservable$$1({}, props, decorators, o);
	        }
	        else {
	            var defaultDecorator = getDefaultDecoratorFromObjectOptions$$1(o);
	            var base = extendObservable$$1({}, undefined, undefined, o);
	            var proxy = createDynamicObservableObject$$1(base);
	            extendObservableObjectWithProperties$$1(proxy, props, decorators, defaultDecorator);
	            return proxy;
	        }
	    },
	    ref: refDecorator$$1,
	    shallow: shallowDecorator,
	    deep: deepDecorator$$1,
	    struct: refStructDecorator
	};
	var observable$$1 = createObservable;
	// weird trick to keep our typings nicely with our funcs, and still extend the observable function
	Object.keys(observableFactories).forEach(function (name) { return (observable$$1[name] = observableFactories[name]); });
	function incorrectlyUsedAsDecorator(methodName) {
	    fail$$1(
	    // process.env.NODE_ENV !== "production" &&
	    "Expected one or two arguments to observable." + methodName + ". Did you accidentally try to use observable." + methodName + " as decorator?");
	}

	var computedDecorator$$1 = createPropDecorator$$1(false, function (instance, propertyName, descriptor, decoratorTarget, decoratorArgs) {
	    var get$$1 = descriptor.get, set$$1 = descriptor.set; // initialValue is the descriptor for get / set props
	    // Optimization: faster on decorator target or instance? Assuming target
	    // Optimization: find out if declaring on instance isn't just faster. (also makes the property descriptor simpler). But, more memory usage..
	    var options = decoratorArgs[0] || {};
	    asObservableObject$$1(instance).addComputedProp(decoratorTarget, propertyName, __assign({ get: get$$1,
	        set: set$$1, context: instance }, options));
	});
	var computedStructDecorator = computedDecorator$$1({ equals: comparer$$1.structural });

	function createAction$$1(actionName, fn) {
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(typeof fn === "function", "`action` can only be invoked on functions");
	        if (typeof actionName !== "string" || !actionName)
	            fail$$1("actions should have valid names, got: '" + actionName + "'");
	    }
	    var res = function () {
	        return executeAction$$1(actionName, fn, this, arguments);
	    };
	    res.isMobxAction = true;
	    return res;
	}
	function executeAction$$1(actionName, fn, scope, args) {
	    var runInfo = startAction(actionName, fn, scope, args);
	    try {
	        return fn.apply(scope, args);
	    }
	    finally {
	        endAction(runInfo);
	    }
	}
	function startAction(actionName, fn, scope, args) {
	    var notifySpy = isSpyEnabled$$1() && !!actionName;
	    var startTime = 0;
	    if (notifySpy && process.env.NODE_ENV !== "production") {
	        startTime = Date.now();
	        var l = (args && args.length) || 0;
	        var flattendArgs = new Array(l);
	        if (l > 0)
	            for (var i = 0; i < l; i++)
	                flattendArgs[i] = args[i];
	        spyReportStart$$1({
	            type: "action",
	            name: actionName,
	            object: scope,
	            arguments: flattendArgs
	        });
	    }
	    var prevDerivation = untrackedStart$$1();
	    startBatch$$1();
	    var prevAllowStateChanges = allowStateChangesStart$$1(true);
	    return {
	        prevDerivation: prevDerivation,
	        prevAllowStateChanges: prevAllowStateChanges,
	        notifySpy: notifySpy,
	        startTime: startTime
	    };
	}
	function endAction(runInfo) {
	    allowStateChangesEnd$$1(runInfo.prevAllowStateChanges);
	    endBatch$$1();
	    untrackedEnd$$1(runInfo.prevDerivation);
	    if (runInfo.notifySpy && process.env.NODE_ENV !== "production")
	        spyReportEnd$$1({ time: Date.now() - runInfo.startTime });
	}
	function allowStateChangesStart$$1(allowStateChanges$$1) {
	    var prev = globalState$$1.allowStateChanges;
	    globalState$$1.allowStateChanges = allowStateChanges$$1;
	    return prev;
	}
	function allowStateChangesEnd$$1(prev) {
	    globalState$$1.allowStateChanges = prev;
	}

	var UNCHANGED$$1 = {};
	var ObservableValue$$1 = /** @class */ (function (_super) {
	    __extends(ObservableValue$$1, _super);
	    function ObservableValue$$1(value, enhancer, name, notifySpy) {
	        if (name === void 0) { name = "ObservableValue@" + getNextId$$1(); }
	        if (notifySpy === void 0) { notifySpy = true; }
	        var _this = _super.call(this, name) || this;
	        _this.enhancer = enhancer;
	        _this.hasUnreportedChange = false;
	        _this.value = enhancer(value, undefined, name);
	        if (notifySpy && isSpyEnabled$$1() && process.env.NODE_ENV !== "production") {
	            // only notify spy if this is a stand-alone observable
	            spyReport$$1({ type: "create", name: _this.name, newValue: "" + _this.value });
	        }
	        return _this;
	    }
	    ObservableValue$$1.prototype.dehanceValue = function (value) {
	        if (this.dehancer !== undefined)
	            return this.dehancer(value);
	        return value;
	    };
	    ObservableValue$$1.prototype.set = function (newValue) {
	        var oldValue = this.value;
	        newValue = this.prepareNewValue(newValue);
	        if (newValue !== UNCHANGED$$1) {
	            var notifySpy = isSpyEnabled$$1();
	            if (notifySpy && process.env.NODE_ENV !== "production") {
	                spyReportStart$$1({
	                    type: "update",
	                    name: this.name,
	                    newValue: newValue,
	                    oldValue: oldValue
	                });
	            }
	            this.setNewValue(newValue);
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportEnd$$1();
	        }
	    };
	    ObservableValue$$1.prototype.prepareNewValue = function (newValue) {
	        checkIfStateModificationsAreAllowed$$1(this);
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                object: this,
	                type: "update",
	                newValue: newValue
	            });
	            if (!change)
	                return UNCHANGED$$1;
	            newValue = change.newValue;
	        }
	        // apply modifier
	        newValue = this.enhancer(newValue, this.value, this.name);
	        return this.value !== newValue ? newValue : UNCHANGED$$1;
	    };
	    ObservableValue$$1.prototype.setNewValue = function (newValue) {
	        var oldValue = this.value;
	        this.value = newValue;
	        this.reportChanged();
	        if (hasListeners$$1(this)) {
	            notifyListeners$$1(this, {
	                type: "update",
	                object: this,
	                newValue: newValue,
	                oldValue: oldValue
	            });
	        }
	    };
	    ObservableValue$$1.prototype.get = function () {
	        this.reportObserved();
	        return this.dehanceValue(this.value);
	    };
	    ObservableValue$$1.prototype.intercept = function (handler) {
	        return registerInterceptor$$1(this, handler);
	    };
	    ObservableValue$$1.prototype.observe = function (listener, fireImmediately) {
	        if (fireImmediately)
	            listener({
	                object: this,
	                type: "update",
	                newValue: this.value,
	                oldValue: undefined
	            });
	        return registerListener$$1(this, listener);
	    };
	    ObservableValue$$1.prototype.toJSON = function () {
	        return this.get();
	    };
	    ObservableValue$$1.prototype.toString = function () {
	        return this.name + "[" + this.value + "]";
	    };
	    ObservableValue$$1.prototype.valueOf = function () {
	        return toPrimitive$$1(this.get());
	    };
	    ObservableValue$$1.prototype[Symbol.toPrimitive] = function () {
	        return this.valueOf();
	    };
	    return ObservableValue$$1;
	}(Atom$$1));
	var isObservableValue$$1 = createInstanceofPredicate$$1("ObservableValue", ObservableValue$$1);

	/**
	 * A node in the state dependency root that observes other nodes, and can be observed itself.
	 *
	 * ComputedValue will remember the result of the computation for the duration of the batch, or
	 * while being observed.
	 *
	 * During this time it will recompute only when one of its direct dependencies changed,
	 * but only when it is being accessed with `ComputedValue.get()`.
	 *
	 * Implementation description:
	 * 1. First time it's being accessed it will compute and remember result
	 *    give back remembered result until 2. happens
	 * 2. First time any deep dependency change, propagate POSSIBLY_STALE to all observers, wait for 3.
	 * 3. When it's being accessed, recompute if any shallow dependency changed.
	 *    if result changed: propagate STALE to all observers, that were POSSIBLY_STALE from the last step.
	 *    go to step 2. either way
	 *
	 * If at any point it's outside batch and it isn't observed: reset everything and go to 1.
	 */
	var ComputedValue$$1 = /** @class */ (function () {
	    /**
	     * Create a new computed value based on a function expression.
	     *
	     * The `name` property is for debug purposes only.
	     *
	     * The `equals` property specifies the comparer function to use to determine if a newly produced
	     * value differs from the previous value. Two comparers are provided in the library; `defaultComparer`
	     * compares based on identity comparison (===), and `structualComparer` deeply compares the structure.
	     * Structural comparison can be convenient if you always produce a new aggregated object and
	     * don't want to notify observers if it is structurally the same.
	     * This is useful for working with vectors, mouse coordinates etc.
	     */
	    function ComputedValue$$1(options) {
	        this.dependenciesState = IDerivationState.NOT_TRACKING;
	        this.observing = []; // nodes we are looking at. Our value depends on these nodes
	        this.newObserving = null; // during tracking it's an array with new observed observers
	        this.isBeingObserved = false;
	        this.isPendingUnobservation = false;
	        this.observers = new Set();
	        this.diffValue = 0;
	        this.runId = 0;
	        this.lastAccessedBy = 0;
	        this.lowestObserverState = IDerivationState.UP_TO_DATE;
	        this.unboundDepsCount = 0;
	        this.__mapid = "#" + getNextId$$1();
	        this.value = new CaughtException$$1(null);
	        this.isComputing = false; // to check for cycles
	        this.isRunningSetter = false;
	        this.isTracing = TraceMode$$1.NONE;
	        this.firstGet = true;
	        if (process.env.NODE_ENV !== "production" && !options.get)
	            throw "[mobx] missing option for computed: get";
	        this.derivation = options.get;
	        this.name = options.name || "ComputedValue@" + getNextId$$1();
	        if (options.set)
	            this.setter = createAction$$1(this.name + "-setter", options.set);
	        this.equals =
	            options.equals ||
	                (options.compareStructural || options.struct
	                    ? comparer$$1.structural
	                    : comparer$$1.default);
	        this.scope = options.context;
	        this.requiresReaction = !!options.requiresReaction;
	        this.keepAlive = !!options.keepAlive;
	    }
	    ComputedValue$$1.prototype.onBecomeStale = function () {
	        propagateMaybeChanged$$1(this);
	    };
	    ComputedValue$$1.prototype.onBecomeUnobserved = function () { };
	    ComputedValue$$1.prototype.onBecomeObserved = function () { };
	    /**
	     * Returns the current value of this computed value.
	     * Will evaluate its computation first if needed.
	     */
	    ComputedValue$$1.prototype.get = function () {
	        var _this = this;
	        if (this.keepAlive && this.firstGet) {
	            this.firstGet = false;
	            autorun$$1(function () { return _this.get(); });
	        }
	        if (this.isComputing)
	            fail$$1("Cycle detected in computation " + this.name + ": " + this.derivation);
	        if (globalState$$1.inBatch === 0 && this.observers.size === 0) {
	            if (shouldCompute$$1(this)) {
	                this.warnAboutUntrackedRead();
	                startBatch$$1(); // See perf test 'computed memoization'
	                this.value = this.computeValue(false);
	                endBatch$$1();
	            }
	        }
	        else {
	            reportObserved$$1(this);
	            if (shouldCompute$$1(this))
	                if (this.trackAndCompute())
	                    propagateChangeConfirmed$$1(this);
	        }
	        var result = this.value;
	        if (isCaughtException$$1(result))
	            throw result.cause;
	        return result;
	    };
	    ComputedValue$$1.prototype.peek = function () {
	        var res = this.computeValue(false);
	        if (isCaughtException$$1(res))
	            throw res.cause;
	        return res;
	    };
	    ComputedValue$$1.prototype.set = function (value) {
	        if (this.setter) {
	            invariant$$1(!this.isRunningSetter, "The setter of computed value '" + this.name + "' is trying to update itself. Did you intend to update an _observable_ value, instead of the computed property?");
	            this.isRunningSetter = true;
	            try {
	                this.setter.call(this.scope, value);
	            }
	            finally {
	                this.isRunningSetter = false;
	            }
	        }
	        else
	            invariant$$1(false, process.env.NODE_ENV !== "production" &&
	                "[ComputedValue '" + this.name + "'] It is not possible to assign a new value to a computed value.");
	    };
	    ComputedValue$$1.prototype.trackAndCompute = function () {
	        if (isSpyEnabled$$1() && process.env.NODE_ENV !== "production") {
	            spyReport$$1({
	                object: this.scope,
	                type: "compute",
	                name: this.name
	            });
	        }
	        var oldValue = this.value;
	        var wasSuspended = 
	        /* see #1208 */ this.dependenciesState === IDerivationState.NOT_TRACKING;
	        var newValue = this.computeValue(true);
	        var changed = wasSuspended ||
	            isCaughtException$$1(oldValue) ||
	            isCaughtException$$1(newValue) ||
	            !this.equals(oldValue, newValue);
	        if (changed) {
	            this.value = newValue;
	        }
	        return changed;
	    };
	    ComputedValue$$1.prototype.computeValue = function (track) {
	        this.isComputing = true;
	        globalState$$1.computationDepth++;
	        var res;
	        if (track) {
	            res = trackDerivedFunction$$1(this, this.derivation, this.scope);
	        }
	        else {
	            if (globalState$$1.disableErrorBoundaries === true) {
	                res = this.derivation.call(this.scope);
	            }
	            else {
	                try {
	                    res = this.derivation.call(this.scope);
	                }
	                catch (e) {
	                    res = new CaughtException$$1(e);
	                }
	            }
	        }
	        globalState$$1.computationDepth--;
	        this.isComputing = false;
	        return res;
	    };
	    ComputedValue$$1.prototype.suspend = function () {
	        clearObserving$$1(this);
	        this.value = undefined; // don't hold on to computed value!
	    };
	    ComputedValue$$1.prototype.observe = function (listener, fireImmediately) {
	        var _this = this;
	        var firstTime = true;
	        var prevValue = undefined;
	        return autorun$$1(function () {
	            var newValue = _this.get();
	            if (!firstTime || fireImmediately) {
	                var prevU = untrackedStart$$1();
	                listener({
	                    type: "update",
	                    object: _this,
	                    newValue: newValue,
	                    oldValue: prevValue
	                });
	                untrackedEnd$$1(prevU);
	            }
	            firstTime = false;
	            prevValue = newValue;
	        });
	    };
	    ComputedValue$$1.prototype.warnAboutUntrackedRead = function () {
	        if (process.env.NODE_ENV === "production")
	            return;
	        if (this.requiresReaction === true) {
	            fail$$1("[mobx] Computed value " + this.name + " is read outside a reactive context");
	        }
	        if (this.isTracing !== TraceMode$$1.NONE) {
	            console.log("[mobx.trace] '" + this.name + "' is being read outside a reactive context. Doing a full recompute");
	        }
	        if (globalState$$1.computedRequiresReaction) {
	            console.warn("[mobx] Computed value " + this.name + " is being read outside a reactive context. Doing a full recompute");
	        }
	    };
	    ComputedValue$$1.prototype.toJSON = function () {
	        return this.get();
	    };
	    ComputedValue$$1.prototype.toString = function () {
	        return this.name + "[" + this.derivation.toString() + "]";
	    };
	    ComputedValue$$1.prototype.valueOf = function () {
	        return toPrimitive$$1(this.get());
	    };
	    ComputedValue$$1.prototype[Symbol.toPrimitive] = function () {
	        return this.valueOf();
	    };
	    return ComputedValue$$1;
	}());
	var isComputedValue$$1 = createInstanceofPredicate$$1("ComputedValue", ComputedValue$$1);

	var IDerivationState;
	(function (IDerivationState$$1) {
	    // before being run or (outside batch and not being observed)
	    // at this point derivation is not holding any data about dependency tree
	    IDerivationState$$1[IDerivationState$$1["NOT_TRACKING"] = -1] = "NOT_TRACKING";
	    // no shallow dependency changed since last computation
	    // won't recalculate derivation
	    // this is what makes mobx fast
	    IDerivationState$$1[IDerivationState$$1["UP_TO_DATE"] = 0] = "UP_TO_DATE";
	    // some deep dependency changed, but don't know if shallow dependency changed
	    // will require to check first if UP_TO_DATE or POSSIBLY_STALE
	    // currently only ComputedValue will propagate POSSIBLY_STALE
	    //
	    // having this state is second big optimization:
	    // don't have to recompute on every dependency change, but only when it's needed
	    IDerivationState$$1[IDerivationState$$1["POSSIBLY_STALE"] = 1] = "POSSIBLY_STALE";
	    // A shallow dependency has changed since last computation and the derivation
	    // will need to recompute when it's needed next.
	    IDerivationState$$1[IDerivationState$$1["STALE"] = 2] = "STALE";
	})(IDerivationState || (IDerivationState = {}));
	var TraceMode$$1;
	(function (TraceMode$$1) {
	    TraceMode$$1[TraceMode$$1["NONE"] = 0] = "NONE";
	    TraceMode$$1[TraceMode$$1["LOG"] = 1] = "LOG";
	    TraceMode$$1[TraceMode$$1["BREAK"] = 2] = "BREAK";
	})(TraceMode$$1 || (TraceMode$$1 = {}));
	var CaughtException$$1 = /** @class */ (function () {
	    function CaughtException$$1(cause) {
	        this.cause = cause;
	        // Empty
	    }
	    return CaughtException$$1;
	}());
	function isCaughtException$$1(e) {
	    return e instanceof CaughtException$$1;
	}
	/**
	 * Finds out whether any dependency of the derivation has actually changed.
	 * If dependenciesState is 1 then it will recalculate dependencies,
	 * if any dependency changed it will propagate it by changing dependenciesState to 2.
	 *
	 * By iterating over the dependencies in the same order that they were reported and
	 * stopping on the first change, all the recalculations are only called for ComputedValues
	 * that will be tracked by derivation. That is because we assume that if the first x
	 * dependencies of the derivation doesn't change then the derivation should run the same way
	 * up until accessing x-th dependency.
	 */
	function shouldCompute$$1(derivation) {
	    switch (derivation.dependenciesState) {
	        case IDerivationState.UP_TO_DATE:
	            return false;
	        case IDerivationState.NOT_TRACKING:
	        case IDerivationState.STALE:
	            return true;
	        case IDerivationState.POSSIBLY_STALE: {
	            var prevUntracked = untrackedStart$$1(); // no need for those computeds to be reported, they will be picked up in trackDerivedFunction.
	            var obs = derivation.observing, l = obs.length;
	            for (var i = 0; i < l; i++) {
	                var obj = obs[i];
	                if (isComputedValue$$1(obj)) {
	                    if (globalState$$1.disableErrorBoundaries) {
	                        obj.get();
	                    }
	                    else {
	                        try {
	                            obj.get();
	                        }
	                        catch (e) {
	                            // we are not interested in the value *or* exception at this moment, but if there is one, notify all
	                            untrackedEnd$$1(prevUntracked);
	                            return true;
	                        }
	                    }
	                    // if ComputedValue `obj` actually changed it will be computed and propagated to its observers.
	                    // and `derivation` is an observer of `obj`
	                    // invariantShouldCompute(derivation)
	                    if (derivation.dependenciesState === IDerivationState.STALE) {
	                        untrackedEnd$$1(prevUntracked);
	                        return true;
	                    }
	                }
	            }
	            changeDependenciesStateTo0$$1(derivation);
	            untrackedEnd$$1(prevUntracked);
	            return false;
	        }
	    }
	}
	function checkIfStateModificationsAreAllowed$$1(atom) {
	    var hasObservers$$1 = atom.observers.size > 0;
	    // Should never be possible to change an observed observable from inside computed, see #798
	    if (globalState$$1.computationDepth > 0 && hasObservers$$1)
	        fail$$1(process.env.NODE_ENV !== "production" &&
	            "Computed values are not allowed to cause side effects by changing observables that are already being observed. Tried to modify: " + atom.name);
	    // Should not be possible to change observed state outside strict mode, except during initialization, see #563
	    if (!globalState$$1.allowStateChanges && (hasObservers$$1 || globalState$$1.enforceActions === "strict"))
	        fail$$1(process.env.NODE_ENV !== "production" &&
	            (globalState$$1.enforceActions
	                ? "Since strict-mode is enabled, changing observed observable values outside actions is not allowed. Please wrap the code in an `action` if this change is intended. Tried to modify: "
	                : "Side effects like changing state are not allowed at this point. Are you trying to modify state from, for example, the render function of a React component? Tried to modify: ") +
	                atom.name);
	}
	/**
	 * Executes the provided function `f` and tracks which observables are being accessed.
	 * The tracking information is stored on the `derivation` object and the derivation is registered
	 * as observer of any of the accessed observables.
	 */
	function trackDerivedFunction$$1(derivation, f, context) {
	    // pre allocate array allocation + room for variation in deps
	    // array will be trimmed by bindDependencies
	    changeDependenciesStateTo0$$1(derivation);
	    derivation.newObserving = new Array(derivation.observing.length + 100);
	    derivation.unboundDepsCount = 0;
	    derivation.runId = ++globalState$$1.runId;
	    var prevTracking = globalState$$1.trackingDerivation;
	    globalState$$1.trackingDerivation = derivation;
	    var result;
	    if (globalState$$1.disableErrorBoundaries === true) {
	        result = f.call(context);
	    }
	    else {
	        try {
	            result = f.call(context);
	        }
	        catch (e) {
	            result = new CaughtException$$1(e);
	        }
	    }
	    globalState$$1.trackingDerivation = prevTracking;
	    bindDependencies(derivation);
	    return result;
	}
	/**
	 * diffs newObserving with observing.
	 * update observing to be newObserving with unique observables
	 * notify observers that become observed/unobserved
	 */
	function bindDependencies(derivation) {
	    // invariant(derivation.dependenciesState !== IDerivationState.NOT_TRACKING, "INTERNAL ERROR bindDependencies expects derivation.dependenciesState !== -1");
	    var prevObserving = derivation.observing;
	    var observing = (derivation.observing = derivation.newObserving);
	    var lowestNewObservingDerivationState = IDerivationState.UP_TO_DATE;
	    // Go through all new observables and check diffValue: (this list can contain duplicates):
	    //   0: first occurrence, change to 1 and keep it
	    //   1: extra occurrence, drop it
	    var i0 = 0, l = derivation.unboundDepsCount;
	    for (var i = 0; i < l; i++) {
	        var dep = observing[i];
	        if (dep.diffValue === 0) {
	            dep.diffValue = 1;
	            if (i0 !== i)
	                observing[i0] = dep;
	            i0++;
	        }
	        // Upcast is 'safe' here, because if dep is IObservable, `dependenciesState` will be undefined,
	        // not hitting the condition
	        if (dep.dependenciesState > lowestNewObservingDerivationState) {
	            lowestNewObservingDerivationState = dep.dependenciesState;
	        }
	    }
	    observing.length = i0;
	    derivation.newObserving = null; // newObserving shouldn't be needed outside tracking (statement moved down to work around FF bug, see #614)
	    // Go through all old observables and check diffValue: (it is unique after last bindDependencies)
	    //   0: it's not in new observables, unobserve it
	    //   1: it keeps being observed, don't want to notify it. change to 0
	    l = prevObserving.length;
	    while (l--) {
	        var dep = prevObserving[l];
	        if (dep.diffValue === 0) {
	            removeObserver$$1(dep, derivation);
	        }
	        dep.diffValue = 0;
	    }
	    // Go through all new observables and check diffValue: (now it should be unique)
	    //   0: it was set to 0 in last loop. don't need to do anything.
	    //   1: it wasn't observed, let's observe it. set back to 0
	    while (i0--) {
	        var dep = observing[i0];
	        if (dep.diffValue === 1) {
	            dep.diffValue = 0;
	            addObserver$$1(dep, derivation);
	        }
	    }
	    // Some new observed derivations may become stale during this derivation computation
	    // so they have had no chance to propagate staleness (#916)
	    if (lowestNewObservingDerivationState !== IDerivationState.UP_TO_DATE) {
	        derivation.dependenciesState = lowestNewObservingDerivationState;
	        derivation.onBecomeStale();
	    }
	}
	function clearObserving$$1(derivation) {
	    // invariant(globalState.inBatch > 0, "INTERNAL ERROR clearObserving should be called only inside batch");
	    var obs = derivation.observing;
	    derivation.observing = [];
	    var i = obs.length;
	    while (i--)
	        removeObserver$$1(obs[i], derivation);
	    derivation.dependenciesState = IDerivationState.NOT_TRACKING;
	}
	function untracked$$1(action$$1) {
	    var prev = untrackedStart$$1();
	    try {
	        return action$$1();
	    }
	    finally {
	        untrackedEnd$$1(prev);
	    }
	}
	function untrackedStart$$1() {
	    var prev = globalState$$1.trackingDerivation;
	    globalState$$1.trackingDerivation = null;
	    return prev;
	}
	function untrackedEnd$$1(prev) {
	    globalState$$1.trackingDerivation = prev;
	}
	/**
	 * needed to keep `lowestObserverState` correct. when changing from (2 or 1) to 0
	 *
	 */
	function changeDependenciesStateTo0$$1(derivation) {
	    if (derivation.dependenciesState === IDerivationState.UP_TO_DATE)
	        return;
	    derivation.dependenciesState = IDerivationState.UP_TO_DATE;
	    var obs = derivation.observing;
	    var i = obs.length;
	    while (i--)
	        obs[i].lowestObserverState = IDerivationState.UP_TO_DATE;
	}
	var MobXGlobals$$1 = /** @class */ (function () {
	    function MobXGlobals$$1() {
	        /**
	         * MobXGlobals version.
	         * MobX compatiblity with other versions loaded in memory as long as this version matches.
	         * It indicates that the global state still stores similar information
	         *
	         * N.B: this version is unrelated to the package version of MobX, and is only the version of the
	         * internal state storage of MobX, and can be the same across many different package versions
	         */
	        this.version = 5;
	        /**
	         * Currently running derivation
	         */
	        this.trackingDerivation = null;
	        /**
	         * Are we running a computation currently? (not a reaction)
	         */
	        this.computationDepth = 0;
	        /**
	         * Each time a derivation is tracked, it is assigned a unique run-id
	         */
	        this.runId = 0;
	        /**
	         * 'guid' for general purpose. Will be persisted amongst resets.
	         */
	        this.mobxGuid = 0;
	        /**
	         * Are we in a batch block? (and how many of them)
	         */
	        this.inBatch = 0;
	        /**
	         * Observables that don't have observers anymore, and are about to be
	         * suspended, unless somebody else accesses it in the same batch
	         *
	         * @type {IObservable[]}
	         */
	        this.pendingUnobservations = [];
	        /**
	         * List of scheduled, not yet executed, reactions.
	         */
	        this.pendingReactions = [];
	        /**
	         * Are we currently processing reactions?
	         */
	        this.isRunningReactions = false;
	        /**
	         * Is it allowed to change observables at this point?
	         * In general, MobX doesn't allow that when running computations and React.render.
	         * To ensure that those functions stay pure.
	         */
	        this.allowStateChanges = true;
	        /**
	         * If strict mode is enabled, state changes are by default not allowed
	         */
	        this.enforceActions = false;
	        /**
	         * Spy callbacks
	         */
	        this.spyListeners = [];
	        /**
	         * Globally attached error handlers that react specifically to errors in reactions
	         */
	        this.globalReactionErrorHandlers = [];
	        /**
	         * Warn if computed values are accessed outside a reactive context
	         */
	        this.computedRequiresReaction = false;
	        /*
	         * Don't catch and rethrow exceptions. This is useful for inspecting the state of
	         * the stack when an exception occurs while debugging.
	         */
	        this.disableErrorBoundaries = false;
	    }
	    return MobXGlobals$$1;
	}());
	var canMergeGlobalState = true;
	var isolateCalled = false;
	var globalState$$1 = (function () {
	    var global = getGlobal$$1();
	    if (global.__mobxInstanceCount > 0 && !global.__mobxGlobals)
	        canMergeGlobalState = false;
	    if (global.__mobxGlobals && global.__mobxGlobals.version !== new MobXGlobals$$1().version)
	        canMergeGlobalState = false;
	    if (!canMergeGlobalState) {
	        setTimeout(function () {
	            if (!isolateCalled) {
	                fail$$1("There are multiple, different versions of MobX active. Make sure MobX is loaded only once or use `configure({ isolateGlobalState: true })`");
	            }
	        }, 1);
	        return new MobXGlobals$$1();
	    }
	    else if (global.__mobxGlobals) {
	        global.__mobxInstanceCount += 1;
	        return global.__mobxGlobals;
	    }
	    else {
	        global.__mobxInstanceCount = 1;
	        return (global.__mobxGlobals = new MobXGlobals$$1());
	    }
	})();
	function isolateGlobalState$$1() {
	    if (globalState$$1.pendingReactions.length ||
	        globalState$$1.inBatch ||
	        globalState$$1.isRunningReactions)
	        fail$$1("isolateGlobalState should be called before MobX is running any reactions");
	    isolateCalled = true;
	    if (canMergeGlobalState) {
	        if (--getGlobal$$1().__mobxInstanceCount === 0)
	            getGlobal$$1().__mobxGlobals = undefined;
	        globalState$$1 = new MobXGlobals$$1();
	    }
	}
	function getGlobal$$1() {
	    return typeof window !== "undefined" ? window : global;
	}
	// function invariantObservers(observable: IObservable) {
	//     const list = observable.observers
	//     const map = observable.observersIndexes
	//     const l = list.length
	//     for (let i = 0; i < l; i++) {
	//         const id = list[i].__mapid
	//         if (i) {
	//             invariant(map[id] === i, "INTERNAL ERROR maps derivation.__mapid to index in list") // for performance
	//         } else {
	//             invariant(!(id in map), "INTERNAL ERROR observer on index 0 shouldn't be held in map.") // for performance
	//         }
	//     }
	//     invariant(
	//         list.length === 0 || Object.keys(map).length === list.length - 1,
	//         "INTERNAL ERROR there is no junk in map"
	//     )
	// }
	function addObserver$$1(observable$$1, node) {
	    // invariant(node.dependenciesState !== -1, "INTERNAL ERROR, can add only dependenciesState !== -1");
	    // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR add already added node");
	    // invariantObservers(observable);
	    observable$$1.observers.add(node);
	    if (observable$$1.lowestObserverState > node.dependenciesState)
	        observable$$1.lowestObserverState = node.dependenciesState;
	    // invariantObservers(observable);
	    // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR didn't add node");
	}
	function removeObserver$$1(observable$$1, node) {
	    // invariant(globalState.inBatch > 0, "INTERNAL ERROR, remove should be called only inside batch");
	    // invariant(observable._observers.indexOf(node) !== -1, "INTERNAL ERROR remove already removed node");
	    // invariantObservers(observable);
	    observable$$1.observers.delete(node);
	    if (observable$$1.observers.size === 0) {
	        // deleting last observer
	        queueForUnobservation$$1(observable$$1);
	    }
	    // invariantObservers(observable);
	    // invariant(observable._observers.indexOf(node) === -1, "INTERNAL ERROR remove already removed node2");
	}
	function queueForUnobservation$$1(observable$$1) {
	    if (observable$$1.isPendingUnobservation === false) {
	        // invariant(observable._observers.length === 0, "INTERNAL ERROR, should only queue for unobservation unobserved observables");
	        observable$$1.isPendingUnobservation = true;
	        globalState$$1.pendingUnobservations.push(observable$$1);
	    }
	}
	/**
	 * Batch starts a transaction, at least for purposes of memoizing ComputedValues when nothing else does.
	 * During a batch `onBecomeUnobserved` will be called at most once per observable.
	 * Avoids unnecessary recalculations.
	 */
	function startBatch$$1() {
	    globalState$$1.inBatch++;
	}
	function endBatch$$1() {
	    if (--globalState$$1.inBatch === 0) {
	        runReactions$$1();
	        // the batch is actually about to finish, all unobserving should happen here.
	        var list = globalState$$1.pendingUnobservations;
	        for (var i = 0; i < list.length; i++) {
	            var observable$$1 = list[i];
	            observable$$1.isPendingUnobservation = false;
	            if (observable$$1.observers.size === 0) {
	                if (observable$$1.isBeingObserved) {
	                    // if this observable had reactive observers, trigger the hooks
	                    observable$$1.isBeingObserved = false;
	                    observable$$1.onBecomeUnobserved();
	                }
	                if (observable$$1 instanceof ComputedValue$$1) {
	                    // computed values are automatically teared down when the last observer leaves
	                    // this process happens recursively, this computed might be the last observabe of another, etc..
	                    observable$$1.suspend();
	                }
	            }
	        }
	        globalState$$1.pendingUnobservations = [];
	    }
	}
	function reportObserved$$1(observable$$1) {
	    var derivation = globalState$$1.trackingDerivation;
	    if (derivation !== null) {
	        /**
	         * Simple optimization, give each derivation run an unique id (runId)
	         * Check if last time this observable was accessed the same runId is used
	         * if this is the case, the relation is already known
	         */
	        if (derivation.runId !== observable$$1.lastAccessedBy) {
	            observable$$1.lastAccessedBy = derivation.runId;
	            // Tried storing newObserving, or observing, or both as Set, but performance didn't come close...
	            derivation.newObserving[derivation.unboundDepsCount++] = observable$$1;
	            if (!observable$$1.isBeingObserved) {
	                observable$$1.isBeingObserved = true;
	                observable$$1.onBecomeObserved();
	            }
	        }
	        return true;
	    }
	    else if (observable$$1.observers.size === 0 && globalState$$1.inBatch > 0) {
	        queueForUnobservation$$1(observable$$1);
	    }
	    return false;
	}
	// function invariantLOS(observable: IObservable, msg: string) {
	//     // it's expensive so better not run it in produciton. but temporarily helpful for testing
	//     const min = getObservers(observable).reduce((a, b) => Math.min(a, b.dependenciesState), 2)
	//     if (min >= observable.lowestObserverState) return // <- the only assumption about `lowestObserverState`
	//     throw new Error(
	//         "lowestObserverState is wrong for " +
	//             msg +
	//             " because " +
	//             min +
	//             " < " +
	//             observable.lowestObserverState
	//     )
	// }
	/**
	 * NOTE: current propagation mechanism will in case of self reruning autoruns behave unexpectedly
	 * It will propagate changes to observers from previous run
	 * It's hard or maybe impossible (with reasonable perf) to get it right with current approach
	 * Hopefully self reruning autoruns aren't a feature people should depend on
	 * Also most basic use cases should be ok
	 */
	// Called by Atom when its value changes
	function propagateChanged$$1(observable$$1) {
	    // invariantLOS(observable, "changed start");
	    if (observable$$1.lowestObserverState === IDerivationState.STALE)
	        return;
	    observable$$1.lowestObserverState = IDerivationState.STALE;
	    // Ideally we use for..of here, but the downcompiled version is really slow...
	    observable$$1.observers.forEach(function (d) {
	        if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
	            if (d.isTracing !== TraceMode$$1.NONE) {
	                logTraceInfo(d, observable$$1);
	            }
	            d.onBecomeStale();
	        }
	        d.dependenciesState = IDerivationState.STALE;
	    });
	    // invariantLOS(observable, "changed end");
	}
	// Called by ComputedValue when it recalculate and its value changed
	function propagateChangeConfirmed$$1(observable$$1) {
	    // invariantLOS(observable, "confirmed start");
	    if (observable$$1.lowestObserverState === IDerivationState.STALE)
	        return;
	    observable$$1.lowestObserverState = IDerivationState.STALE;
	    observable$$1.observers.forEach(function (d) {
	        if (d.dependenciesState === IDerivationState.POSSIBLY_STALE)
	            d.dependenciesState = IDerivationState.STALE;
	        else if (d.dependenciesState === IDerivationState.UP_TO_DATE // this happens during computing of `d`, just keep lowestObserverState up to date.
	        )
	            observable$$1.lowestObserverState = IDerivationState.UP_TO_DATE;
	    });
	    // invariantLOS(observable, "confirmed end");
	}
	// Used by computed when its dependency changed, but we don't wan't to immediately recompute.
	function propagateMaybeChanged$$1(observable$$1) {
	    // invariantLOS(observable, "maybe start");
	    if (observable$$1.lowestObserverState !== IDerivationState.UP_TO_DATE)
	        return;
	    observable$$1.lowestObserverState = IDerivationState.POSSIBLY_STALE;
	    observable$$1.observers.forEach(function (d) {
	        if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
	            d.dependenciesState = IDerivationState.POSSIBLY_STALE;
	            if (d.isTracing !== TraceMode$$1.NONE) {
	                logTraceInfo(d, observable$$1);
	            }
	            d.onBecomeStale();
	        }
	    });
	    // invariantLOS(observable, "maybe end");
	}
	function logTraceInfo(derivation, observable$$1) {
	    console.log("[mobx.trace] '" + derivation.name + "' is invalidated due to a change in: '" + observable$$1.name + "'");
	    if (derivation.isTracing === TraceMode$$1.BREAK) {
	        var lines = [];
	        printDepTree(getDependencyTree$$1(derivation), lines, 1);
	        // prettier-ignore
	        new Function("debugger;\n/*\nTracing '" + derivation.name + "'\n\nYou are entering this break point because derivation '" + derivation.name + "' is being traced and '" + observable$$1.name + "' is now forcing it to update.\nJust follow the stacktrace you should now see in the devtools to see precisely what piece of your code is causing this update\nThe stackframe you are looking for is at least ~6-8 stack-frames up.\n\n" + (derivation instanceof ComputedValue$$1 ? derivation.derivation.toString() : "") + "\n\nThe dependencies for this derivation are:\n\n" + lines.join("\n") + "\n*/\n    ")();
	    }
	}
	function printDepTree(tree, lines, depth) {
	    if (lines.length >= 1000) {
	        lines.push("(and many more)");
	        return;
	    }
	    lines.push("" + new Array(depth).join("\t") + tree.name); // MWE: not the fastest, but the easiest way :)
	    if (tree.dependencies)
	        tree.dependencies.forEach(function (child) { return printDepTree(child, lines, depth + 1); });
	}

	var Reaction$$1 = /** @class */ (function () {
	    function Reaction$$1(name, onInvalidate, errorHandler) {
	        if (name === void 0) { name = "Reaction@" + getNextId$$1(); }
	        this.name = name;
	        this.onInvalidate = onInvalidate;
	        this.errorHandler = errorHandler;
	        this.observing = []; // nodes we are looking at. Our value depends on these nodes
	        this.newObserving = [];
	        this.dependenciesState = IDerivationState.NOT_TRACKING;
	        this.diffValue = 0;
	        this.runId = 0;
	        this.unboundDepsCount = 0;
	        this.__mapid = "#" + getNextId$$1();
	        this.isDisposed = false;
	        this._isScheduled = false;
	        this._isTrackPending = false;
	        this._isRunning = false;
	        this.isTracing = TraceMode$$1.NONE;
	    }
	    Reaction$$1.prototype.onBecomeStale = function () {
	        this.schedule();
	    };
	    Reaction$$1.prototype.schedule = function () {
	        if (!this._isScheduled) {
	            this._isScheduled = true;
	            globalState$$1.pendingReactions.push(this);
	            runReactions$$1();
	        }
	    };
	    Reaction$$1.prototype.isScheduled = function () {
	        return this._isScheduled;
	    };
	    /**
	     * internal, use schedule() if you intend to kick off a reaction
	     */
	    Reaction$$1.prototype.runReaction = function () {
	        if (!this.isDisposed) {
	            startBatch$$1();
	            this._isScheduled = false;
	            if (shouldCompute$$1(this)) {
	                this._isTrackPending = true;
	                try {
	                    this.onInvalidate();
	                    if (this._isTrackPending &&
	                        isSpyEnabled$$1() &&
	                        process.env.NODE_ENV !== "production") {
	                        // onInvalidate didn't trigger track right away..
	                        spyReport$$1({
	                            name: this.name,
	                            type: "scheduled-reaction"
	                        });
	                    }
	                }
	                catch (e) {
	                    this.reportExceptionInDerivation(e);
	                }
	            }
	            endBatch$$1();
	        }
	    };
	    Reaction$$1.prototype.track = function (fn) {
	        startBatch$$1();
	        var notify = isSpyEnabled$$1();
	        var startTime;
	        if (notify && process.env.NODE_ENV !== "production") {
	            startTime = Date.now();
	            spyReportStart$$1({
	                name: this.name,
	                type: "reaction"
	            });
	        }
	        this._isRunning = true;
	        var result = trackDerivedFunction$$1(this, fn, undefined);
	        this._isRunning = false;
	        this._isTrackPending = false;
	        if (this.isDisposed) {
	            // disposed during last run. Clean up everything that was bound after the dispose call.
	            clearObserving$$1(this);
	        }
	        if (isCaughtException$$1(result))
	            this.reportExceptionInDerivation(result.cause);
	        if (notify && process.env.NODE_ENV !== "production") {
	            spyReportEnd$$1({
	                time: Date.now() - startTime
	            });
	        }
	        endBatch$$1();
	    };
	    Reaction$$1.prototype.reportExceptionInDerivation = function (error) {
	        var _this = this;
	        if (this.errorHandler) {
	            this.errorHandler(error, this);
	            return;
	        }
	        if (globalState$$1.disableErrorBoundaries)
	            throw error;
	        var message = "[mobx] Encountered an uncaught exception that was thrown by a reaction or observer component, in: '" + this;
	        console.error(message, error);
	        /** If debugging brought you here, please, read the above message :-). Tnx! */
	        if (isSpyEnabled$$1()) {
	            spyReport$$1({
	                type: "error",
	                name: this.name,
	                message: message,
	                error: "" + error
	            });
	        }
	        globalState$$1.globalReactionErrorHandlers.forEach(function (f) { return f(error, _this); });
	    };
	    Reaction$$1.prototype.dispose = function () {
	        if (!this.isDisposed) {
	            this.isDisposed = true;
	            if (!this._isRunning) {
	                // if disposed while running, clean up later. Maybe not optimal, but rare case
	                startBatch$$1();
	                clearObserving$$1(this);
	                endBatch$$1();
	            }
	        }
	    };
	    Reaction$$1.prototype.getDisposer = function () {
	        var r = this.dispose.bind(this);
	        r[$mobx$$1] = this;
	        return r;
	    };
	    Reaction$$1.prototype.toString = function () {
	        return "Reaction[" + this.name + "]";
	    };
	    Reaction$$1.prototype.trace = function (enterBreakPoint) {
	        if (enterBreakPoint === void 0) { enterBreakPoint = false; }
	        trace$$1(this, enterBreakPoint);
	    };
	    return Reaction$$1;
	}());
	/**
	 * Magic number alert!
	 * Defines within how many times a reaction is allowed to re-trigger itself
	 * until it is assumed that this is gonna be a never ending loop...
	 */
	var MAX_REACTION_ITERATIONS = 100;
	var reactionScheduler = function (f) { return f(); };
	function runReactions$$1() {
	    // Trampolining, if runReactions are already running, new reactions will be picked up
	    if (globalState$$1.inBatch > 0 || globalState$$1.isRunningReactions)
	        return;
	    reactionScheduler(runReactionsHelper);
	}
	function runReactionsHelper() {
	    globalState$$1.isRunningReactions = true;
	    var allReactions = globalState$$1.pendingReactions;
	    var iterations = 0;
	    // While running reactions, new reactions might be triggered.
	    // Hence we work with two variables and check whether
	    // we converge to no remaining reactions after a while.
	    while (allReactions.length > 0) {
	        if (++iterations === MAX_REACTION_ITERATIONS) {
	            console.error("Reaction doesn't converge to a stable state after " + MAX_REACTION_ITERATIONS + " iterations." +
	                (" Probably there is a cycle in the reactive function: " + allReactions[0]));
	            allReactions.splice(0); // clear reactions
	        }
	        var remainingReactions = allReactions.splice(0);
	        for (var i = 0, l = remainingReactions.length; i < l; i++)
	            remainingReactions[i].runReaction();
	    }
	    globalState$$1.isRunningReactions = false;
	}
	var isReaction$$1 = createInstanceofPredicate$$1("Reaction", Reaction$$1);
	function setReactionScheduler$$1(fn) {
	    var baseScheduler = reactionScheduler;
	    reactionScheduler = function (f) { return fn(function () { return baseScheduler(f); }); };
	}

	function isSpyEnabled$$1() {
	    return process.env.NODE_ENV !== "production" && !!globalState$$1.spyListeners.length;
	}
	function spyReport$$1(event) {
	    if (process.env.NODE_ENV === "production")
	        return; // dead code elimination can do the rest
	    if (!globalState$$1.spyListeners.length)
	        return;
	    var listeners = globalState$$1.spyListeners;
	    for (var i = 0, l = listeners.length; i < l; i++)
	        listeners[i](event);
	}
	function spyReportStart$$1(event) {
	    if (process.env.NODE_ENV === "production")
	        return;
	    var change = __assign({}, event, { spyReportStart: true });
	    spyReport$$1(change);
	}
	var END_EVENT = { spyReportEnd: true };
	function spyReportEnd$$1(change) {
	    if (process.env.NODE_ENV === "production")
	        return;
	    if (change)
	        spyReport$$1(__assign({}, change, { spyReportEnd: true }));
	    else
	        spyReport$$1(END_EVENT);
	}
	function spy$$1(listener) {
	    if (process.env.NODE_ENV === "production") {
	        console.warn("[mobx.spy] Is a no-op in production builds");
	        return function () { };
	    }
	    else {
	        globalState$$1.spyListeners.push(listener);
	        return once$$1(function () {
	            globalState$$1.spyListeners = globalState$$1.spyListeners.filter(function (l) { return l !== listener; });
	        });
	    }
	}

	function dontReassignFields() {
	    fail$$1(process.env.NODE_ENV !== "production" && "@action fields are not reassignable");
	}
	function namedActionDecorator$$1(name) {
	    return function (target, prop, descriptor) {
	        if (descriptor) {
	            if (process.env.NODE_ENV !== "production" && descriptor.get !== undefined) {
	                return fail$$1("@action cannot be used with getters");
	            }
	            // babel / typescript
	            // @action method() { }
	            if (descriptor.value) {
	                // typescript
	                return {
	                    value: createAction$$1(name, descriptor.value),
	                    enumerable: false,
	                    configurable: true,
	                    writable: true // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
	                };
	            }
	            // babel only: @action method = () => {}
	            var initializer_1 = descriptor.initializer;
	            return {
	                enumerable: false,
	                configurable: true,
	                writable: true,
	                initializer: function () {
	                    // N.B: we can't immediately invoke initializer; this would be wrong
	                    return createAction$$1(name, initializer_1.call(this));
	                }
	            };
	        }
	        // bound instance methods
	        return actionFieldDecorator$$1(name).apply(this, arguments);
	    };
	}
	function actionFieldDecorator$$1(name) {
	    // Simple property that writes on first invocation to the current instance
	    return function (target, prop, descriptor) {
	        Object.defineProperty(target, prop, {
	            configurable: true,
	            enumerable: false,
	            get: function () {
	                return undefined;
	            },
	            set: function (value) {
	                addHiddenProp$$1(this, prop, action$$1(name, value));
	            }
	        });
	    };
	}
	function boundActionDecorator$$1(target, propertyName, descriptor, applyToInstance) {
	    if (applyToInstance === true) {
	        defineBoundAction$$1(target, propertyName, descriptor.value);
	        return null;
	    }
	    if (descriptor) {
	        // if (descriptor.value)
	        // Typescript / Babel: @action.bound method() { }
	        // also: babel @action.bound method = () => {}
	        return {
	            configurable: true,
	            enumerable: false,
	            get: function () {
	                defineBoundAction$$1(this, propertyName, descriptor.value || descriptor.initializer.call(this));
	                return this[propertyName];
	            },
	            set: dontReassignFields
	        };
	    }
	    // field decorator Typescript @action.bound method = () => {}
	    return {
	        enumerable: false,
	        configurable: true,
	        set: function (v) {
	            defineBoundAction$$1(this, propertyName, v);
	        },
	        get: function () {
	            return undefined;
	        }
	    };
	}

	var action$$1 = function action$$1(arg1, arg2, arg3, arg4) {
	    // action(fn() {})
	    if (arguments.length === 1 && typeof arg1 === "function")
	        return createAction$$1(arg1.name || "<unnamed action>", arg1);
	    // action("name", fn() {})
	    if (arguments.length === 2 && typeof arg2 === "function")
	        return createAction$$1(arg1, arg2);
	    // @action("name") fn() {}
	    if (arguments.length === 1 && typeof arg1 === "string")
	        return namedActionDecorator$$1(arg1);
	    // @action fn() {}
	    if (arg4 === true) {
	        // apply to instance immediately
	        addHiddenProp$$1(arg1, arg2, createAction$$1(arg1.name || arg2, arg3.value));
	    }
	    else {
	        return namedActionDecorator$$1(arg2).apply(null, arguments);
	    }
	};
	action$$1.bound = boundActionDecorator$$1;
	function runInAction$$1(arg1, arg2) {
	    var actionName = typeof arg1 === "string" ? arg1 : arg1.name || "<unnamed action>";
	    var fn = typeof arg1 === "function" ? arg1 : arg2;
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(typeof fn === "function" && fn.length === 0, "`runInAction` expects a function without arguments");
	        if (typeof actionName !== "string" || !actionName)
	            fail$$1("actions should have valid names, got: '" + actionName + "'");
	    }
	    return executeAction$$1(actionName, fn, this, undefined);
	}
	function isAction$$1(thing) {
	    return typeof thing === "function" && thing.isMobxAction === true;
	}
	function defineBoundAction$$1(target, propertyName, fn) {
	    addHiddenProp$$1(target, propertyName, createAction$$1(propertyName, fn.bind(target)));
	}

	/**
	 * Creates a named reactive view and keeps it alive, so that the view is always
	 * updated if one of the dependencies changes, even when the view is not further used by something else.
	 * @param view The reactive view
	 * @returns disposer function, which can be used to stop the view from being updated in the future.
	 */
	function autorun$$1(view, opts) {
	    if (opts === void 0) { opts = EMPTY_OBJECT$$1; }
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(typeof view === "function", "Autorun expects a function as first argument");
	        invariant$$1(isAction$$1(view) === false, "Autorun does not accept actions since actions are untrackable");
	    }
	    var name = (opts && opts.name) || view.name || "Autorun@" + getNextId$$1();
	    var runSync = !opts.scheduler && !opts.delay;
	    var reaction$$1;
	    if (runSync) {
	        // normal autorun
	        reaction$$1 = new Reaction$$1(name, function () {
	            this.track(reactionRunner);
	        }, opts.onError);
	    }
	    else {
	        var scheduler_1 = createSchedulerFromOptions(opts);
	        // debounced autorun
	        var isScheduled_1 = false;
	        reaction$$1 = new Reaction$$1(name, function () {
	            if (!isScheduled_1) {
	                isScheduled_1 = true;
	                scheduler_1(function () {
	                    isScheduled_1 = false;
	                    if (!reaction$$1.isDisposed)
	                        reaction$$1.track(reactionRunner);
	                });
	            }
	        }, opts.onError);
	    }
	    function reactionRunner() {
	        view(reaction$$1);
	    }
	    reaction$$1.schedule();
	    return reaction$$1.getDisposer();
	}
	var run = function (f) { return f(); };
	function createSchedulerFromOptions(opts) {
	    return opts.scheduler
	        ? opts.scheduler
	        : opts.delay
	            ? function (f) { return setTimeout(f, opts.delay); }
	            : run;
	}
	function reaction$$1(expression, effect, opts) {
	    if (opts === void 0) { opts = EMPTY_OBJECT$$1; }
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(typeof expression === "function", "First argument to reaction should be a function");
	        invariant$$1(typeof opts === "object", "Third argument of reactions should be an object");
	    }
	    var name = opts.name || "Reaction@" + getNextId$$1();
	    var effectAction = action$$1(name, opts.onError ? wrapErrorHandler(opts.onError, effect) : effect);
	    var runSync = !opts.scheduler && !opts.delay;
	    var scheduler = createSchedulerFromOptions(opts);
	    var firstTime = true;
	    var isScheduled = false;
	    var value;
	    var equals = opts.compareStructural
	        ? comparer$$1.structural
	        : opts.equals || comparer$$1.default;
	    var r = new Reaction$$1(name, function () {
	        if (firstTime || runSync) {
	            reactionRunner();
	        }
	        else if (!isScheduled) {
	            isScheduled = true;
	            scheduler(reactionRunner);
	        }
	    }, opts.onError);
	    function reactionRunner() {
	        isScheduled = false; // Q: move into reaction runner?
	        if (r.isDisposed)
	            return;
	        var changed = false;
	        r.track(function () {
	            var nextValue = expression(r);
	            changed = firstTime || !equals(value, nextValue);
	            value = nextValue;
	        });
	        if (firstTime && opts.fireImmediately)
	            effectAction(value, r);
	        if (!firstTime && changed === true)
	            effectAction(value, r);
	        if (firstTime)
	            firstTime = false;
	    }
	    r.schedule();
	    return r.getDisposer();
	}
	function wrapErrorHandler(errorHandler, baseFn) {
	    return function () {
	        try {
	            return baseFn.apply(this, arguments);
	        }
	        catch (e) {
	            errorHandler.call(this, e);
	        }
	    };
	}

	function onBecomeObserved$$1(thing, arg2, arg3) {
	    return interceptHook("onBecomeObserved", thing, arg2, arg3);
	}
	function onBecomeUnobserved$$1(thing, arg2, arg3) {
	    return interceptHook("onBecomeUnobserved", thing, arg2, arg3);
	}
	function interceptHook(hook, thing, arg2, arg3) {
	    var atom = typeof arg2 === "string" ? getAtom$$1(thing, arg2) : getAtom$$1(thing);
	    var cb = typeof arg2 === "string" ? arg3 : arg2;
	    var orig = atom[hook];
	    if (typeof orig !== "function")
	        return fail$$1(process.env.NODE_ENV !== "production" && "Not an atom that can be (un)observed");
	    atom[hook] = function () {
	        orig.call(this);
	        cb.call(this);
	    };
	    return function () {
	        atom[hook] = orig;
	    };
	}

	function configure$$1(options) {
	    var enforceActions = options.enforceActions, computedRequiresReaction = options.computedRequiresReaction, disableErrorBoundaries = options.disableErrorBoundaries, reactionScheduler = options.reactionScheduler;
	    if (enforceActions !== undefined) {
	        if (typeof enforceActions === "boolean" || enforceActions === "strict")
	            deprecated$$1("Deprecated value for 'enforceActions', use 'false' => '\"never\"', 'true' => '\"observed\"', '\"strict\"' => \"'always'\" instead");
	        var ea = void 0;
	        switch (enforceActions) {
	            case true:
	            case "observed":
	                ea = true;
	                break;
	            case false:
	            case "never":
	                ea = false;
	                break;
	            case "strict":
	            case "always":
	                ea = "strict";
	                break;
	            default:
	                fail$$1("Invalid value for 'enforceActions': '" + enforceActions + "', expected 'never', 'always' or 'observed'");
	        }
	        globalState$$1.enforceActions = ea;
	        globalState$$1.allowStateChanges = ea === true || ea === "strict" ? false : true;
	    }
	    if (computedRequiresReaction !== undefined) {
	        globalState$$1.computedRequiresReaction = !!computedRequiresReaction;
	    }
	    if (options.isolateGlobalState === true) {
	        isolateGlobalState$$1();
	    }
	    if (disableErrorBoundaries !== undefined) {
	        if (disableErrorBoundaries === true)
	            console.warn("WARNING: Debug feature only. MobX will NOT recover from errors when `disableErrorBoundaries` is enabled.");
	        globalState$$1.disableErrorBoundaries = !!disableErrorBoundaries;
	    }
	    if (reactionScheduler) {
	        setReactionScheduler$$1(reactionScheduler);
	    }
	}

	function extendObservable$$1(target, properties, decorators, options) {
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(arguments.length >= 2 && arguments.length <= 4, "'extendObservable' expected 2-4 arguments");
	        invariant$$1(typeof target === "object", "'extendObservable' expects an object as first argument");
	        invariant$$1(!isObservableMap$$1(target), "'extendObservable' should not be used on maps, use map.merge instead");
	    }
	    options = asCreateObservableOptions$$1(options);
	    var defaultDecorator = getDefaultDecoratorFromObjectOptions$$1(options);
	    asObservableObject$$1(target, options.name, defaultDecorator.enhancer); // make sure object is observable, even without initial props
	    if (properties)
	        extendObservableObjectWithProperties$$1(target, properties, decorators, defaultDecorator);
	    return target;
	}
	function getDefaultDecoratorFromObjectOptions$$1(options) {
	    return options.defaultDecorator || (options.deep === false ? refDecorator$$1 : deepDecorator$$1);
	}
	function extendObservableObjectWithProperties$$1(target, properties, decorators, defaultDecorator) {
	    if (process.env.NODE_ENV !== "production") {
	        invariant$$1(!isObservable$$1(properties), "Extending an object with another observable (object) is not supported. Please construct an explicit propertymap, using `toJS` if need. See issue #540");
	        if (decorators)
	            for (var key in decorators)
	                if (!(key in properties))
	                    fail$$1("Trying to declare a decorator for unspecified property '" + key + "'");
	    }
	    startBatch$$1();
	    try {
	        for (var key in properties) {
	            var descriptor = Object.getOwnPropertyDescriptor(properties, key);
	            if (process.env.NODE_ENV !== "production") {
	                if (Object.getOwnPropertyDescriptor(target, key))
	                    fail$$1("'extendObservable' can only be used to introduce new properties. Use 'set' or 'decorate' instead. The property '" + key + "' already exists on '" + target + "'");
	                if (isComputed$$1(descriptor.value))
	                    fail$$1("Passing a 'computed' as initial property value is no longer supported by extendObservable. Use a getter or decorator instead");
	            }
	            var decorator = decorators && key in decorators
	                ? decorators[key]
	                : descriptor.get
	                    ? computedDecorator$$1
	                    : defaultDecorator;
	            if (process.env.NODE_ENV !== "production" && typeof decorator !== "function")
	                fail$$1("Not a valid decorator for '" + key + "', got: " + decorator);
	            var resultDescriptor = decorator(target, key, descriptor, true);
	            if (resultDescriptor // otherwise, assume already applied, due to `applyToInstance`
	            )
	                Object.defineProperty(target, key, resultDescriptor);
	        }
	    }
	    finally {
	        endBatch$$1();
	    }
	}

	function getDependencyTree$$1(thing, property) {
	    return nodeToDependencyTree(getAtom$$1(thing, property));
	}
	function nodeToDependencyTree(node) {
	    var result = {
	        name: node.name
	    };
	    if (node.observing && node.observing.length > 0)
	        result.dependencies = unique$$1(node.observing).map(nodeToDependencyTree);
	    return result;
	}

	function _isComputed$$1(value, property) {
	    if (value === null || value === undefined)
	        return false;
	    if (property !== undefined) {
	        if (isObservableObject$$1(value) === false)
	            return false;
	        if (!value[$mobx$$1].values.has(property))
	            return false;
	        var atom = getAtom$$1(value, property);
	        return isComputedValue$$1(atom);
	    }
	    return isComputedValue$$1(value);
	}
	function isComputed$$1(value) {
	    if (arguments.length > 1)
	        return fail$$1(process.env.NODE_ENV !== "production" &&
	            "isComputed expects only 1 argument. Use isObservableProp to inspect the observability of a property");
	    return _isComputed$$1(value);
	}

	function _isObservable(value, property) {
	    if (value === null || value === undefined)
	        return false;
	    if (property !== undefined) {
	        if (process.env.NODE_ENV !== "production" &&
	            (isObservableMap$$1(value) || isObservableArray$$1(value)))
	            return fail$$1("isObservable(object, propertyName) is not supported for arrays and maps. Use map.has or array.length instead.");
	        if (isObservableObject$$1(value)) {
	            return value[$mobx$$1].values.has(property);
	        }
	        return false;
	    }
	    // For first check, see #701
	    return (isObservableObject$$1(value) ||
	        !!value[$mobx$$1] ||
	        isAtom$$1(value) ||
	        isReaction$$1(value) ||
	        isComputedValue$$1(value));
	}
	function isObservable$$1(value) {
	    if (arguments.length !== 1)
	        fail$$1(process.env.NODE_ENV !== "production" &&
	            "isObservable expects only 1 argument. Use isObservableProp to inspect the observability of a property");
	    return _isObservable(value);
	}
	function set$$1(obj, key, value) {
	    if (arguments.length === 2) {
	        startBatch$$1();
	        var values_1 = key;
	        try {
	            for (var key_1 in values_1)
	                set$$1(obj, key_1, values_1[key_1]);
	        }
	        finally {
	            endBatch$$1();
	        }
	        return;
	    }
	    if (isObservableObject$$1(obj)) {
	        var adm = obj[$mobx$$1];
	        var existingObservable = adm.values.get(key);
	        if (existingObservable) {
	            adm.write(key, value);
	        }
	        else {
	            adm.addObservableProp(key, value, adm.defaultEnhancer);
	        }
	    }
	    else if (isObservableMap$$1(obj)) {
	        obj.set(key, value);
	    }
	    else if (isObservableArray$$1(obj)) {
	        if (typeof key !== "number")
	            key = parseInt(key, 10);
	        invariant$$1(key >= 0, "Not a valid index: '" + key + "'");
	        startBatch$$1();
	        if (key >= obj.length)
	            obj.length = key + 1;
	        obj[key] = value;
	        endBatch$$1();
	    }
	    else {
	        return fail$$1(process.env.NODE_ENV !== "production" &&
	            "'set()' can only be used on observable objects, arrays and maps");
	    }
	}

	function trace$$1() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i] = arguments[_i];
	    }
	    var enterBreakPoint = false;
	    if (typeof args[args.length - 1] === "boolean")
	        enterBreakPoint = args.pop();
	    var derivation = getAtomFromArgs(args);
	    if (!derivation) {
	        return fail$$1(process.env.NODE_ENV !== "production" &&
	            "'trace(break?)' can only be used inside a tracked computed value or a Reaction. Consider passing in the computed value or reaction explicitly");
	    }
	    if (derivation.isTracing === TraceMode$$1.NONE) {
	        console.log("[mobx.trace] '" + derivation.name + "' tracing enabled");
	    }
	    derivation.isTracing = enterBreakPoint ? TraceMode$$1.BREAK : TraceMode$$1.LOG;
	}
	function getAtomFromArgs(args) {
	    switch (args.length) {
	        case 0:
	            return globalState$$1.trackingDerivation;
	        case 1:
	            return getAtom$$1(args[0]);
	        case 2:
	            return getAtom$$1(args[0], args[1]);
	    }
	}

	/**
	 * During a transaction no views are updated until the end of the transaction.
	 * The transaction will be run synchronously nonetheless.
	 *
	 * @param action a function that updates some reactive state
	 * @returns any value that was returned by the 'action' parameter.
	 */
	function transaction$$1(action$$1, thisArg) {
	    if (thisArg === void 0) { thisArg = undefined; }
	    startBatch$$1();
	    try {
	        return action$$1.apply(thisArg);
	    }
	    finally {
	        endBatch$$1();
	    }
	}

	function getAdm(target) {
	    return target[$mobx$$1];
	}
	// Optimization: we don't need the intermediate objects and could have a completely custom administration for DynamicObjects,
	// and skip either the internal values map, or the base object with its property descriptors!
	var objectProxyTraps = {
	    has: function (target, name) {
	        if (name === $mobx$$1 || name === "constructor" || name === mobxDidRunLazyInitializersSymbol$$1)
	            return true;
	        var adm = getAdm(target);
	        if (adm.values.get(name))
	            return true;
	        if (typeof name === "string")
	            return adm.has(name);
	        return name in target;
	    },
	    get: function (target, name) {
	        if (name === $mobx$$1 || name === "constructor" || name === mobxDidRunLazyInitializersSymbol$$1)
	            return target[name];
	        var adm = getAdm(target);
	        var observable$$1 = adm.values.get(name);
	        if (observable$$1 instanceof Atom$$1)
	            return observable$$1.get();
	        // make sure we start listening to future keys
	        // note that we only do this here for optimization
	        if (typeof name === "string")
	            adm.has(name);
	        return target[name];
	    },
	    set: function (target, name, value) {
	        if (typeof name !== "string")
	            return false;
	        set$$1(target, name, value);
	        return true;
	    },
	    deleteProperty: function (target, name) {
	        if (typeof name !== "string")
	            return false;
	        var adm = getAdm(target);
	        adm.remove(name);
	        return true;
	    },
	    ownKeys: function (target) {
	        var adm = getAdm(target);
	        adm.keysAtom.reportObserved();
	        return Reflect.ownKeys(target);
	    },
	    preventExtensions: function (target) {
	        fail$$1("Dynamic observable objects cannot be frozen");
	        return false;
	    }
	};
	function createDynamicObservableObject$$1(base) {
	    var proxy = new Proxy(base, objectProxyTraps);
	    base[$mobx$$1].proxy = proxy;
	    return proxy;
	}

	function hasInterceptors$$1(interceptable) {
	    return interceptable.interceptors !== undefined && interceptable.interceptors.length > 0;
	}
	function registerInterceptor$$1(interceptable, handler) {
	    var interceptors = interceptable.interceptors || (interceptable.interceptors = []);
	    interceptors.push(handler);
	    return once$$1(function () {
	        var idx = interceptors.indexOf(handler);
	        if (idx !== -1)
	            interceptors.splice(idx, 1);
	    });
	}
	function interceptChange$$1(interceptable, change) {
	    var prevU = untrackedStart$$1();
	    try {
	        var interceptors = interceptable.interceptors;
	        if (interceptors)
	            for (var i = 0, l = interceptors.length; i < l; i++) {
	                change = interceptors[i](change);
	                invariant$$1(!change || change.type, "Intercept handlers should return nothing or a change object");
	                if (!change)
	                    break;
	            }
	        return change;
	    }
	    finally {
	        untrackedEnd$$1(prevU);
	    }
	}

	function hasListeners$$1(listenable) {
	    return listenable.changeListeners !== undefined && listenable.changeListeners.length > 0;
	}
	function registerListener$$1(listenable, handler) {
	    var listeners = listenable.changeListeners || (listenable.changeListeners = []);
	    listeners.push(handler);
	    return once$$1(function () {
	        var idx = listeners.indexOf(handler);
	        if (idx !== -1)
	            listeners.splice(idx, 1);
	    });
	}
	function notifyListeners$$1(listenable, change) {
	    var prevU = untrackedStart$$1();
	    var listeners = listenable.changeListeners;
	    if (!listeners)
	        return;
	    listeners = listeners.slice();
	    for (var i = 0, l = listeners.length; i < l; i++) {
	        listeners[i](change);
	    }
	    untrackedEnd$$1(prevU);
	}

	var MAX_SPLICE_SIZE = 10000; // See e.g. https://github.com/mobxjs/mobx/issues/859
	var arrayTraps = {
	    get: function (target, name) {
	        if (name === $mobx$$1)
	            return target[$mobx$$1];
	        if (name === "length")
	            return target[$mobx$$1].getArrayLength();
	        if (typeof name === "number") {
	            return arrayExtensions.get.call(target, name);
	        }
	        if (typeof name === "string" && !isNaN(name)) {
	            return arrayExtensions.get.call(target, parseInt(name));
	        }
	        if (arrayExtensions.hasOwnProperty(name)) {
	            return arrayExtensions[name];
	        }
	        return target[name];
	    },
	    set: function (target, name, value) {
	        if (name === "length") {
	            target[$mobx$$1].setArrayLength(value);
	            return true;
	        }
	        if (typeof name === "number") {
	            arrayExtensions.set.call(target, name, value);
	            return true;
	        }
	        if (!isNaN(name)) {
	            arrayExtensions.set.call(target, parseInt(name), value);
	            return true;
	        }
	        return false;
	    },
	    preventExtensions: function (target) {
	        fail$$1("Observable arrays cannot be frozen");
	        return false;
	    }
	};
	function createObservableArray$$1(initialValues, enhancer, name, owned) {
	    if (name === void 0) { name = "ObservableArray@" + getNextId$$1(); }
	    if (owned === void 0) { owned = false; }
	    var adm = new ObservableArrayAdministration(name, enhancer, owned);
	    addHiddenFinalProp$$1(adm.values, $mobx$$1, adm);
	    var proxy = new Proxy(adm.values, arrayTraps);
	    adm.proxy = proxy;
	    if (initialValues && initialValues.length) {
	        var prev = allowStateChangesStart$$1(true);
	        adm.spliceWithArray(0, 0, initialValues);
	        allowStateChangesEnd$$1(prev);
	    }
	    return proxy;
	}
	var ObservableArrayAdministration = /** @class */ (function () {
	    function ObservableArrayAdministration(name, enhancer, owned) {
	        this.owned = owned;
	        this.values = [];
	        this.proxy = undefined;
	        this.lastKnownLength = 0;
	        this.atom = new Atom$$1(name || "ObservableArray@" + getNextId$$1());
	        this.enhancer = function (newV, oldV) { return enhancer(newV, oldV, name + "[..]"); };
	    }
	    ObservableArrayAdministration.prototype.dehanceValue = function (value) {
	        if (this.dehancer !== undefined)
	            return this.dehancer(value);
	        return value;
	    };
	    ObservableArrayAdministration.prototype.dehanceValues = function (values$$1) {
	        if (this.dehancer !== undefined && this.values.length > 0)
	            return values$$1.map(this.dehancer);
	        return values$$1;
	    };
	    ObservableArrayAdministration.prototype.intercept = function (handler) {
	        return registerInterceptor$$1(this, handler);
	    };
	    ObservableArrayAdministration.prototype.observe = function (listener, fireImmediately) {
	        if (fireImmediately === void 0) { fireImmediately = false; }
	        if (fireImmediately) {
	            listener({
	                object: this.proxy,
	                type: "splice",
	                index: 0,
	                added: this.values.slice(),
	                addedCount: this.values.length,
	                removed: [],
	                removedCount: 0
	            });
	        }
	        return registerListener$$1(this, listener);
	    };
	    ObservableArrayAdministration.prototype.getArrayLength = function () {
	        this.atom.reportObserved();
	        return this.values.length;
	    };
	    ObservableArrayAdministration.prototype.setArrayLength = function (newLength) {
	        if (typeof newLength !== "number" || newLength < 0)
	            throw new Error("[mobx.array] Out of range: " + newLength);
	        var currentLength = this.values.length;
	        if (newLength === currentLength)
	            return;
	        else if (newLength > currentLength) {
	            var newItems = new Array(newLength - currentLength);
	            for (var i = 0; i < newLength - currentLength; i++)
	                newItems[i] = undefined; // No Array.fill everywhere...
	            this.spliceWithArray(currentLength, 0, newItems);
	        }
	        else
	            this.spliceWithArray(newLength, currentLength - newLength);
	    };
	    ObservableArrayAdministration.prototype.updateArrayLength = function (oldLength, delta) {
	        if (oldLength !== this.lastKnownLength)
	            throw new Error("[mobx] Modification exception: the internal structure of an observable array was changed.");
	        this.lastKnownLength += delta;
	    };
	    ObservableArrayAdministration.prototype.spliceWithArray = function (index, deleteCount, newItems) {
	        var _this = this;
	        checkIfStateModificationsAreAllowed$$1(this.atom);
	        var length = this.values.length;
	        if (index === undefined)
	            index = 0;
	        else if (index > length)
	            index = length;
	        else if (index < 0)
	            index = Math.max(0, length + index);
	        if (arguments.length === 1)
	            deleteCount = length - index;
	        else if (deleteCount === undefined || deleteCount === null)
	            deleteCount = 0;
	        else
	            deleteCount = Math.max(0, Math.min(deleteCount, length - index));
	        if (newItems === undefined)
	            newItems = EMPTY_ARRAY$$1;
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                object: this.proxy,
	                type: "splice",
	                index: index,
	                removedCount: deleteCount,
	                added: newItems
	            });
	            if (!change)
	                return EMPTY_ARRAY$$1;
	            deleteCount = change.removedCount;
	            newItems = change.added;
	        }
	        newItems = newItems.length === 0 ? newItems : newItems.map(function (v) { return _this.enhancer(v, undefined); });
	        if (process.env.NODE_ENV !== "production") {
	            var lengthDelta = newItems.length - deleteCount;
	            this.updateArrayLength(length, lengthDelta); // checks if internal array wasn't modified
	        }
	        var res = this.spliceItemsIntoValues(index, deleteCount, newItems);
	        if (deleteCount !== 0 || newItems.length !== 0)
	            this.notifyArraySplice(index, newItems, res);
	        return this.dehanceValues(res);
	    };
	    ObservableArrayAdministration.prototype.spliceItemsIntoValues = function (index, deleteCount, newItems) {
	        var _a;
	        if (newItems.length < MAX_SPLICE_SIZE) {
	            return (_a = this.values).splice.apply(_a, __spread([index, deleteCount], newItems));
	        }
	        else {
	            var res = this.values.slice(index, index + deleteCount);
	            this.values = this.values
	                .slice(0, index)
	                .concat(newItems, this.values.slice(index + deleteCount));
	            return res;
	        }
	    };
	    ObservableArrayAdministration.prototype.notifyArrayChildUpdate = function (index, newValue, oldValue) {
	        var notifySpy = !this.owned && isSpyEnabled$$1();
	        var notify = hasListeners$$1(this);
	        var change = notify || notifySpy
	            ? {
	                object: this.proxy,
	                type: "update",
	                index: index,
	                newValue: newValue,
	                oldValue: oldValue
	            }
	            : null;
	        // The reason why this is on right hand side here (and not above), is this way the uglifier will drop it, but it won't
	        // cause any runtime overhead in development mode without NODE_ENV set, unless spying is enabled
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportStart$$1(__assign({}, change, { name: this.atom.name }));
	        this.atom.reportChanged();
	        if (notify)
	            notifyListeners$$1(this, change);
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportEnd$$1();
	    };
	    ObservableArrayAdministration.prototype.notifyArraySplice = function (index, added, removed) {
	        var notifySpy = !this.owned && isSpyEnabled$$1();
	        var notify = hasListeners$$1(this);
	        var change = notify || notifySpy
	            ? {
	                object: this.proxy,
	                type: "splice",
	                index: index,
	                removed: removed,
	                added: added,
	                removedCount: removed.length,
	                addedCount: added.length
	            }
	            : null;
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportStart$$1(__assign({}, change, { name: this.atom.name }));
	        this.atom.reportChanged();
	        // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
	        if (notify)
	            notifyListeners$$1(this, change);
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportEnd$$1();
	    };
	    return ObservableArrayAdministration;
	}());
	var arrayExtensions = {
	    intercept: function (handler) {
	        return this[$mobx$$1].intercept(handler);
	    },
	    observe: function (listener, fireImmediately) {
	        if (fireImmediately === void 0) { fireImmediately = false; }
	        var adm = this[$mobx$$1];
	        return adm.observe(listener, fireImmediately);
	    },
	    clear: function () {
	        return this.splice(0);
	    },
	    replace: function (newItems) {
	        var adm = this[$mobx$$1];
	        return adm.spliceWithArray(0, adm.values.length, newItems);
	    },
	    /**
	     * Converts this array back to a (shallow) javascript structure.
	     * For a deep clone use mobx.toJS
	     */
	    toJS: function () {
	        return this.slice();
	    },
	    toJSON: function () {
	        // Used by JSON.stringify
	        return this.toJS();
	    },
	    /*
	     * functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
	     * since these functions alter the inner structure of the array, the have side effects.
	     * Because the have side effects, they should not be used in computed function,
	     * and for that reason the do not call dependencyState.notifyObserved
	     */
	    splice: function (index, deleteCount) {
	        var newItems = [];
	        for (var _i = 2; _i < arguments.length; _i++) {
	            newItems[_i - 2] = arguments[_i];
	        }
	        var adm = this[$mobx$$1];
	        switch (arguments.length) {
	            case 0:
	                return [];
	            case 1:
	                return adm.spliceWithArray(index);
	            case 2:
	                return adm.spliceWithArray(index, deleteCount);
	        }
	        return adm.spliceWithArray(index, deleteCount, newItems);
	    },
	    spliceWithArray: function (index, deleteCount, newItems) {
	        var adm = this[$mobx$$1];
	        return adm.spliceWithArray(index, deleteCount, newItems);
	    },
	    push: function () {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i] = arguments[_i];
	        }
	        var adm = this[$mobx$$1];
	        adm.spliceWithArray(adm.values.length, 0, items);
	        return adm.values.length;
	    },
	    pop: function () {
	        return this.splice(Math.max(this[$mobx$$1].values.length - 1, 0), 1)[0];
	    },
	    shift: function () {
	        return this.splice(0, 1)[0];
	    },
	    unshift: function () {
	        var items = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            items[_i] = arguments[_i];
	        }
	        var adm = this[$mobx$$1];
	        adm.spliceWithArray(0, 0, items);
	        return adm.values.length;
	    },
	    reverse: function () {
	        // reverse by default mutates in place before returning the result
	        // which makes it both a 'derivation' and a 'mutation'.
	        // so we deviate from the default and just make it an dervitation
	        if (process.env.NODE_ENV !== "production") {
	            console.warn("[mobx] `observableArray.reverse()` will not update the array in place. Use `observableArray.slice().reverse()` to supress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().reverse())` to reverse & update in place");
	        }
	        var clone = this.slice();
	        return clone.reverse.apply(clone, arguments);
	    },
	    sort: function (compareFn) {
	        // sort by default mutates in place before returning the result
	        // which goes against all good practices. Let's not change the array in place!
	        if (process.env.NODE_ENV !== "production") {
	            console.warn("[mobx] `observableArray.sort()` will not update the array in place. Use `observableArray.slice().sort()` to supress this warning and perform the operation on a copy, or `observableArray.replace(observableArray.slice().sort())` to sort & update in place");
	        }
	        var clone = this.slice();
	        return clone.sort.apply(clone, arguments);
	    },
	    remove: function (value) {
	        var adm = this[$mobx$$1];
	        var idx = adm.dehanceValues(adm.values).indexOf(value);
	        if (idx > -1) {
	            this.splice(idx, 1);
	            return true;
	        }
	        return false;
	    },
	    get: function (index) {
	        var adm = this[$mobx$$1];
	        if (adm) {
	            if (index < adm.values.length) {
	                adm.atom.reportObserved();
	                return adm.dehanceValue(adm.values[index]);
	            }
	            console.warn("[mobx.array] Attempt to read an array index (" + index + ") that is out of bounds (" + adm.values.length + "). Please check length first. Out of bound indices will not be tracked by MobX");
	        }
	        return undefined;
	    },
	    set: function (index, newValue) {
	        var adm = this[$mobx$$1];
	        var values$$1 = adm.values;
	        if (index < values$$1.length) {
	            // update at index in range
	            checkIfStateModificationsAreAllowed$$1(adm.atom);
	            var oldValue = values$$1[index];
	            if (hasInterceptors$$1(adm)) {
	                var change = interceptChange$$1(adm, {
	                    type: "update",
	                    object: this,
	                    index: index,
	                    newValue: newValue
	                });
	                if (!change)
	                    return;
	                newValue = change.newValue;
	            }
	            newValue = adm.enhancer(newValue, oldValue);
	            var changed = newValue !== oldValue;
	            if (changed) {
	                values$$1[index] = newValue;
	                adm.notifyArrayChildUpdate(index, newValue, oldValue);
	            }
	        }
	        else if (index === values$$1.length) {
	            // add a new item
	            adm.spliceWithArray(index, 0, [newValue]);
	        }
	        else {
	            // out of bounds
	            throw new Error("[mobx.array] Index out of bounds, " + index + " is larger than " + values$$1.length);
	        }
	    }
	};
	[
	    "concat",
	    "every",
	    "filter",
	    "forEach",
	    "indexOf",
	    "join",
	    "lastIndexOf",
	    "map",
	    "reduce",
	    "reduceRight",
	    "slice",
	    "some",
	    "toString",
	    "toLocaleString"
	].forEach(function (funcName) {
	    arrayExtensions[funcName] = function () {
	        var adm = this[$mobx$$1];
	        adm.atom.reportObserved();
	        var res = adm.dehanceValues(adm.values);
	        return res[funcName].apply(res, arguments);
	    };
	});
	var isObservableArrayAdministration = createInstanceofPredicate$$1("ObservableArrayAdministration", ObservableArrayAdministration);
	function isObservableArray$$1(thing) {
	    return isObject$$1(thing) && isObservableArrayAdministration(thing[$mobx$$1]);
	}

	var _a;
	var ObservableMapMarker = {};
	// just extend Map? See also https://gist.github.com/nestharus/13b4d74f2ef4a2f4357dbd3fc23c1e54
	// But: https://github.com/mobxjs/mobx/issues/1556
	var ObservableMap$$1 = /** @class */ (function () {
	    function ObservableMap$$1(initialData, enhancer, name) {
	        if (enhancer === void 0) { enhancer = deepEnhancer$$1; }
	        if (name === void 0) { name = "ObservableMap@" + getNextId$$1(); }
	        this.enhancer = enhancer;
	        this.name = name;
	        this[_a] = ObservableMapMarker;
	        this._keysAtom = createAtom$$1(this.name + ".keys()");
	        this[Symbol.toStringTag] = "Map";
	        if (typeof Map !== "function") {
	            throw new Error("mobx.map requires Map polyfill for the current browser. Check babel-polyfill or core-js/es6/map.js");
	        }
	        this._data = new Map();
	        this._hasMap = new Map();
	        this.merge(initialData);
	    }
	    ObservableMap$$1.prototype._has = function (key) {
	        return this._data.has(key);
	    };
	    ObservableMap$$1.prototype.has = function (key) {
	        if (this._hasMap.has(key))
	            return this._hasMap.get(key).get();
	        return this._updateHasMapEntry(key, false).get();
	    };
	    ObservableMap$$1.prototype.set = function (key, value) {
	        var hasKey = this._has(key);
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                type: hasKey ? "update" : "add",
	                object: this,
	                newValue: value,
	                name: key
	            });
	            if (!change)
	                return this;
	            value = change.newValue;
	        }
	        if (hasKey) {
	            this._updateValue(key, value);
	        }
	        else {
	            this._addValue(key, value);
	        }
	        return this;
	    };
	    ObservableMap$$1.prototype.delete = function (key) {
	        var _this = this;
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                type: "delete",
	                object: this,
	                name: key
	            });
	            if (!change)
	                return false;
	        }
	        if (this._has(key)) {
	            var notifySpy = isSpyEnabled$$1();
	            var notify = hasListeners$$1(this);
	            var change = notify || notifySpy
	                ? {
	                    type: "delete",
	                    object: this,
	                    oldValue: this._data.get(key).value,
	                    name: key
	                }
	                : null;
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	            transaction$$1(function () {
	                _this._keysAtom.reportChanged();
	                _this._updateHasMapEntry(key, false);
	                var observable$$1 = _this._data.get(key);
	                observable$$1.setNewValue(undefined);
	                _this._data.delete(key);
	            });
	            if (notify)
	                notifyListeners$$1(this, change);
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportEnd$$1();
	            return true;
	        }
	        return false;
	    };
	    ObservableMap$$1.prototype._updateHasMapEntry = function (key, value) {
	        // optimization; don't fill the hasMap if we are not observing, or remove entry if there are no observers anymore
	        var entry = this._hasMap.get(key);
	        if (entry) {
	            entry.setNewValue(value);
	        }
	        else {
	            entry = new ObservableValue$$1(value, referenceEnhancer$$1, this.name + "." + key + "?", false);
	            this._hasMap.set(key, entry);
	        }
	        return entry;
	    };
	    ObservableMap$$1.prototype._updateValue = function (key, newValue) {
	        var observable$$1 = this._data.get(key);
	        newValue = observable$$1.prepareNewValue(newValue);
	        if (newValue !== UNCHANGED$$1) {
	            var notifySpy = isSpyEnabled$$1();
	            var notify = hasListeners$$1(this);
	            var change = notify || notifySpy
	                ? {
	                    type: "update",
	                    object: this,
	                    oldValue: observable$$1.value,
	                    name: key,
	                    newValue: newValue
	                }
	                : null;
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	            observable$$1.setNewValue(newValue);
	            if (notify)
	                notifyListeners$$1(this, change);
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportEnd$$1();
	        }
	    };
	    ObservableMap$$1.prototype._addValue = function (key, newValue) {
	        var _this = this;
	        checkIfStateModificationsAreAllowed$$1(this._keysAtom);
	        transaction$$1(function () {
	            var observable$$1 = new ObservableValue$$1(newValue, _this.enhancer, _this.name + "." + key, false);
	            _this._data.set(key, observable$$1);
	            newValue = observable$$1.value; // value might have been changed
	            _this._updateHasMapEntry(key, true);
	            _this._keysAtom.reportChanged();
	        });
	        var notifySpy = isSpyEnabled$$1();
	        var notify = hasListeners$$1(this);
	        var change = notify || notifySpy
	            ? {
	                type: "add",
	                object: this,
	                name: key,
	                newValue: newValue
	            }
	            : null;
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	        if (notify)
	            notifyListeners$$1(this, change);
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportEnd$$1();
	    };
	    ObservableMap$$1.prototype.get = function (key) {
	        if (this.has(key))
	            return this.dehanceValue(this._data.get(key).get());
	        return this.dehanceValue(undefined);
	    };
	    ObservableMap$$1.prototype.dehanceValue = function (value) {
	        if (this.dehancer !== undefined) {
	            return this.dehancer(value);
	        }
	        return value;
	    };
	    ObservableMap$$1.prototype.keys = function () {
	        this._keysAtom.reportObserved();
	        return this._data.keys();
	    };
	    ObservableMap$$1.prototype.values = function () {
	        var self = this;
	        var nextIndex = 0;
	        var keys$$1 = Array.from(this.keys());
	        return makeIterable({
	            next: function () {
	                return nextIndex < keys$$1.length
	                    ? { value: self.get(keys$$1[nextIndex++]), done: false }
	                    : { done: true };
	            }
	        });
	    };
	    ObservableMap$$1.prototype.entries = function () {
	        var self = this;
	        var nextIndex = 0;
	        var keys$$1 = Array.from(this.keys());
	        return makeIterable({
	            next: function () {
	                if (nextIndex < keys$$1.length) {
	                    var key = keys$$1[nextIndex++];
	                    return {
	                        value: [key, self.get(key)],
	                        done: false
	                    };
	                }
	                return { done: true };
	            }
	        });
	    };
	    ObservableMap$$1.prototype[(_a = $mobx$$1, Symbol.iterator)] = function () {
	        return this.entries();
	    };
	    ObservableMap$$1.prototype.forEach = function (callback, thisArg) {
	        var e_1, _a;
	        try {
	            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
	                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
	                callback.call(thisArg, value, key, this);
	            }
	        }
	        catch (e_1_1) { e_1 = { error: e_1_1 }; }
	        finally {
	            try {
	                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
	            }
	            finally { if (e_1) throw e_1.error; }
	        }
	    };
	    /** Merge another object into this object, returns this. */
	    ObservableMap$$1.prototype.merge = function (other) {
	        var _this = this;
	        if (isObservableMap$$1(other)) {
	            other = other.toJS();
	        }
	        transaction$$1(function () {
	            if (isPlainObject$$1(other))
	                Object.keys(other).forEach(function (key) { return _this.set(key, other[key]); });
	            else if (Array.isArray(other))
	                other.forEach(function (_a) {
	                    var _b = __read(_a, 2), key = _b[0], value = _b[1];
	                    return _this.set(key, value);
	                });
	            else if (isES6Map$$1(other))
	                other.forEach(function (value, key) { return _this.set(key, value); });
	            else if (other !== null && other !== undefined)
	                fail$$1("Cannot initialize map from " + other);
	        });
	        return this;
	    };
	    ObservableMap$$1.prototype.clear = function () {
	        var _this = this;
	        transaction$$1(function () {
	            untracked$$1(function () {
	                var e_2, _a;
	                try {
	                    for (var _b = __values(_this.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
	                        var key = _c.value;
	                        _this.delete(key);
	                    }
	                }
	                catch (e_2_1) { e_2 = { error: e_2_1 }; }
	                finally {
	                    try {
	                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
	                    }
	                    finally { if (e_2) throw e_2.error; }
	                }
	            });
	        });
	    };
	    ObservableMap$$1.prototype.replace = function (values$$1) {
	        var _this = this;
	        transaction$$1(function () {
	            // grab all the keys that are present in the new map but not present in the current map
	            // and delete them from the map, then merge the new map
	            // this will cause reactions only on changed values
	            var newKeys = getMapLikeKeys$$1(values$$1);
	            var oldKeys = Array.from(_this.keys());
	            var missingKeys = oldKeys.filter(function (k) { return newKeys.indexOf(k) === -1; });
	            missingKeys.forEach(function (k) { return _this.delete(k); });
	            _this.merge(values$$1);
	        });
	        return this;
	    };
	    Object.defineProperty(ObservableMap$$1.prototype, "size", {
	        get: function () {
	            this._keysAtom.reportObserved();
	            return this._data.size;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * Returns a plain object that represents this map.
	     * Note that all the keys being stringified.
	     * If there are duplicating keys after converting them to strings, behaviour is undetermined.
	     */
	    ObservableMap$$1.prototype.toPOJO = function () {
	        var e_3, _a;
	        var res = {};
	        try {
	            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
	                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
	                res["" + key] = value;
	            }
	        }
	        catch (e_3_1) { e_3 = { error: e_3_1 }; }
	        finally {
	            try {
	                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
	            }
	            finally { if (e_3) throw e_3.error; }
	        }
	        return res;
	    };
	    /**
	     * Returns a shallow non observable object clone of this map.
	     * Note that the values migth still be observable. For a deep clone use mobx.toJS.
	     */
	    ObservableMap$$1.prototype.toJS = function () {
	        return new Map(this);
	    };
	    ObservableMap$$1.prototype.toJSON = function () {
	        // Used by JSON.stringify
	        return this.toPOJO();
	    };
	    ObservableMap$$1.prototype.toString = function () {
	        var _this = this;
	        return (this.name +
	            "[{ " +
	            Array.from(this.keys())
	                .map(function (key) { return key + ": " + ("" + _this.get(key)); })
	                .join(", ") +
	            " }]");
	    };
	    /**
	     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
	     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
	     * for callback details
	     */
	    ObservableMap$$1.prototype.observe = function (listener, fireImmediately) {
	        process.env.NODE_ENV !== "production" &&
	            invariant$$1(fireImmediately !== true, "`observe` doesn't support fireImmediately=true in combination with maps.");
	        return registerListener$$1(this, listener);
	    };
	    ObservableMap$$1.prototype.intercept = function (handler) {
	        return registerInterceptor$$1(this, handler);
	    };
	    return ObservableMap$$1;
	}());
	/* 'var' fixes small-build issue */
	var isObservableMap$$1 = createInstanceofPredicate$$1("ObservableMap", ObservableMap$$1);

	var ObservableObjectAdministration$$1 = /** @class */ (function () {
	    function ObservableObjectAdministration$$1(target, values$$1, name, defaultEnhancer) {
	        if (values$$1 === void 0) { values$$1 = new Map(); }
	        this.target = target;
	        this.values = values$$1;
	        this.name = name;
	        this.defaultEnhancer = defaultEnhancer;
	        this.keysAtom = new Atom$$1(name + ".keys");
	    }
	    ObservableObjectAdministration$$1.prototype.read = function (key) {
	        return this.values.get(key).get();
	    };
	    ObservableObjectAdministration$$1.prototype.write = function (key, newValue) {
	        var instance = this.target;
	        var observable$$1 = this.values.get(key);
	        if (observable$$1 instanceof ComputedValue$$1) {
	            observable$$1.set(newValue);
	            return;
	        }
	        // intercept
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                type: "update",
	                object: this.proxy || instance,
	                name: key,
	                newValue: newValue
	            });
	            if (!change)
	                return;
	            newValue = change.newValue;
	        }
	        newValue = observable$$1.prepareNewValue(newValue);
	        // notify spy & observers
	        if (newValue !== UNCHANGED$$1) {
	            var notify = hasListeners$$1(this);
	            var notifySpy = isSpyEnabled$$1();
	            var change = notify || notifySpy
	                ? {
	                    type: "update",
	                    object: this.proxy || instance,
	                    oldValue: observable$$1.value,
	                    name: key,
	                    newValue: newValue
	                }
	                : null;
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	            observable$$1.setNewValue(newValue);
	            if (notify)
	                notifyListeners$$1(this, change);
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportEnd$$1();
	        }
	    };
	    ObservableObjectAdministration$$1.prototype.has = function (key) {
	        if (this.values.get(key) instanceof ObservableValue$$1)
	            return true;
	        else {
	            this.waitForKey(key);
	            return false;
	        }
	    };
	    ObservableObjectAdministration$$1.prototype.waitForKey = function (key) {
	        var map = this.pendingKeys || (this.pendingKeys = new Map());
	        var entry = map.get(key);
	        if (!entry) {
	            entry = new ObservableValue$$1(false, referenceEnhancer$$1, this.name + "." + key.toString() + "?", false);
	            map.set(key, entry);
	        }
	        entry.get(); // read to subscribe
	    };
	    ObservableObjectAdministration$$1.prototype.addObservableProp = function (propName, newValue, enhancer) {
	        if (enhancer === void 0) { enhancer = this.defaultEnhancer; }
	        var target = this.target;
	        assertPropertyConfigurable$$1(target, propName);
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                object: this.proxy || target,
	                name: propName,
	                type: "add",
	                newValue: newValue
	            });
	            if (!change)
	                return;
	            newValue = change.newValue;
	        }
	        var observable$$1 = new ObservableValue$$1(newValue, enhancer, this.name + "." + propName, false);
	        this.values.set(propName, observable$$1);
	        newValue = observable$$1.value; // observableValue might have changed it
	        Object.defineProperty(target, propName, generateObservablePropConfig$$1(propName));
	        this.notifyPropertyAddition(propName, newValue);
	    };
	    ObservableObjectAdministration$$1.prototype.addComputedProp = function (propertyOwner, // where is the property declared?
	    propName, options) {
	        var target = this.target;
	        options.name = options.name || this.name + "." + propName;
	        this.values.set(propName, new ComputedValue$$1(options));
	        if (propertyOwner === target || isPropertyConfigurable$$1(propertyOwner, propName))
	            Object.defineProperty(propertyOwner, propName, generateComputedPropConfig$$1(propName));
	    };
	    ObservableObjectAdministration$$1.prototype.remove = function (key) {
	        if (!this.values.has(key))
	            return;
	        var target = this.target;
	        if (hasInterceptors$$1(this)) {
	            var change = interceptChange$$1(this, {
	                object: this.proxy || target,
	                name: key,
	                type: "remove"
	            });
	            if (!change)
	                return;
	        }
	        try {
	            startBatch$$1();
	            var notify = hasListeners$$1(this);
	            var notifySpy = isSpyEnabled$$1();
	            var oldObservable = this.values.get(key);
	            var oldValue = oldObservable && oldObservable.get();
	            oldObservable && oldObservable.set(undefined);
	            this.keysAtom.reportChanged();
	            this.values.delete(key);
	            delete this.target[key];
	            var change = notify || notifySpy
	                ? {
	                    type: "remove",
	                    object: this.proxy || target,
	                    oldValue: oldValue,
	                    name: key
	                }
	                : null;
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	            if (notify)
	                notifyListeners$$1(this, change);
	            if (notifySpy && process.env.NODE_ENV !== "production")
	                spyReportEnd$$1();
	        }
	        finally {
	            endBatch$$1();
	        }
	    };
	    ObservableObjectAdministration$$1.prototype.illegalAccess = function (owner, propName) {
	        /**
	         * This happens if a property is accessed through the prototype chain, but the property was
	         * declared directly as own property on the prototype.
	         *
	         * E.g.:
	         * class A {
	         * }
	         * extendObservable(A.prototype, { x: 1 })
	         *
	         * classB extens A {
	         * }
	         * console.log(new B().x)
	         *
	         * It is unclear whether the property should be considered 'static' or inherited.
	         * Either use `console.log(A.x)`
	         * or: decorate(A, { x: observable })
	         *
	         * When using decorate, the property will always be redeclared as own property on the actual instance
	         */
	        console.warn("Property '" + propName + "' of '" + owner + "' was accessed through the prototype chain. Use 'decorate' instead to declare the prop or access it statically through it's owner");
	    };
	    /**
	     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
	     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
	     * for callback details
	     */
	    ObservableObjectAdministration$$1.prototype.observe = function (callback, fireImmediately) {
	        process.env.NODE_ENV !== "production" &&
	            invariant$$1(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
	        return registerListener$$1(this, callback);
	    };
	    ObservableObjectAdministration$$1.prototype.intercept = function (handler) {
	        return registerInterceptor$$1(this, handler);
	    };
	    ObservableObjectAdministration$$1.prototype.notifyPropertyAddition = function (key, newValue) {
	        var notify = hasListeners$$1(this);
	        var notifySpy = isSpyEnabled$$1();
	        var change = notify || notifySpy
	            ? {
	                type: "add",
	                object: this.proxy || this.target,
	                name: key,
	                newValue: newValue
	            }
	            : null;
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportStart$$1(__assign({}, change, { name: this.name, key: key }));
	        if (notify)
	            notifyListeners$$1(this, change);
	        if (notifySpy && process.env.NODE_ENV !== "production")
	            spyReportEnd$$1();
	        if (this.pendingKeys) {
	            var entry = this.pendingKeys.get(key);
	            if (entry)
	                entry.set(true);
	        }
	        this.keysAtom.reportChanged();
	    };
	    ObservableObjectAdministration$$1.prototype.getKeys = function () {
	        var e_1, _a;
	        this.keysAtom.reportObserved();
	        // return Reflect.ownKeys(this.values) as any
	        var res = [];
	        try {
	            for (var _b = __values(this.values), _c = _b.next(); !_c.done; _c = _b.next()) {
	                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
	                if (value instanceof ObservableValue$$1)
	                    res.push(key);
	            }
	        }
	        catch (e_1_1) { e_1 = { error: e_1_1 }; }
	        finally {
	            try {
	                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
	            }
	            finally { if (e_1) throw e_1.error; }
	        }
	        return res;
	    };
	    return ObservableObjectAdministration$$1;
	}());
	function asObservableObject$$1(target, name, defaultEnhancer) {
	    if (name === void 0) { name = ""; }
	    if (defaultEnhancer === void 0) { defaultEnhancer = deepEnhancer$$1; }
	    if (Object.prototype.hasOwnProperty.call(target, $mobx$$1))
	        return target[$mobx$$1];
	    process.env.NODE_ENV !== "production" &&
	        invariant$$1(Object.isExtensible(target), "Cannot make the designated object observable; it is not extensible");
	    if (!isPlainObject$$1(target))
	        name = (target.constructor.name || "ObservableObject") + "@" + getNextId$$1();
	    if (!name)
	        name = "ObservableObject@" + getNextId$$1();
	    var adm = new ObservableObjectAdministration$$1(target, new Map(), name, defaultEnhancer);
	    addHiddenProp$$1(target, $mobx$$1, adm);
	    return adm;
	}
	var observablePropertyConfigs = {};
	var computedPropertyConfigs = {};
	function generateObservablePropConfig$$1(propName) {
	    return (observablePropertyConfigs[propName] ||
	        (observablePropertyConfigs[propName] = {
	            configurable: true,
	            enumerable: true,
	            get: function () {
	                return this[$mobx$$1].read(propName);
	            },
	            set: function (v) {
	                this[$mobx$$1].write(propName, v);
	            }
	        }));
	}
	function getAdministrationForComputedPropOwner(owner) {
	    var adm = owner[$mobx$$1];
	    if (!adm) {
	        // because computed props are declared on proty,
	        // the current instance might not have been initialized yet
	        initializeInstance$$1(owner);
	        return owner[$mobx$$1];
	    }
	    return adm;
	}
	function generateComputedPropConfig$$1(propName) {
	    return (computedPropertyConfigs[propName] ||
	        (computedPropertyConfigs[propName] = {
	            configurable: true,
	            enumerable: false,
	            get: function () {
	                return getAdministrationForComputedPropOwner(this).read(propName);
	            },
	            set: function (v) {
	                getAdministrationForComputedPropOwner(this).write(propName, v);
	            }
	        }));
	}
	var isObservableObjectAdministration = createInstanceofPredicate$$1("ObservableObjectAdministration", ObservableObjectAdministration$$1);
	function isObservableObject$$1(thing) {
	    if (isObject$$1(thing)) {
	        // Initializers run lazily when transpiling to babel, so make sure they are run...
	        initializeInstance$$1(thing);
	        return isObservableObjectAdministration(thing[$mobx$$1]);
	    }
	    return false;
	}

	function getAtom$$1(thing, property) {
	    if (typeof thing === "object" && thing !== null) {
	        if (isObservableArray$$1(thing)) {
	            if (property !== undefined)
	                fail$$1(process.env.NODE_ENV !== "production" &&
	                    "It is not possible to get index atoms from arrays");
	            return thing[$mobx$$1].atom;
	        }
	        if (isObservableMap$$1(thing)) {
	            var anyThing = thing;
	            if (property === undefined)
	                return anyThing._keysAtom;
	            var observable$$1 = anyThing._data.get(property) || anyThing._hasMap.get(property);
	            if (!observable$$1)
	                fail$$1(process.env.NODE_ENV !== "production" &&
	                    "the entry '" + property + "' does not exist in the observable map '" + getDebugName$$1(thing) + "'");
	            return observable$$1;
	        }
	        // Initializers run lazily when transpiling to babel, so make sure they are run...
	        initializeInstance$$1(thing);
	        if (property && !thing[$mobx$$1])
	            thing[property]; // See #1072
	        if (isObservableObject$$1(thing)) {
	            if (!property)
	                return fail$$1(process.env.NODE_ENV !== "production" && "please specify a property");
	            var observable$$1 = thing[$mobx$$1].values.get(property);
	            if (!observable$$1)
	                fail$$1(process.env.NODE_ENV !== "production" &&
	                    "no observable property '" + property + "' found on the observable object '" + getDebugName$$1(thing) + "'");
	            return observable$$1;
	        }
	        if (isAtom$$1(thing) || isComputedValue$$1(thing) || isReaction$$1(thing)) {
	            return thing;
	        }
	    }
	    else if (typeof thing === "function") {
	        if (isReaction$$1(thing[$mobx$$1])) {
	            // disposer function
	            return thing[$mobx$$1];
	        }
	    }
	    return fail$$1(process.env.NODE_ENV !== "production" && "Cannot obtain atom from " + thing);
	}
	function getAdministration$$1(thing, property) {
	    if (!thing)
	        fail$$1("Expecting some object");
	    if (property !== undefined)
	        return getAdministration$$1(getAtom$$1(thing, property));
	    if (isAtom$$1(thing) || isComputedValue$$1(thing) || isReaction$$1(thing))
	        return thing;
	    if (isObservableMap$$1(thing))
	        return thing;
	    // Initializers run lazily when transpiling to babel, so make sure they are run...
	    initializeInstance$$1(thing);
	    if (thing[$mobx$$1])
	        return thing[$mobx$$1];
	    fail$$1(process.env.NODE_ENV !== "production" && "Cannot obtain administration from " + thing);
	}
	function getDebugName$$1(thing, property) {
	    var named;
	    if (property !== undefined)
	        named = getAtom$$1(thing, property);
	    else if (isObservableObject$$1(thing) || isObservableMap$$1(thing))
	        named = getAdministration$$1(thing);
	    else
	        named = getAtom$$1(thing); // valid for arrays as well
	    return named.name;
	}

	var toString = Object.prototype.toString;
	function deepEqual$$1(a, b) {
	    return eq(a, b);
	}
	// Copied from https://github.com/jashkenas/underscore/blob/5c237a7c682fb68fd5378203f0bf22dce1624854/underscore.js#L1186-L1289
	// Internal recursive comparison function for `isEqual`.
	function eq(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b)
	        return a !== 0 || 1 / a === 1 / b;
	    // `null` or `undefined` only equal to itself (strict comparison).
	    if (a == null || b == null)
	        return false;
	    // `NaN`s are equivalent, but non-reflexive.
	    if (a !== a)
	        return b !== b;
	    // Exhaust primitive checks
	    var type = typeof a;
	    if (type !== "function" && type !== "object" && typeof b != "object")
	        return false;
	    return deepEq(a, b, aStack, bStack);
	}
	// Internal recursive comparison function for `isEqual`.
	function deepEq(a, b, aStack, bStack) {
	    // Unwrap any wrapped objects.
	    a = unwrap(a);
	    b = unwrap(b);
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b))
	        return false;
	    switch (className) {
	        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	        case "[object RegExp]":
	        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	        case "[object String]":
	            // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	            // equivalent to `new String("5")`.
	            return "" + a === "" + b;
	        case "[object Number]":
	            // `NaN`s are equivalent, but non-reflexive.
	            // Object(NaN) is equivalent to NaN.
	            if (+a !== +a)
	                return +b !== +b;
	            // An `egal` comparison is performed for other numeric values.
	            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	        case "[object Date]":
	        case "[object Boolean]":
	            // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	            // millisecond representations. Note that invalid dates with millisecond representations
	            // of `NaN` are not equivalent.
	            return +a === +b;
	        case "[object Symbol]":
	            return (typeof Symbol !== "undefined" && Symbol.valueOf.call(a) === Symbol.valueOf.call(b));
	    }
	    var areArrays = className === "[object Array]";
	    if (!areArrays) {
	        if (typeof a != "object" || typeof b != "object")
	            return false;
	        // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	        // from different frames are.
	        var aCtor = a.constructor, bCtor = b.constructor;
	        if (aCtor !== bCtor &&
	            !(typeof aCtor === "function" &&
	                aCtor instanceof aCtor &&
	                typeof bCtor === "function" &&
	                bCtor instanceof bCtor) &&
	            ("constructor" in a && "constructor" in b)) {
	            return false;
	        }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	        // Linear search. Performance is inversely proportional to the number of
	        // unique nested structures.
	        if (aStack[length] === a)
	            return bStack[length] === b;
	    }
	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);
	    // Recursively compare objects and arrays.
	    if (areArrays) {
	        // Compare array lengths to determine if a deep comparison is necessary.
	        length = a.length;
	        if (length !== b.length)
	            return false;
	        // Deep compare the contents, ignoring non-numeric properties.
	        while (length--) {
	            if (!eq(a[length], b[length], aStack, bStack))
	                return false;
	        }
	    }
	    else {
	        // Deep compare objects.
	        var keys$$1 = Object.keys(a), key;
	        length = keys$$1.length;
	        // Ensure that both objects contain the same number of properties before comparing deep equality.
	        if (Object.keys(b).length !== length)
	            return false;
	        while (length--) {
	            // Deep compare each member
	            key = keys$$1[length];
	            if (!(has$1(b, key) && eq(a[key], b[key], aStack, bStack)))
	                return false;
	        }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	}
	function unwrap(a) {
	    if (isObservableArray$$1(a))
	        return a.slice();
	    if (isES6Map$$1(a) || isObservableMap$$1(a))
	        return Array.from(a.entries());
	    return a;
	}
	function has$1(a, key) {
	    return Object.prototype.hasOwnProperty.call(a, key);
	}

	function makeIterable(iterator) {
	    iterator[Symbol.iterator] = self$1;
	    return iterator;
	}
	function self$1() {
	    return this;
	}

	/*
	The only reason for this file to exist is pure horror:
	Without it rollup can make the bundling fail at any point in time; when it rolls up the files in the wrong order
	it will cause undefined errors (for example because super classes or local variables not being hosted).
	With this file that will still happen,
	but at least in this file we can magically reorder the imports with trial and error until the build succeeds again.
	*/

	/**
	 * (c) Michel Weststrate 2015 - 2018
	 * MIT Licensed
	 *
	 * Welcome to the mobx sources! To get an global overview of how MobX internally works,
	 * this is a good place to start:
	 * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
	 *
	 * Source folders:
	 * ===============
	 *
	 * - api/     Most of the public static methods exposed by the module can be found here.
	 * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
	 * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
	 * - utils/   Utility stuff.
	 *
	 */
	if (typeof Proxy === "undefined" || typeof Symbol === "undefined") {
	    throw new Error("[mobx] MobX 5+ requires Proxy and Symbol objects. If your environment doesn't support Proxy objects, please downgrade to MobX 4. For React Native Android, consider upgrading JSCore.");
	}
	try {
	    // define process.env if needed
	    // if this is not a production build in the first place
	    // (in which case the expression below would be substituted with 'production')
	    process.env.NODE_ENV;
	}
	catch (e) {
	    var g = typeof window !== "undefined" ? window : global;
	    if (typeof process === "undefined")
	        g.process = {};
	    g.process.env = {};
	}

	(function () {
	    function testCodeMinification() { }
	    if (testCodeMinification.name !== "testCodeMinification" &&
	        process.env.NODE_ENV !== "production") {
	        console.warn("[mobx] you are running a minified build, but 'process.env.NODE_ENV' was not set to 'production' in your bundler. This results in an unnecessarily large and slow bundle");
	    }
	})();
	// Devtools support
	if (typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ === "object") {
	    // See: https://github.com/andykog/mobx-devtools/
	    __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
	        spy: spy$$1,
	        extras: {
	            getDebugName: getDebugName$$1
	        },
	        $mobx: $mobx$$1
	    });
	}

	configure$$1({
	//	enforceActions: "observed", // don't allow state modifications outside actions
	//	reactionScheduler: f => setTimeout(f, Math.random() * 10000),
	});
	const mobXBox = box("MobX");
	/**
	 * Make object observable and readonly
	 * You must change the state with the changeState command
	 */
	const observableState = observable$$1;
	/** Hold reference with items that will be rerun */
	const activeSubscriptions = {};
	function reRunOnStateChange(fn, name) {
	    const logName = name || fn.name;
	    if (!logName)
	        throw new Error("reRun requires a function with a name");
	    let isFirst = true;
	    const id = getId();
	    const idBox = box(`#${id}`, colors.lightGrey);
	    activeSubscriptions[`_${id}`] = logName;
	    const unsubscribe = autorun$$1(() => {
	        logGroup([mobXBox, box("reRun", colors.orange), idBox, isFirst ? box("ON", colors.green) : "", logName], () => {
	            isFirst = false;
	            fn();
	        });
	    }, { name });
	    return () => {
	        log(mobXBox, box("reRun", colors.orange), idBox, box("OFF", colors.red), logName);
	        delete activeSubscriptions[`_${id}`];
	        unsubscribe();
	    };
	}
	/** By using this function you have a mutable State */
	function changeState(state, description, change) {
	    // I think we can use a group because reactions are executed immediate synchronous.
	    return logGroup([mobXBox, box("changeState"), description], () => {
	        return runInAction$$1(description, () => change(state));
	    });
	}
	/** When a property is watched, start the passed function and execute the unsubscribe function when stopped watching */
	function whenStatePropUsed(state, description, propName, onSubscribe) {
	    let cleanup;
	    const idBox = box(`#${getId()}`, colors.lightGrey);
	    let disposables = [
	        onBecomeObserved$$1(state, propName, function _whenStatePropUsedStart() {
	            log(mobXBox, box("whenStatePropUsed", colors.orange), idBox, box("ON", colors.green), description);
	            const unsubscribe = onSubscribe();
	            return cleanup = function _whenStatePropUsedDispose() {
	                log(mobXBox, box("whenStatePropUsed", colors.orange), idBox, box("OFF", colors.red), description);
	                unsubscribe();
	            };
	        }),
	        // IDEA: Track use count and optionally dispose with a delay()?
	        onBecomeUnobserved$$1(state, propName, function _whenStatePropUsedEnd() {
	            cleanup();
	        }),
	    ];
	    return () => {
	        disposables.forEach(d => d());
	        cleanup = undefined;
	        disposables = [];
	    };
	}

	function getStateAndValueMessage(stateAndValue, getLogValue = value => JSON.stringify(value)) {
	    if (!stateAndValue)
	        return `${undefined}`;
	    const state = stateAndValue.state;
	    if (state === "not-loaded" /* NotLoaded */)
	        return "Not available";
	    if (state === "loading" /* Loading */)
	        return "Loading...";
	    if (state === "error" /* Error */)
	        return "Error";
	    if (state === "loaded" /* Loaded */)
	        return `Loaded: ${getLogValue(stateAndValue.value)}`;
	    return exhaustiveFail(state);
	}

	const routeState = observableState({
	    value: undefined,
	    state: "not-loaded" /* NotLoaded */,
	});
	function setRoute(data, stateAndValue) {
	    return changeState(data, `setRoute: ${getStateAndValueMessage(stateAndValue)}`, data => {
	        data.state = stateAndValue.state;
	        data.value = stateAndValue.value;
	    });
	}

	var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const routes = ["players", "intro", "overview", "bet", "bet-wait", "bet-overview", "question"];
	function getNextRoute() {
	    //	if (!isQuizmaster(model.loggedOnPlayer.value)) return undefined;
	    let newPage = routes[1];
	    const currentPage = routeState.value
	        ? routeState.value.page
	        : undefined;
	    if (currentPage) {
	        const index = routes.indexOf(currentPage);
	        newPage = routes[index + 1];
	    }
	    return newPage;
	}
	function canGoNext() {
	    return !!getNextRoute();
	}
	function goNext() {
	    return __awaiter$3(this, void 0, void 0, function* () {
	        const newRoute = getNextRoute();
	        const currentPage = routeState.value
	            ? routeState.value.page
	            : undefined;
	        // On page leave
	        if (currentPage === "bet-wait") {
	            yield updateTeamBetAsync(0);
	        }
	        if (newRoute && newRoute !== currentPage) {
	            changeState(routeState, "Marking route loading", routeState$$1 => {
	                routeState$$1.state = "loading" /* Loading */;
	            });
	            yield database.setRouteAsync(newRoute);
	        }
	    });
	}
	function getPrevRoute() {
	    //	if (!isQuizmaster(model.loggedOnPlayer.value)) return undefined;
	    const currentPage = routeState.value
	        ? routeState.value.page
	        : undefined;
	    if (!currentPage)
	        return undefined;
	    const index = routes.indexOf(currentPage);
	    return routes[index - 1];
	}
	function canGoPrev() {
	    return !!getPrevRoute();
	}
	function goPrev() {
	    const newRoute = getPrevRoute();
	    const currentPage = routeState.value
	        ? routeState.value.page
	        : undefined;
	    if (newRoute && newRoute !== currentPage)
	        database.setRouteAsync(newRoute);
	}
	function goRoute(route) {
	    const currentPage = routeState.value
	        ? routeState.value.page
	        : undefined;
	    if (route && route !== currentPage) {
	        database.setRouteAsync(route);
	    }
	}

	var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	/*
	type PropertyNamesOfType<T, TProp> = Exclude<{
	    [K in keyof T]: T[K] extends TProp ? K : never;
	}[keyof T], undefined>;
	*/
	// type PropertiesOfType<T, TProp> = Pick<T, PropertyNamesOfType<T, TProp>>;
	//type ChangedMessageOfType<T> = Extract<AllowedMessages, ChangedMessage<AllowedMessageNames, Readonly<T> | undefined>>["name"];
	//type AsyncChangedMessageOfType<T> = Extract<AllowedMessages, AsyncChangedMessage<AllowedMessageNames, Readonly<T> | undefined>>["name"];
	/** Change a property and broadcast a message */
	/*
	export function changeValue<
	    T,
	    TPropName extends PropertyNamesOfType<IState, T | undefined>,
	    TMessage extends ChangedMessageOfType<NonNullable<IState[TPropName]>>
	>(state: IState, newValue: IState[TPropName], propertyName: TPropName, messageName: TMessage) {

	    if (!state[propertyName]) (state as any)[propertyName] = {};
	    const prevValue = state[propertyName]!;

	    // Is Changed
	    if (prevValue === newValue) return;

	    // Set
	    if (!newValue) {
	        delete state[propertyName];
	        //state[propertyName] = newValue;
	    } else {
	        state[propertyName] = newValue;
	    }

	    // Broadcsat change
	    const message: ChangedMessage<AllowedMessageNames, T> = {
	        name: messageName,
	        previous: prevValue,
	        current: newValue,
	    } as any;

	    broadcaster.publish(message as any);
	}*/
	/** Returns a function to change the state and broadcast a message */
	/*export function createValueChanger<
	    TPropName extends PropertyNamesOfType<IState,
	    any | undefined>>(state: IState, propertyName: TPropName, messageName: ChangedMessageOfType<NonNullable<IState[TPropName]>
	>) {
	    return (newValue: IState[TPropName]) => {
	        changeValue(state, newValue, propertyName, messageName);
	    };
	}*/
	/** Change state and broadcast a message */
	/*
	export function changeAsyncValue<
	    T,
	    TPropName extends PropertyNamesOfType<IState, LoadStateAndValue<any> | undefined>,
	    TMessage extends AsyncChangedMessageOfType<NonNullable<IState[TPropName]>["value"]>
	>(state: IState, newValue: IState[TPropName], propertyName: TPropName, messageName: TMessage) {

	    if (!state[propertyName]) updateState(`start of async update: ${messageName}`, state => (state as any)[propertyName] = {});
	    const prev = state[propertyName]!;

	    const prevValue = prev.value;
	    const prevState = prev.state;

	    // Is Changed
	    if (newValue && prevValue === newValue.value && prevState === newValue.state) return;

	    // Set
	    if (!newValue) {
	        updateState(`remove value for async update: ${messageName}`, state => delete state[propertyName]);
	        //state[propertyName] = newValue;
	    } else {
	        updateState(`update value for async update: ${messageName}`, () => {
	            prev.value = (newValue.state === LoadState.Loaded) ? newValue.value as any : undefined;
	            prev.state = newValue.state;
	        });
	    }

	    // Broadcsat change
	    const message: AsyncChangedMessage<AllowedMessageNames, T> = {
	        name: messageName,
	        previous: {
	            value: prevValue,
	            state: prevState
	        },
	        current: newValue,
	    } as any;

	    broadcaster.publish(message as any);
	}
	*/
	/** Returns a function to change the state and broadcast a message */
	/*export function createAsyncValueChanger<
	    TPropName extends PropertyNamesOfType<IState,
	    LoadStateAndValue<any> | undefined>>(state: IState, propertyName: TPropName, messageName: AsyncChangedMessageOfType<NonNullable<IState[TPropName]>["value"]
	>) {
	    return (newValue: IState[TPropName]) => {
	        changeAsyncValue(state, newValue, propertyName, messageName);
	    };
	}
	*/
	/** Execute a promise and update state (value and load state) */
	function executePromiseWithLoadState(exec, update) {
	    return __awaiter$4(this, void 0, void 0, function* () {
	        update({ state: "loading" /* Loading */, value: undefined });
	        return exec()
	            .then(value => {
	            update({ state: "loaded" /* Loaded */, value });
	            return value;
	        })
	            .catch(() => {
	            update({ state: "error" /* Error */, value: undefined });
	            // rethrow arg?
	        });
	    });
	}

	var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const loggedOnPlayerState = observableState({
	    value: undefined,
	    state: "not-loaded" /* NotLoaded */,
	});
	/** Change local state */
	function setLoggedOnPlayer(data, stateAndValue) {
	    return changeState(data, `setLoggedOnPlayer: ${getStateAndValueMessage(stateAndValue)}`, data => {
	        data.state = stateAndValue.state;
	        //data.value = observableState(stateAndValue.value);
	        data.value = stateAndValue.value;
	    });
	}
	function canLogOn() {
	    return (!loggedOnPlayerState.value &&
	        loggedOnPlayerState.state !== "loading" /* Loading */);
	}
	function canLogOff() {
	    return !!loggedOnPlayerState.value;
	}
	/** Add to database and update loggedOnPlayer in state */
	const logOnAsync = (player) => __awaiter$5(undefined, void 0, void 0, function* () {
	    return executePromiseWithLoadState(() => __awaiter$5(this, void 0, void 0, function* () { return database.logOnAsync(player); }), result => {
	        setLoggedOnPlayer(loggedOnPlayerState, result);
	    });
	});
	/** Remove from database and update loggedOnPlayer in state */
	const logOffAsync = (playerId) => __awaiter$5(undefined, void 0, void 0, function* () {
	    return executePromiseWithLoadState(() => __awaiter$5(this, void 0, void 0, function* () { return database.logOffAsync(playerId); }), () => {
	        setLoggedOnPlayer(loggedOnPlayerState, { state: "not-loaded" /* NotLoaded */ });
	    });
	});

	const playersState = observableState({
	    value: undefined,
	    state: "not-loaded" /* NotLoaded */,
	});
	function setPlayers(data, stateAndValue) {
	    return changeState(data, `setPlayers: ${getStateAndValueMessage(stateAndValue, v => `${v ? `${v.filter(p => p.isOnline()).length} players` : "undefined"}`)}`, data => {
	        data.state = stateAndValue.state;
	        data.value = stateAndValue.value;
	    });
	}

	const controllerBox = box("Controller", colors.purple);
	function logController(controllerCreator) {
	    return function _logController(...args) {
	        const idBox = box(`#${getId()}`, colors.lightGrey);
	        // Log Start
	        const result = logGroup([controllerBox, idBox, box("ON", colors.green), controllerCreator.name], function _logControllerCaptureStartGroup() {
	            // Call original function
	            return controllerCreator(...args);
	        });
	        // Patch dispose (if available) to log
	        if (result) {
	            const oriDispose = result.dispose;
	            result.dispose = function _logControllerDispose() {
	                // Log Dispose
	                logGroup([controllerBox, idBox, box("OFF", colors.red), controllerCreator.name], function _logControllerCaptureEndGroup() {
	                    oriDispose();
	                });
	            };
	        }
	        else {
	            log(controllerBox, idBox, box("OFF", colors.red), controllerCreator.name);
	        }
	        return result;
	    };
	}

	const aiController = logController(function aiController() {
	    let unsubscribes = [];
	    // When loggedon player is 'demo' start adding AI players
	    function checkAi() {
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        const createAi = loggedOnPlayer && loggedOnPlayer.name === "demo";
	        if (createAi) {
	            if (unsubscribes.length === 0) { // Create once
	                database.dropAsync();
	                unsubscribes.push(createAiPlayers(18));
	                unsubscribes.push(createAiQuizmaster());
	            }
	        }
	        else {
	            log("Log off demo players");
	            unsubscribes.forEach(u => {
	                u();
	            });
	            unsubscribes = [];
	        }
	    }
	    unsubscribes.push(reRunOnStateChange(checkAi));
	    return {
	        dispose() {
	            unsubscribes.forEach(u => u());
	            unsubscribes = [];
	        }
	    };
	});
	function createAiQuizmaster() {
	    log("Using AI Quizmaster...");
	    function onPlayersRoute() {
	        function waitUntilEnoughPlayers() {
	            // When transitioned to other page, dont doit
	            const currentPage = routeState.value && routeState.value.page || "players";
	            if (currentPage === "players") {
	                if (playersState.value && playersState.value.filter(p => p.isOnline()).length >= 14) {
	                    goNext();
	                }
	            }
	        }
	        const unsubscribeAutoRun = reRunOnStateChange(waitUntilEnoughPlayers);
	        // If no new Player messages check after 4s if already OK
	        const timer = setTimeout(waitUntilEnoughPlayers, 4000);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	            unsubscribeAutoRun();
	        };
	    }
	    function onIntroRoute() {
	        function doit() {
	            // When transitioned to other page, dont doit
	            if (routeState.value && routeState.value.page === "intro") {
	                goNext();
	            }
	        }
	        const timer = setTimeout(doit, 4000);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	        };
	    }
	    function onBet() {
	        function doit() {
	            // When transitioned to other page, dont doit
	            if (routeState.value && routeState.value.page === "bet") {
	                goNext();
	            }
	        }
	        const timer = setTimeout(doit, 3000);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	        };
	    }
	    function onBetWait(questionNumber) {
	        let nbrOfPlayersBet = 0;
	        function continueWhenEnoughPlayers() {
	            const nbrOfLoggedOnPlayers = playersState.value ? playersState.value.filter(p => p.isOnline()).length : 0;
	            // Continue when 95% of the players have bet
	            if (nbrOfLoggedOnPlayers > 0 && nbrOfPlayersBet >= nbrOfLoggedOnPlayers * 0.95) {
	                goNext();
	            }
	        }
	        const unsubscribeBets = database.watchPlayerBets(questionNumber, bets => {
	            nbrOfPlayersBet = Object.keys(bets).length;
	            continueWhenEnoughPlayers();
	        }).dispose;
	        const unsubscribeAutorun = reRunOnStateChange(continueWhenEnoughPlayers);
	        return () => {
	            unsubscribeBets();
	            unsubscribeAutorun();
	        };
	    }
	    function onBetOverview() {
	        function doit() {
	            // When transitioned to other page, dont doit
	            if (routeState.value && routeState.value.page === "bet-overview") {
	                goNext();
	            }
	        }
	        const timer = setTimeout(doit, 3000);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	        };
	    }
	    function onOverviewRoute() {
	        function doit() {
	            // When transitioned to other page, dont doit
	            if (routeState.value && routeState.value.page === "overview") {
	                goNext();
	            }
	        }
	        const timer = setTimeout(doit, 4000);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	        };
	    }
	    function aiControllerRouteActions() {
	        let routeUnsubscribe;
	        const prevRouteUnsubscribe = routeUnsubscribe; // Capture to unsubscribe after new route subscribe
	        const currentPage = routeState.value
	            ? routeState.value.page
	            : undefined;
	        const currentQuestionNumber = routeState.value
	            ? routeState.value.questionNumber || 0
	            : 0;
	        switch (currentPage) {
	            case undefined:
	            case "players": {
	                routeUnsubscribe = onPlayersRoute();
	                break;
	            }
	            case "intro": {
	                routeUnsubscribe = onIntroRoute();
	                break;
	            }
	            case "overview": {
	                routeUnsubscribe = onOverviewRoute();
	                break;
	            }
	            case "bet": {
	                routeUnsubscribe = onBet();
	                break;
	            }
	            case "bet-wait": {
	                routeUnsubscribe = onBetWait(currentQuestionNumber);
	                break;
	            }
	            case "bet-overview": {
	                routeUnsubscribe = onBetOverview();
	                break;
	            }
	            case "question": {
	                break;
	            }
	            default:
	                exhaustiveFail(currentPage);
	                break;
	        }
	        if (prevRouteUnsubscribe)
	            prevRouteUnsubscribe();
	    }
	    const autoRunUnsubscribe = reRunOnStateChange(aiControllerRouteActions);
	    // Start at Players
	    goRoute("players");
	    return () => {
	        autoRunUnsubscribe();
	    };
	}
	function createAiPlayer(player) {
	    log(`Using AI Player ${player.name}...`);
	    let routeUnsubscribe;
	    function onBet(questionNumber) {
	        function doit() {
	            const betAmounts = [0.05, 0.1, 0.15];
	            const randomBetAmount = betAmounts[Math.floor(Math.random() * betAmounts.length)];
	            if (playersState.value) { // Are there players
	                const randomPlayerId = getRandom(playersState.value
	                    .filter(p => p.gender === player.gender) // Only my gender
	                    .map(p => p.id));
	                if (randomPlayerId && routeState.value && (routeState.value.page === "bet" || routeState.value.page === "bet-wait")) {
	                    setMyBet(UserId.ensure(player.name), questionNumber, player.gender, randomPlayerId, randomBetAmount);
	                }
	            }
	        }
	        const delayInMs = Math.round(Math.random() * 10000 + 2000);
	        const timer = setTimeout(doit, delayInMs);
	        return () => {
	            if (timer)
	                clearTimeout(timer);
	        };
	    }
	    // Set View Properties
	    function aiControllerForPlayer() {
	        const prevRouteUnsubscribe = routeUnsubscribe; // Capture to unsubscribe after, new route subscribe
	        const currentPage = routeState.value
	            ? routeState.value.page
	            : undefined;
	        const currentQuestionNumber = routeState.value
	            ? routeState.value.questionNumber || 0
	            : 0;
	        switch (currentPage) {
	            case "players": {
	                break;
	            }
	            case "intro": {
	                break;
	            }
	            case "overview": {
	                break;
	            }
	            case "bet": {
	                routeUnsubscribe = onBet(currentQuestionNumber);
	                break;
	            }
	            case "bet-wait": {
	                routeUnsubscribe = onBet(currentQuestionNumber);
	                break;
	            }
	            case "bet-overview": {
	                break;
	            }
	            case "question": {
	                break;
	            }
	            case undefined: {
	                break;
	            }
	            default:
	                exhaustiveFail(currentPage);
	                break;
	        }
	        if (prevRouteUnsubscribe)
	            prevRouteUnsubscribe();
	    }
	    const autoRunUnsubscribe = reRunOnStateChange(aiControllerForPlayer, `aiControllerForPlayer: ${player.name}`);
	    // Start with delayed login
	    let loggedOnPlayer;
	    let logOnTimeout = window.setTimeout(() => {
	        database.logOnAsync(player).then(player => {
	            if (logOnTimeout) { // Is disposed during Async call?
	                loggedOnPlayer = player;
	            }
	            else {
	                database.logOffAsync(player.id); // Directly logOff
	            }
	        });
	    }, Math.random() * 13000 + 2000);
	    // Unsubscribe
	    return () => {
	        if (logOnTimeout) {
	            clearTimeout(logOnTimeout);
	            logOnTimeout = 0;
	        }
	        if (loggedOnPlayer)
	            database.logOffAsync(loggedOnPlayer.id);
	        autoRunUnsubscribe();
	    };
	}
	function createAiPlayers(count = 18) {
	    const players = [
	        { name: "Jordy", gender: Gender.Male },
	        { name: "Lien", gender: Gender.Female },
	        { name: "Kris", gender: Gender.Male },
	        { name: "Melissa", gender: Gender.Female },
	        { name: "Joris", gender: Gender.Male },
	        { name: "Angelique", gender: Gender.Female },
	        { name: "Maarten", gender: Gender.Male },
	        { name: "Liesbeth", gender: Gender.Female },
	        { name: "Jeroen", gender: Gender.Male },
	        { name: "Vicky", gender: Gender.Female },
	        { name: "Koen C", gender: Gender.Male },
	        { name: "Ellen M", gender: Gender.Female },
	        { name: "Koen V", gender: Gender.Male },
	        { name: "Claudia", gender: Gender.Female },
	        { name: "Tim", gender: Gender.Male },
	        { name: "Carolien", gender: Gender.Female },
	        { name: "Dominiek", gender: Gender.Male },
	        { name: "Ellen C", gender: Gender.Female },
	    ];
	    // Build an array of AI player info
	    const myPlayers = [];
	    for (let i = 0; i < count; i++) {
	        let player = players[i];
	        // Create Player
	        if (!player) {
	            player = {
	                name: `Player${i}`,
	                gender: Math.random() > 0.5 ? Gender.Male : Gender.Female
	            };
	        }
	        myPlayers.push({
	            name: UserName.ensure(player.name),
	            gender: player.gender,
	        });
	    }
	    // Create AI players
	    const disposables = myPlayers.map(createAiPlayer);
	    // Return unsubscribe
	    return () => {
	        disposables.forEach(d => {
	            d();
	        });
	    };
	}

	class BalancedScope {
	    constructor(options) {
	        this.startCount = 0;
	        this.onStart = options.onStart;
	        this.onEnd = options.onEnd;
	        this.onJoin = options.onJoin;
	        this.isStopped = false;
	    }
	    /** The returned function should be called to end */
	    start() {
	        if (this.isStopped)
	            return () => undefined;
	        let hasEdded = false;
	        this.startCount++;
	        if (this.startCount === 1) {
	            this.onStartResult = this.onStart();
	        }
	        else {
	            if (this.onJoin)
	                this.onJoin();
	        }
	        return () => {
	            if (!hasEdded) { // Execute only once
	                hasEdded = true;
	                this.end();
	            }
	        };
	    }
	    /** Try to use the returned function from start */
	    end() {
	        if (this.isStopped)
	            return;
	        this.startCount--;
	        if (this.startCount === 0)
	            this.onEnd(this.onStartResult);
	    }
	    /** When you want to dispose, you can force it to end */
	    stop() {
	        while (this.startCount > 0) {
	            this.end();
	        }
	        this.isStopped = true;
	    }
	    isBusy() {
	        return this.startCount > 0;
	    }
	    during(promise) {
	        this.start();
	        return promise.then(results => {
	            this.end();
	            return results;
	        }).catch(err => {
	            this.end();
	            throw err;
	        });
	    }
	}

	const firebaseConnectionState = observableState({
	    state: "not-loaded" /* NotLoaded */,
	    value: undefined,
	});
	function setFirebaseConnection(data, stateAndValue) {
	    return changeState(data, `setFirebaseConnection: ${getStateAndValueMessage(stateAndValue)}`, data => {
	        data.state = stateAndValue.state;
	        data.value = stateAndValue.value;
	    });
	}

	const blockInputController = logController(function blockInputController(blockInputEl) {
	    const logBox = box("InputBlocker", "#888888");
	    const balancedScope = new BalancedScope({
	        onStart: () => {
	            blockInputEl.classList.add("active");
	            log(logBox, box("ON", colors.green));
	            return setTimeout(() => { blockInputEl.classList.add("visible"); }, 1500);
	        },
	        onEnd: (timer) => {
	            clearTimeout(timer);
	            log(logBox, box("OFF", colors.red));
	            blockInputEl.classList.remove("active");
	            blockInputEl.classList.remove("visible");
	        }
	    });
	    // Return an update function and capture a start scope
	    function busyWhen(condition) {
	        let runningScope;
	        return () => {
	            const isBusy = condition();
	            // Start
	            if (!runningScope && isBusy) {
	                runningScope = balancedScope.start();
	            }
	            // Stop
	            else if (runningScope && !isBusy) {
	                runningScope(); // end scope
	                runningScope = undefined;
	            }
	        };
	    }
	    const isLogOnBusyChecker = busyWhen(() => loggedOnPlayerState.state === "loading" /* Loading */);
	    const isConnectionBusyChecker = busyWhen(() => !firebaseConnectionState.value);
	    const isRouteBusyChecker = busyWhen(() => routeState.state === "loading" /* Loading */);
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(function checkIfLogOnBusy() { isLogOnBusyChecker(); }),
	        reRunOnStateChange(function checkIfConnectionBusy() { isConnectionBusyChecker(); }),
	        reRunOnStateChange(function checkIfRouteBusy() { isRouteBusyChecker(); }),
	    ]);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            balancedScope.stop();
	        }
	    };
	});

	const fabMenuState = observableState({
	    isOpen: false,
	});
	function openFabMenu(data, shouldOpen = true) {
	    return changeState(data, `openFabMenu: ${shouldOpen}`, data => {
	        data.isOpen = shouldOpen;
	    });
	}

	const logOffPopupState = observableState({
	    isOpen: false,
	});
	function openLogOffPopup(data, shouldOpen = true) {
	    return changeState(data, `openLogOffPopup: ${shouldOpen}`, data => {
	        data.isOpen = shouldOpen;
	    });
	}

	const logOnPopupState = observableState({
	    isOpen: false,
	});
	function openLogOnPopup(data, shouldOpen = true) {
	    return changeState(data, `openLogOnPopup: ${shouldOpen}`, data => {
	        data.isOpen = shouldOpen;
	    });
	}

	const fabMenuController = logController(function fabMenuController(fabMenuElement) {
	    // Handle View events
	    //--------------------
	    const unsubscribeFabClick = subscribeToEvent(fabMenuElement, "fab-menu-click", e => {
	        const button = e.detail.element;
	        // Hidden?
	        if (!fabMenuElement.isOpen)
	            return;
	        // User button clicked
	        if (button.querySelector(".toggleLogOn")) {
	            if (canLogOff())
	                openLogOffPopup(logOffPopupState);
	            else if (canLogOn())
	                openLogOnPopup(logOnPopupState);
	            else
	                console.warn("Cannot log on or off");
	        }
	        else {
	            alert("todo");
	        }
	    });
	    const unsubscribeFabOpenChanged = subscribeToEvent(fabMenuElement, "fab-menu-opened", e => {
	        openFabMenu(fabMenuState, !!e.detail.isOpen);
	    });
	    // Update UI
	    function updateFabMenu() {
	        fabMenuElement.hide = !(loggedOnPlayerState.value);
	        // Close if hidden
	        if (fabMenuElement.hide) {
	            fabMenuElement.isOpen = false;
	        }
	        // Close when popup is open
	        if (logOffPopupState.isOpen) {
	            fabMenuElement.isOpen = false;
	        }
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(updateFabMenu)
	    ]);
	    // Unsubscribe
	    const result = {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeFabOpenChanged();
	            unsubscribeFabClick();
	        }
	    };
	    return result;
	});

	var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const logOffPopupController = logController(function logOffPopupController(logOffPopupElement) {
	    // Handle View events
	    //--------------------
	    const unsubscribeLogOffClick = subscribeToEvent(logOffPopupElement, "log-off-click", () => __awaiter$6(this, void 0, void 0, function* () {
	        if (canLogOff()) {
	            const loggedOnPlayer = loggedOnPlayerState.value;
	            if (loggedOnPlayer)
	                yield logOffAsync(loggedOnPlayer.id);
	            // Clear login info for auto-login
	            localStorage.removeItem("userName");
	            localStorage.removeItem("gender");
	        }
	        else {
	            // Already logged off, just close
	            openLogOffPopup(logOffPopupState, false);
	        }
	    }));
	    /** Close when clicked on background */
	    const unsubscribeBackgroundClick = subscribeToEvent(logOffPopupElement, "popup-bg-click", () => __awaiter$6(this, void 0, void 0, function* () {
	        openLogOffPopup(logOffPopupState, false);
	    }));
	    function updateLogOffPopup() {
	        // toggle
	        const popupEl = assert(logOffPopupElement.querySelector("top-popup"));
	        popupEl.isOpened = !!logOffPopupState.isOpen;
	        if (logOffPopupState.isOpen) {
	            const loggedOnPlayer = loggedOnPlayerState.value;
	            if (loggedOnPlayer)
	                logOffPopupElement.userName = loggedOnPlayer.name;
	            // Focus
	            const el = popupEl.querySelector("button");
	            if (el && "focus" in el)
	                el.focus();
	        }
	    }
	    function checkToCloseLogOffPopupWhenLoggedOff() {
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        if (loggedOnPlayer)
	            logOffPopupElement.userName = loggedOnPlayer.name; // Don't clear, else it changes during popup fade-out
	        // Close LogOff dialog if already logged off
	        if (!loggedOnPlayer)
	            openLogOffPopup(logOffPopupState, false);
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(checkToCloseLogOffPopupWhenLoggedOff),
	        reRunOnStateChange(updateLogOffPopup),
	    ]);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeBackgroundClick();
	            unsubscribeLogOffClick();
	        }
	    };
	});

	var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const logOnPopupController = logController(function logOnPopupController(logOnPopupElement) {
	    // Handle View events
	    //--------------------
	    const unsubscribeLogOnClick = subscribeToEvent(logOnPopupElement, "log-on-click", () => __awaiter$7(this, void 0, void 0, function* () {
	        if (canLogOn()) {
	            const userName = logOnPopupElement.userName;
	            const gender = logOnPopupElement.gender;
	            if (userName && gender) {
	                yield logOnAsync({
	                    name: userName,
	                    gender
	                });
	                // Remember login info for auto-login
	                localStorage.setItem("userName", userName);
	                localStorage.setItem("gender", gender);
	            }
	        }
	        else {
	            // Already logged off, just close
	            openLogOnPopup(logOnPopupState, false);
	        }
	    }));
	    /** Close when clicked on background */
	    const unsubscribeBackgroundClick = subscribeToEvent(logOnPopupElement, "popup-bg-click", () => __awaiter$7(this, void 0, void 0, function* () {
	        openLogOnPopup(logOnPopupState, false);
	    }));
	    function updateLogOnPopup() {
	        const popupEl = assert(logOnPopupElement.querySelector("top-popup"));
	        popupEl.isOpened = !!logOnPopupState.isOpen;
	        if (logOnPopupState.isOpen) {
	            // Focus
	            const el = popupEl.querySelector('[name="name"]');
	            if (el && "focus" in el)
	                el.focus();
	        }
	    }
	    function checkToCloseLogOnPopupWhenLoggedOn() {
	        // Close after user is logged login
	        if (loggedOnPlayerState.value) {
	            openLogOnPopup(logOnPopupState, false);
	        }
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(checkToCloseLogOnPopupWhenLoggedOn),
	        reRunOnStateChange(updateLogOnPopup),
	    ]);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeLogOnClick();
	            unsubscribeBackgroundClick();
	        }
	    };
	});

	const theme = {
	    malePrimaryColor: "#4580ff",
	    femalePrimaryColor: "#ea88db",
	    selectionColor: "orange",
	    lightColor: "#ffffff",
	    greyColor: "#888888",
	    lightGreyColor: "#AAAAAA",
	    darkTextColor: "#333333",
	    lightTextColor: "#f8f8f8",
	    fontFamily: "Play, Verdana, Geneva, sans-serif",
	    fontSize: 16,
	    boxShadow: "0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
	};
	var HexColor;
	(function (HexColor) {
	    function toString(r, g, b) {
	        const newR = r.toString(16);
	        const newG = g.toString(16);
	        const newB = b.toString(16);
	        return `#${newR.length < 2 ? `0${newR}` : newR}${newG.length < 2 ? `0${newG}` : newG}${newB.length < 2 ? `0${newB}` : newB}`;
	    }
	    HexColor.toString = toString;
	    function parse(hexColor) {
	        if (hexColor.length !== 7)
	            throw new Error("Invalid hex color must be 7 chars long.");
	        if (hexColor[0] !== "#")
	            throw new Error("Hex color should start with '#'");
	        const r = parseInt(hexColor[1] + hexColor[2], 16);
	        const g = parseInt(hexColor[3] + hexColor[4], 16);
	        const b = parseInt(hexColor[5] + hexColor[6], 16);
	        return { r, g, b };
	    }
	    HexColor.parse = parse;
	    function mix(hexColor1, hexColor2, alpha2) {
	        const color1 = parse(hexColor1);
	        const color2 = parse(hexColor2);
	        const alpha1 = 1 - alpha2;
	        const alpha = alpha1 + alpha2 * (1 - alpha1);
	        const red = color1.r * alpha1 + color2.r * alpha2 * (1 - alpha1) / alpha;
	        const green = color1.g * alpha1 + color2.g * alpha2 * (1 - alpha1) / alpha;
	        const blue = color1.b * alpha1 + color2.b * alpha2 * (1 - alpha1) / alpha;
	        return toString(Math.round(red), Math.round(green), Math.round(blue));
	    }
	    HexColor.mix = mix;
	    /*
	    // https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors#answer-13542669
	    function shadeRGBColor(hexColor: string, percent: number) {
	    
	            const t = percent < 0 ? 0 : 255;
	            const p = percent < 0 ? percent * -1 : percent;
	            const colorParts = parseHexColor(hexColor);
	    
	            const newR = (Math.round((t - colorParts.r) * p) + colorParts.r).toString(16);
	            const newG = (Math.round((t - colorParts.g) * p) + colorParts.g).toString(16);
	            const newB = (Math.round((t - colorParts.b) * p) + colorParts.b).toString(16);
	    
	            //return `rgb(${Math.round((t - R) * p) + R}, ${Math.round((t - G) * p) + G}, ${Math.round((t - B) * p) + B})`;
	            return `#${newR.length < 2 ? `0${newR}` : newR}${newG.length < 2 ? `0${newG}` : newG}${newB.length < 2 ? `0${newB}` : newB}`;
	    }*/
	})(HexColor || (HexColor = {}));

	/** Make Navigationbar of browser the gender color */
	const navigationBarController = logController(function navigationBarController() {
	    function updateNavigationBar() {
	        /*
	        <!-- Chrome, Firefox OS and Opera -->
	        <meta name="theme-color" content="#4285f4">

	        <!-- Windows Phone -->
	        <meta name="msapplication-navbutton-color" content="#4285f4">

	        <!-- iOS Safari -->
	        <meta name="apple-mobile-web-app-status-bar-style" content="#4285f4">
	        */
	        const themeColor = loggedOnPlayerState.value
	            ? loggedOnPlayerState.value.gender === Gender.Female
	                ? theme.femalePrimaryColor
	                : theme.malePrimaryColor
	            : "";
	        function createMeta(name) {
	            let chromeMetaEl = document.querySelector(`head meta[name="${name}"]`);
	            if (!chromeMetaEl) {
	                chromeMetaEl = document.createElement("meta");
	                chromeMetaEl.setAttribute("name", name);
	                document.getElementsByTagName("head")[0].appendChild(chromeMetaEl);
	            }
	            chromeMetaEl.setAttribute("content", themeColor);
	        }
	        createMeta("theme-color");
	        createMeta("msapplication-navbutton-color");
	        createMeta("apple-mobile-web-app-status-bar-style");
	    }
	    const unsubscribeAutorun = reRunOnStateChange(updateNavigationBar);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	        }
	    };
	});

	const navigationController = logController(function navigationController(navigationElement) {
	    function updateNavigationVisibility() {
	        navigationElement.hide = !isQuizmaster(loggedOnPlayerState.value) || (fabMenuState.isOpen);
	    }
	    function updateNavigationButtonState() {
	        navigationElement.disablePrev = !canGoPrev();
	        navigationElement.disableNext = !canGoNext();
	    }
	    const unsubscribeAutoRun = reRunOnStateChange(updateNavigationButtonState);
	    const unsubscribeLeftClick = subscribeToEvent(navigationElement, "navigation-el-left-click", e => {
	        e.stopPropagation();
	        goPrev();
	    });
	    const unsubscribeRightClick = subscribeToEvent(navigationElement, "navigation-el-right-click", e => {
	        e.stopPropagation();
	        goNext();
	    });
	    const unsubscribeKeyPress = subscribeToEvent(window, "keydown", e => {
	        const keyCode = e.which;
	        // Page Up
	        if (keyCode === 33) {
	            e.stopPropagation();
	            e.preventDefault();
	            goPrev();
	        }
	        // PageUDown
	        else if (keyCode === 34) {
	            e.stopPropagation();
	            e.preventDefault();
	            goNext();
	        }
	    });
	    function updateNavigation() {
	        updateNavigationVisibility();
	        updateNavigationButtonState();
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(updateNavigation),
	        reRunOnStateChange(updateNavigationVisibility),
	    ]);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeLeftClick();
	            unsubscribeRightClick();
	            unsubscribeAutoRun();
	            unsubscribeKeyPress();
	        }
	    };
	});

	class HyperElement extends HTMLElement {
	    constructor() {
	        super();
	        this.isRerenderRequested = false;
	        this.unsubscribeConnection = undefined;
	        this.html = hyperHTML.bind(this);
	        this.slots = {
	            default: []
	        };
	    }
	    loadSlots() {
	        const children = this.childNodes;
	        if (children.length > 0) {
	            Array.from(children).map(child => {
	                const slotName = child.getAttribute ? child.getAttribute("slot") : undefined;
	                if (!slotName) {
	                    this.slots.default.push(child);
	                }
	                else {
	                    if (!this.slots[slotName]) {
	                        this.slots[slotName] = [];
	                    }
	                    this.slots[slotName].push(child);
	                }
	            });
	        }
	    }
	    /**
	     * I prefer to expose connectCallback and disconnectCallback with 1 function.
	     * So no member variables need to be stored for use at disconnect when inheriting
	     */
	    onConnect() {
	        return undefined;
	    }
	    /* Called every time the element is inserted into the DOM */
	    //@ts-ignore
	    connectedCallback() {
	        this.unsubscribeConnection = this.onConnect();
	        this.render();
	    }
	    /** Called every time the element is removed from the DOM. */
	    //@ts-ignore
	    disconnectedCallback() {
	        if (this.unsubscribeConnection) {
	            this.unsubscribeConnection();
	            this.unsubscribeConnection = undefined;
	        }
	    }
	    /** Called when an attribute was added, removed, or updated */
	    attributeChangedCallback(_attrName, _oldVal, _newVal) {
	        return undefined;
	    }
	    /* Called if the element has been moved into a new document */
	    adoptedCallback() {
	        return undefined;
	    }
	    dispatchEvent(evt) {
	        return logGroup([box("⚡ Event", colors.orange), evt.type], () => {
	            return super.dispatchEvent(evt);
	        });
	    }
	    /**
	     * Request an UI update asynchronious.
	     * Multiple requests are batched as one UI update.
	     */
	    invalidate() {
	        if (!this.isRerenderRequested) {
	            // All additional invalidate() calls before will be ignored.
	            this.isRerenderRequested = true;
	            // Schedule the following as micro task, which runs before requestAnimationFrame.
	            // https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
	            // tslint:disable-next-line
	            Promise.resolve().then(() => {
	                this.isRerenderRequested = false;
	                this.render();
	            });
	        }
	    }
	}
	/** Custom element decorator */
	function Component(options) {
	    return function (ctor) {
	        if (arguments[1])
	            throw new Error("only use @Component as class decorator");
	        customElements.define(options.tag, ctor);
	        return ctor;
	    };
	}
	/** Creates a getter and setter that gets/sets the data in an attribute */
	function Attribute(options = {}) {
	    return function (proto, propName) {
	        if (!propName || typeof proto[propName] === "function")
	            throw new Error("only use @Attribute decorator on member variables");
	        const { attributeName = propName, type = "string", } = options;
	        // tslint:disable:no-invalid-this
	        // Save as string
	        if (type === "string") {
	            Object.defineProperty(proto, propName, {
	                get() {
	                    return this.getAttribute(attributeName);
	                },
	                set(newValue) {
	                    if (newValue !== null && newValue !== undefined) {
	                        this.setAttribute(attributeName, newValue);
	                    }
	                    else {
	                        this.removeAttribute(attributeName);
	                    }
	                },
	                enumerable: true,
	                configurable: true
	            });
	        }
	        // Save as number
	        else if (type === "number") {
	            Object.defineProperty(proto, propName, {
	                get() {
	                    return parseFloat(this.getAttribute(attributeName));
	                },
	                set(newValue) {
	                    if (newValue !== null && newValue !== undefined) {
	                        this.setAttribute(attributeName, newValue.toString());
	                    }
	                    else {
	                        this.removeAttribute(attributeName);
	                    }
	                },
	                enumerable: true,
	                configurable: true
	            });
	        }
	        // Save as boolean
	        else if (type === "boolean") {
	            Object.defineProperty(proto, propName, {
	                get() {
	                    return this.hasAttribute(attributeName);
	                },
	                set(newValue) {
	                    const currentValue = this.hasAttribute(attributeName); // Check else observedAttributes triggered
	                    if (newValue) {
	                        if (!currentValue)
	                            this.setAttribute(attributeName, "");
	                    }
	                    else {
	                        if (currentValue)
	                            this.removeAttribute(attributeName);
	                    }
	                },
	                enumerable: true,
	                configurable: true
	            });
	        }
	        else {
	            throw new Error("invalid attribute type");
	        }
	        // tslint:enable:no-invalid-this
	    };
	}
	/** Rerender when Propery changes */
	function Property() {
	    return function (proto, propName) {
	        if (!propName || typeof proto[propName] === "function")
	            throw new Error("only use @Property decorator on member variables");
	        let value;
	        Object.defineProperty(proto, propName, {
	            get() {
	                return value;
	            },
	            set(newValue) {
	                if (newValue !== value) { // Same array doesn't rerender
	                    value = newValue;
	                    // tslint:disable-next-line:no-invalid-this
	                    this.render();
	                }
	            },
	            enumerable: true,
	            configurable: true
	        });
	    };
	}
	/** Execute this function when attribute(s) changes on HTMLElement */
	function Watch(options) {
	    return function (proto, functionName) {
	        if (typeof proto[functionName] !== "function")
	            throw new Error("only use @Watch decorator on member function");
	        const ctor = proto.constructor;
	        const attributeNames = Array.isArray(options.attributeName) ? options.attributeName : [options.attributeName];
	        // tslint:disable:no-invalid-this
	        if (attributeNames && ctor) {
	            // Create Array if not available
	            if (!ctor.observedAttributes)
	                ctor.observedAttributes = [];
	            // Add attributeName name to observableAttributes
	            attributeNames.forEach(attributeName => {
	                if (ctor.observedAttributes.indexOf(attributeName) === -1)
	                    ctor.observedAttributes.push(attributeName);
	            });
	            // patch attributeChangedCallback
	            //@ts-ignore
	            const oriAttributeChangedCallback = proto.attributeChangedCallback;
	            //@ts-ignore
	            proto.attributeChangedCallback = function triggeredByWatchDecorator() {
	                if (attributeNames.indexOf(arguments[0]) >= 0) {
	                    this[functionName].apply(this, arguments);
	                }
	                oriAttributeChangedCallback.apply(this, arguments);
	            };
	        }
	        // tslint:enable:no-invalid-this
	    };
	}

	var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	let IntroPageElement = class IntroPageElement extends HyperElement {
	    render() {
	        return this.html `
		<gender-bg-el>
		<div class="page">
			<h1>Het Spel:</h1>
			<ul>
				<li>--Under Construction--</li>
				<li>Mannen vs Vrouwen</li>
				<li>Eén man en één vrouw zullen het tegen elkaar moeten opnemen om een opdracht het beste uit te voeren.</li>
				<li>Voor de opdracht kiest iedereen individueel <a href='#speler' title="Speler">wie</a> hij/zij vindt dat de opdracht het beste kan uitvoeren en voor hoeveel <strong><a href='#punten' title="Punten">punten</a></strong>.</li>
				<li>De meeste opdrachten zijn <strong>doe-opdrachten</strong>, dus GSM is enkel voor inzetten en spel overzicht nodig.</li>
				<li>Op het einde weten we <strong>eindelijk</strong> welk geslacht het sterkste is.</li>
			</ul>

			<h1 id="speler">De Speler:</h1>
			<ul>
				<li><strong>Wie het meeste gekozen is</strong> binnen het team moet de opdracht uitvoeren, bij gelijke stand kiest de app.</li>
				<li>Iemand die gekozen is kan voor de volgende vragen niet meer gekozen worden tot iedereen een opdracht heeft uitgevoerd.</li>
			</ul>

			<!--
			<h1 id="punten">De Punten:</h1>
			<ul>
				<li>Beide team starten met 1000 punten.</li>
				<li>Inzetten gebeurd aan de hand van een percentage: 5%, 10% of 15%.</li>
				<li>Het <strong>gemiddelde</strong> percentage van het team wordt gebruikt.</li>
				<li>Wanneer je <strong>wint steel</strong> je dit percentage van de punten van het andere geslacht.</li>
				<li>Wanneer je <strong>verliest</strong> moet je dit percentage van je eigen punten <strong>afgeven</strong>.</li>
			</ul>
			<h1 id="puntenvoorbeeld">Punten Voorbeeld:</h1>
			<ul>
				<li>Score: Mannen: 500, Vrouwen: 1500</li>
				<li>Inzet: Mannen: 10%, Vrouwen: 5%</li>
				<li>Als de <strong>mannen winnen</strong> stelen ze 10% van de vrouwen (10% van 1500 = 150) en verliezen de vrouwen 5% van hun score (5% van 1500 = 75): Totaal = 225p</li>
				<li>Als de <strong>vrouwen winnen</strong> stelen ze 5% van de mannen (5% van 500 = 25) en verliezen de mannen 10% van hun score (10% van 500 = 50): Totaal = 75p</li>
				<li><u>Opmerking</u>: Door met percentages te werken is het makkelijker voor het verliezende team om achterstand weg te werken.</li>
			</ul>
			-->
		</div>
		</gender-bg-el>`;
	    }
	};
	IntroPageElement = __decorate([
	    Component({ tag: "intro-page" })
	], IntroPageElement);

	const genderBackgroundController = logController(function genderBackgroundController(genderBackgroundElement) {
	    const unsubscribeAutorun = reRunOnStateChange(function updateBackgroundColorOnGenderChange() {
	        const player = loggedOnPlayerState.value;
	        genderBackgroundElement.gender = player ? player.gender : undefined;
	    });
	    return {
	        dispose() {
	            unsubscribeAutorun();
	        }
	    };
	});

	const introPageController = logController(function introPageController(introPageElement) {
	    const genderEl = introPageElement.querySelector("gender-bg-el");
	    const unsubscribeBackground = genderBackgroundController(genderEl).dispose;
	    return {
	        dispose: () => {
	            unsubscribeBackground();
	        }
	    };
	});

	/**
	 * We need to do the following to *our* objects before passing to freestyle:
	 * - For any `$nest` directive move up to FreeStyle style nesting
	 * - For any `$unique` directive map to FreeStyle Unique
	 * - For any `$debugName` directive return the debug name
	 */
	function ensureStringObj(object) {
	    /** The final result we will return */
	    var result = {};
	    var debugName = '';
	    for (var key in object) {
	        /** Grab the value upfront */
	        var val = object[key];
	        /** TypeStyle configuration options */
	        if (key === '$unique') {
	            result[freeStyle_1] = val;
	        }
	        else if (key === '$nest') {
	            var nested = val;
	            for (var selector in nested) {
	                var subproperties = nested[selector];
	                result[selector] = ensureStringObj(subproperties).result;
	            }
	        }
	        else if (key === '$debugName') {
	            debugName = val;
	        }
	        else {
	            result[key] = val;
	        }
	    }
	    return { result: result, debugName: debugName };
	}
	// todo: better name here
	function explodeKeyframes(frames) {
	    var result = { $debugName: undefined, keyframes: {} };
	    for (var offset in frames) {
	        var val = frames[offset];
	        if (offset === '$debugName') {
	            result.$debugName = val;
	        }
	        else {
	            result.keyframes[offset] = val;
	        }
	    }
	    return result;
	}

	/** Raf for node + browser */
	var raf = typeof requestAnimationFrame === 'undefined'
	    /**
	     * Make sure setTimeout is always invoked with
	     * `this` set to `window` or `global` automatically
	     **/
	    ? function (cb) { return setTimeout(cb); }
	    /**
	     * Make sure window.requestAnimationFrame is always invoked with `this` window
	     * We might have raf without window in case of `raf/polyfill` (recommended by React)
	     **/
	    : typeof window === 'undefined'
	        ? requestAnimationFrame
	        : requestAnimationFrame.bind(window);
	/**
	 * Merges various styles into a single style object.
	 * Note: if two objects have the same property the last one wins
	 */
	function extend() {
	    var objects = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        objects[_i] = arguments[_i];
	    }
	    /** The final result we will return */
	    var result = {};
	    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
	        var object = objects_1[_a];
	        if (object == null || object === false) {
	            continue;
	        }
	        for (var key in object) {
	            /** Falsy values except a explicit 0 is ignored */
	            var val = object[key];
	            if (!val && val !== 0) {
	                continue;
	            }
	            /** if nested media or pseudo selector */
	            if (key === '$nest' && val) {
	                result[key] = result['$nest'] ? extend(result['$nest'], val) : val;
	            }
	            else if ((key.indexOf('&') !== -1 || key.indexOf('@media') === 0)) {
	                result[key] = result[key] ? extend(result[key], val) : val;
	            }
	            else {
	                result[key] = val;
	            }
	        }
	    }
	    return result;
	}

	/**
	 * Creates an instance of free style with our options
	 */
	var createFreeStyle = function () { return freeStyle_10(
	/** Use the default hash function */
	undefined, 
	/** Preserve $debugName values */
	true); };
	/**
	 * Maintains a single stylesheet and keeps it in sync with requested styles
	 */
	var TypeStyle = /** @class */ (function () {
	    function TypeStyle(_a) {
	        var autoGenerateTag = _a.autoGenerateTag;
	        var _this = this;
	        /**
	         * Insert `raw` CSS as a string. This is useful for e.g.
	         * - third party CSS that you are customizing with template strings
	         * - generating raw CSS in JavaScript
	         * - reset libraries like normalize.css that you can use without loaders
	         */
	        this.cssRaw = function (mustBeValidCSS) {
	            if (!mustBeValidCSS) {
	                return;
	            }
	            _this._raw += mustBeValidCSS || '';
	            _this._pendingRawChange = true;
	            _this._styleUpdated();
	        };
	        /**
	         * Takes CSSProperties and registers it to a global selector (body, html, etc.)
	         */
	        this.cssRule = function (selector) {
	            var objects = [];
	            for (var _i = 1; _i < arguments.length; _i++) {
	                objects[_i - 1] = arguments[_i];
	            }
	            var object = ensureStringObj(extend.apply(void 0, objects)).result;
	            _this._freeStyle.registerRule(selector, object);
	            _this._styleUpdated();
	            return;
	        };
	        /**
	         * Renders styles to the singleton tag imediately
	         * NOTE: You should only call it on initial render to prevent any non CSS flash.
	         * After that it is kept sync using `requestAnimationFrame` and we haven't noticed any bad flashes.
	         **/
	        this.forceRenderStyles = function () {
	            var target = _this._getTag();
	            if (!target) {
	                return;
	            }
	            target.textContent = _this.getStyles();
	        };
	        /**
	         * Utility function to register an @font-face
	         */
	        this.fontFace = function () {
	            var fontFace = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                fontFace[_i] = arguments[_i];
	            }
	            var freeStyle$$1 = _this._freeStyle;
	            for (var _a = 0, _b = fontFace; _a < _b.length; _a++) {
	                var face = _b[_a];
	                freeStyle$$1.registerRule('@font-face', face);
	            }
	            _this._styleUpdated();
	            return;
	        };
	        /**
	         * Allows use to use the stylesheet in a node.js environment
	         */
	        this.getStyles = function () {
	            return (_this._raw || '') + _this._freeStyle.getStyles();
	        };
	        /**
	         * Takes keyframes and returns a generated animationName
	         */
	        this.keyframes = function (frames) {
	            var _a = explodeKeyframes(frames), keyframes = _a.keyframes, $debugName = _a.$debugName;
	            // TODO: replace $debugName with display name
	            var animationName = _this._freeStyle.registerKeyframes(keyframes, $debugName);
	            _this._styleUpdated();
	            return animationName;
	        };
	        /**
	         * Helps with testing. Reinitializes FreeStyle + raw
	         */
	        this.reinit = function () {
	            /** reinit freestyle */
	            var freeStyle$$1 = createFreeStyle();
	            _this._freeStyle = freeStyle$$1;
	            _this._lastFreeStyleChangeId = freeStyle$$1.changeId;
	            /** reinit raw */
	            _this._raw = '';
	            _this._pendingRawChange = false;
	            /** Clear any styles that were flushed */
	            var target = _this._getTag();
	            if (target) {
	                target.textContent = '';
	            }
	        };
	        /** Sets the target tag where we write the css on style updates */
	        this.setStylesTarget = function (tag) {
	            /** Clear any data in any previous tag */
	            if (_this._tag) {
	                _this._tag.textContent = '';
	            }
	            _this._tag = tag;
	            /** This special time buffer immediately */
	            _this.forceRenderStyles();
	        };
	        /**
	         * Takes an object where property names are ideal class names and property values are CSSProperties, and
	         * returns an object where property names are the same ideal class names and the property values are
	         * the actual generated class names using the ideal class name as the $debugName
	         */
	        this.stylesheet = function (classes$$1) {
	            var classNames = Object.getOwnPropertyNames(classes$$1);
	            var result = {};
	            for (var _i = 0, classNames_1 = classNames; _i < classNames_1.length; _i++) {
	                var className = classNames_1[_i];
	                var classDef = classes$$1[className];
	                if (classDef) {
	                    classDef.$debugName = className;
	                    result[className] = _this.style(classDef);
	                }
	            }
	            return result;
	        };
	        var freeStyle$$1 = createFreeStyle();
	        this._autoGenerateTag = autoGenerateTag;
	        this._freeStyle = freeStyle$$1;
	        this._lastFreeStyleChangeId = freeStyle$$1.changeId;
	        this._pending = 0;
	        this._pendingRawChange = false;
	        this._raw = '';
	        this._tag = undefined;
	        // rebind prototype to TypeStyle.  It might be better to do a function() { return this.style.apply(this, arguments)}
	        this.style = this.style.bind(this);
	    }
	    /**
	     * Only calls cb all sync operations settle
	     */
	    TypeStyle.prototype._afterAllSync = function (cb) {
	        var _this = this;
	        this._pending++;
	        var pending = this._pending;
	        raf(function () {
	            if (pending !== _this._pending) {
	                return;
	            }
	            cb();
	        });
	    };
	    TypeStyle.prototype._getTag = function () {
	        if (this._tag) {
	            return this._tag;
	        }
	        if (this._autoGenerateTag) {
	            var tag = typeof window === 'undefined'
	                ? { textContent: '' }
	                : document.createElement('style');
	            if (typeof document !== 'undefined') {
	                document.head.appendChild(tag);
	            }
	            this._tag = tag;
	            return tag;
	        }
	        return undefined;
	    };
	    /** Checks if the style tag needs updating and if so queues up the change */
	    TypeStyle.prototype._styleUpdated = function () {
	        var _this = this;
	        var changeId = this._freeStyle.changeId;
	        var lastChangeId = this._lastFreeStyleChangeId;
	        if (!this._pendingRawChange && changeId === lastChangeId) {
	            return;
	        }
	        this._lastFreeStyleChangeId = changeId;
	        this._pendingRawChange = false;
	        this._afterAllSync(function () { return _this.forceRenderStyles(); });
	    };
	    TypeStyle.prototype.style = function () {
	        var freeStyle$$1 = this._freeStyle;
	        var _a = ensureStringObj(extend.apply(undefined, arguments)), result = _a.result, debugName = _a.debugName;
	        var className = debugName ? freeStyle$$1.registerStyle(result, debugName) : freeStyle$$1.registerStyle(result);
	        this._styleUpdated();
	        return className;
	    };
	    return TypeStyle;
	}());

	/** Zero configuration, default instance of TypeStyle */
	var ts = new TypeStyle({ autoGenerateTag: true });
	/**
	 * Takes CSSProperties and registers it to a global selector (body, html, etc.)
	 */
	var cssRule = ts.cssRule;

	var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var IconElement_1;
	var IconNames;
	(function (IconNames) {
	    IconNames["offline"] = "offline";
	    IconNames["female"] = "female";
	    IconNames["male"] = "male";
	    IconNames["user"] = "user";
	    IconNames["crown"] = "crown";
	    IconNames["arrowLeft"] = "arrowLeft";
	    IconNames["arrowRight"] = "arrowRight";
	})(IconNames || (IconNames = {}));
	cssRule("icon-el", {
	    $debugName: "icon",
	    width: "1em",
	    height: "1em",
	    display: "inline-block",
	    verticalAlign: "middle"
	});
	let IconElement = IconElement_1 = class IconElement extends HyperElement {
	    static getIcon(iconName) {
	        switch (iconName) {
	            case IconNames.offline:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 512 512">
					<g>
						<path d="M402.048,149.824C387.221,75.968,321.365,21.333,245.333,21.333c-88.235,0-160,71.765-160,160
							c0,3.605,0.149,7.296,0.469,11.2C37.653,197.653,0,238.507,0,288c0,52.928,43.072,96,96,96c5.888,0,10.667-4.779,10.667-10.667
							c0-5.888-4.779-10.667-10.667-10.667c-41.173,0-74.667-33.493-74.667-74.667s33.493-74.667,73.941-74.709
							c0.469,0.085,1.792,0.213,2.261,0.213c2.901-0.32,6.123-1.259,8.192-3.605s3.008-5.483,2.56-8.576
							c-1.109-7.616-1.621-13.973-1.621-19.989c0-76.459,62.208-138.667,138.667-138.667c68.501,0,127.445,51.157,137.109,118.997
							c0.768,5.333,7.019,9.195,12.224,9.003c52.928,0,96,43.072,96,96c0,52.928-43.072,96-96,96c-5.888,0-10.667,4.779-10.667,10.667
							c0,5.888,4.779,10.667,10.667,10.667C459.349,384,512,331.371,512,266.667C512,204.992,464.171,154.283,402.048,149.824z"/>
						<path d="M245.333,256C180.651,256,128,308.629,128,373.333s52.651,117.333,117.333,117.333s117.333-52.629,117.333-117.333
							S310.016,256,245.333,256z M245.333,469.333c-52.928,0-96-43.072-96-96c0-52.928,43.072-96,96-96c52.928,0,96,43.072,96,96
							C341.333,426.261,298.261,469.333,245.333,469.333z"/>
						<path d="M328.277,441.237L177.451,290.389c-4.16-4.16-10.923-4.16-15.083,0c-4.16,4.16-4.16,10.923,0,15.083L313.195,456.32
							c2.091,2.069,4.821,3.115,7.552,3.115c2.731,0,5.461-1.045,7.531-3.115C332.437,452.16,332.437,445.397,328.277,441.237z"/>
					</g>
				</svg>`;
	            case IconNames.female:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 414.693 414.693">
					<path d="M355.578,148.231C355.578,66.496,289.082,0,207.347,0S59.115,66.496,59.115,148.231 c0,76.672,58.514,139.933,133.231,147.476v47.601h-41.568v30h41.568v41.385h30v-41.385h41.568v-30h-41.568v-47.601 C297.064,288.164,355.578,224.903,355.578,148.231z M89.115,148.231C89.115,83.038,142.153,30,207.347,30 s118.231,53.038,118.231,118.231S272.54,266.462,207.347,266.462S89.115,213.424,89.115,148.231z"/>
				</svg>`;
	            case IconNames.male:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 351.778 351.778">
					<path d="M321.778,95.024l30-0.049l-0.154-94.821L256.802,0l-0.049,30l43.741,0.071l-58.583,58.583 c-26.385-21.595-59.13-33.339-93.68-33.339c-39.594,0-76.817,15.419-104.814,43.417C15.419,126.729,0,163.953,0,203.547 s15.419,76.818,43.416,104.815s65.221,43.416,104.814,43.416s76.818-15.419,104.815-43.416 c54.215-54.215,57.572-140.324,10.073-198.49l58.588-58.588L321.778,95.024z M231.833,287.149 c-22.331,22.331-52.021,34.629-83.603,34.629S86.96,309.48,64.629,287.149C42.298,264.818,30,235.128,30,203.547 s12.298-61.271,34.629-83.602s52.021-34.629,83.602-34.629c31.581,0,61.271,12.298,83.603,34.629 C277.931,166.044,277.931,241.051,231.833,287.149z"/>
				</svg>`;
	            case IconNames.arrowLeft:
	                return hyperHTML.wire(undefined, "svg") `<svg version= "1.1" viewBox= "0 0 123.969 123.97">
					<path d="M96.059,24.603c5.799-5.801,5.699-15.301-0.5-20.9c-5.801-5.3-14.801-4.8-20.301,0.8l-47.4,47.3 c-2.8,2.801-4.2,6.5-4.2,10.2s1.4,7.4,4.2,10.2l47.3,47.3c5.5,5.5,14.6,6.101,20.3,0.8c6.101-5.6,6.3-15.1,0.5-20.899l-30.2-30.3 c-3.9-3.9-3.9-10.2,0-14.101L96.059,24.603z" />
				</svg>`;
	            case IconNames.arrowRight:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 123.97 123.97">
					<path d="M27.961,99.367c-5.8,5.8-5.7,15.3,0.5,20.899c5.8,5.301,14.8,4.801,20.3-0.8l47.3-47.3c2.8-2.8,4.2-6.5,4.2-10.2 s-1.4-7.399-4.2-10.2l-47.2-47.3c-5.5-5.5-14.6-6.1-20.3-0.8c-6.1,5.6-6.3,15.1-0.5,20.9l30.2,30.399c3.9,3.9,3.9,10.2,0,14.101 L27.961,99.367z" />
				</svg>`;
	            case IconNames.user:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 248.349 248.349">
					<g>
						<path d="M9.954,241.305h228.441c3.051,0,5.896-1.246,7.805-3.416c1.659-1.882,2.393-4.27,2.078-6.723 c-5.357-41.734-31.019-76.511-66.15-95.053c-14.849,14.849-35.348,24.046-57.953,24.046s-43.105-9.197-57.953-24.046 C31.09,154.65,5.423,189.432,0.071,231.166c-0.315,2.453,0.424,4.846,2.078,6.723C4.058,240.059,6.903,241.305,9.954,241.305z" />
						<path d="M72.699,127.09c1.333,1.398,2.725,2.73,4.166,4.019c12.586,11.259,29.137,18.166,47.309,18.166 s34.723-6.913,47.309-18.166c1.441-1.289,2.834-2.622,4.166-4.019c1.327-1.398,2.622-2.828,3.84-4.329 c9.861-12.211,15.8-27.717,15.8-44.6c0-39.216-31.906-71.116-71.116-71.116S53.059,38.95,53.059,78.16 c0,16.883,5.939,32.39,15.8,44.6C70.072,124.262,71.366,125.687,72.699,127.09z" />
					</g>
				</svg>`;
	            case IconNames.crown:
	                return hyperHTML.wire(undefined, "svg") `<svg version="1.1" viewBox="0 0 981.9 981.901">
					<g>
						<path d="M861,863.05c0-30.4-24.6-55-55-55H175.9c-30.4,0-55,24.6-55,55s24.6,55,55,55H806C836.4,918.05,861,893.35,861,863.05z"/>
						<path d="M65.4,417.85c0.9,0,1.7,0,2.6-0.1l87.2,315.6H491h335.7l87.2-315.6c0.899,0,1.699,0.1,2.6,0.1c36.1,0,65.4-29.3,65.4-65.4s-29.301-65.4-65.4-65.4s-65.4, 29.3-65.4, 65.4c0, 7, 1.101, 13.8, 3.2, 20.1l-157.7, 92.2l-169.5-281c17.601-11.7, 29.301-31.8, 29.301-54.5c0-36.1-29.301-65.4-65.4-65.4s-65.4, 29.3-65.4, 65.4c0, 22.8, 11.601, 42.8, 29.301, 54.5l-169.5, 281l-157.7-92.2c2-6.3, 3.2-13.1, 3.2-20.1c0-36.1-29.3-65.4-65.4-65.4c-36.2, 0-65.5, 29.3-65.5, 65.4S29.3, 417.85, 65.4, 417.85z"/>
					</g>
				</svg>`;
	            default:
	                if (!IconElement_1.isValidIconName(iconName))
	                    console.error(`Invalid icon name= '${Object.keys(IconNames).join(", ")}'`);
	                exhaustiveFail(iconName);
	                return hyperHTML.wire() ``;
	        }
	    }
	    onIconNameChanged(_attrName, _oldVal, newVal) {
	        if (IconElement_1.isValidIconName(newVal)) {
	            this.iconSvg = IconElement_1.getIcon(newVal);
	            this.invalidate();
	        }
	    }
	    // Watch attributes
	    static isValidIconName(iconName) {
	        return iconName in IconNames;
	    }
	    render() {
	        return this.html `${this.iconSvg}`;
	    }
	};
	__decorate$1([
	    Attribute({ attributeName: "name" })
	], IconElement.prototype, "iconName", void 0);
	__decorate$1([
	    Watch({ attributeName: "name" })
	], IconElement.prototype, "onIconNameChanged", null);
	IconElement = IconElement_1 = __decorate$1([
	    Component({ tag: "icon-el" })
	], IconElement);

	var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("score-el", {
	    position: "relative",
	    display: "block",
	    overflow: "hidden",
	    border: `0.15em solid ${theme.lightTextColor}`,
	    borderRadius: "0.15em",
	    $nest: {
	        "& > div": {
	            position: "absolute",
	            top: 0,
	            left: 0,
	            height: "100%",
	            width: "100%",
	        },
	        "& icon-el": {
	            padding: "0 0.3em 0.15em 0.3em",
	        },
	        "& > .left-value": {
	            float: "left",
	            position: "relative",
	            fill: theme.lightTextColor,
	        },
	        "& > .right-value": {
	            float: "right",
	            position: "relative",
	            fill: theme.lightTextColor,
	        },
	        "& > .center": {
	            position: "absolute",
	            top: 0,
	            left: "50%",
	            width: "0.1em",
	            height: "100%",
	            backgroundColor: theme.lightTextColor,
	        },
	        "& > .male": {
	            backgroundColor: theme.malePrimaryColor,
	        },
	        "& > .female": {
	            backgroundColor: theme.femalePrimaryColor,
	        },
	    }
	});
	let ScoreElement = class ScoreElement extends HyperElement {
	    render() {
	        const leftValue = this.gender
	            ? this.gender === Gender.Male
	                ? this.maleScore || 0
	                : this.femaleScore || 0
	            : 0;
	        const rightValue = this.gender
	            ? this.gender === Gender.Male
	                ? this.femaleScore || 0
	                : this.maleScore || 0
	            : 0;
	        // Increment left
	        const lastLeftValue = this.lastLeftValue = this.lastLeftValue || leftValue;
	        const currentLeftValue = leftValue;
	        let hasNewLeftValue = true;
	        if (lastLeftValue < currentLeftValue)
	            this.lastLeftValue += 1;
	        else if (lastLeftValue > currentLeftValue)
	            this.lastLeftValue -= 1;
	        else
	            hasNewLeftValue = false;
	        // Increment right
	        const lastRightValue = this.lastRightValue = this.lastRightValue || rightValue;
	        const currentRightValue = rightValue;
	        let hasNewRightValue = true;
	        if (lastRightValue < currentRightValue)
	            this.lastRightValue += 1;
	        else if (lastRightValue > currentRightValue)
	            this.lastRightValue -= 1;
	        else
	            hasNewRightValue = false;
	        const totalValue = this.lastLeftValue + this.lastRightValue;
	        const rightPercent = this.lastRightValue * 100 / totalValue;
	        // RAF
	        if (hasNewLeftValue || hasNewRightValue)
	            requestAnimationFrame(() => this.render());
	        const leftGender = this.gender
	            ? this.gender === Gender.Male
	                ? "male"
	                : "female"
	            : "";
	        const rightGender = this.gender
	            ? this.gender === Gender.Male
	                ? "female"
	                : "male"
	            : "";
	        return this.html `
			<div class="${`left ${leftGender}`}"></div>
			<div class="${`right ${rightGender}`}" style="${`transform: translateX(${100 - rightPercent}%)`}"></div>
			<div class="center"></div>

			<span class="left-value"><icon-el name="${leftGender}"/>${this.lastLeftValue}</span>
			<span class="right-value">${this.lastRightValue}<icon-el name="${rightGender}"/></span>
		`;
	    }
	};
	__decorate$2([
	    Attribute({ type: "number", attributeName: "female-score" })
	], ScoreElement.prototype, "femaleScore", void 0);
	__decorate$2([
	    Attribute({ type: "number", attributeName: "male-score" })
	], ScoreElement.prototype, "maleScore", void 0);
	__decorate$2([
	    Attribute({ type: "string", attributeName: "gender" })
	], ScoreElement.prototype, "gender", void 0);
	__decorate$2([
	    Watch({ attributeName: ["female-score", "male-score", "gender"] })
	], ScoreElement.prototype, "render", null);
	ScoreElement = __decorate$2([
	    Component({ tag: "score-el" })
	], ScoreElement);

	var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	let OverviewPageElement = class OverviewPageElement extends HyperElement {
	    render() {
	        return this.html `
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<h1>Overzicht:</h1>
				<ol>
					${game.questions.map((question, index) => hyperHTML.wire(this, `id:${index}`) `
						<li>${question.title}</li>
					`)}
				</ol>
			</div>
		</gender-bg-el>
		`;
	    }
	};
	OverviewPageElement = __decorate$3([
	    Component({ tag: "overview-page" })
	], OverviewPageElement);

	const scoreState = observableState({
	    value: undefined,
	    state: "not-loaded" /* NotLoaded */,
	});
	function setScore(data, stateAndValue) {
	    return changeState(data, `setScore: ${getStateAndValueMessage(stateAndValue)}`, data => {
	        data.state = stateAndValue.state;
	        data.value = stateAndValue.value;
	    });
	}

	const playersWatcher = new BalancedScope({
	    onStart: () => {
	        setPlayers(playersState, { state: "loading" /* Loading */ });
	        return database.watchPlayers(players => {
	            const filteredPlayers = players.filter(p => !isQuizmaster(p));
	            setPlayers(playersState, { state: "loaded" /* Loaded */, value: filteredPlayers });
	        }).dispose;
	    },
	    onEnd: unsubscribe => {
	        unsubscribe();
	        setPlayers(playersState, { state: "not-loaded" /* NotLoaded */ });
	    }
	});
	const scoreWatcher = new BalancedScope({
	    onStart: () => {
	        setScore(scoreState, { state: "loading" /* Loading */ });
	        return database.watchScore(score => {
	            setScore(scoreState, { state: "loaded" /* Loaded */, value: score });
	        }).dispose;
	    },
	    onEnd: unsubscribe => {
	        unsubscribe();
	        setScore(scoreState, { state: "not-loaded" /* NotLoaded */ });
	    }
	});
	const routeWatcher = new BalancedScope({
	    onStart: () => {
	        setRoute(routeState, { state: "loading" /* Loading */ });
	        return database.watchRoute((route, questionNumber) => {
	            setRoute(routeState, { state: "loaded" /* Loaded */, value: {
	                    page: route,
	                    questionNumber
	                } }); // slice because tests use an observable array
	        }).dispose;
	    },
	    onEnd: unsubscribe => {
	        unsubscribe();
	        setRoute(routeState, { state: "not-loaded" /* NotLoaded */ });
	    }
	});
	const isConnectedWatcher = new BalancedScope({
	    onStart: () => {
	        setFirebaseConnection(firebaseConnectionState, { state: "loading" /* Loading */ });
	        return watchConnection(isConnected => {
	            setFirebaseConnection(firebaseConnectionState, { state: "loaded" /* Loaded */, value: isConnected });
	        }).dispose;
	    },
	    onEnd: unsubscribe => {
	        unsubscribe();
	        setFirebaseConnection(firebaseConnectionState, { state: "not-loaded" /* NotLoaded */ });
	    }
	});
	/*
	export function playerBetsWatcher(questionNumber: number) {

	    if (playerBetsWatchers[questionNumber]) return questionNumber[questionNumber];

	    // returning a new BalancedScope defeeds the purpose
	    // Hold it in a map
	    return questionNumber[questionNumber] = new BalancedScope({
	        onStart: () => {
	            changePlayersBet(questionNumber, {state: LoadState.Loading});
	            return database.watchPlayerBets(questionNumber, bets => {
	                changePlayersBet(questionNumber, {state: LoadState.Loaded, value: bets});
	            }).dispose;
	        },
	        onEnd: unsubscribe => {
	            unsubscribe();
	            delete questionNumber[questionNumber];
	            changePlayersBet(questionNumber, undefined);
	        }
	    });
	}*/
	/*
	return typeof questionNumber === "number"
	? database.watchPlayerBets(questionNumber, bets => {
	    playerIds = Object.keys(bets || {}).filter(UserId.isValid) as UserId[];
	    updateEl();
	}).dispose
	: () => undefined;*/
	whenStatePropUsed(playersState, "Get players from firebase...", "value", () => playersWatcher.start());
	whenStatePropUsed(routeState, "Watch route changes", "value", () => routeWatcher.start());
	whenStatePropUsed(firebaseConnectionState, "Watch firebase connection", "value", () => isConnectedWatcher.start());

	const scoreController = logController(function scoreController(scoreElement) {
	    function updateScore() {
	        const score = scoreState.value;
	        scoreElement.maleScore = score ? score.male : 0;
	        scoreElement.femaleScore = score ? score.female : 0;
	    }
	    function updateScoreGender() {
	        scoreElement.gender = loggedOnPlayerState.value
	            ? loggedOnPlayerState.value.gender
	            : undefined;
	    }
	    // TODO: Use Score HOOK
	    const unsubscribeScore = scoreWatcher.start();
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(updateScoreGender),
	        reRunOnStateChange(updateScore),
	    ]);
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeScore();
	        }
	    };
	});

	const overviewPageController = logController(function overviewPageController(overviewPageElement) {
	    const unsubscribeBackground = genderBackgroundController(overviewPageElement.querySelector("gender-bg-el")).dispose;
	    const unsubscribeScore = scoreController(overviewPageElement.querySelector("score-el")).dispose;
	    return {
	        dispose: () => {
	            unsubscribeBackground();
	            unsubscribeScore();
	        }
	    };
	});

	var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("player-el", {
	    $nest: {
	        "&[is-me] > button": {
	            animationDuration: "2s",
	            animationIterationCount: "infinite",
	            animationName: lib_12({
	                "0%": { backgroundColor: "rgba(0, 0, 0, 0.2)" },
	                "50%": { backgroundColor: "rgba(0, 0, 0, 0.25)" },
	                "100%": { backgroundColor: "rgba(0, 0, 0, 0.2)" },
	            })
	        },
	        "> button": {
	            fontFamily: theme.fontFamily,
	            fontSize: "1rem",
	            display: "inline-block",
	            marginTop: "0.3rem",
	            marginBottom: "0.3rem",
	            margin: "0.5rem",
	            padding: "0.5rem",
	            borderRadius: "1rem",
	            border: "none",
	            color: "rgba(255,255,255,0.8)",
	            backgroundColor: "rgba(0, 0, 0, 0.1)",
	        },
	        "> button:focus": {
	            outline: "none"
	        }
	    }
	});
	let PlayerElement = class PlayerElement extends HyperElement {
	    render() {
	        return this.html `<button>
			${this.name}
		</button>`;
	    }
	};
	__decorate$4([
	    Attribute()
	], PlayerElement.prototype, "name", void 0);
	__decorate$4([
	    Attribute({
	        attributeName: "is-me",
	        type: "boolean"
	    })
	], PlayerElement.prototype, "isMe", void 0);
	__decorate$4([
	    Watch({
	        attributeName: ["name", "is-me"]
	    })
	], PlayerElement.prototype, "render", null);
	PlayerElement = __decorate$4([
	    Component({ tag: "player-el" })
	], PlayerElement);

	var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("players-page", {
	    // Full page
	    position: "absolute",
	    left: 0,
	    top: 0,
	    right: 0,
	    bottom: 0,
	    $nest: {
	        "& table": {
	            borderCollapse: "collapse",
	            minHeight: "100%",
	            height: "100%",
	            width: "100%",
	        },
	        "& .title": {
	            height: "8rem",
	            color: theme.lightColor,
	            opacity: 0.25,
	            textAlign: "center",
	            margin: "0 auto",
	            marginBottom: 0,
	            fontFamily: theme.fontFamily,
	            fontSize: "6rem",
	            fill: theme.lightColor,
	        },
	        "& .vs": {
	            position: "absolute",
	            top: "2.8rem",
	            left: "50%",
	            color: theme.lightColor,
	            opacity: 0.25,
	            fontFamily: `Condiment, ${theme.fontFamily}`,
	            fontSize: "3rem",
	            fontWeight: "bold",
	            animationDuration: "3s",
	            animationIterationCount: "infinite",
	            animationTimingFunction: "ease-in-out",
	            animationName: lib_12({
	                "0%": { transform: "translateX(-50%) scale(1)" },
	                "1%": { transform: "translateX(-50%) scale(1.3) skewX(-8deg)" },
	                "3%": { transform: "translateX(-50%) scale(1) skewX(-1deg)" },
	                "10%": { transform: "translateX(-50%) scale(1) skewX(1deg)" },
	                "11%": { transform: "translateX(-50%) scale(1.2) skewY(5deg)" },
	                "13%": { transform: "translateX(-50%) scale(1)" },
	                "100%": { transform: "translateX(-50%) scale(1)" },
	            })
	        },
	        "& .loading": {
	            color: theme.lightColor,
	            fontFamily: theme.fontFamily,
	            fontSize: "1rem",
	            opacity: 0,
	            animationDuration: "500ms",
	            animationDelay: "1s",
	            animationFillMode: "forwards",
	            animationName: lib_12({
	                "0%": {
	                    opacity: 0
	                },
	                "100%": {
	                    opacity: 1
	                }
	            })
	        },
	        "& .male": {
	            backgroundImage: "url('images/bg.png')",
	            width: "50%",
	            verticalAlign: "top",
	            paddingTop: 6,
	            backgroundColor: theme.malePrimaryColor,
	            textAlign: "center",
	            overflow: "hidden",
	            $nest: {
	                "& icon-el": {
	                    transformOrigin: "42% 58%",
	                    animationDuration: "1s",
	                    animationIterationCount: "infinite",
	                    animationName: lib_12({
	                        "0%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
	                        "50%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(5deg)" },
	                        "100%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
	                    })
	                }
	            }
	        },
	        "& .female": {
	            backgroundImage: "url('images/bg.png')",
	            width: "50%",
	            verticalAlign: "top",
	            paddingTop: 6,
	            backgroundColor: theme.femalePrimaryColor,
	            textAlign: "center",
	            overflow: "hidden",
	            $nest: {
	                "& icon-el": {
	                    transformOrigin: "50% 36%",
	                    animationDuration: "5s",
	                    animationIterationCount: "infinite",
	                    animationTimingFunction: "ease-in-out",
	                    animationName: lib_12({
	                        "0%": { transform: "rotate(-10deg)" },
	                        "50%": { transform: "rotate(10deg)" },
	                        "100%": { transform: "rotate(-10deg)" },
	                    })
	                }
	            }
	        }
	    }
	});
	let PlayersPageElement = class PlayersPageElement extends HyperElement {
	    render() {
	        const players = this.players ? this.players.slice(0) : [];
	        players.sort((a, b) => a.name > b.name ? 1 : -1);
	        const maleEls = players
	            .filter(p => p.gender === Gender.Male && p.isOnline())
	            .map(p => hyperHTML.wire(this, `:player-${p.id}`) `
				<player-el name="${p.name}" isMe="${!!this.loggedOnUser && (this.loggedOnUser.id === p.id)}"/>
			`);
	        const femaleEls = players
	            .filter(p => p.gender === Gender.Female && p.isOnline())
	            .map(p => hyperHTML.wire(this, `:player-${p.id}`) `
				<player-el name="${p.name}" isMe="${!!this.loggedOnUser && (this.loggedOnUser.id === p.id)}"/>
			`);
	        const loadingEl = () => this.isLoading ? hyperHTML.wire() `<span class="loading">Loading...</span>` : undefined;
	        return this.html `
			<table><tr>
				<td class="male">
					<div class="title"><icon-el name="male"/></div>
					<div>${loadingEl() || maleEls}</div>
				</td>
				<td class="female">
					<div class="title"><icon-el name="female"/></div>
					<div>${loadingEl() || femaleEls}</div>
				</td>
			</tr></table>
			<div class="vs">VS</div>
		`;
	    }
	};
	__decorate$5([
	    Property()
	], PlayersPageElement.prototype, "players", void 0);
	__decorate$5([
	    Property()
	], PlayersPageElement.prototype, "loggedOnUser", void 0);
	__decorate$5([
	    Property()
	], PlayersPageElement.prototype, "isLoading", void 0);
	PlayersPageElement = __decorate$5([
	    Component({ tag: "players-page" })
	], PlayersPageElement);

	const joinController = logController(function joinController(joinElement) {
	    function updateButtonText() {
	        const loggedOnPlayerLoadState = loggedOnPlayerState ? loggedOnPlayerState.state : "not-loaded" /* NotLoaded */;
	        if (loggedOnPlayerLoadState === "loading" /* Loading */) {
	            joinElement.buttonText = "Connecting...";
	        }
	        else if (loggedOnPlayerLoadState === "loaded" /* Loaded */ && (loggedOnPlayerState.value)) {
	            joinElement.buttonText = "Connected";
	        }
	        else {
	            joinElement.buttonText = "Ik wil mee spelen!";
	            joinElement.focus();
	        }
	    }
	    function updateJoinButton() {
	        joinElement.hide = !!loggedOnPlayerState.value || logOnPopupState.isOpen;
	        updateButtonText();
	    }
	    const unsubscribeAutorun = reRunOnStateChange(updateJoinButton);
	    // Handle View events
	    //--------------------
	    const unsubscribeJoinClick = subscribeToEvent(joinElement, "join-el-click", () => {
	        openLogOnPopup(logOnPopupState);
	    });
	    // Auto Login?
	    const userName = localStorage.getItem("userName");
	    const gender = localStorage.getItem("gender");
	    if (UserName.isValid(userName) && GenderHelper.isValid(gender)) {
	        try {
	            joinElement.hide = true;
	            logOnAsync({
	                name: UserName.ensure(userName),
	                gender: GenderHelper.ensure(gender)
	            });
	        }
	        catch (e) {
	            joinElement.hide = false;
	        }
	    }
	    else {
	        joinElement.hide = false;
	    }
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeJoinClick();
	        }
	    };
	});

	const playersPageController = logController(function playersPageController(playersPageElement) {
	    const unsubscribeJoinButton = joinController(assert(document.querySelector("join-el"))).dispose;
	    function scrollToMe() {
	        if (!loggedOnPlayerState || !loggedOnPlayerState.value)
	            return false;
	        const playerEl = playersPageElement.querySelector(`player-el[name='${loggedOnPlayerState.value.name}']`);
	        if (playerEl)
	            playerEl.scrollIntoView({ behavior: "smooth" });
	        return !!playerEl;
	    }
	    // Set View Properties
	    let shouldScrollToMe = false;
	    // Update players
	    function updatePlayers() {
	        playersPageElement.isLoading = (playersState.state === "loading" /* Loading */);
	        playersPageElement.players = playersState.value;
	        // Update after loggedOnPlayer should scroll to me
	        if (shouldScrollToMe) {
	            scrollToMe();
	            shouldScrollToMe = false;
	        }
	    }
	    // Watch Loggedon Player
	    function updateLoggedOnPlayerOnPlayersPage() {
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        playersPageElement.loggedOnUser = loggedOnPlayer;
	        // Scroll me in view
	        if (loggedOnPlayer) {
	            shouldScrollToMe = !scrollToMe();
	        }
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(updateLoggedOnPlayerOnPlayersPage),
	        reRunOnStateChange(updatePlayers),
	    ]);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	            unsubscribeJoinButton();
	        }
	    };
	});

	const transitionDuration = "200ms";
	function focusStyle() {
	    const props = {
	        $nest: {
	            "&:focus": {
	                outline: "none",
	                borderColor: "orange",
	            },
	        }
	    };
	    return props;
	}
	function clickableStyle() {
	    const focus = focusStyle();
	    const props = Object.assign({}, focus, { transitionDuration, transitionProperty: "transform", cursor: "pointer", $nest: Object.assign({}, focus.$nest, { "&:active": {
	                transform: "scale(0.9)",
	            } }) });
	    return props;
	}
	function buttonStyle() {
	    const clickable = clickableStyle();
	    const props = Object.assign({}, clickable, { fontFamily: theme.fontFamily, fontSize: "1rem", color: theme.lightColor, backgroundColor: theme.greyColor, border: "0.1rem solid rgba(0, 0, 0, 0.2)", padding: "0.5rem 1rem", borderRadius: "0.25rem", $nest: Object.assign({}, clickable.$nest, { "&:disabled": {
	                backgroundColor: `${theme.lightGreyColor} !important`,
	            } }) });
	    return props;
	}

	var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("bet-page", {
	    // Full page
	    position: "absolute",
	    left: 0,
	    top: 0,
	    right: 0,
	    bottom: 0,
	    $nest: {
	        "& .question-title": {
	            fontSize: "2rem",
	        },
	        "& player-el > button": Object.assign({}, clickableStyle(), { "-webkit-tap-highlight-color": "transparent", backgroundColor: theme.lightColor, color: theme.darkTextColor, boxShadow: theme.boxShadow }),
	        "& player-el > button:focus": {
	            color: "orange",
	        },
	        "& player-el.selected > button": {
	            backgroundColor: "orange",
	            color: theme.lightTextColor,
	        },
	        "& .points": {
	            display: "flex",
	            $nest: {
	                "& > button": Object.assign({}, buttonStyle(), { "-webkit-tap-highlight-color": "transparent", width: "100%", border: "none", backgroundColor: theme.lightColor, color: theme.darkTextColor, fontSize: "1rem", margin: "0.5rem", padding: "0.5rem", boxShadow: theme.boxShadow, borderRadius: "1rem" }),
	                "& > button.selected": {
	                    backgroundColor: "orange",
	                    color: theme.lightTextColor,
	                },
	            }
	        }
	    }
	});
	let BetPageElement = class BetPageElement extends HyperElement {
	    render() {
	        const myTeamPlayers = (this.players || [])
	            .map(p => hyperHTML.wire(this, `:player-${p.id}`) `
				<player-el name="${p.name}" class="${p.id === this.selectedPlayerId ? "selected" : ""}" onclick=${() => this.selectedPlayerId = p.id}/>
			`);
	        return this.html `
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<p class="please-bet">Gelieve in te zetten... ${this.secondsRemaining !== undefined ? `${this.secondsRemaining}s` : ""}</p>
				<div class="question-title">${(this.questionNumber || 0) + 1}. ${this.questionTitle}</div>

				<p class="choose-player">Kies speler:</p>
				<div class="players">
					${myTeamPlayers}
				</div>

				<p class="choose-points">Inzet:</p>
				<div class="points">
					<button onclick=${() => { this.selectedBet = 0.05; }} class="${this.selectedBet === 0.05 ? "selected" : ""}">5%</button>
					<button onclick=${() => { this.selectedBet = 0.1; }} class="${this.selectedBet === 0.1 ? "selected" : ""}">10%</button>
					<button onclick=${() => { this.selectedBet = 0.15; }} class="${this.selectedBet === 0.15 ? "selected" : ""}">15%</button>
				</div>

				<div>
					${this.enemyScore && this.selectedBet ? `winst: +${Math.floor(this.enemyScore * this.selectedBet)} punten, ` : ""}
					${this.ourScore && this.selectedBet ? `verlies: -${Math.floor(this.ourScore * this.selectedBet)} punten.` : ""}
				</div>

			</div>
		</gender-bg-el>

		`;
	    }
	};
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "secondsRemaining", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "questionNumber", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "questionTitle", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "players", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "selectedPlayerId", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "selectedBet", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "ourScore", void 0);
	__decorate$6([
	    Property()
	], BetPageElement.prototype, "enemyScore", void 0);
	BetPageElement = __decorate$6([
	    Component({ tag: "bet-page" })
	], BetPageElement);

	function vibrate(pattern) {
	    // https://www.chromestatus.com/feature/5644273861001216
	    try {
	        if (navigator && navigator.vibrate)
	            navigator.vibrate(pattern);
	    }
	    catch (e) {
	        // Some browsers don't allow vibrate when page not active
	    }
	}
	const vibrationController = logController(function vibrationController() {
	    const unsubscribeReaction = reaction$$1(
	    // Only check route when loaded, else when we use route, it will start requesting the route from the database
	    () => routeState.state === "loaded" /* Loaded */
	        ? routeState.value
	        : undefined, () => {
	        vibrate(20);
	    }, {
	        name: "Vibrate on route change",
	    });
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeReaction();
	        }
	    };
	});

	var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const betPageController = logController(function betPageController(betPageElement) {
	    const unsubscribeBackground = genderBackgroundController(betPageElement.querySelector("gender-bg-el")).dispose;
	    const unsubscribeScore = scoreController(betPageElement.querySelector("score-el")).dispose;
	    let unsubscribeCountDown;
	    // TODO: watch currentbet
	    function startCountDown() {
	        betPageElement.secondsRemaining = typeof betPageElement.secondsRemaining !== "number"
	            ? 10
	            : Math.max(betPageElement.secondsRemaining - 1, 0);
	        let intervalId = window.setInterval(() => __awaiter$8(this, void 0, void 0, function* () {
	            let secondsRemaining = typeof betPageElement.secondsRemaining !== "number" ? 10 : betPageElement.secondsRemaining;
	            betPageElement.secondsRemaining = Math.max(--secondsRemaining, 0);
	            // Vibrate
	            vibrate(secondsRemaining > 3 ? 50 :
	                secondsRemaining > 0 ? 100 :
	                    600);
	            // Set interval
	            if (secondsRemaining <= 0) { // Times up
	                const teamPlayers = loggedOnPlayerState.value
	                    ? getTeamPlayers(loggedOnPlayerState.value.gender)
	                    : [];
	                if (loggedOnPlayerState &&
	                    loggedOnPlayerState.value && // still logged on
	                    routeState &&
	                    routeState.value &&
	                    routeState.value.page === "bet" && // still on bet page
	                    teamPlayers.length > 0 // players needed for storing random player
	                ) {
	                    // Store bet
	                    yield setMyBet(loggedOnPlayerState.value.id, routeState.value.questionNumber, loggedOnPlayerState.value.gender, betPageElement.selectedPlayerId || randomPlayer(teamPlayers).id, betPageElement.selectedBet || 0.15);
	                    // Navigate to next page
	                    if (routeState.value) {
	                        const questionNumber = routeState.value.questionNumber;
	                        setRoute(routeState, {
	                            state: "loaded" /* Loaded */,
	                            value: {
	                                page: "bet-wait",
	                                questionNumber
	                            }
	                        });
	                    }
	                }
	                else {
	                    // only unsubscribe if bet is stored
	                    unsubscribe();
	                }
	            }
	        }), 1000);
	        const unsubscribe = () => {
	            if (intervalId) {
	                betPageElement.secondsRemaining = undefined;
	                clearInterval(intervalId);
	                intervalId = 0;
	            }
	        };
	        return unsubscribe;
	    }
	    function getTeamPlayers(gender) {
	        const players = playersState.value ? playersState.value.slice(0) : [];
	        players.sort((a, b) => a.name > b.name ? 1 : -1);
	        return players && gender
	            ? players.filter(p => p.gender === gender && // Same gender
	                p.isOnline(60) // Don't show when to long offline
	            )
	            : [];
	    }
	    function randomPlayer(players) {
	        return players.length > 0
	            ? players[Math.floor(Math.random() * players.length)]
	            : undefined;
	    }
	    function updateBetPageElement() {
	        const page = routeState.value && routeState.value.page || "bet";
	        const questionNumber = routeState.value && routeState.value.questionNumber || 0;
	        const question = game.questions[questionNumber];
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        const gender = loggedOnPlayer ? loggedOnPlayer.gender : undefined;
	        const teamPlayers = getTeamPlayers(gender);
	        // When page changed, don't update UI
	        if (page !== "bet")
	            return;
	        // Countdown for quizmaster
	        // only start counting if players are available
	        if (teamPlayers.length === 0 || isQuizmaster(loggedOnPlayer)) {
	            if (unsubscribeCountDown) {
	                unsubscribeCountDown();
	                unsubscribeCountDown = undefined;
	            }
	        }
	        // Countdown
	        else {
	            if (!unsubscribeCountDown)
	                unsubscribeCountDown = startCountDown();
	        }
	        const score = scoreState.value;
	        betPageElement.players = teamPlayers;
	        betPageElement.ourScore = score && gender
	            ? gender === Gender.Male
	                ? score.male
	                : score.female
	            : undefined;
	        betPageElement.enemyScore = score && gender
	            ? gender === Gender.Male
	                ? score.female
	                : score.male
	            : undefined;
	        betPageElement.questionNumber = questionNumber;
	        betPageElement.questionTitle = question.title || undefined;
	        // Set defaults
	        if (!betPageElement.selectedBet)
	            betPageElement.selectedBet = 0.15;
	        if (!betPageElement.selectedPlayerId && teamPlayers && teamPlayers.length > 0)
	            betPageElement.selectedPlayerId = randomPlayer(teamPlayers).id;
	    }
	    const unsubscribeAutorun = reRunOnStateChange(updateBetPageElement);
	    return {
	        dispose: () => {
	            unsubscribeBackground();
	            unsubscribeScore();
	            unsubscribeAutorun();
	            if (unsubscribeCountDown)
	                unsubscribeCountDown();
	        }
	    };
	});

	var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("bet-wait-page", {
	    $nest: {
	        "& player-el.selected > button": {
	            backgroundColor: "orange",
	            color: theme.lightTextColor,
	        },
	    }
	});
	let BetWaitPageElement = class BetWaitPageElement extends HyperElement {
	    render() {
	        return this.html `
		<gender-bg-el>
			<div class="page">
				<score-el></score-el>
				<p class="wait-title">Wachten op inzet van andere spelers...</p>
				<div>
				${this.players
            ? this.players.length > 0
                ? this.players.map(p => hyperHTML.wire(this, `:player-${p.id}`) `
							<player-el name="${p.name}" class="${this.playerIds && this.playerIds.some(pid => p.id === pid) ? "selected" : ""}" />
						`)
                : "Geen spelers."
            : "Loading..."}
				</div>
			</div>
		</gender-bg-el>
		`;
	    }
	};
	__decorate$7([
	    Property()
	], BetWaitPageElement.prototype, "players", void 0);
	__decorate$7([
	    Property()
	], BetWaitPageElement.prototype, "playerIds", void 0);
	BetWaitPageElement = __decorate$7([
	    Component({ tag: "bet-wait-page" })
	], BetWaitPageElement);

	const betWaitPageController = logController(function betWaitPageController(betWaitPageElement) {
	    const getQuestionNumber = () => routeState.value ? routeState.value.questionNumber || 0 : undefined;
	    let questionNumber = getQuestionNumber();
	    let playerIds = [];
	    const unsubscribeBackground = genderBackgroundController(betWaitPageElement.querySelector("gender-bg-el")).dispose;
	    const unsubscribeScore = scoreController(betWaitPageElement.querySelector("score-el")).dispose;
	    const questionBets = subscribeWhenChanged({
	        subscribe: () => {
	            return typeof questionNumber === "number"
	                ? database.watchPlayerBets(questionNumber, bets => {
	                    playerIds = Object.keys(bets || {}).filter(UserId.isValid);
	                    updatePlayers();
	                }).dispose
	                : () => undefined;
	        },
	        getChangeId: () => `${getQuestionNumber()}`
	    });
	    function betWaitPageRouteWatcher() {
	        questionNumber = getQuestionNumber();
	        questionBets.validate();
	    }
	    // Update Players
	    const unsubscribeAutoRun = combineUnsubscribes([
	        reRunOnStateChange(betWaitPageRouteWatcher),
	        reRunOnStateChange(updatePlayers),
	    ]);
	    questionBets.validate();
	    function updatePlayers() {
	        betWaitPageElement.players = playersState.value ? playersState.value.filter(p => p.isOnline()) : undefined;
	        betWaitPageElement.playerIds = playerIds;
	    }
	    function subscribeWhenChanged(options) {
	        const { subscribe, getChangeId } = options;
	        let lastId;
	        let unsubscribe;
	        const result = {
	            //Something changed, check if new subscription needed
	            validate: () => {
	                const id = getChangeId();
	                if (id === lastId)
	                    return; // same data, skip
	                lastId = id;
	                result.subscribe();
	            },
	            subscribe: () => {
	                result.unsubscribe();
	                unsubscribe = subscribe();
	            },
	            unsubscribe: () => {
	                if (unsubscribe)
	                    unsubscribe();
	            },
	        };
	        return result;
	    }
	    return {
	        dispose: () => {
	            unsubscribeBackground();
	            unsubscribeScore();
	            unsubscribeAutoRun();
	            questionBets.unsubscribe();
	        }
	    };
	});

	var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("bet-overview-page", {
	    // Full page
	    position: "absolute",
	    left: 0,
	    top: 0,
	    right: 0,
	    bottom: 0,
	    color: "#f8f8f8",
	    fontFamily: "Play, Verdana, Geneva, sans-serif",
	    fontSize: "1rem",
	    $nest: {
	        "& score-el": {
	            position: "absolute",
	            top: "1em",
	            left: "1em",
	            right: "1em",
	        },
	        "& table": {
	            borderCollapse: "collapse",
	            minHeight: "100%",
	            height: "100%",
	            width: "100%",
	        },
	        "& .title": {
	            height: "8rem",
	            color: theme.lightColor,
	            opacity: 0.25,
	            textAlign: "center",
	            margin: "0 auto",
	            marginBottom: 0,
	            fontFamily: theme.fontFamily,
	            fontSize: "6rem",
	            fill: theme.lightColor,
	            marginTop: "0.4em"
	        },
	        "& .loading": {
	            color: theme.lightColor,
	            fontFamily: theme.fontFamily,
	            fontSize: "1rem",
	            opacity: 0,
	            animationDuration: "500ms",
	            animationDelay: "1s",
	            animationFillMode: "forwards",
	            animationName: lib_12({
	                "0%": {
	                    opacity: 0
	                },
	                "100%": {
	                    opacity: 1
	                }
	            })
	        },
	        "& table .male": {
	            backgroundImage: "url('images/bg.png')",
	            width: "50%",
	            verticalAlign: "top",
	            paddingTop: 6,
	            backgroundColor: theme.malePrimaryColor,
	            textAlign: "center",
	            overflow: "hidden",
	            $nest: {
	                "& icon-el": {
	                    transformOrigin: "42% 58%",
	                    animationDuration: "1s",
	                    animationIterationCount: "infinite",
	                    animationName: lib_12({
	                        "0%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
	                        "50%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(5deg)" },
	                        "100%": { transform: "scale(0.86) translateY(-19%) translateX(8%) rotate(-5deg)" },
	                    })
	                }
	            }
	        },
	        "& table .female": {
	            backgroundImage: "url('images/bg.png')",
	            width: "50%",
	            verticalAlign: "top",
	            paddingTop: 6,
	            backgroundColor: theme.femalePrimaryColor,
	            textAlign: "center",
	            overflow: "hidden",
	            $nest: {
	                "& icon-el": {
	                    transformOrigin: "50% 36%",
	                    animationDuration: "5s",
	                    animationIterationCount: "infinite",
	                    animationTimingFunction: "ease-in-out",
	                    animationName: lib_12({
	                        "0%": { transform: "rotate(-10deg)" },
	                        "50%": { transform: "rotate(10deg)" },
	                        "100%": { transform: "rotate(-10deg)" },
	                    })
	                }
	            }
	        },
	        "& .bet-percent-title": {
	            fontFamily: theme.fontFamily,
	            fontSize: "1rem",
	            color: theme.lightTextColor,
	        },
	        "& .bet-percent-value": {
	            fontFamily: theme.fontFamily,
	            fontSize: "4rem",
	            color: theme.lightTextColor,
	            marginBottom: "1rem",
	        },
	        "& .bet-person": {
	            fontSize: "1.5rem",
	        },
	        "& .bet-title": {
	            fontFamily: theme.fontFamily,
	            fontSize: "1rem",
	            color: theme.lightTextColor,
	            paddingTop: "1rem",
	        },
	        "& .bet-value": {
	            fontFamily: theme.fontFamily,
	            fontSize: "2.5rem",
	            color: theme.lightTextColor,
	        },
	    }
	});
	let BetOverviewPageElement = class BetOverviewPageElement extends HyperElement {
	    render() {
	        /*
	        const myTeamPlayers = (this.players || [])
	            .map(p => hyperHTML.wire(this, `:player-${p.id}`)`
	                <player-el name="${p.name}" class="${p.id === this.selectedPlayerId ? "selected" : ""}" onclick=${() => this.selectedPlayerId = p.id}/>
	            `);
	*/
	        const myGender = this.myTeamGender || "male";
	        const otherGender = myGender === Gender.Male ? Gender.Female : Gender.Male;
	        const isLoading = !this.myTeamGender;
	        const loadingEl = () => isLoading ? hyperHTML.wire() `<span class="loading">Loading...</span>` : undefined;
	        return this.html `
			<score-el></score-el>
			<table><tr>
				<td class="${myGender}">
					<div class="title"><icon-el name="male"/></div>
					<div>${loadingEl()}</div>
					<div>
						<div class="bet-percent-value">${this.myTeamPercent || "?"}%</div>
						<div class="bet-person">${this.myTeamPlayerName || ""}</div>
						<div class="bet-title">speelt voor:</div>
						<div class="bet-value">${(this.myTeamProfit || 0) + (this.otherTeamLoss || 0)}p</div>
					</div>
				</td>
				<td class="${otherGender}">
					<div class="title"><icon-el name="female"/></div>
					<div>${loadingEl()}</div>
					<div>
						<div class="bet-percent-value">${this.otherTeamPercent || "?"}%</div>
						<div class="bet-person">${this.otherTeamPlayerName || ""}</div>
						<div class="bet-title">speelt voor:</div>
						<div class="bet-value">${(this.otherTeamProfit || 0) + (this.myTeamLoss || 0)}p</div>
					</div>
				</td>
			</tr></table>`;
	    }
	};
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "myTeamGender", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "myTeamPercent", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "myTeamProfit", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "myTeamLoss", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "myTeamPlayerName", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "otherTeamPercent", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "otherTeamProfit", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "otherTeamLoss", void 0);
	__decorate$8([
	    Property()
	], BetOverviewPageElement.prototype, "otherTeamPlayerName", void 0);
	BetOverviewPageElement = __decorate$8([
	    Component({ tag: "bet-overview-page" })
	], BetOverviewPageElement);

	const betOverviewPageController = logController(function betOverviewPageController(betOverviewPageElement) {
	    const unsubscribeScore = scoreWatcher.start();
	    const unsubscribeScoreController = scoreController(betOverviewPageElement.querySelector("score-el")).dispose;
	    let lastTeamBetId = "";
	    let unsubscribeTeamBets;
	    let lastTeamBets;
	    function updateOverviewPageElement() {
	        //const question = game.questions[questionNumber];
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        // Don't update when navigating away
	        if (routeState.value && routeState.value.page !== "bet-overview")
	            return;
	        const score = scoreState.value;
	        const myGender = loggedOnPlayer ? loggedOnPlayer.gender : undefined;
	        const myTeamScore = !score || !myGender ? undefined : myGender === Gender.Male ? score.male : score.female;
	        const myTeamRatio = lastTeamBets && myGender ? lastTeamBets[myGender].amount : undefined;
	        const myTeamPlayerId = lastTeamBets && myGender ? lastTeamBets[myGender].playerId : undefined;
	        const myTeamPlayer = playersState.value && myTeamPlayerId ? playersState.value.find(p => p.id === myTeamPlayerId) : undefined;
	        const otherGender = !myGender ? undefined : myGender === Gender.Male ? Gender.Female : Gender.Male;
	        const otherTeamScore = !score || !myGender ? undefined : myGender === Gender.Male ? score.female : score.male;
	        const otherTeamRatio = lastTeamBets && otherGender ? lastTeamBets[otherGender].amount : undefined;
	        const otherTeamPlayerId = lastTeamBets && otherGender ? lastTeamBets[otherGender].playerId : undefined;
	        const otherTeamPlayer = playersState.value && otherTeamPlayerId ? playersState.value.find(p => p.id === otherTeamPlayerId) : undefined;
	        betOverviewPageElement.myTeamGender = myGender;
	        betOverviewPageElement.myTeamPercent = myTeamRatio ? Math.round(myTeamRatio * 100).toString() : "";
	        betOverviewPageElement.myTeamLoss = myTeamScore && myTeamRatio ? Math.floor(myTeamScore * myTeamRatio) : 0;
	        betOverviewPageElement.myTeamProfit = otherTeamScore && myTeamRatio ? Math.floor(otherTeamScore * myTeamRatio) : 0;
	        betOverviewPageElement.myTeamPlayerName = myTeamPlayer ? myTeamPlayer.name : "";
	        betOverviewPageElement.otherTeamPercent = lastTeamBets && otherGender ? Math.round(lastTeamBets[otherGender].amount * 100).toString() : "";
	        betOverviewPageElement.otherTeamLoss = otherTeamScore && otherTeamRatio ? Math.floor(otherTeamScore * otherTeamRatio) : 0;
	        betOverviewPageElement.otherTeamProfit = myTeamScore && otherTeamRatio ? Math.floor(myTeamScore * otherTeamRatio) : 0;
	        betOverviewPageElement.otherTeamPlayerName = otherTeamPlayer ? otherTeamPlayer.name : "";
	    }
	    function watchTeamBets() {
	        const questionNumber = routeState.value && routeState.value.questionNumber || 0;
	        const currentMyBetId = `${questionNumber}`;
	        // Something changed?
	        if (lastTeamBetId === currentMyBetId)
	            return;
	        // Unsubscribe previous
	        if (unsubscribeTeamBets)
	            unsubscribeTeamBets();
	        // Start watching
	        const myTeamBetUnsubscribe = database.watchTeamBets(questionNumber, teamBets => {
	            lastTeamBets = teamBets;
	            updateOverviewPageElement();
	        }).dispose;
	        lastTeamBetId = currentMyBetId;
	        // Create nbew unsubscribe
	        unsubscribeTeamBets = () => {
	            myTeamBetUnsubscribe();
	            lastTeamBetId = "";
	        };
	    }
	    const unsubscribeAutorun = combineUnsubscribes([
	        reRunOnStateChange(updateOverviewPageElement),
	        reRunOnStateChange(watchTeamBets),
	    ]);
	    return {
	        dispose: () => {
	            unsubscribeScore();
	            unsubscribeScoreController();
	            unsubscribeAutorun();
	            if (unsubscribeTeamBets)
	                unsubscribeTeamBets();
	        }
	    };
	});

	var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("question-page", {
	    // Full page
	    position: "absolute",
	    left: 0,
	    top: 0,
	    right: 0,
	    bottom: 0,
	    $nest: {
	        "& score-el": {
	            position: "absolute",
	            top: "1em",
	            left: "1em",
	            right: "1em",
	        },
	        "& .question-title": {
	            paddingTop: "3rem",
	            paddingBottom: "1rem",
	            fontSize: "2rem",
	        },
	        "& .question-info": {
	            paddingTop: "1rem",
	            fontStyle: "italic",
	        },
	    }
	});
	let QuestionPageElement = class QuestionPageElement extends HyperElement {
	    render() {
	        return this.html `
			<gender-bg-el>
				<div class="page">
					<score-el></score-el>
					<div class="question-title">${(this.questionNumber || 0) + 1}. ${this.questionTitle}</div>
					<div class="question-description">${this.questionDescription}</div>
					<div class="question-info">${this.questionInfo}</div>
				</div>
			</gender-bg-el>`;
	    }
	};
	__decorate$9([
	    Property()
	], QuestionPageElement.prototype, "questionNumber", void 0);
	__decorate$9([
	    Property()
	], QuestionPageElement.prototype, "questionTitle", void 0);
	__decorate$9([
	    Property()
	], QuestionPageElement.prototype, "questionDescription", void 0);
	__decorate$9([
	    Property()
	], QuestionPageElement.prototype, "questionInfo", void 0);
	QuestionPageElement = __decorate$9([
	    Component({ tag: "question-page" })
	], QuestionPageElement);

	const questionPageController = logController(function questionPageController(questionPageElement) {
	    const unsubscribeBackground = genderBackgroundController(questionPageElement.querySelector("gender-bg-el")).dispose;
	    const unsubscribeScore = scoreController(questionPageElement.querySelector("score-el")).dispose;
	    // TODO: watch currentbet
	    function updateQuestionPageElement() {
	        const questionNumber = routeState.value && routeState.value.questionNumber || 0;
	        const question = game.questions[questionNumber];
	        const loggedOnPlayer = loggedOnPlayerState.value;
	        questionPageElement.questionNumber = questionNumber;
	        questionPageElement.questionTitle = question ? question.title : "";
	        questionPageElement.questionDescription = question ? question.description : "";
	        questionPageElement.questionInfo = question && isQuizmaster(loggedOnPlayer) ? question.info : "";
	    }
	    const unsubscribeAutorun = reRunOnStateChange(updateQuestionPageElement);
	    return {
	        dispose: () => {
	            unsubscribeAutorun();
	            unsubscribeBackground();
	            unsubscribeScore();
	        }
	    };
	});
	/*
	export interface IQuestionPlayersBet {
	    readonly [playerId: string]: IGenderBet | undefined;
	}

	export interface IQuestionsPlayersBet {
	    readonly [questionNumber: number]: LoadStateAndValue<IQuestionPlayersBet> | undefined;
	}*/

	const routerController = logController(function routerController(routerElement) {
	    let disposable;
	    let lastRoute;
	    function replaceRoute(el, controller) {
	        const animationDuration = 800;
	        // Remove current page
	        const currentPage = routerElement.firstChild;
	        const oldDisposable = disposable;
	        if (currentPage) {
	            currentPage.style.opacity = "0";
	            setTimeout(() => {
	                if (currentPage.parentNode)
	                    currentPage.parentNode.removeChild(currentPage);
	                // Unsubscribe old after new so overlap in BalancedScope
	                if (oldDisposable)
	                    oldDisposable.dispose();
	            }, animationDuration + 10);
	        }
	        // Add new Page
	        if (el) {
	            const newPage = document.createElement("div");
	            newPage.style.transitionDuration = `${animationDuration}ms`;
	            newPage.style.transitionProperty = "opacity";
	            newPage.style.opacity = "1";
	            newPage.appendChild(el);
	            routerElement.insertBefore(newPage, routerElement.firstChild);
	        }
	        disposable = controller ? controller() : undefined;
	    }
	    function updateRouteElement() {
	        const route = loggedOnPlayerState.value
	            ? routeState.value
	                ? routeState.value.page
	                : undefined
	            : undefined;
	        // Don't change while loading new route
	        if (routeState.state === "loading" /* Loading */)
	            return;
	        // Don't replace with the same route
	        if ((lastRoute) === (route || "players"))
	            return;
	        lastRoute = route || "players";
	        switch (route) {
	            case undefined:
	            case "players": {
	                const el = new PlayersPageElement();
	                replaceRoute(el, () => playersPageController(el));
	                break;
	            }
	            case "intro": {
	                const el = new IntroPageElement();
	                replaceRoute(el, () => introPageController(el));
	                break;
	            }
	            case "overview": {
	                const el = new OverviewPageElement();
	                replaceRoute(el, () => overviewPageController(el));
	                break;
	            }
	            case "bet": {
	                const el = new BetPageElement();
	                replaceRoute(el, () => betPageController(el));
	                break;
	            }
	            case "bet-wait": {
	                const el = new BetWaitPageElement();
	                replaceRoute(el, () => betWaitPageController(el));
	                break;
	            }
	            case "bet-overview": {
	                const el = new BetOverviewPageElement();
	                replaceRoute(el, () => betOverviewPageController(el));
	                break;
	            }
	            case "question": {
	                const el = new QuestionPageElement();
	                replaceRoute(el, () => questionPageController(el));
	                break;
	            }
	            default: {
	                exhaustiveFail(route);
	                break;
	            }
	        }
	    }
	    const unsubscribeAutorun = reRunOnStateChange(updateRouteElement);
	    // Unsubscribe
	    return {
	        dispose() {
	            unsubscribeAutorun();
	        }
	    };
	});

	var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	const animation = lib_12({
	    "0%": {
	        transform: "translateY(0)"
	    },
	    "80%": {
	        transform: "translateY(0)"
	    },
	    "90%": {
	        transform: "translateY(-1rem)"
	    },
	    "100%": {
	        transform: "translateY(0)"
	    }
	});
	lib_8("block-input", {
	    position: "fixed",
	    top: 0,
	    left: 0,
	    width: "100%",
	    height: "100%",
	    pointerEvents: "none",
	    backgroundColor: "rgba(255, 255, 255, 0.3)",
	    opacity: 0,
	    transitionProperty: "opacity",
	    transitionDuration: "1s",
	    $nest: {
	        "&.active": {
	            pointerEvents: "auto",
	        },
	        "&.visible": {
	            opacity: 1,
	        },
	        ".block-input__dot": {
	            width: "1rem",
	            height: "1rem",
	            backgroundColor: "rgba(0, 0, 0, 0.5)",
	            borderRadius: "50%",
	            position: "absolute",
	            top: "50%",
	            left: "50%",
	            animationName: animation,
	            animationIterationCount: "infinite",
	            animationTimingFunction: "ease-in-out",
	            animationDuration: "1s",
	        },
	        ".block-input__dot:nth-child(1)": {
	            marginLeft: "-2.5rem",
	            animationDelay: "-0.1s",
	        },
	        ".block-input__dot:nth-child(2)": {
	            marginLeft: "-0.5rem",
	        },
	        ".block-input__dot:nth-child(3)": {
	            marginLeft: "1.5rem",
	            animationDelay: "0.1s",
	        }
	    }
	});
	let BlockInputElement = class BlockInputElement extends HyperElement {
	    render() {
	        return this.html `
			<div class="block-input__dot"></div>
			<div class="block-input__dot"></div>
			<div class="block-input__dot"></div>
		`;
	    }
	};
	BlockInputElement = __decorate$a([
	    Component({ tag: "block-input" })
	], BlockInputElement);

	var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	const iconSize = 1.6;
	const transitionDuration$1 = "300ms";
	const fabSize = 3;
	const fabCircle = {
	    width: `${fabSize}rem`,
	    height: `${fabSize}rem`,
	    borderRadius: "50%",
	    border: "0.1rem solid #ffffff",
	    boxShadow: `${1 / 8}rem ${1 / 8}rem ${1 / 4}rem rgba(0, 0, 0, 0.2)`,
	};
	const focus = focusStyle();
	lib_8("fab-menu", {
	    $debugName: "fab",
	    position: "fixed",
	    left: "50%",
	    bottom: `${fabSize - 5}rem`,
	    transitionDuration: transitionDuration$1,
	    transitionProperty: "transform",
	    $nest: {
	        "& .fab": Object.assign({}, fabCircle, focus, { position: "absolute", top: 0, left: 0, 
	            // Make origin center
	            marginLeft: `-${fabSize / 2}rem`, marginTop: `-${fabSize / 2}rem`, backgroundColor: theme.lightColor, transitionDuration: transitionDuration$1, transitionProperty: "transform", fill: theme.greyColor, color: theme.greyColor, $nest: Object.assign({}, focus.$nest, { "&:active": {
	                    transform: "scale(0.9)",
	                    $nest: {
	                        "& span": {
	                            fill: theme.darkTextColor,
	                        }
	                    }
	                }, "icon-el": {
	                    fontSize: "1.5rem"
	                } }) }),
	        "& .fab-bg": Object.assign({}, fabCircle, { position: "absolute", top: 0, left: 0, width: "1rem", height: "1rem", 
	            // Make origin center
	            marginLeft: "-0.5rem", marginTop: "-0.5rem", opacity: 0.3, transitionDuration: transitionDuration$1, transitionProperty: "transform", backgroundColor: theme.lightColor, transitionTimingFunction: "ease-out" }),
	        "& .hamburger": {
	            position: "relative",
	            display: "inline-block",
	            width: `${iconSize}rem`,
	            height: `${iconSize}rem`,
	            marginTop: 2,
	        },
	        "& .hamburger span": {
	            display: "block",
	            position: "absolute",
	            height: `${iconSize * 0.2}rem`,
	            width: `${iconSize}rem`,
	            borderRadius: `${iconSize * 2}rem`,
	            background: theme.greyColor,
	            opacity: 1,
	            left: 0,
	            transform: "rotate(0)",
	            transition: `${transitionDuration$1} ease-in-out`,
	            $nest: {
	                "&:nth-child(1)": {
	                    top: 0
	                },
	                "&:nth-child(2), &:nth-child(3)": {
	                    top: `${iconSize * 0.4}rem`
	                },
	                "&:nth-child(4)": {
	                    top: `${iconSize * 0.8}rem`
	                }
	            }
	        },
	        "& .fab-buttons": {
	            opacity: 0,
	            pointerEvents: "none",
	            transitionDelay: transitionDuration$1,
	            transitionProperty: "opacity",
	        },
	        "&:not([hide])": {
	            transform: "translateY(-5rem)",
	        },
	        // When opened
	        "&[opened]": {
	            $nest: {
	                "& .hamburger span:nth-child(1)": {
	                    top: `${iconSize * 0.4}rem`,
	                    width: 0,
	                    left: `${iconSize * 0.5}rem`
	                },
	                "& .hamburger span:nth-child(4)": {
	                    top: `${iconSize * 0.4}rem`,
	                    width: 0,
	                    left: `${iconSize * 0.5}rem`
	                },
	                "& .hamburger span:nth-child(2)": {
	                    transform: "rotate(45deg)"
	                },
	                "& .hamburger span:nth-child(3)": {
	                    transform: "rotate(-45deg)"
	                },
	                "& .fab-bg": {
	                    transform: "scale(14.5)",
	                    transitionTimingFunction: "cubic-bezier(0.24, 1.14, 1, 1)",
	                },
	                "& .fab-buttons": {
	                    opacity: 1,
	                    pointerEvents: "auto",
	                    transitionDelay: "0s",
	                },
	                "& .fab-buttons .fab:nth-child(1)": {
	                    transform: "translate(-100%, -100%)",
	                    $nest: {
	                        "&:active": {
	                            transform: "translate(-100%, -100%) scale(0.9)",
	                            fill: theme.darkTextColor
	                        }
	                    }
	                },
	                "& .fab-buttons .fab:nth-child(2)": {
	                    transform: "translate(100%, -100%)",
	                    $nest: {
	                        "&:active": {
	                            transform: "translate(100%, -100%) scale(0.9)",
	                            fill: theme.darkTextColor
	                        }
	                    }
	                },
	            }
	        }
	    }
	});
	let FabMenuElement = class FabMenuElement extends HyperElement {
	    constructor() {
	        super();
	        this.loadSlots();
	        // bind methods to this
	        this.fabButtonClicked = this.fabButtonClicked.bind(this);
	        this.childButtonClicked = this.childButtonClicked.bind(this);
	    }
	    onAttributeOpenedChange(_attrName, _oldVal, _newVal) {
	        // TODO: test recursive loop?
	        // notify state is changed
	        const event = new CustomEvent("fab-menu-opened", {
	            detail: {
	                isOpen: !!this.isOpen
	            }, bubbles: false
	        });
	        this.dispatchEvent(event);
	    }
	    /** toggle open state */
	    fabButtonClicked(e) {
	        e.stopPropagation();
	        this.isOpen = !this.isOpen;
	    }
	    childButtonClicked(e) {
	        e.stopPropagation();
	        const event = new CustomEvent("fab-menu-click", {
	            detail: {
	                element: e.currentTarget,
	                index: parseInt(e.currentTarget.getAttribute("data-index") || "0", 10),
	            }, bubbles: false
	        });
	        this.dispatchEvent(event);
	    }
	    render() {
	        return this.html `
		<div class="fab-bg"></div>
		<div class="fab-buttons">${this.slots["fab-item"]
            ? this.slots["fab-item"].map((fabItem, index$$1) => hyperHTML.wire(this, `id:${index$$1}`) `<button class="fab fab-button" data-index="${index$$1}" onclick="${this.childButtonClicked}">${fabItem}</button>`)
            : ""}</div>
		<button class="fab" onclick=${this.fabButtonClicked}>
			<div class="hamburger">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</button>`;
	    }
	};
	__decorate$b([
	    Attribute({ attributeName: "opened", type: "boolean" })
	], FabMenuElement.prototype, "isOpen", void 0);
	__decorate$b([
	    Attribute({ attributeName: "hide", type: "boolean" })
	], FabMenuElement.prototype, "hide", void 0);
	__decorate$b([
	    Watch({ attributeName: "opened" })
	], FabMenuElement.prototype, "onAttributeOpenedChange", null);
	FabMenuElement = __decorate$b([
	    Component({ tag: "fab-menu" })
	], FabMenuElement);

	var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("gender-bg-el", {
	    position: "absolute",
	    width: "100%",
	    minHeight: "100%",
	    top: 0,
	    left: 0,
	    backgroundImage: "url(images/bg.png)",
	    $nest: {
	        "&[gender='male']": {
	            backgroundColor: theme.malePrimaryColor,
	        },
	        "&[gender='female']": {
	            backgroundColor: theme.femalePrimaryColor,
	        }
	    }
	});
	let GenderBackgroundElement = class GenderBackgroundElement extends HyperElement {
	    constructor() {
	        super();
	        this.loadSlots();
	    }
	    render() {
	        return this.html `${this.slots.default}`;
	    }
	};
	__decorate$c([
	    Attribute()
	], GenderBackgroundElement.prototype, "gender", void 0);
	GenderBackgroundElement = __decorate$c([
	    Component({ tag: "gender-bg-el" })
	], GenderBackgroundElement);

	var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	const transitionDuration$2 = "300ms";
	lib_8("join-el", {
	    position: "fixed",
	    left: "50%",
	    bottom: `${-5 + 2}rem`,
	    transitionDuration: transitionDuration$2,
	    transitionProperty: "transform",
	    $nest: {
	        "&:not([hide])": {
	            transform: "translateY(-5rem)",
	        },
	        button: Object.assign({}, buttonStyle(), { boxShadow: "0 0 2rem rgba(0, 0, 0, 0.5)" }),
	        div: {
	            display: "inline-block",
	            marginLeft: "-50%",
	            // Pulsate
	            animationDuration: "3000ms",
	            animationDelay: "2s",
	            animationIterationCount: "infinite",
	            animationName: lib_12({
	                "0%": { transform: "scale(1)" },
	                "80%": { transform: "scale(1)" },
	                "90%": { transform: "scale(1.2)" },
	                "100%": { transform: "scale(1)" },
	            })
	        }
	    }
	});
	let JoinElement = class JoinElement extends HyperElement {
	    constructor() {
	        super();
	        // bind methods to this
	        this.joinButtonClicked = this.joinButtonClicked.bind(this);
	    }
	    /** toggle open state */
	    joinButtonClicked(e) {
	        e.stopPropagation();
	        const event = new CustomEvent("join-el-click", {
	            detail: {
	                element: e.currentTarget
	            }, bubbles: false
	        });
	        this.dispatchEvent(event);
	    }
	    render() {
	        return this.html `
		<div>
			<button onclick=${this.joinButtonClicked}>
				${this.buttonText || ""}
			</button>
		</div>`;
	    }
	};
	__decorate$d([
	    Attribute({ attributeName: "hide", type: "boolean" })
	], JoinElement.prototype, "hide", void 0);
	__decorate$d([
	    Property()
	], JoinElement.prototype, "buttonText", void 0);
	JoinElement = __decorate$d([
	    Component({ tag: "join-el" })
	], JoinElement);

	var __decorate$e = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("log-off-popup", {
	    $nest: {
	        "& button": Object.assign({}, buttonStyle()),
	        "&[data-gender='male'] button": {
	            backgroundColor: theme.malePrimaryColor,
	        },
	        "&[data-gender='female'] button": {
	            backgroundColor: theme.femalePrimaryColor,
	        },
	    }
	});
	let LogOffPopupElement = class LogOffPopupElement extends HyperElement {
	    constructor() {
	        super();
	        // bind methods to this
	        this.logOffButtonClicked = this.logOffButtonClicked.bind(this);
	        this.userName = undefined;
	    }
	    logOffButtonClicked(e) {
	        e.stopPropagation();
	        e.preventDefault();
	        const event = new CustomEvent("log-off-click", {
	            detail: {},
	            bubbles: false
	        });
	        this.dispatchEvent(event);
	    }
	    render() {
	        return this.html `<top-popup close-on-background>
			<span slot="header">Afmelden</span>
			Ben je zeker dat je '${this.userName}' wilt afmelden?
			<button slot="footer" type="submit" onclick=${this.logOffButtonClicked} >Log off</button>
		</top-popup>`;
	    }
	};
	__decorate$e([
	    Attribute({ attributeName: "username" })
	], LogOffPopupElement.prototype, "userName", void 0);
	__decorate$e([
	    Watch({
	        attributeName: "username"
	    })
	], LogOffPopupElement.prototype, "render", null);
	LogOffPopupElement = __decorate$e([
	    Component({ tag: "log-off-popup" })
	], LogOffPopupElement);

	var __decorate$f = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	lib_8("log-on-popup", {
	    $nest: {
	        "& input[type='text']": Object.assign({}, focusStyle(), { fontFamily: theme.fontFamily, fontSize: "1rem", backgroundColor: theme.greyColor, color: theme.lightColor, border: "0.1rem solid rgba(0, 0, 0, 0.2)", padding: "0.5rem", borderRadius: "0.25rem" }),
	        "& input[type='text']::placeholder": {
	            color: theme.lightColor,
	        },
	        "& h1": {
	            margin: 0,
	            marginBottom: "1rem",
	            fontWeight: "normal",
	        },
	        "& input[type='radio']": Object.assign({ marginTop: "1rem", verticalAlign: "bottom", width: "1rem", height: "1rem" }, focusStyle()),
	        "label[for='male']": {
	            marginRight: "2rem",
	        },
	        "& button": Object.assign({}, buttonStyle(), { marginTop: "2rem" }),
	        "[selected-gender='male']": {
	            $nest: {
	                "& input[type='text'], & button": {
	                    backgroundColor: theme.malePrimaryColor,
	                },
	                "&": {
	                //color: HexColor.mix(theme.malePrimaryColor, theme.darkTextColor, 0.3)
	                }
	            }
	        },
	        "[selected-gender='female']": {
	            $nest: {
	                "& input[type='text'], & button": {
	                    backgroundColor: theme.femalePrimaryColor,
	                },
	                "&": {
	                //color: HexColor.mix(theme.femalePrimaryColor, theme.darkTextColor, 0.3)
	                }
	            }
	        },
	    }
	});
	let LogOnPopupElement = class LogOnPopupElement extends HyperElement {
	    constructor() {
	        super();
	        // bind methods to this
	        this.logOnButtonClicked = this.logOnButtonClicked.bind(this);
	        this.userNameChanged = this.userNameChanged.bind(this);
	        this.genderChanged = this.genderChanged.bind(this);
	    }
	    get userName() {
	        const nameEl = this.querySelector("input[name='name']");
	        return (nameEl && UserName.isValid(nameEl.value)) ? UserName.ensure(nameEl.value) : undefined;
	    }
	    get gender() {
	        const node = Array.from(this.querySelectorAll("input[name='gender']")).find(node => node.checked);
	        return node
	            ? GenderHelper.ensure(node.value)
	            : undefined;
	    }
	    logOnButtonClicked(e) {
	        e.stopPropagation();
	        e.preventDefault();
	        // Validate
	        const event = new CustomEvent("log-on-click", {
	            detail: {},
	            bubbles: false
	        });
	        this.dispatchEvent(event);
	    }
	    canSubmit() {
	        return !!(this.userName && this.gender);
	    }
	    userNameChanged(e) {
	        e.stopPropagation();
	        this.invalidate();
	    }
	    genderChanged(e) {
	        e.stopPropagation();
	        this.invalidate();
	    }
	    render() {
	        return this.html `<top-popup selected-gender="${this.gender}">
			<form>
				<h1>Speel mee!</h1>
				<input type="text" name="name" placeholder="Naam" maxlength="10" required="required" oninput="${this.userNameChanged}" autocomplete="off"/><br/>
				<div>
					<input id="male" type="radio" name="gender" value="male" onchange="${this.genderChanged}"/>
					<label for="male"><icon-el name="male"/> Man</label>
					<input id="female" type="radio" name="gender" value="female" onchange="${this.genderChanged}"/>
					<label for ="female"><icon-el name="female"/> Vrouw</label>
				</div>
				<button onclick="${this.logOnButtonClicked}" type="submit" disabled="${!this.canSubmit()}">Join</button>
			</form>
		</top-popup>`;
	    }
	};
	LogOnPopupElement = __decorate$f([
	    Component({ tag: "log-on-popup" })
	], LogOnPopupElement);

	var __decorate$g = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	const fabSize$1 = 3;
	const focus$1 = focusStyle();
	const fabCircle$1 = Object.assign({}, focus$1, { width: `${fabSize$1}rem`, height: `${fabSize$1}rem`, borderRadius: "50%", border: "0.1rem solid #ffffff", boxShadow: `${1 / 8}rem ${1 / 8}rem ${1 / 4}rem rgba(0, 0, 0, 0.2)` });
	lib_8("navigation-el", {
	    position: "fixed",
	    bottom: "4.5rem",
	    width: "100%",
	    $nest: {
	        "& button": Object.assign({}, fabCircle$1, { position: "absolute", opacity: 1, transitionProperty: "transform, opacity", transitionDuration: "300ms", backgroundColor: "#ffffff", fill: theme.greyColor, color: theme.greyColor, $nest: Object.assign({}, fabCircle$1.$nest, { "&:active": {
	                    $nest: {}
	                }, "icon-el": {
	                    fontSize: "1.5rem"
	                } }) }),
	        "& button[disabled]": {
	            opacity: 0.3,
	        },
	        "& button.left": {
	            left: "-4rem",
	        },
	        "& button.right": {
	            right: "-4rem",
	        },
	        "&:not([hide]) button.left": {
	            transform: "translateX(6rem)",
	        },
	        "&:not([hide]) button.right": {
	            transform: "translateX(-6rem)",
	        },
	        "&:not([hide]) button.left:active": {
	            transform: "translateX(6rem) scale(0.9)",
	        },
	        "&:not([hide]) button.right:active": {
	            transform: "translateX(-6rem) scale(0.9)",
	        },
	    }
	});
	let NavigationElement = class NavigationElement extends HyperElement {
	    constructor() {
	        super();
	        this.navLeftClicked = this.navLeftClicked.bind(this);
	        this.navRightClicked = this.navRightClicked.bind(this);
	    }
	    navLeftClicked(e) {
	        e.stopPropagation();
	        const event = new CustomEvent("navigation-el-left-click", {});
	        this.dispatchEvent(event);
	    }
	    navRightClicked(e) {
	        e.stopPropagation();
	        const event = new CustomEvent("navigation-el-right-click", {});
	        this.dispatchEvent(event);
	    }
	    render() {
	        return this.html `
			<button class="left" onclick="${this.navLeftClicked}" disabled="${this.disablePrev}"><icon-el name="arrowLeft"></icon-el></button>
			<button class="right" onclick="${this.navRightClicked}" disabled="${this.disableNext}"><icon-el name="arrowRight"></icon-el></button>
		`;
	    }
	};
	__decorate$g([
	    Attribute({ type: "boolean" })
	], NavigationElement.prototype, "hide", void 0);
	__decorate$g([
	    Property()
	], NavigationElement.prototype, "disablePrev", void 0);
	__decorate$g([
	    Property()
	], NavigationElement.prototype, "disableNext", void 0);
	NavigationElement = __decorate$g([
	    Component({ tag: "navigation-el" })
	], NavigationElement);

	var __decorate$h = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	const transitionDuration$3 = "300ms";
	const shadowSize = "3em";
	lib_8("top-popup", {
	    $debugName: "topPopup",
	    position: "absolute",
	    width: "100%",
	    bottom: `calc(100% + ${shadowSize})`,
	    textAlign: "center",
	    fontFamily: theme.fontFamily,
	    fontSize: "1rem",
	    $nest: {
	        "& .popup": {
	            display: "inline-block",
	            bottom: `calc(100% + ${shadowSize})`,
	            transform: "translateY(0%)",
	            transitionProperty: "transform",
	            transitionDuration: transitionDuration$3,
	            transitionTimingFunction: "ease-in-out",
	            borderBottomLeftRadius: "1rem",
	            borderBottomRightRadius: "1rem",
	            margin: "0 1rem 0.5rem 1rem",
	            padding: "2rem",
	            backgroundColor: "#ffffff",
	            boxShadow: `0 0 ${shadowSize} rgba(0, 0, 0, 0.4)`,
	        },
	        "& .popup__popop-header": {
	            marginBottom: "1em",
	            fontSize: "1.5rem",
	            fontWeight: "bold",
	        },
	        "& .popup__popop-footer": {
	            marginTop: "1em",
	        },
	        "& .popup-background": {
	            display: "none",
	            position: "fixed",
	            top: 0,
	            left: 0,
	            width: "100%",
	            height: "100%",
	        },
	        "&[opened] > .popup": {
	            transform: `translateY(calc(100% + ${shadowSize}))`,
	        },
	        "&[opened] > .popup-background": {
	            display: "block",
	        },
	    }
	});
	let TopPopupElement = class TopPopupElement extends HyperElement {
	    constructor() {
	        super();
	        this.loadSlots();
	        this.backgroundClicked = this.backgroundClicked.bind(this);
	    }
	    /** toggle open state */
	    backgroundClicked() {
	        const event = new CustomEvent("popup-bg-click", {
	            detail: undefined,
	            bubbles: true
	        });
	        this.dispatchEvent(event);
	    }
	    connectedCallback() {
	        super.connectedCallback();
	        setFocusableChilds(this, !!this.isOpened);
	    }
	    render() {
	        return this.html `
		<div class="popup-background" onClick=${this.backgroundClicked}></div>
		<div class="popup">
			${this.slots.header && this.slots.header.length > 0
            ? hyperHTML.wire() `<div class="popup__popop-header">${this.slots.header}</div>`
            : ""}
			${this.slots.default && this.slots.default.length > 0
            ? this.slots.default
            : ""}
			${this.slots.footer && this.slots.footer.length > 0
            ? hyperHTML.wire() `<div class="popup__popop-footer">${this.slots.footer}</div>`
            : ""}
		</div>`;
	    }
	    openedChanged() {
	        setFocusableChilds(this, !!this.isOpened);
	    }
	};
	__decorate$h([
	    Attribute({
	        attributeName: "opened",
	        type: "boolean"
	    })
	], TopPopupElement.prototype, "isOpened", void 0);
	__decorate$h([
	    Watch({ attributeName: "opened" })
	], TopPopupElement.prototype, "openedChanged", null);
	TopPopupElement = __decorate$h([
	    Component({ tag: "top-popup" })
	], TopPopupElement);

	// For debug purpose
	window.state = {
	    players: playersState,
	    loggedOnPlayer: loggedOnPlayerState,
	    route: routeState,
	    ui: {
	        fabMenu: fabMenuState,
	        logOnPopup: logOnPopupState,
	        logOffPopup: logOffPopupState,
	    },
	    /** For debugging: view all watching functions */
	    activeSubscriptions,
	};

	lib_8("body", {
	    margin: 0
	});
	lib_8(".pages", {
	    position: "absolute",
	    width: "100%",
	    height: "100%",
	});
	lib_8(".page", {
	    fontFamily: theme.fontFamily,
	    fontSize: "1rem",
	    padding: "1em",
	    paddingBottom: "4em",
	    color: theme.lightTextColor,
	    $nest: {
	        a: {
	            color: theme.lightTextColor,
	        },
	        "a:visited": {
	            color: theme.lightTextColor,
	        }
	    }
	});
	class App {
	    constructor() {
	        this.appEl = document.getElementById("app");
	        log("Add a 'live expression' to 'Object.keys(state.activeSubscriptions)' to see is everything is properly unsubscribed.");
	        addEventListener("error", e => {
	            alert(`Er is en fout opgetreden${e.error ? `:\n${e.error.stack}` : `${e.message}.`}`);
	        });
	        this.update();
	        // Update
	        addEventListener("resize", () => this.calculateRem());
	        addEventListener("orientationChange", () => this.calculateRem());
	        this.calculateRem();
	        // Detect if mouse is available
	        const unsubscribeMouseMove = subscribeToEvent(window, "mousemove", () => {
	            this.appEl.classList.add("has-mouse");
	            unsubscribeMouseMove();
	        }, false);
	    }
	    calculateRem() {
	        const width = window.innerWidth;
	        const height = window.innerHeight;
	        const area = width * height;
	        const fontSize = Math.round(Math.max(Math.min(area / 40000 + 10, 36), 16));
	        document.querySelector(":root").style.fontSize = `${fontSize}px`;
	    }
	    update() {
	        hyperHTML.bind(this.appEl) `
		<div class="pages"/>
		<fab-menu id="fab" hide>
			<span slot="fab-item" class="toggleLogOn"><icon-el name="user"></icon-el></span>
			<span slot="fab-item"><icon-el name="crown"></icon-el></span>
		</fab-menu>
		<join-el hide/>
		<log-off-popup/>
		<log-on-popup/>
		<block-input></block-input>
		<navigation-el hide></navigation-el>`;
	        vibrationController();
	        navigationBarController();
	        navigationController(assert(document.querySelector("navigation-el")));
	        logOffPopupController(assert(document.querySelector("log-off-popup")));
	        logOnPopupController(assert(document.querySelector("log-on-popup")));
	        blockInputController(assert(document.querySelector("block-input")));
	        fabMenuController(assert(document.getElementById("fab")));
	        routerController(assert(document.querySelector(".pages")));
	        aiController();
	    }
	}
	const app = new App();

	exports.App = App;
	exports.app = app;

	return exports;

}({}));
