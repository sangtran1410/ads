/**
 * Created by sangtv3 on 11/27/2015.
 */
;(function(window) { if (window.eClick){return;}





    var noop = function () {
    };

    Date.now = Date.now || function () {
        return +new Date;
    };

    var nativeForEach = Array.prototype.forEach,
        nativeMap = Array.prototype.map;

    var _ = {
        toArray: function toArray(nodeList) {
            var arr = [];
            for (var i = 0; i < nodeList.length; ++i) {
                arr[i] = nodeList[i];
            }
            return arr;
        },

        forEach: function forEach(array, iterator, context) {

            if (nativeForEach && array.forEach === nativeForEach) {
                array.forEach(iterator);
            } else {
                for (var i = 0, l = array.length; i < l; ++i) {
                    if (iterator.call(context, array[i], i, array) === false) return;
                }
            }
        },

        map: function (obj, iterator, context) {
            var results = [];
            if (obj == null) return results;
            if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
            _.forEach(obj, function (value, index, list) {
                results[results.length] = iterator.call(context, value, index, list);
            });
            return results;
        },

        find: function () {

        },

        extend: function extend(obj) {
            _.forEach([].slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        },

        isArray: Array.isArray || function (obj) {
            return {}.toString.call(obj) == '[object Array]';
        },

        debounce: function (func, wait, immediate) {
            var timeout, result;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) result = func.apply(context, args);
                return result;
            };
        },

        tokenize: function tokenize(str, delimiter, pairDelimiter) {
            !delimiter && ( delimiter = ',');
            !pairDelimiter && ( pairDelimiter = ':');

            var obj = {},
                pairs = str.split(delimiter);

            _.forEach(pairs, function (pair) {
                var split = pair.split(pairDelimiter),
                    key = split[0],
                    value = split[1];

                if (key && value) {
                    obj[key] = value;
                }
            });

            return obj;
        }
    };

    function utf8_encode(argString) {
        return unescape(window.encodeURIComponent(argString));
    }

    function sha1(str) {
        var
            rotate_left = function (n, s) {
                return (n << s) | (n >>> (32 - s));
            },

            cvt_hex = function (val) {
                var str = '',
                    i,
                    v;

                for (i = 7; i >= 0; i--) {
                    v = (val >>> (i * 4)) & 0x0f;
                    str += v.toString(16);
                }
                return str;
            },

            blockstart,
            i,
            j,
            W = [],
            H0 = 0x67452301,
            H1 = 0xEFCDAB89,
            H2 = 0x98BADCFE,
            H3 = 0x10325476,
            H4 = 0xC3D2E1F0,
            A,
            B,
            C,
            D,
            E,
            temp,
            str_len,
            word_array = [];

        str = utf8_encode(str);
        str_len = str.length;

        for (i = 0; i < str_len - 3; i += 4) {
            j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
            word_array.push(j);
        }

        switch (str_len & 3) {
            case 0:
                i = 0x080000000;
                break;
            case 1:
                i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
                break;
            case 2:
                i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
                break;
            case 3:
                i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) << 8 | 0x80;
                break;
        }

        word_array.push(i);

        while ((word_array.length & 15) !== 14) {
            word_array.push(0);
        }

        word_array.push(str_len >>> 29);
        word_array.push((str_len << 3) & 0x0ffffffff);

        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++) {
                W[i] = word_array[blockstart + i];
            }

            for (i = 16; i <= 79; i++) {
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            }

            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;

            for (i = 0; i <= 19; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 20; i <= 39; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 40; i <= 59; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            for (i = 60; i <= 79; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }

            H0 = (H0 + A) & 0x0ffffffff;
            H1 = (H1 + B) & 0x0ffffffff;
            H2 = (H2 + C) & 0x0ffffffff;
            H3 = (H3 + D) & 0x0ffffffff;
            H4 = (H4 + E) & 0x0ffffffff;
        }

        temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
        return temp.toLowerCase();
    }

    function loadCss(url) {
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        document.getElementsByTagName("head")[0].appendChild(link)
    }

    function hasClass(el, className) {
        if (el.classList) {
            return el.classList.contains(className)
        } else {
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
        }
    }

    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className)
        } else if (!hasClass(el, className)) {
            el.className += " " + className
        }
    }

    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className=el.className.replace(reg, ' ')
        }
    }

    function cstr(str)
    {
        var typ = typeof str,
            OBJ = "object",
            STR = "string",
            NUM = "number",
            S = (window && window.String);
        if (typ == STR) return str;
        if (typ == NUM && !str) return "0";
        if (typ == OBJ && str) {
            if (str.join) {
                return str.join("");
            } else {
                var css = "";
                parseObj(str, function(val, key){
                    css += key + ":" + val + ";";
                });
                return css;
            }
        }
        if (str === false) return 'false';
        if (str === true) return 'true';
        return (str) ? S(str) : "";
    }

    var closest = function(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    function css(el, val)
    {
        var st, LEN = "length";

        try {
            st	= el.style;

            if (arguments[LEN] > 1) {
                st.cssText = cstr(val);
            } else {
                val = st.cssText;
            }
        } catch (e) {
            val = "";
        }
        return val;
    }

    var JSONP = (function () {
        var counter = 0, head, query, key, window = this, config = {};

        function load(url) {
            var script = document.createElement('script'),
                done = false;
            script.src = url;
            script.async = true;

            script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;
                    script.onload = script.onreadystatechange = null;
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }
            };
            if (!head) {
                head = document.getElementsByTagName('head')[0];
            }
            head.appendChild(script);
        }

        function encode(str) {
            return encodeURIComponent(str);
        }

        function jsonp(url, params, callback, callbackName) {
            query = (url || '').indexOf('?') === -1 ? '?' : '&';
            params = params || {};
            for (key in params) {
                if (params.hasOwnProperty(key)) {
                    query += encode(key) + "=" + encode(params[key]) + "&";
                }
            }
            var jsonp = "json" + (++counter);
            window[ jsonp ] = function (data) {
                callback(data);
                try {
                    delete window[ jsonp ];
                } catch (e) {
                    window[ jsonp ] = null;
                }
            };

            load(url + query + (callbackName || config['callbackName'] || 'callback') + '=' + jsonp);
            return jsonp;
        }

        function setDefaults(obj) {
            config = obj;
        }

        return {
            get: jsonp,
            script: load,
            init: setDefaults
        };
    }());

    function contentLoaded(win, fn) {
        var done = false, top = true,

            doc = win.document, root = doc.documentElement,

            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',

            init = function (e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function () {
                try {
                    root.doScroll('left');
                } catch (e) {
                    setTimeout(poll, 50);
                    return;
                }
                init('poll');
            };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch (e) {
                }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
    /*!
     * Cookies.js - 0.2.0
     * Friday, June 15 2012 @ 7:38 PM EST
     *
     * Copyright (c) 2012, Scott Hamper
     * Licensed under the MIT license,
     * http://www.opensource.org/licenses/MIT
     */
    (function (document, exports, undefined) {

        var cookies = function (key, value, options) {
            return arguments.length === 1 ? cookies.get(key) : cookies.set(key, value, options);
        };

        cookies.get = function (key) {
            if (document.cookie !== cookies._cacheString) {
                cookies._populateCache();
            }

            return cookies._cache[key] || '';
        };

        cookies.defaults = {
            path: '/'
        };

        cookies.set = function (key, value, options) {
            var options = {
                path: options && options.path || cookies.defaults.path,
                domain: options && options.domain || cookies.defaults.domain,
                expires: options && options.expires || cookies.defaults.expires,
                secure: options && options.secure !== undefined ? options.secure : cookies.defaults.secure
            };

            if (value === undefined) {
                options.expires = -1;
            }

            switch (typeof options.expires) {
                // If a number is passed in, make it work like 'max-age'
                case 'number':
                    options.expires = new Date(new Date().getTime() + options.expires * 1000);
                    break;
                // Allow multiple string formats for dates
                case 'string':
                    options.expires = new Date(options.expires);
                    break;
            }

            // Escape only the characters that should be escaped as defined by RFC6265
            var cookieString = encodeURIComponent(key) + '=' + (value + '').replace(/[^!#-+\--:<-[\]-~]/g, encodeURIComponent);
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toGMTString() : '';
            cookieString += options.secure ? ';secure' : '';

            document.cookie = cookieString;

            return cookies;
        };

        cookies.expire = function (key, options) {
            return cookies.set(key, undefined, options);
        };

        cookies._populateCache = function () {
            cookies._cache = {};
            cookies._cacheString = document.cookie;

            var cookiesArray = cookies._cacheString.split('; ');
            for (var i = 0; i < cookiesArray.length; i++) {
                // The cookie value can contain a '=', so cannot use 'split'
                var separatorIndex = cookiesArray[i].indexOf('=');

                try {
                    var key = decodeURIComponent(cookiesArray[i].substr(0, separatorIndex));
                    var value = decodeURIComponent(cookiesArray[i].substr(separatorIndex + 1));
                } catch (ex) {
                    continue;
                }

                // The first instance of a key in the document.cookie string
                // is the most locally scoped cookie with the specified key.
                // The value of this key will be sent to the web server, so we'll
                // just ignore any other instances of the key.
                if (cookies._cache[key] === undefined) {
                    cookies._cache[key] = value;
                }
            }
        };

        cookies.enabled = (function () {
            var isEnabled = cookies.set('cookies.js', '1').get('cookies.js') === '1';
            cookies.expire('cookies.js');
            return isEnabled;
        })();

        return exports['cookies'] = cookies;
    })(document, _);

    function addEventListener(element, eventName, handler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);
        }
        else if (element.attachEvent) {
            element.attachEvent('on' + eventName, handler);
        }
        else {
            element['on' + eventName] = handler;
        }
    }

    function removeEventListener(element, eventName, handler) {
        if (element.addEventListener) {
            element.removeEventListener(eventName, handler, false);
        }
        else if (element.detachEvent) {
            element.detachEvent('on' + eventName, handler);
        }
        else {
            element['on' + eventName] = null;
        }
    }

    function sendRequest(url, callback, postData) {
        var req = createXMLHTTPObject();
        if (!req) return;
        var method = (postData) ? "POST" : "GET";

        // cache buster for ie
        url += '&cb=' + Date.now();

        try {
            req.open(method, url, true);
        } catch (ex) {
            JSONP.get(url, postData || {}, callback);
            return;
        }

//  req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        if (postData) {
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }

        req.onreadystatechange = function () {
            if (req.readyState != 4) return;
            if (req.status != 200 && req.status != 304) {
                return;
            }
            var json = JSON.parse(req.response || req.responseText || 'null');
            callback(json, req);
        };
        if (req.readyState == 4) return;
        req.send(postData);
    }

    var XMLHttpFactories = [
        function () {
            return new XMLHttpRequest()
        },
        function () {
            return new ActiveXObject("Msxml3.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Msxml2.XMLHTTP.6.0");
        },
        function () {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        },
        function () {
            return new ActiveXObject("Msxml2.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    ];

    function createXMLHTTPObject() {
        var xmlhttp = false;
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
            }
            catch (e) {
                continue;
            }
            break;
        }
        return xmlhttp;
    }

    var getCookieWithArrayResult = function(name) {
        var valArr = [],
            c = doc.cookie["split"](";");
        name = new RegExp("^\\s*" + name + "=\\s*(.*?)\\s*$");
        for (var i = 0; i < c["length"]; i++) {
            var val = c[i]["match"](name);
            val && valArr["push"](val[1])
        }
        return valArr
    };

    var writeCookieOnThisDomain = function(url){
        url = url || document.domain;

        // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
        url = url.replace(/^\s+/,""); // START
        url = url.replace(/\s+$/,""); // END

        // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
        url = url.replace(/\\/g,"/");

        // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
        url = url.replace(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i,"");

        // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
        url = url.replace(/^www\./i,"");

        var origin = [".", url].join("");

        url = url.split(".");

        var candidate = "", temp = [], arr = [];

        for(var i = 1; i <= url.length; i++){
            temp.push([".",url[url.length - i].replace(/[^a-zA-Z0-9]/g,"")].join(""));
        }

        for(var j = temp.length;j > 0;j--){
            candidate = temp[temp.length - j] + candidate;
            arr.push(candidate);
        }

        for(var k = 0; k < arr.length; k++){
            var isCookieDomain = _.cookies.set('isCookieDomain', '1', {domain: arr[k]}).get('isCookieDomain') === '1';
            _.cookies.expire('isCookieDomain', {domain: arr[k]});
            if(isCookieDomain) return arr[k];
        }
        return origin;
    }();

    function isBoxModel() {
        var body = document.body,
            win = document.defaultView,
            docElem = document.documentElement,
            box = document.createElement('div');
        box.style.paddingLeft = box.style.width = "1px";
        body.appendChild(box);
        var isBoxModel = box.offsetWidth == 2;
        body.removeChild(box);

        return isBoxModel;
    }

    function offset(element) {
        var body = document.body
            , docElem = document.documentElement
            , box = element.getBoundingClientRect()
            , scroll = getScroll()
            , clientTop = docElem.clientTop || body.clientTop || 0
            , clientLeft = docElem.clientLeft || body.clientLeft || 0
            , scrollTop = scroll.top
            , scrollLeft = scroll.left;

        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    }

    function getScroll() {
        return {
            left: (window.pageXOffset !== void 0) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            top: (window.pageYOffset !== void 0) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
        }
    }

    function $log(log) {
    }
    if (window.console && window.console.log && _debug) {
        $log = function () {
            var e = new Error();
            var where = e.stack ? e.stack.split('\n')[2].replace(/^\s+/, '[eClick] log ') : '';
            console.log(where, arguments);
        }
    }

    function getWeekNum(_this) {
        var onejan = new Date(_this.getFullYear(), 0, 1);
        return Math.ceil((((_this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    }

    function sendLog(url, callback) {
        var image = new Image(1, 1);
        image.onload = callback;
        image.src = url;
        $log('log sent', url);
    }

    function getElementsByAttribute(attr, tag, value) {
        if (document.querySelectorAll) {
            var query = tag ? tag : '';
            query += '[' + attr;
            if (typeof value === 'undefined') {
                query += ']';
            } else {
                query += '="' + value + '"]';
            }
            return document.querySelectorAll(query);
        }

        var all = tag ? document.getElementsByTagName(tag) : document.all
            , matched = [];
        if (typeof value === 'undefined') {
            _.forEach(all, function (elem) {
                var $value = elem.getAttribute(attr);
                if ($value) {
                    matched.push(elem);
                }
            });

            return matched;
        }

        _.forEach(all, function (elem) {
            var $value = elem.getAttribute(attr);
            if ($value == value) {
                matched.push(elem);
            }
        });

        return matched;
    }

    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function(search) {
            var d = document, elements, pattern, i, results = [];
            if (d.querySelectorAll) { // IE8
                return d.querySelectorAll("." + search);
            }
            if (d.evaluate) { // IE6, IE7
                pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
                elements = d.evaluate(pattern, d, null, 0, null);
                while ((i = elements.iterateNext())) {
                    results.push(i);
                }
            } else {
                elements = d.getElementsByTagName("*");
                pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
                for (i = 0; i < elements.length; i++) {
                    if ( pattern.test(elements[i].className) ) {
                        results.push(elements[i]);
                    }
                }
            }
            return results;
        }
    }

    function makeSure(fn, context) {

        var isReady = false
            , queue = [];

        function ensured() {
            if (!isReady) {
                queue.push(arguments);
                return false;
            } else {
                fn.apply(context, arguments);
            }
        }

        ensured.setReady = function () {
            isReady = true;
            for (var i = 0, l = queue.length; i < l; ++i) {
                fn.apply(context, queue[i]);
            }
        };

        return ensured;
    }

    var foreverCookieJob = function () {
        var t = this,
            cookieReg = [],
            localStore = window.localStorage,
            delay = 2000;

        if(typeof foreverCookieJob.instance == 'object'){
            return foreverCookieJob.instance;
        }

        this.set = function (name, value, options) {
            if(!value) return;
            t.main(name, value, options);
            //delay += 1000;
        };

        this.get = function (name) {
            return this.main(name, undefined, undefined);
        };

        this.update = function(name, value, options) {
            if(!value) return;
            t.watcher(undefined, undefined, true);
            t.main(name, value, options);
        };

        this.main = function (name, value, options) {
            var ckData, lsData, wnData;
            ckData = t._cookie_data(name, value, options);
            lsData = t._local_storage(name, value);
            wnData = t._win_name(name, value);

            t.watcher(name, function (value) {
                if(value == null || value == "null") return;
                t._cookie_data(name, value, options);
                t._local_storage(name, value);
                t._win_name(name, value);
            });
            if(value == undefined) return ckData || lsData || wnData;
        };

        this.watcher = function (name, callback, bool) {
            var itv = window.setInterval(function () {
                if(name){
                    if (cookieReg[name] && (cookieReg[name] != null || cookieReg[name] != "null")) {
                        if (_.cookies(name) != null && _.cookies(name) != cookieReg[name]) cookieReg[name] = _.cookies(name);
                        if(localStore && localStore.getItem(name) != cookieReg[name]) cookieReg[name] = localStore.getItem(name);
                        if(t._win_name(name) != cookieReg[name]) cookieReg[name] = t._win_name(name);
                        return callback(cookieReg[name]);
                    } else if (_.cookies(name) != null|| _.cookies(name) != "null"){
                        cookieReg[name] = _.cookies(name);
                    }
                }
            }, delay);
            if(bool) clearInterval(itv)
        };

        this._win_name = function (name, value) {
            try {
                if (value !== undefined) {
                    window.name = this._ec_replace(window.name, name, value);
                } else {
                    return this.getFrmStr(name, window.name);
                }
            } catch (e) {}
        };

        this._local_storage = function (name, value) {
            try {
                if (localStore) {
                    if (value !== undefined) {
                        localStore.setItem(name, value);
                    } else {
                        return localStore.getItem(name)
                    }
                }
            } catch (e) {}
        };

        this._cookie_data = function (name, value, options) {
            options = options || {};
            try {
                if (value !== undefined) {
                    _.cookies(name, value, options)
                } else {
                    return this.getFrmStr(name, document.cookie);
                }
            } catch (e) {}
        };

        this._ec_replace = function (str, key, value) {
            if (str.indexOf("&" + key + "=") > -1 || str.indexOf(key + "=") === 0) {
                // find start
                var idx = str.indexOf("&" + key + "="),
                    end, newstr;
                if (idx === -1) {
                    idx = str.indexOf(key + "=");
                }
                // find end
                end = str.indexOf("&", idx + 1);
                if (end !== -1) {
                    newstr = str.substr(0, idx) + str.substr(end + (idx ? 0 : 1)) + "&" + key + "=" + value;
                } else {
                    newstr = str.substr(0, idx) + "&" + key + "=" + value;
                }
                return newstr;
            } else {
                return str + "&" + key + "=" + value;
            }
        };

        this.getFrmStr = function (name, text) {
            if (typeof text !== "string") {
                return;
            }
            var nameEQ = name + "=",
                ca = text.split(/[;&]/),
                i, c;
            for (i = 0; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) === " ") {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
        };

        foreverCookieJob.instance = this;
    };

    var typeOf = function (a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array) return "array";
                if (a instanceof Object) return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
            } else return "null";
        else if ("function" == b && "undefined" == typeof a.call) return "object";
        return b
    };

    var parseObj = function (obj, callback) {
        for (var row in obj) Object.prototype.hasOwnProperty.call(obj, row) && callback.call(null, obj[row], row, obj)
    };

    var addEvent = function (element, event, handler, d) { /* add event listener */
            return (element.addEventListener ? (element.addEventListener(event, handler, d || false), true) : element.attachEvent ?
                (element.attachEvent("on" + event, handler), true) : false);
        },
        removeEvent = function (element, event, handler, d) { /* remove event listener */
            return (element.removeEventListener ? (element.removeEventListener(event, handler, d || false), true) : element.detachEvent ?
                (element.detachEvent("on" + event, handler), true) : false);
        },
        encodeUrl = function (url) {
            if (typeof encodeURIComponent == "function") {
                return encodeURIComponent(url);
            } else {
                return escape(url);
            }
        },
        decodeUrl = function (url) {
            if (typeof decodeURIComponent == "function") {
                return decodeURIComponent(url);
            } else {
                return unescape(url);
            }
        },
        buildUrl = function (domain, path, protocol) { /* build url with protocol */
            protocol = protocol || (document.location.protocol == "https:" ? "https" : "http");
            return [protocol, "://", domain, path].join("");
        };

    var bindFunc = function (fn, scope, c) {
            return fn.call.apply(fn.bind, arguments)
        },
        atnBindFunc = function (fn, scope, c) {
            if (!fn) throw Error();
            if (2 < arguments.length) {
                var d = Array.prototype.slice.call(arguments, 2);
                return function () {
                    var c = Array.prototype.slice.call(arguments);
                    Array.prototype.unshift.apply(c, d);
                    return fn.apply(scope, c)
                }
            }
            return function () {
                return fn.apply(scope,
                    arguments)
            }
        },
        setScopeFunc = function (fn, scope, c) {
            setScopeFunc = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? bindFunc : atnBindFunc;
            return setScopeFunc.apply(null, arguments)
        };

    var getFlashVers = function () {
        if (navigator.plugins && navigator.mimeTypes.length) {
            var plugin = navigator.plugins["Shockwave Flash"];
            if (plugin && plugin.description) return plugin.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s)+r/, ".")
        } else {
            if (navigator.userAgent && 0 <= navigator.userAgent.indexOf("Windows CE")) {
                for (var a = 3, b = 1; b;) try {
                    b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + (a + 1)), a++
                } catch (c) {
                    b = null
                }
                return a.toString()
            }
            if (-1 != navigator.userAgent.toLowerCase().indexOf("msie") && !window.opera) {
                b = null;
                try {
                    b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7")
                } catch (d) {
                    a = 0;
                    try {
                        b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6"), a = 6, b.Ma = "always"
                    } catch (e) {
                        if (6 == a) return a.toString()
                    }
                    try {
                        b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
                    } catch (f) {}
                }
                if (b) return a = b.GetVariable("$version").split(" ")[1], a.replace(/,/g, ".")
            }
        }
        return "0";
    };

    var getIEVersion = function () {
        var uag = navigator.userAgent;
        var msie = uag.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(uag.substring(msie + 5, uag.indexOf('.', msie)), 10);
        }

        var trident = uag.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = uag.indexOf('rv:');
            return parseInt(uag.substring(rv + 3, uag.indexOf('.', rv)), 10);
        }

        var edge = uag.indexOf('Edge/');
        if (edge > 0) {
            // IE 12 => return version number
            return parseInt(uag.substring(edge + 5, uag.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    };

    function xhr(url, cb) {
        var that = this,
            isCrossDomain = url.indexOf([window.location.protocol, window.location.host].join('//')) !== 0;

        this.updating = false;
        this.abort = function () {
            if (that.updating) {
                that.updating = false;
                that.AJAX.abort();
                that.AJAX = null;
            }
        };
        this.send = function (params, postMethod) {
            if (that.updating) {
                return false;
            }
            that.AJAX = null;
            if (window.XMLHttpRequest) {
                that.AJAX = (isCrossDomain && window.XDomainRequest) ? new XDomainRequest() : new XMLHttpRequest();
            } else {
                that.AJAX = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (that.AJAX == null) {
                return false;
            } else {
                that.AJAX.onreadystatechange = that.AJAX.onload = function () {
                    if (that.AJAX && (typeof that.AJAX.readyState === "undefined" || that.AJAX.readyState == 4)) {
                        that.updating = false;
                        that.callback(that.AJAX.responseText, that.AJAX.status, that.AJAX.responseXML);
                        that.AJAX = null;
                    }
                }
                that.updating = new Date();

                var key, query = '', params = params || {};
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        query += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
                    }
                }

                if (/post/i.test(postMethod)) {
                    var uri = url + '?' + that.updating.getTime();
                    that.AJAX.open("POST", uri, true);
                    that.AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    that.AJAX.setRequestHeader("Content-Length", query.length);
                    that.AJAX.send(query);
                } else {
                    var uri = url + '?' + query + 'ord=' + (that.updating.getTime());

                    that.AJAX.open("GET", uri, true);

                    that.AJAX.send(null);
                }
                return true;
            }
        };
        this.callback = cb || noop;
    }

    var getComputedStylePropertyValue;

    (function () {
        getComputedStylePropertyValue = function (el, cssProperty) {
            if (!window.getComputedStyle) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    return document.defaultView.getComputedStyle.getPropertyValue(cssProperty);
                }
                else {
                    var camelCasedCssProperty = getCamelCasedCssProperty(cssProperty);
                    if (el.currentStyle) {
                        return el.currentStyle(camelCasedCssProperty);
                    }
                    else {
                        return el.style[camelCasedCssProperty];
                    }
                }
            }
            else {
                return window.getComputedStyle(el).getPropertyValue(cssProperty);
            }

        };

        function getCamelCasedCssProperty(cssProperty) {
            return cssProperty.replace(/-([a-z])/g, function (g) {
                return g[1].toUpperCase()
            });
        }
    })();

    var listener = function () {
        var interval_id,
            last_hash,
            cache_bust = 1,
            attached_callback,
            window = this;

        return {
            postMessage: function (message, targetUrl, target) {
                if (!targetUrl) {
                    return;
                }
                target = target || parent;
                if (window['postMessage']) {
                    // the browser supports window.postMessage, so call it with a targetOrigin
                    // set appropriately, based on the target_url parameter.
                    target['postMessage'](message, targetUrl.replace(/([^:]+:\/\/[^\/]+).*/, '$1'));
                } else if (targetUrl) {
                    // the browser does not support window.postMessage, so set the location
                    // of the target to target_url#message. A bit ugly, but it works! A cache
                    // bust parameter is added to ensure that repeat messages trigger the callback.
                    target.location = targetUrl.replace(/#.*$/, '') + '#' + (+new Date) + (cache_bust++) + '&' + message;
                }
            },

            receiveMessage: function (callback, source_origin) {
                // browser supports window.postMessage
                if (window['postMessage']) {
                    attached_callback = function (e) {
                        /*if ((typeof source_origin === 'string' && e.origin !== source_origin)
                         || (Object.prototype.toString.call(source_origin) === "[object Function]" && source_origin(e.origin) === false)) {
                         return false;
                         }*/
                        callback(e);
                    };
                    if (window['addEventListener']) {
                        window[callback ? 'addEventListener' : 'removeEventListener']('message', attached_callback, false);
                    } else {
                        window[callback ? 'attachEvent' : 'detachEvent']('onmessage', attached_callback);
                    }
                } else {
                    // a polling loop is started & callback is called whenever the location.hash changes
                    interval_id && clearInterval(interval_id);
                    interval_id = null;
                    if (callback) {
                        interval_id = setInterval(function () {
                            var hash = document.location.hash,
                                re = /^#?\d+&/;
                            if (hash !== last_hash && re.test(hash)) {
                                last_hash = hash;
                                callback({data: hash.replace(re, '')});
                            }
                        }, 1000);
                    }
                }
            }
        }
    }();

    var util = {
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        getComputedStylePropertyValue: getComputedStylePropertyValue,
        getElementsByAttribute: getElementsByAttribute,
        forEach: _.forEach,
        contentLoaded: contentLoaded,
        extend: _.extend,
        addClass: addClass,
        removeClass: removeClass,
        xhr: xhr
    };

////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE
////////////////////////////////////////////////////////////// START HERE

    var _version=289908722,_debug=false,debugParams={},_delivery="//staging.j.eclick.vn/delivery",_delivery_static="//staging.s.eclick.vn/",_delivery_cpm="//staging.cpm.j.eclick.vn",_log={"impressions":"//t.eclick.vn","clicks":"//c.eclick.vn","trueImpressions":"//t.eclick.vn","cpm":"//t.eclick.vn"},_css="//staging.s.eclick.vn/delivery/asset/289908722/eclick.css",_mobile_css="//staging.s.eclick.vn/delivery/asset/289908722/eclick_mobile.css",_online_friday_css="//staging.s.eclick.vn/delivery/asset/289908722/eclick_online_friday.css",freq={"expireDays":7,"maxTrueImp":10,"maxBanners":10,"key":{"trueImp":0,"click":1,"lastSeen":2}},_rUrl="//staging.s.eclick.vn/delivery/asset/289908722/r.html",blockedBanners=[];
    (function () {
        var win = window,
            doc = document,
            loc = win.location,
            nav = navigator,
            _this = this;

        var eclickRenderAdsAsync = true,
            hasSrmAds = false,
            ECLICKVN = ".eclick.vn";

        var eclickLogImpDomain = "t" + ECLICKVN,
            eclickClickDomain = "c" + ECLICKVN,
            eclickDeliveryDomain = "j" + ECLICKVN,
            eclickStaticDomain = "s" + ECLICKVN,
            eclickLogDomain = "log" + ECLICKVN,
            eclickDeliveryGo = "g" + ECLICKVN;

        var eclick_ads = /(^| )adsbyeclick($| )/,
            eclick_banner = /(^| )eclick-banner($| )/,
            eclick_flash = /(^| )eclick_flash($| )/;

        var gender = "fosp_gender", // for targeting service
            visitorid = "fosp_aid",
            loc_zone = "zone",
            loc_country = "country",
            loc_province = "province",
            loc_isp = "isp",
            loc_ip = "ip";

        var support = {
            flash: "",
            java: "",
            html5: ""
        };

        var Fa = /&/g,
            Ga = /</g,
            Ha = />/g,
            Ia = /"/g,
            Ja = /'/g,
            Ka = /\x00/g,
            Ea = /[\x00&<>"']/,
            Ma = {
                "\x00": "\\0",
                "\b": "\\b",
                "\f": "\\f",
                "\n": "\\n",
                "\r": "\\r",
                "\t": "\\t",
                "\x0B": "\\x0B",
                '"': '\\"',
                "\\": "\\\\"
            },
            Na = {
                "'": "\\'"
            };

        var uniquePageviewId = function () {
            var randomNum = Date.now() * 1000 + ~~(Math.random() * 1000);
            return sha1(randomNum + "").substring(0, 24);
        }();

        var customStringify = function (obj) {

            var t = typeof (obj);
            if (t != "object" || obj === null) {

                // simple data type
                if (t == "string") obj = '"'+obj+'"';
                return String(obj);

            }
            else {

                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n]; t = typeof(v);

                    if (t == "string") v = '"'+v+'"';
                    else if (t == "object" && v !== null) v = JSON.stringify(v);

                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }

                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        };

        function dot2num(dot)
        {
            var d = dot.split('.');
            return ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);
        }

        function num2dot(num)
        {
            var d = num%256;
            for (var i = 3; i > 0; i--)
            {
                num = Math.floor(num/256);
                d = num%256 + '.' + d;
            }
            return d;
        }

        var targetingUser = function () {
            var urlGetId = buildUrl(eclickLogImpDomain, "/getid?nid=fosp_aid");

            var opt = {
                gender: {
                    path: '/',
                    expires: 15 * 24 * 3600,
                    domain: writeCookieOnThisDomain
                },
                visitorid: {
                    path: '/',
                    expires: 365 * 24 * 3600,
                    domain: writeCookieOnThisDomain
                },
                loc: {
                    path: '/',
                    expires: 10 * 24 * 3600,
                    domain: writeCookieOnThisDomain
                },
                targeting: {
                    path: '/',
                    expires: 7 * 24 * 3600,
                    domain: writeCookieOnThisDomain
                }
            };

            var targetingObj = {
                fosp_aid: _.cookies(visitorid) || "",
                fosp_gender: _.cookies(gender).toString() || "",
                zone: _.cookies('fosp_location_zone') || "",
                province: _.cookies('fosp_location') || "",
                isp: _.cookies('fosp_isp') || "",
                country: _.cookies('fosp_country') || "",
                ip: _.cookies('fosp_ip') || ""
            };

            //parseObj(targetingObj, function(val, key){
            //    if(val) {
            //       if(key == gender) fcj.set(gender, val, opt.gender); // 15 ngay
            //       if(key == visitorid) fcj.set(visitorid, val, opt.visitorid); // 1 nam
            //    }
            //});

            if(targetingObj.fosp_aid && targetingObj.zone && targetingObj.ip){
                return targetingObj;
            } else if (win.fosp_aid && win.fosp_location_zone && win.fosp_ip) {
                targetingObj.fosp_aid = win[visitorid];
                targetingObj.fosp_gender = win[gender];
                targetingObj.zone = win['fosp_location_zone'];
                targetingObj.province = win['fosp_location'];
                targetingObj.isp = win['fosp_isp'];
                targetingObj.country = win['fosp_country'];
                targetingObj.ip = win['fosp_ip'];

                return targetingObj;
            } else {
                var timeoutTarget = window.setTimeout(function () {
                    return targetingObj;
                }, 2000);
                // first time
                JSONP.get(urlGetId, {}, function (resp) {
                    clearTimeout(timeoutTarget);

                    //fcj.set(gender, resp.gender, opt.gender); // 15 ngay
                    //fcj.set(visitorid, resp.vid, opt.visitorid); // 1 nam
                    _.cookies(gender, resp.gender, opt.gender);
                    _.cookies(visitorid, resp.vid, opt.visitorid);
                    _.cookies('fosp_location_zone', resp.zone, opt.loc);
                    _.cookies('fosp_location', resp.province, opt.loc);
                    _.cookies('fosp_isp', resp.isp, opt.loc);
                    _.cookies('fosp_country', resp.country, opt.loc);
                    _.cookies('fosp_ip', resp.ip, opt.loc);

                    targetingObj.fosp_aid = win[visitorid] = resp.vid;
                    targetingObj.fosp_gender = win[gender] = resp.gender;
                    targetingObj.zone = win['fosp_location_zone'] = resp.zone;
                    targetingObj.province = win['fosp_location'] = resp.province;
                    targetingObj.isp = win['fosp_isp'] = resp.isp;
                    targetingObj.country = win['fosp_country'] = resp.country;
                    targetingObj.ip = win['fosp_ip'] = resp.ip;

                    return targetingObj;
                });
            }
        }();

        var QueryString = function () {
            // This function is anonymous, is executed immediately and
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = win.location.hash.substring(1); // var query = win.location.search.substring(1);
            if (!query) return;
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], pair[1]];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        }();

        var Ec = { // REVIEW QC ECLICK - working on process -
            ezid: "eclick_review_ad_zone",
            ebid: "eclick_review_ad_banner"
        };

        var deliveryMsg = function (msg) {
            try {
                return listener.postMessage(msg, "*"), true
            } catch (e) {
            }
            return false
        };

        var startTime = (new Date).getTime();
        var ecUniqueId = function (a) {
            a.eclick_unique_id ? ++a.eclick_unique_id : a.eclick_unique_id = 1
        };

        var buildPageviewRequest = function (obj, url, bool) { // build ads client request // a = obj ; b = url
            if(typeof bool == "undefined") bool = true;
            var params = [],
                temp = [],
                accepted,
                tempLc = "", tempLz = "", tempLp = "";

            if(bool) {
                accepted = "url fosp_gender ts lz lc lp fosp_aid";
            } else {
                accepted = "eclick_url fosp_gender eclick_start_time loc_zone loc_country loc_province fosp_aid";
            }

            accepted = accepted.split(" ");

            parseObj(obj, function (value, key) {
                for (var i = 0; i < accepted.length; i++) {
                    if (key == accepted[i]) {
                        if(value == "undefined" || value == null) value = "";
                        if (key == accepted[0]) key = "origin";
                        if(key == accepted[1]) key = "gender";
                        if(key == accepted[2]) key = "ts";
                        if(key == accepted[3]) {
                            key = "lz";
                            tempLz = value;
                        }
                        if(key == accepted[4]) {
                            key = "lc";
                            tempLc = value;
                        }
                        if(key == accepted[5]) {
                            key = "lp";
                            tempLp = value;
                        }
                        params.push(key + "=" + value);
                    }
                }
            });
            var locStr;
            if(tempLp != "" || tempLz != "" || tempLc != "") {
                locStr =  [tempLp,"-",tempLz,"-",tempLc].join("");
            } else {
                locStr = "";
            }
            params.push("loc=" + locStr);
            params.push("ev=130920&v=4");
            var dv = "1";
            //if(isMobile()) dv = "2"; // HARDCODE
            params.push("device=" + dv);

            if(bool) {
                for(var j=0; j < beacon2Array.length; j++){
                    if(beacon2Array[j]) temp.push(beacon2Array[j]);
                }
                params.push("pv=" + uniquePageviewId + "+" + temp.join("+"));
            } else {
                params.push("pv=" + uniquePageviewId);
            }

            return url + params.join("&");
        };

        var eclickMessage = "eclick_update_data eclick_update_imp_state eclick_env_data eclick_upd_md".split(" "),
            beacon2Array = [],
            imprCounter = 0,
            frameSent = [], // not currently use
            adsSeen = []; // not currently use

        var logPageview = function (data) {
            for(var i=0;i < frameSent.length; i++){
                if(frameSent[i] == data.id) return;
            }
            beacon2Array.push(data.bc2);
            frameSent.push(data.id);
            var url;

            if (imprCounter == win.eclick_unique_id && beacon2Array.length == win.eclick_unique_id) {
                url = buildPageviewRequest(data, buildUrl(eclickLogImpDomain, "/pageview?"));
                if(win.pv_sent != "true"){
                    sendLog(url, function () {
                        beacon2Array = [];
                        win.pv_sent = "true";
                    });
                }
            }
            setTimeout(function(){
                if(beacon2Array.length > 0) {
                    url = buildPageviewRequest(data, buildUrl(eclickLogImpDomain, "/pageview?"));
                    sendLog(url, function() {
                        beacon2Array = [];
                        win.pv_sent = "true";
                    });
                }
            }, 6000)
        };

        var logTrueImp = function (data) {
            adsSeen.push(data.id);
            if (data.url) sendLog(data.url, function () {
            })
        };

        var updateEnvData = function (data) {
            parseObj(data, function (val, key) {
                win[key] = val ? val : ""
            })
        };

        var updateMetaData = function(data) {
            parseObj(data, function (val, key) {
                win[key] = val ? val : ""
            })
        };

        listener.receiveMessage(function (e) {
            var parsedData, type = "";
            try {
                parsedData = JSON.parse(e.data);
                parsedData && parsedData.type && (type = parsedData.type);
            } catch (e) {
                parsedData = {};
            }
            if (type == eclickMessage[0]) {
                imprCounter++;
                logPageview(parsedData);
            }
            if (type == eclickMessage[1]) {
                logTrueImp(parsedData);
            }
            if (type == eclickMessage[2]) {
                updateEnvData(parsedData);
            }
            if(type == eclickMessage[3]) {
                updateMetaData(parsedData);
            }
        });

        var xa = function (a) {
            xa[" "](a);
            return a
        };
        xa[" "] = function () {
        };
        var ya = function (a) {
            try {
                var b;
                if (b = !!a && null != a.location.href) a: {
                    try {
                        xa(a.foo);
                        b = true;
                        break a
                    } catch (c) {
                    }
                    b = false
                }
                return b
            } catch (d) {
                return false
            }
        };
        var Db = null,
            x = document,
            Eb = function () {
                if (!Db) {
                    for (var a = window, b = a, c = 0; a && a != a.parent;)
                        if (a = a.parent, c++, ya(a)) b = a;
                        else break;
                    Db = b
                }
                return Db
            };

        var asyncAd = !!win.eclick_async_ad,
            ecWin = asyncAd && window.parent || window;

        var Fb = function (a) {
            try {
                return !!a && null != a.location.href && Eb(a, "foo")
            } catch (b) {
                return false
            }
        };

        var TOP_WINDOW = function () {
            if (asyncAd && !Fb(ecWin)) {
                for (var a = "." + x.domain; 2 < a.split(".").length && !Fb(ecWin);) doc.domain = a = a.substr(a.indexOf(".") + 1), ecWin = window.parent;
                Fb(ecWin) || (ecWin = window)
            }
            return ecWin
        };

        var detectOs = function () {
            var ua = nav.userAgent.toLowerCase();
            if (/IEMobile/i.test(nav.userAgent)){
                return "3";
            } else if (ua.indexOf("android") > -1) {
                return "2";
            } else if (/iPad|iPhone|iPod/.test(nav.platform)) {
                return "1";
            }
            return "";
        };
        var getIsInIframe = function () {
                try {
                    return win.self !== win.top;
                } catch (e) {
                    return true;
                }
            },
            getHostName = function () {
                try {
                    if (getIsInIframe()) {
                        return doc.referrer.match(/\/[^\/:]+/)[0].substr(1);
                    } else {
                        return loc.href.match(/\/[^\/:]+/)[0].substr(1);
                    }
                } catch (e) {
                    return ""
                }
            },
            getLocation = function () {
                //return (getIsInIframe()) ? TOP_WINDOW().referrer : TOP_WINDOW().href;
                var tLoc = TOP_WINDOW().document.location;
                return tLoc.href;
            },
            getReferrer = function () {
                //return (!getIsInIframe()) ? TOP_WINDOW().referrer : (loc.ancestorOrigins && loc.ancestorOrigins[0] ? loc.ancestorOrigins[0] : TOP_WINDOW().referrer);
                var tDoc = TOP_WINDOW().document;
                return tDoc.referrer;
                //return TOP_WINDOW().self !== TOP_WINDOW().top ? (tDoc.location.ancestorOrigins && tDoc.location.ancestorOrigins[0] ? tDoc.location.ancestorOrigins[0] : tDoc.referrer) : tDoc.referrer
            },
            getScreenResolution = function () {
                return [win.screen.width, "x", win.screen.height].join("");
            },
            getJavaEnabled = function () {
                return nav.javaEnabled();
            },
            getHourString = function () {
                var date = new Date();
                return [date.getFullYear(), (parseInt(date.getMonth()) + 1), date.getDate(), date.getHours()].join("-");
            },
            getElemStyle = function (elem, win) {
                return win.getComputedStyle ? win.getComputedStyle(elem, null) : elem.currentStyle
            },
            getStyle = function (el, prop) {
                if (getComputedStyle !== 'undefined') {
                    return getComputedStyle(el, null).getPropertyValue(prop);
                } else {
                    return el.currentStyle[prop];
                }
            };

        var getIframeState = function () {
            if (win.top == win) return states.NO_IFRAMING;
            var ancOrg = win.location.ancestorOrigins;
            if (ancOrg) return ancOrg[ancOrg.length - 1] == win.location.origin ? states.SAME_DOMAIN_IFRAMING : states.CROSS_DOMAIN_IFRAMING;
            return isSameDomain(win.top) ? states.SAME_DOMAIN_IFRAMING : states.CROSS_DOMAIN_IFRAMING
        };

        var getBodyElement = function (wd) { // use to get clientWidth + clientHeight
            wd = wd.document;
            return ("CSS1Compat" == wd.compatMode ? wd.documentElement : wd.body) || {}
        };

        var Ib = function (a) {
            var b = "";
            parseObj(a.split("_"), function (a) {
                b += a.substr(0, 2)
            });
            return b
        };

        var Jb = function (a) {
            // if(b==true) getHashValue(a)
            var b = false;
            parseObj(Ec, function (c) {
                a && a.indexOf ? -1 != a.indexOf(c) ? c = true : (c = Ib(c), c = -1 != a.indexOf(c) ? true : false) : c = false;
                c && (b = true)
            });
            return b
        };

        var isObjectEmpty = function (obj) {
            var prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        }, isFunc = function (a) {
            return !!a && "function" == typeof a && !!a.call
        };

        var safeParseJSON = function (data) {
            if (window.JSON && window.JSON.parse) {
                // Support: Android 2.3
                // Workaround failure to string-cast null input
                return window.JSON.parse(data + "");
            }
        };

        var states = {
            NO_IFRAMING: 0,
            SAME_DOMAIN_IFRAMING: 1,
            CROSS_DOMAIN_IFRAMING: 2,
            NAME_FIRST_ECLICK_WINDOW: "eclick_ads_frame0",
            IFRAME_COUNTS_DELAY: 2000,
            MAXIMUM_IFRAME_DEPTH: 20
        };

        var xa = function (a) {
            xa[" "](a);
            return a
        };
        xa[" "] = function () {
        };

        var Eb = function (a, b) {
            try {
                return xa(a[b]), true
            } catch (c) {
            }
            return false
        };
        var ya = function (a) {
            try {
                var b;
                if (b = !!a && null != a.location.href) a: {
                    try {
                        xa(a.foo);
                        b = true;
                        break a
                    } catch (c) {
                    }
                    b = false
                }
                return b
            } catch (d) {
                return false
            }
        };

        var isSameDomain = function (a) {
            try {
                return !!a && null != a.location.href && Eb(a, "foo")
            } catch (b) {
                return false
            }
        };

        var getElemPosition = function (elem) {
            var currDocEl = win.document.documentElement;
            try {
                var docBounding = currDocEl.getBoundingClientRect();
                return elem.getBoundingClientRect().top - docBounding.top
            } catch (e) {
                return 0
            }
        };

        var addDomReadyEvent = function (handler) {
            var b = document;
            b.addEventListener ? b.addEventListener("DOMContentLoaded", handler, false) : b.attachEvent && b.attachEvent("onDOMContentLoaded", handler)
        };

        var Sa = function (a, b) {
            if (!(2 > arguments.length))
                for (var c = 1, d = arguments.length; c < d; ++c) a.push(arguments[c])
        };

        var ga = /^([\w-]+\.)*([\w-]{2,})(\:[0-9]+)?$/,
            ha = function (a, b) {
                if (!a) return b;
                var c = a.match(ga);
                return c ? c[0] : b
            };

        var toJsGlobalVar = function (obj) {
            var arr = [];
            for (var o in obj) {
                var oo;
                if (typeof obj[o] == "number") {
                    oo = obj[o];
                } else if (typeof obj[o] == "string") {
                    oo = "\"" + obj[o] + "\"";
                } else {
                    oo = "\"\""
                }
                arr.push(o + "=" + oo);
            }
            arr.push("");
            return arr.join(";");
        };

        var builtDesktopJsScript = function () {
            var scrt = xa("script");
            return ["<", scrt, ' src="', "js/ads_impl.js", '"></', scrt, ">"].join("")
        };

        var builtMobileJsScript = function () {
            var scrt = xa("script");
            return ["<", scrt, ' src="', buildUrl(eclickStaticDomain, "/delivery/asset/" + _version + "/eclick_mobile.js", ""), '"></', scrt, ">"].join("")
        };

        var isFunction = function (a) {
            return !!a && "function" == typeof a && !!a.call
        };

        var builtFrameStr = function (ifrObj, width, height) {
            var frameArr = ["<iframe"], css, ifrAttr;
            for (ifrAttr in ifrObj) {
                if(ifrObj.hasOwnProperty(ifrAttr) &&  ifrAttr != "className") {
                    Sa(frameArr, ifrAttr + "=" + ifrObj[ifrAttr]);
                } else {
                    Sa(frameArr, "class" + "=" + ifrObj[ifrAttr]);
                }
            }
            frameArr.push('style="position:absolute;left:0;top:0;"');
            frameArr.push("></iframe>");
            css = "border:none;height:" + height + "px;margin:0 auto;padding:0;position:relative;visibility:visible;width:" + width + "px;background-color:transparent";

            return ['<ins id="', ifrObj.id + "_ins", '" style="display:block;', css, '"><div id="',ifrObj.id,'_div" class="ad_wrapper_protection">', frameArr.join(" "), "</div></ins>"].join("")
        };

        var writeContent = function (id, str, bool) {
            return function () {
                var plag = false;
                try {
                    var ifrCnt = win.document.getElementById(id).contentWindow;
                    if (ya(ifrCnt)) {
                        var h = win.document.getElementById(id).contentWindow,
                            k = h.document;
                        k.body && k.body.firstChild || (k.open(), k.write(str));
                    } else {
                        var l = win.document.getElementById(id).contentWindow,
                            m;

                        str = String(str);
                        if (str.quote) {
                            m = str.quote();
                        } else {
                            ifrCnt = ['"'];
                            for (h = 0; h < str.length; h++) {
                                var n = str.charAt(h),
                                    u = n.charCodeAt(0),
                                    k = h + 1,
                                    x;
                                if (!(x = Ma[n])) {
                                    var y;
                                    if (31 < u && 127 > u) y = n;
                                    else {
                                        var r = n;
                                        if (r in Na) y =
                                            Na[r];
                                        else if (r in Ma) y = Na[r] = Ma[r];
                                        else {
                                            var A = r,
                                                q = r.charCodeAt(0);
                                            if (31 < q && 127 > q) A = r;
                                            else {
                                                if (256 > q) {
                                                    if (A = "\\x", 16 > q || 256 < q) A += "0"
                                                } else A = "\\u", 4096 > q && (A += "0");
                                                A += q.toString(16).toUpperCase()
                                            }
                                            y = Na[r] = A
                                        }
                                    }
                                    x = y
                                }
                                ifrCnt[k] = x
                            }
                            ifrCnt.push('"');
                            m = ifrCnt.join("");
                        }
                        l.location.replace("javascript:" + m)
                    }
                    plag = true;
                } catch (ex) {
                    //l = Eb().google_jobrunner, Jc(l) && l.rl()
                }
            }
        };

        var cssStrUrl = function(url){
            var l = ["<link "];
            l.push('rel=','\"stylesheet\" ');
            l.push('type=','\"text/css\" ');
            l.push('href=','\"'+ url +'\" >');
            return l.join("");
        };

        var ensureAd = function() {
            var countItv = 0,
                intItvAds =  win.setInterval(function(){
                    countItv++;
                    try {
                        var eDiv = doc.getElementsByClassName("ad_wrapper_protection");
                        for(var i=0,eDivLength=eDiv.length,div=eDiv[i];i<eDivLength;div=eDiv[++i]) {
                            if(div && div.getElementsByClassName('ad_frame_protection').length == 0) {
                                div.parentNode.removeChild(div) ;
                            }
                        }
                    } catch (e) {}
                    countItv > 6 && win.clearInterval(intItvAds);
                }, 1000);
        };

        var renderIframe = function (params, elem, callback) {
            var st = xa("script"),
                ifm = {};

            ifm.width = '"' + params.eclick_ad_width + '"';
            ifm.height = '"' + params.eclick_ad_height + '"';
            ifm.frameborder = '"0"';
            ifm.marginwidth = '"0"';
            ifm.marginheight = '"0"';
            ifm.vspace = '"0"';
            ifm.hspace = '"0"';
            ifm.allowtransparency = '"true"';
            ifm.scrolling = '"no"';
            ifm.allowfullscreen = '"true"';
            //ifm.style = '"width:' + params.eclick_ad_width + 'px;height:' + params.eclick_ad_height + 'px;"';
            //e.onload = '"' + Cc + '"';
            callback = callback(ifm, params); // callback return eclick_ads_frame id

            var ecConfig = toJsGlobalVar(params),
                builtJs = builtDesktopJsScript(),
                builtCss = "";

            var insStr = "<i" + "ns class=\"adsbyeclick\" data-zone=\"" + params.eclick_zone + "\" data-ad-width=\"" + params.eclick_ad_width + "\" data-ad-height=\"" + params.eclick_ad_height + "\"></i" + "ns>";

            //if(isMobile()) {
            //    builtCss = cssStrUrl(_mobile_css);
            //    //builtJs = builtMobileJsScript();
            //    //builtJs += insStr;
            //} else {
            //    builtCss = cssStrUrl(_css);
            //}

            builtCss = cssStrUrl(_css);
            var strEclickStaticFrame = "",
                strIframeContent = ["<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=yes'>", builtCss ,"</head><body style='margin: 0; padding: 0;'>", strEclickStaticFrame, "<", st, ">", "eclick_unique_id=", win.eclick_unique_id, ";" + ecConfig, "</", st, ">", builtJs, "</body></html>"].join("");

            writeContent(params.eclick_frameId, strIframeContent, true)();
        };

        var renderAdsJob = function (params, elem) {
            renderIframe(params, elem, function (ifrObj, params) {
                for (var id = ifrObj.id, h = 0; !id || win.document.getElementById(id);) {
                    id = "eclick_ads_frame" + h++;
                }
                ifrObj.id = params.eclick_frameId = id;
                ifrObj.name = id;
                ifrObj.className = "ad_frame_protection";

                var width = Number(params.eclick_ad_width),
                    height = Number(params.eclick_ad_height),
                    ecDiv;

                elem.innerHTML = builtFrameStr(ifrObj, width, height);

                return ifrObj.id;
            })
        };

        var eclick_zones = [], srmCount = 0;

        var eclickIns = function (a) { /* check ins adsbyeclick */
                for (var ecIns = document.getElementsByTagName("ins"), c = 0, ins = ecIns[c]; c < ecIns.length; ins = ecIns[++c])
                    if (checkEclickIns(ins) && (!a || ins.id == a)) {
                        return ins
                    }
                return null
            },
            checkEclickIns = function (a) {
                return eclick_ads.test(a.className) && "done" != a.getAttribute("data-adsbyeclick");
            },
            checkEclickAds = function (params) { /* check ads done or not */
                var elem = params.element;
                if (elem) {
                    if (!checkEclickIns(elem) && (elem = elem.id && eclickIns(elem.id), !elem)) throw Error("adsbyeclick: 'element' has already been filled.");
                    if (!("innerHTML" in elem)) throw Error("adsbyeclick.push(): 'element' is not a good DOM element.");
                } else if (elem = eclickIns(), !elem) throw Error("adsbyeclick.push(): All ins elements in the DOM with class=adsbyeclick already have ads in them.");

                initEclickAds(elem, params);
            };

        //var eclickEnvParams = " fosp_aid gender eclick_async_ad eclick_start_time eclick_version eclick_pv eclick_ref eclick_unique_version eclick_device eclick_url eclick_ad_host eclick_zone".split(" "); // length = 10

        var eclickInfo = {
            aa: "eclick_async_ad",
            st: "eclick_start_time",
            vs: "eclick_version",
            pv: "eclick_pv",
            rf: "eclick_ref",
            uv: "eclick_unique_version",
            dv: "eclick_device",
            ul: "eclick_url",
            ah: "eclick_ad_host",
            zn: "eclick_zone",
            vi: "fosp_aid",
            gd: "fosp_gender",
            lc: "loc_country",
            lz: "loc_zone",
            lp: "loc_province",
            lis: "loc_isp",
            li: "loc_ip"
        };

        var checkAttr = function (elem, params) {
            var ei = eclickInfo;
            for (var attrList = elem.attributes, attrLength = attrList.length, e = 0; e < attrLength; e++) {
                var attr = attrList[e], attrVal;
                if (/data-/.test(attr.name)) {
                    var ecAttr = attr.name.replace("data", "eclick").replace(/-/g, "_");
                    params.hasOwnProperty(ecAttr) || (attrVal = attr.value, null === attrVal || (params[ecAttr] = attrVal))
                }
                Jb(win.location.hash) && (params.eclick_debug = "on");
            }

            params[ei.st] = startTime; // eclick_start_time
            params[ei.rf] = encodeUrl(getReferrer() + ""); // eclick_ref
            params[ei.pv] = uniquePageviewId; // eclick_pv
            params[ei.uv] = _version; // eclick_unique_version
            params[ei.aa] = "true" && (eclickRenderAdsAsync = true); // eclick_async_ad ?
            params[ei.vs] = "4"; // eclick_version
            if(targetingUser){
                params[ei.gd] = targetingUser[gender];
                params[ei.vi] = targetingUser[visitorid].replace(/"/g,'');
                params[ei.lc] = targetingUser[loc_country];
                params[ei.lp] = targetingUser[loc_province];
                params[ei.lz] = targetingUser[loc_zone];
                params[ei.li] = targetingUser[loc_ip];
                params[ei.lis] = targetingUser[loc_isp];
            }

            //params[ei.dv] = isMobile() ? "2" : "1"; // eclick_device
            params[ei.dv] = "1";
                params[ei.ul] = encodeUrl(getLocation()); // eclick_url
            params[ei.ah] = encodeUrl(getHostName()); // eclick_ad_host
        };

        var digitRegex = /^(-?[0-9.]{1,30})$/,
            isDigit = function (a) {
                return digitRegex.test(a) && (a = Number(a), !isNaN(a)) ? a : null
            };

        var canDisplayAds = function (elem, params) {
            // check slot
            // check white list
            // check css : display none ? visibility ?
            var style;
            var stopRenderAds = false;
            if (stopRenderAds) {
                null !== isDigit(elem.getAttribute("width")) && elem.setAttribute("width", 0);
                null !== isDigit(elem.getAttribute("height")) && elem.setAttribute("height", 0);
                elem.style.width = "0px";
                elem.style.height = "0px";
                return false
            }

            return !!(style = getElemStyle(elem, win)) || "none" != style.display
        };

        var batchKeywords = { // country - zone - city
            fosp_aid: "fosp_aid",
            fosp_gender: "gender",
            loc_zone: "lz",
            loc_country: "lc",
            loc_province: "lp",
            eclick_url: "url",
            eclick_ad_host: "host",
            eclick_device: "device",
            eclick_pv: "pv",
            eclick_debug: "debug",
            eclick_channel: "chnl",
            eclick_random: "rand",
            eclick_start_time: "ts",
            eclick_version: "v",
            eclick_os: "os"
        };

        var setParams = function (a, b) {
            //if (2 > arguments.length) return a.length;
            for (var c = 1, d = arguments.length; c < d; ++c) a.push(arguments[c]);
            return a.length
        };

        var buildBatchParams = function (params, url) {
            var locZone, locCountry, locProvince, locIp, locIsp;
            try {
                var pZ = targetingUser;
                //var pZ = JSON.parse(targetingLoc) || win.loc;
                locZone = pZ.zone.toString() || win.fosp_location_zone;
                locCountry = pZ.country.toString() || win.fosp_country;
                locProvince = pZ.province.toString() || win.fosp_location;
                locIp = pZ.ip.toString() || win.fosp_ip;
                locIsp = pZ.isp.toString() || win.fosp_isp;
            } catch (e) {}

            try {
                support.flash = getFlashVers();
            } catch (e) {
                support.flash = "0";
            }

            params.eclick_support = encodeUrl(JSON.stringify(support));
            params.eclick_debug = "false";
            params.loc_zone = locZone;
            params.loc_country = locCountry;
            params.loc_province = locProvince;
            params.loc_ip = locIp;
            params.loc_isp = locIsp;
            params.eclick_random = ~~((new Date).getTime() / 100);
            params.eclick_channel = _.cookies("channel") ? _.cookies("channel") : "0";
            params.eclick_os = detectOs();

            var obj = {};
            parseObj(batchKeywords, function (val, key) {
                obj[val] = params[key] != undefined ? params[key] : ""
            });

            var c = url.slice(-1),
                d = "?" == c || "#" == c ? "" : "&",
                e = [url];
            parseObj(obj, function (val, key) {
                if (val || val == "" || 0 === val || false === val) "boolean" == typeof val && (val = val ? 1 : 0), setParams(e, d, key, "=", encodeUrl(val)), d = "&"
            });
            return e.join("")
        };

        var initEclickAds = function (elem, params) {
            checkAttr(elem, params);
            elem.setAttribute("data-adsbyeclick", "done");
            if (canDisplayAds(elem, params)) {
                // vẽ iframe
                ecUniqueId(win);
                params.eclick_batchUrl = buildBatchParams(params, buildUrl(eclickDeliveryGo, "/delivery/zone/batch.json?"));
                params.eclick_pvUrl = buildPageviewRequest(params, buildUrl(eclickLogImpDomain, "/pageview?"), false);

                renderAdsJob(params, elem);
            }
        };

        var init = function () {
            var ecAds, params;
            if ((ecAds = win.adsbyeclick) && ecAds.shift) {
                for (var i = 20; (params = ecAds.shift()) && 0 < i--;) {
                    try {
                        checkEclickAds(params);
                    } catch (error) {
                        throw win.setTimeout(init, 0), error;
                    }
                }
            }

            ecAds && ecAds.loaded || (win.adsbyeclick = {
                push: checkEclickAds,
                loaded: true
            });
            ensureAd();
        };

        /* MAGIC START*/
        init();
        /* MAGIC END*/
    })();



////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE
////////////////////////////////////////////////////////////// END HERE




    function contentLoaded(win, fn) {
        var done = false, top = true,

            doc = win.document, root = doc.documentElement,

            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',

            init = function (e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function () {
                try {
                    root.doScroll('left');
                } catch (e) {
                    setTimeout(poll, 50);
                    return;
                }
                init('poll');
            };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch (e) {
                }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
    (function (window, document, exports) {

        if (window[exports]) return;

        var onReadyQueue = [];

        window[exports] = {
            ready: function (func) {
                typeof func == 'function' && onReadyQueue.push(func);
            },
            isReady: function () {
                return false;
            }
        }

        contentLoaded(window, function () {
            var requestAdUrl = _delivery_cpm + '/ar',
                getToday = function () {
                    var d = new Date();
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                },
                getYesterday = function () {
                    var d = new Date();
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime();
                },
                getHour = function () {
                    var d = new Date();
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime();
                },
                getLastHour = function () {
                    var d = new Date();
                    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() - 1).getTime();
                },
                noop = function () {
                    return
                };

            /*var Frequency = (function (window) {

             var isSupported = Storage.isSupported(),
             dayKeyPrefix = 'evfd-',
             hourKeyPrefix = 'evfh-',
             lifetimeKeyPrefix = 'evfl',
             getDayKey = function (day) {
             return dayKeyPrefix + day;
             },
             getHourKey = function (hour) {
             return hourKeyPrefix + hour;
             },
             getLifetimeKey = function () {
             return lifetimeKeyPrefix;
             },
             expireOldKey = function () {
             Storage.expireOldKey(dayKeyPrefix, getToday());
             Storage.expireOldKey(hourKeyPrefix, getHour());
             Storage.expireLtBanner(_delivery_cpm + '/geb', lifetimeKeyPrefix);
             };

             if (isSupported) {
             contentLoaded(window, expireOldKey);
             }

             return isSupported ? {
             isSupported: function () {
             return isSupported;
             },
             get: function (callback, transformKey, stringify) {
             var today = getDayKey(getToday()),
             hour = getHourKey(getHour()),
             lifetime = getLifetimeKey();

             Storage.get([today, hour, lifetime].join(','), function (data) {

             var key, result = {}

             if (!transformKey) {
             result = data;
             } else {
             for (key in data) {
             if (key.indexOf(dayKeyPrefix) == 0) {
             result.day = data[key];
             } else if (key.indexOf(hourKeyPrefix) == 0) {
             result.hour = data[key];
             } else if (key.indexOf(lifetimeKeyPrefix) == 0) {
             result.lifetime = data[key];
             }
             }
             }

             if (stringify) {
             for (key in result) {
             result[key] = (result[key] != null) ? JSON.stringify(result[key]) : '';
             }
             }

             callback(result);
             });
             },
             set: function (adId) {
             var todayKey = getDayKey(getToday()),
             hourKey = getHourKey(getHour()),
             lifetimeKey = getLifetimeKey(),
             todayData, hourData;

             Storage.get(todayKey, function (data) {
             todayData = data[todayKey] || {};
             todayData.hasOwnProperty(adId) ? todayData[adId] += 1 : todayData[adId] = 1;
             Storage.set(todayKey, todayData);
             });

             Storage.get(hourKey, function (data) {
             hourData = data[hourKey] || {};
             hourData.hasOwnProperty(adId) ? hourData[adId] += 1 : hourData[adId] = 1;
             Storage.set(hourKey, hourData);
             });

             Storage.get(lifetimeKey, function (data) {
             lifetimeData = data[lifetimeKey] || {};
             lifetimeData.hasOwnProperty(adId) ? lifetimeData[adId] += 1 : lifetimeData[adId] = 1;
             Storage.set(lifetimeKey, lifetimeData);
             });
             },
             expireOldKey: expireOldKey
             } : {
             isSupported: function () {
             return false;
             },
             get: function (callback, transformKey) {

             if (!transformKey) {
             callback({
             day: null,
             hour: null,
             lifetime: null
             });

             return;
             }

             var result = {}
             result[getDayKey(getToday())] = result[getHourKey(getHour())] = result[getLifetimeKey()] = null;
             callback(result);

             },
             set: noop,
             expireOldKey: noop
             }

             })(window);*/

            function getPlayer(playerId) {
                return document[playerId];
            }

            function track(url) {
                (new Image()).src = url;
            }

            function $log() {
                window.console && window.console.log && window.console.log(arguments[0]);
            }

            var trackedAds = {};

            window[exports] = window[exports] || {};

            _.extend(window[exports], {
                ready: function (func) {
                    func();
                },
                isReady: function () {
                    return true;
                },
                getAd: (function () {

                    var expiredOldKey = false;

                    return function (zoneId, playerId, callback) {

                        if (!expiredOldKey) {
                            //Frequency.expireOldKey();
                            expiredOldKey = true;
                        }

                        new xhr(requestAdUrl, function (data) {
                            if (typeof callback == 'function') {
                                callback(data);
                            }
                            else {
                                var player = getPlayer(playerId);
                                player && typeof player[callback] == 'function' && player[callback](data);
                            }
                        }).send({
                                zone_id: zoneId,
                                url: window.top == window.self ? window.location.href : window.document.referrer,
                                fd: '',
                                fh: '',
                                fl: ''
                            });

//                    JSONP.get(requestAdUrl, {
//                        zone_id: zoneId,
//                        url: window.location.href,
//                        fd: '',
//                        fh: '',
//                        fl: ''
//                    }, function (data) {
//
//                        if (typeof callback == 'function') {
//                            callback(data);
//                        }
//                        else {
//                            var player = getPlayer(playerId);
//                            player && typeof player[callback] == 'function' && player[callback](data);
//                        }
//
//                    });

                        // var r = function(data){
                        //         JSONP.get(requestAdUrl, {
                        //              zone_id: zoneId,
                        //              url: window.location.href,
                        //              fd: data.day,
                        //              fh: data.hour,
                        //              fl: data.lifetime
                        //         }, function (data) {
                        //              var player = getPlayer(playerId);
                        //              player && typeof player[callback] == 'function' && player[callback](data);
                        //         });
                        //     },
                        //     timeout = setTimeout(function(){
                        //         $log('!!!');
                        //         r({
                        //             day: '',
                        //             hour: '',
                        //             lifetime: ''
                        //         });
                        //     }, 500);


                        // Frequency.get(function (data) {
                        //     clearTimeout(timeout);
                        //     $log('@@@');
                        //     r(data);
                        // }, true, true);

                    }

                    })(),
                trackAd: function (url, adId, zoneId, event) {
                    track(url);

                    if (event == 'start' && !trackedAds[adId]) {
                        //Frequency.set(adId);
                        trackedAds[adId] = 1;
                    }

                    loadFrame(_gaUrl + "?actionType=video:" + event + "&bannerId=" + adId + "&zone=" + zoneId, "eClick-" + zoneId);
                }
            });

            _.forEach(onReadyQueue, function (func) {
                func();
            });
        });
    })(window, document, 'ECLIMA');






})(window);