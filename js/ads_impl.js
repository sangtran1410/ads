;
(function (window) {
    if (window.eClick) {
        return;
    }


// doT.js
// 2011, Laura Doktorova, https://github.com/olado/doT
//
// doT.js is an open source component of http://bebedo.com
// Licensed under the MIT license.
//
    (function () {
        "use strict";
        var doT = {
            version: '0.2.0',
            templateSettings: {
                evaluate: /\{\{([\s\S]+?)\}\}/g,
                interpolate: /\{\{=([\s\S]+?)\}\}/g,
                encode: /\{\{!([\s\S]+?)\}\}/g,
                use: /\{\{#([\s\S]+?)\}\}/g,
                define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
                conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
                iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
                varname: 'it',
                strip: true,
                append: true,
                selfcontained: false
            },
            template: undefined, //fn, compile template
            compile: undefined  //fn, for express
        };

        var global = (function () {
            return this || (0, eval)('this');
        }());

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = doT;
        } else if (typeof define === 'function' && define.amd) {
            define(function () {
                return doT;
            });
        } else {
            global.doT = doT;
        }

        if (!global.doT && doT) {
            global.doT = doT;
        }

        function encodeHTMLSource() {
            var encodeHTMLRules = {"&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;'},
                matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
            return function (code) {
                return code ? code.toString().replace(matchHTML, function (m) {
                    return encodeHTMLRules[m] || m;
                }) : code;
            };
        }

        global.encodeHTML = encodeHTMLSource();

        var startend = {
            append: {start: "'+(", end: ")+'", startencode: "'+encodeHTML("},
            split: {start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML("}
        }, skip = /$^/;

        function resolveDefs(c, block, def) {
            return ((typeof block === 'string') ? block : block.toString())
                .replace(c.define || skip, function (m, code, assign, value) {
                    if (code.indexOf('def.') === 0) {
                        code = code.substring(4);
                    }
                    if (!(code in def)) {
                        if (assign === ':') {
                            def[code] = value;
                        } else {
                            eval("def['" + code + "']=" + value);
                        }
                    }
                    return '';
                })
                .replace(c.use || skip, function (m, code) {
                    var v = eval(code);
                    return v ? resolveDefs(c, v, def) : v;
                });
        }

        function unescape(code) {
            return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, ' ');
        }

        doT.template = function (tmpl, c, def) {
            c = c || doT.templateSettings;
            var cse = c.append ? startend.append : startend.split, str, needhtmlencode, sid = 0, indv;

            if (c.use || c.define) {
                var olddef = global.def;
                global.def = def || {}; // workaround minifiers
                str = resolveDefs(c, tmpl, global.def);
                global.def = olddef;
            } else str = tmpl;

            str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, ' ')
                .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, '') : str)
                .replace(/'|\\/g, '\\$&')
                .replace(c.interpolate || skip, function (m, code) {
                    return cse.start + unescape(code) + cse.end;
                })
                .replace(c.encode || skip, function (m, code) {
                    needhtmlencode = true;
                    return cse.startencode + unescape(code) + cse.end;
                })
                .replace(c.conditional || skip, function (m, elsecase, code) {
                    return elsecase ?
                        (code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
                        (code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
                })
                .replace(c.iterate || skip, function (m, iterate, vname, iname) {
                    if (!iterate) return "';} } out+='";
                    sid += 1;
                    indv = iname || "i" + sid;
                    iterate = unescape(iterate);
                    return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){"
                        + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
                })
                .replace(c.evaluate || skip, function (m, code) {
                    return "';" + unescape(code) + "out+='";
                })
            + "';return out;")
                .replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r')
                .replace(/(\s|;|}|^|{)out\+='';/g, '$1').replace(/\+''/g, '')
                .replace(/(\s|;|}|^|{)out\+=''\+/g, '$1out+=');

            if (needhtmlencode && c.selfcontained) {
                str = "var encodeHTML=(" + encodeHTMLSource.toString() + "());" + str;
            }
            try {
                return new Function(c.varname, str);
            } catch (e) {
                if (typeof console !== 'undefined') console.log("Could not create a template function: " + str);
                throw e;
            }
        };

        doT.compile = function (tmpl, def) {
            return doT.template(tmpl, null, def);
        };
    }());


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

    var UA, _this = this; // string userAgent
    a: {
        var tnav = _this.navigator;
        if (tnav) {
            var tua = tnav.userAgent;
            if (tua) {
                UA = tua;
                break a
            }
        }
        UA = ""
    }

    var checkUa = function (strUa) {
        return -1 != UA.indexOf(strUa)
    };
    var isEdge = function () {
        return checkUa("Edge")
    };
    var isTablet = function () {
        return checkUa("iPad") || checkUa("Android") && !checkUa("Mobile") || checkUa("Silk")
    };
    var isMobile = function () {
        return (/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent));
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
            el.className = el.className.replace(reg, ' ')
        }
    }

    function cstr(str) {
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
                parseObj(str, function (val, key) {
                    css += key + ":" + val + ";";
                });
                return css;
            }
        }
        if (str === false) return 'false';
        if (str === true) return 'true';
        return (str) ? S(str) : "";
    }

    var closest = function (el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    function css(el, val) {
        var st, LEN = "length";

        try {
            st = el.style;

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
            window[jsonp] = function (data) {
                callback(data);
                try {
                    delete window[jsonp];
                } catch (e) {
                    window[jsonp] = null;
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

    var getCookieWithArrayResult = function (name) {
        var valArr = [],
            c = doc.cookie["split"](";");
        name = new RegExp("^\\s*" + name + "=\\s*(.*?)\\s*$");
        for (var i = 0; i < c["length"]; i++) {
            var val = c[i]["match"](name);
            val && valArr["push"](val[1])
        }
        return valArr
    };

    var writeCookieOnThisDomain = function (url) {
        url = url || document.domain;

        // IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
        url = url.replace(/^\s+/, ""); // START
        url = url.replace(/\s+$/, ""); // END

        // IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
        url = url.replace(/\\/g, "/");

        // IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
        url = url.replace(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i, "");

        // IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
        url = url.replace(/^www\./i, "");

        var origin = [".", url].join("");

        url = url.split(".");

        var candidate = "", temp = [], arr = [];

        for (var i = 1; i <= url.length; i++) {
            temp.push([".", url[url.length - i].replace(/[^a-zA-Z0-9]/g, "")].join(""));
        }

        for (var j = temp.length; j > 0; j--) {
            candidate = temp[temp.length - j] + candidate;
            arr.push(candidate);
        }

        for (var k = 0; k < arr.length; k++) {
            var isCookieDomain = _.cookies.set('isCookieDomain', '1', {domain: arr[k]}).get('isCookieDomain') === '1';
            _.cookies.expire('isCookieDomain', {domain: arr[k]});
            if (isCookieDomain) return arr[k];
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
        document.getElementsByClassName = function (search) {
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
                    if (pattern.test(elements[i].className)) {
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

        if (typeof foreverCookieJob.instance == 'object') {
            return foreverCookieJob.instance;
        }

        this.set = function (name, value, options) {
            if (!value) return;
            t.main(name, value, options);
            //delay += 1000;
        };

        this.get = function (name) {
            return this.main(name, undefined, undefined);
        };

        this.update = function (name, value, options) {
            if (!value) return;
            t.watcher(undefined, undefined, true);
            t.main(name, value, options);
        };

        this.main = function (name, value, options) {
            var ckData, lsData, wnData;
            ckData = t._cookie_data(name, value, options);
            lsData = t._local_storage(name, value);
            wnData = t._win_name(name, value);

            t.watcher(name, function (value) {
                if (value == null || value == "null") return;
                t._cookie_data(name, value, options);
                t._local_storage(name, value);
                t._win_name(name, value);
            });
            if (value == undefined) return ckData || lsData || wnData;
        };

        this.watcher = function (name, callback, bool) {
            var itv = window.setInterval(function () {
                if (name) {
                    if (cookieReg[name] && (cookieReg[name] != null || cookieReg[name] != "null")) {
                        if (_.cookies(name) != null && _.cookies(name) != cookieReg[name]) cookieReg[name] = _.cookies(name);
                        if (localStore && localStore.getItem(name) != cookieReg[name]) cookieReg[name] = localStore.getItem(name);
                        if (t._win_name(name) != cookieReg[name]) cookieReg[name] = t._win_name(name);
                        return callback(cookieReg[name]);
                    } else if (_.cookies(name) != null || _.cookies(name) != "null") {
                        cookieReg[name] = _.cookies(name);
                    }
                }
            }, delay);
            if (bool) clearInterval(itv)
        };

        this._win_name = function (name, value) {
            try {
                if (value !== undefined) {
                    window.name = this._ec_replace(window.name, name, value);
                } else {
                    return this.getFrmStr(name, window.name);
                }
            } catch (e) {
            }
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
            } catch (e) {
            }
        };

        this._cookie_data = function (name, value, options) {
            options = options || {};
            try {
                if (value !== undefined) {
                    _.cookies(name, value, options)
                } else {
                    return this.getFrmStr(name, document.cookie);
                }
            } catch (e) {
            }
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
                    } catch (f) {
                    }
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
    ////////////////////////////////////////////////////////////// START HERE
    ////////////////////////////////////////////////////////////// START HERE


    var _version = 289908722, _debug = false, debugParams = {}, _delivery = "//staging.j.eclick.vn/delivery", _delivery_static = "//staging.s.eclick.vn/", _delivery_cpm = "//staging.cpm.j.eclick.vn", _log = {
        "impressions": "//t.eclick.vn",
        "clicks": "//c.eclick.vn",
        "trueImpressions": "//t.eclick.vn",
        "cpm": "//t.eclick.vn"
    }, _css = "//staging.s.eclick.vn/delivery/asset/289908722/eclick.css", _mobile_css = "//staging.s.eclick.vn/delivery/asset/289908722/eclick_mobile.css", _online_friday_css = "//staging.s.eclick.vn/delivery/asset/289908722/eclick_online_friday.css", freq = {
        "expireDays": 7,
        "maxTrueImp": 10,
        "maxBanners": 10,
        "key": {"trueImp": 0, "click": 1, "lastSeen": 2}
    }, _rUrl = "//staging.s.eclick.vn/delivery/asset/289908722/r.html", blockedBanners = [];

    /**
     * Created by phatpt3 on 6/16/2015.
     */

    (function () {
        var win = window,
            doc = document,
            loc = win.location,
            nav = navigator,
            self = this;

        var eclickSimpleRender = false,
            eclickRenderAdsAsync = !!(win.eclick_async_ad) || true, // hardcode
            eclickRenderAdsAsyncSingleRequest = false,
            isEcAsync = eclickRenderAdsAsync,
            parWin = window.parent || window;

        var ECLICKVN = ".eclick.vn",
            eclickLogImpDomain = "t" + ECLICKVN,
            eclickClickDomain = "c" + ECLICKVN,
            eclickDeliveryDomain = "staging.j" + ECLICKVN,
            eclickStaticDomain = "staging.s" + ECLICKVN,
            eclickLogDomain = "log" + ECLICKVN,
            eclickDeliveryGo = "g" + ECLICKVN,
            eclickDeliveryStagingGo = "staging.g" + ECLICKVN,
            eclickLogIp = "r" + ECLICKVN;

        // Zone Formats
        var ECLICK_WIDGET_NOPRICE = 101,
            ECLICK_WIDGET_PRICE = 102,
            ECLICK_WIDGET_METRO_PRICE = 103,
            ECLICK_WIDGET_BIG_METRO = 104,
            ECLICK_WIDGET_METRO_NOPRICE = 105,
            ECLICK_WIDGET_PRODUCT_LIST = 106,
            ECLICK_WIDGET_TEXT_LINK = 107,
            ECLICK_WIDGET_ARTICLE_SPOTLIGHT = 108,
            ECLICK_WIDGET_ONLINE_FRIDAY = 109,
            ECLICK_CREATIVE_DEFAULT = 200,
            ECLICK_CREATIVE_STANDARD_IMAGE = 201,
            ECLICK_CREATIVE_GALLERY = 401,
            ECLICK_WIDGET_DEFAULT_NATIVE_AD = 500,
            ECLICK_WIDGET_NATIVE_AD = 501,
            ECLICK_WIDGET_NATIVE_AD_DETAIL = 502,
            ECLICK_RICH_MEDIA_STANDARD = 601,
            ECLICK_RICH_MEDIA_BALLOON = 602,
            ECLICK_CREATIVE_INPAGE_FULLSCREEN = 701;

        // REGEX
        var eclick_ads = /(^| )adsbyeclick($| )/,
            eclick_banner = /(^| )eclick_banner($| )/,
            eclick_flash = /(^| )eclick_flash($| )/,
            vne = /vnexpress/,
            gamethu = /gamethu.vnexpress/;

        var genderid = "fosp_gender",
            visitorid = "fosp_aid",
            EQUAL = "=",
            RESIZE = "resize",
            SCROLL = "scroll",
            CLICK = "click",
            TOUCHMOVE = "touchmove",
            MOUSEOVER = "mouseover",
            MOUSEOUT = "mouseout",
            MOUSEENTER = "mouseenter",
            MOUSELEAVE = "mouseleave";

        var noop = function () {};
        var Db = function (obj) {
            Db[" "](obj);
            return obj
        };

        Db[" "] = noop;
        var Eb = function (a, b) {
            try {
                return Db(a[b]), true
            } catch (c) {}
            return false
        };

        var Fb = function (a) {
            try {
                return !!a && null != a.location.href && Eb(a, "foo")
            } catch (b) {
                return false
            }
        };

        var getTopWin = function () {
            if (!Fb(parWin)) {
                for (var a = "." + doc.domain; 2 < a.split(".").length && !Fb(parWin);) doc.domain = a = a.substr(a.indexOf(".") + 1), parWin = window.parent;
                Fb(parWin) || (parWin = win)
            }
            return parWin
        };

        var mobileRatio = 1.5, ios = false, adr = false, wdp = false, topWin = getTopWin(), topDoc = topWin.document, ua = nav.userAgent.toLowerCase();
        if (/iPad|iPhone|iPod/.test(nav.platform)) {
            mobileRatio = 1;
            ios = true;
        }
        if(ua.indexOf("android") > -1) {
            adr = true;
        }
        if(/IEMobile/i.test(nav.userAgent)){
            wdp = true;
        }

        var RichMediaType = {
            flash: 1,
            gif: 4,
            html5: 16,
            srcHtml5: 32
        };

        var     SimpleType = {
            eca: 1, // ECLICK_CLEAR_ALL
            esdc: 2, // ECLICK_SHOW_DEFAULT_CREATIVE
            espb: 3, // ECLICK_SCRIPT_PASS_BACK
            esdi: 4 // ECLICK_SHOW_DEFAULT_IMAGE
        };

        var FormatNameKeys = {
            classic: ECLICK_WIDGET_NOPRICE,
            eclick_cogia: ECLICK_WIDGET_PRICE,
            eclick_gallery: ECLICK_CREATIVE_GALLERY,
            eclick_image: ECLICK_CREATIVE_STANDARD_IMAGE,
            eclick_rich_media: ECLICK_RICH_MEDIA_STANDARD,
            eclick_balloon: ECLICK_RICH_MEDIA_BALLOON
        };

        var canAccess = function (a) {
                try {
                    return !!a && null != a.location.href && Eb(a, "foo")
                } catch (b) {
                    return false
                }
            },
            ed = function (a, b) {
                for (var c = 0, d = a, e = 0; a != a.parent;)
                    if (a = a.parent, e++, canAccess(a)) d = a, c = e;
                    else if (b) break;
                return {
                    win: d,
                    level: c
                }
            },
            gd = function (a) {
                a = ed(a, false);
                return a.win
            };

        function detectEnv(a, b, c) {
            var obj = {};
            obj.topAvailableWindow = gd(win);
            //d.topLocation = Ji(d.topAvailableWindow, c);
            //d.inAdframe = Fi(C(), b, a.google_ad_width, a.google_ad_height);
            //d.iframing = Ki(a, d.inAdframe, d.topLocation.isTopUrl);
            return obj
        }

        function optimizeEvents() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !topWin.requestAnimationFrame; ++x) {
                topWin.requestAnimationFrame = topWin[vendors[x]+'RequestAnimationFrame'];
                topWin.cancelAnimationFrame = topWin[vendors[x]+'CancelAnimationFrame']
                || topWin[vendors[x]+'CancelRequestAnimationFrame'];
            }

            if (!topWin.requestAnimationFrame) {
                topWin.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = topWin.setTimeout(function() { callback(currTime + timeToCall); },
                        timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
            if (!topWin.cancelAnimationFrame) {
                topWin.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
            }

            var throttle = function(type, name, obj) {
                var obj = obj || topWin,
                    running = false,
                    func = function() {
                        if (running) { return; }
                        running = true;
                        obj.requestAnimationFrame(function() {

                            try {
                                /* init - you can init any event */
                                obj.dispatchEvent(new CustomEvent(name));
                                throttled = true;
                            } catch (e) {
                                throttled = false;
                            }
                            running = false;
                        });
                    };

                addEvent(obj, type, func);
            }, throttled;

            throttle(RESIZE, "optimizedResize", topWin);
            throttle(RESIZE, "optimizedResize", win);
            throttle(SCROLL, "optimizedScroll", topWin);
            throttle(TOUCHMOVE, "optimizedTouchmove", topWin);

            if (throttled){
                RESIZE = "optimizedResize";
                SCROLL = "optimizedScroll";
                TOUCHMOVE = "optimizedTouchmove";
            }
        }

        var ecStorage, isLoaded = false, updateCookie = function(storage) {
            storage && storage.getVid('fosp_aid', function(cb){
                parseObj(cb, function(val, key){
                    var opt = {
                        fosp_aid: {
                            path: '/',
                            expires: 365 * 24 * 3600,
                            domain: writeCookieOnThisDomain
                        },
                        fosp_gender: {
                            path: '/',
                            expires: 15 * 24 * 3600,
                            domain: writeCookieOnThisDomain
                        },
                        loc: {
                            path: '/',
                            expires: 10 * 24 * 3600,
                            domain: writeCookieOnThisDomain
                        }
                    };
                    if (_.cookies(key) != val) {
                        var fcj = new foreverCookieJob();
                        if (key == visitorid || key == genderid){
                            fcj.update(key, val, opt[key]);
                        } else {
                            fcj.update(key, val, opt.loc)
                        }
                    }
                });
            });
        };

        //var ic = function () {
        //    for (var b = [win.top], c = [], d = 0, e; e = b[d++];) {
        //        !Fb(e) || c.push(e);
        //        try {
        //            if (e.frames)
        //                for (var f = e.frames.length, g = 0; g < f && 1024 > b.length; ++g) b.push(e.frames[g])
        //        } catch (h) {
        //        }
        //    }
        //    return c
        //};
        //var jh = function (a) {
        //    for (var b = ic(), c = 0; c < b.length; c++) try {
        //        var d = b[c].frames.eclick_sf;
        //        if (d && (!a || Fb(d))) return d
        //    } catch (e) {
        //    }
        //    return null
        //};

        contentLoaded(topWin, function () {
            ecStorage = (function (postMessage, localStorage, JSON) {

                var esf = null, eclickStaticFrame, loadEsf;
                if (!esf) b: {
                    var topArr = [win.top];
                    var winArr = [];
                    for (var w,i = 0; w = topArr[i++];) {
                        !Fb(w) || winArr.push(w);
                        try {
                            if (w.frames)
                                for (var J = w.frames.length, Z = 0; Z < J && 1024 > topArr.length; ++Z) topArr.push(w.frames[Z])
                        } catch (ex) {}
                    }
                    for (J = 0; J < winArr.length; J++) try {
                            if (eclickStaticFrame = winArr[J].frames.eclick_sf) {
                                esf = eclickStaticFrame;
                                break b
                            }
                    } catch (ex) {}
                    esf = null
                }

                loadEsf = !esf;

                //loadEsf = !jh(false);
                if (!loadEsf){
                    return;
                }
                isLoaded = true;

                var proxyUrl = _delivery_static + 'delivery/lookup.html',// lookup.html
                    isSupported = !!window.postMessage && !!window.localStorage && !!window.JSON,
                    proxy, cbc = 0, isReady = false,
                    createCallback = function (callback) {
                        var callbackName = 'adFreCb' + (++cbc);
                        window[callbackName] = callback;
                        return callbackName;
                    };

                var ensuredGet = makeSure(function (key, callback) {
                    proxy.postMessage(JSON.stringify({
                        action: 'get',
                        key: key,
                        callback: createCallback(callback)
                    }), '*');
                });

                var ensuredSet = makeSure(function (key, value) {
                    proxy.postMessage(JSON.stringify({
                        action: 'set',
                        key: key,
                        value: JSON.stringify(value)
                    }), '*');
                });

                var getVid = makeSure(function (key, callback) {
                    proxy.postMessage(JSON.stringify({
                        action: 'targeting',
                        callback: createCallback(callback)
                    }), '*');
                });

                isSupported && (proxy = (function () {
                    var callback = function (params) {
                        try {
                            //if (!params.origin.match(/eclick/ig)) {
                            //    return;
                            //}
                            var response = JSON.parse(params.data),
                                cb = window[response.callback];
                            if (typeof cb == 'function') {
                                cb(response.data);
                                cb = noop;
                            }
                        } catch (e) {
                            console.error('exception while processing message from proxy', e);
                        }
                    };

                    addEventListener(window, 'message', callback);

                    var proxy = document.createElement('iframe');
                    proxy.src = proxyUrl;
                    //proxy.id = 'eclick-proxy-' + Math.random().toString().split('.')[1];
                    proxy.id = 'eclick_sf';
                    proxy.name = 'eclick_sf';
                    proxy.width = 0;
                    proxy.height = 0;
                    proxy.style.display = 'none';
                    document.body.appendChild(proxy);
                    proxy.onload = function () {
                        isReady = true;
                        ensuredGet.setReady();
                        ensuredSet.setReady();
                        getVid.setReady();
                    };
                    return proxy.contentWindow;

                })());

                return isSupported ? {
                    isSupported: function () {
                        return isSupported;
                    },
                    isReady: function () {
                        return isReady;
                    },
                    get: ensuredGet,
                    set: ensuredSet,
                    getVid: getVid,
                    expireOldKey: function (prefix, time) {
                        proxy.postMessage(JSON.stringify({
                            action: 'expireOldKey',
                            prefix: prefix,
                            time: time
                        }), '*');
                    },
                    expireLtBanner: function (geb, ltk) {
                        proxy.postMessage(JSON.stringify({
                            action: 'expireLtBanner',
                            geb: geb,
                            ltk: ltk
                        }), '*');
                    },
                    getProxy: function () {
                        return proxy;
                    }

                } : {
                    isSupported: function () {
                        return false;
                    },
                    isReady: function () {
                        return false;
                    },
                    get: function (key, cb) {
                        cb(null);
                    },
                    getVid: function (key, cb) {
                        cb(null);
                    },
                    set: noop
                }

            })(window.postMessage, window.localStorage, window.JSON);

            setInterval(function(){
                updateCookie(ecStorage);
            }, 2000);

        });

        var getUrlComponent = function (url) {
            var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
            return match &&
                {
                    protocol: match[1],
                    host: match[2],
                    hostname: match[3],
                    port: match[4],
                    pathname: match[5],
                    search: match[6],
                    hash: match[7]
                };
        };

        var buildUtmTracking = function (parsedUrl) { /* build utm for google tracking */
            if (parsedUrl) {
                var urlParams = parsedUrl.search.replace(/^\?/, '').split("&"), searchArr = [];
                for (var i = 0, param, split; param = urlParams[i]; i++) {
                    split = param.split("=");
                    if (split[0] == 'utm_source' && split[1] == '') {
                        searchArr.push('utm_source=eclick');
                    } else if (split[0] == 'utm_content' && split[1] == '') {
                        try {
                            searchArr.push('utm_content=' + loc.hostname);
                        } catch(e) {}
                    } else {
                        searchArr.push(param)
                    }
                }
                return [(parsedUrl.protocol ? parsedUrl.protocol : ""), "//", parsedUrl.host, ((typeof (parsedUrl.port) != "undefined") ? parsedUrl.port : ""), parsedUrl.pathname, (searchArr.length > 0 ? ("?" + searchArr.join("&")) : ""), parsedUrl.hash].join("");
            }
            return "";
        };

        var buildLogoBar = function (dataId) {
            var key, logo_bar, value, weekNum, date;
            date = new Date;
            weekNum = getWeekNum(date);
            logo_bar = {
                source: "zone-" + dataId + "-" + (win.eclick_ad_host),
                medium: 'logo_bar_cpc',
                campaign: "EC:w" + weekNum + ":m" + (date.getMonth() + 1) + ":y" + (date.getYear() - 100)
            };

            return {
                logo_bar: ((function () {
                    var _results;
                    _results = [];
                    for (key in logo_bar) {
                        value = logo_bar[key];
                        _results.push("utm_" + key + EQUAL + value);
                    }
                    return _results;
                })()).join('&')
            };
        };

        var getZoneRect = function (elem) {
            try {
                var bounding = elem.getBoundingClientRect();
            } catch (e) {
                try {
                    var rect = {
                        "top": 0,
                        "right": 0,
                        "left": 0,
                        "height": elem.firstChild.offsetHeight ? elem.firstChild.offsetHeight : 0,
                        "width": elem.firstChild.offsetWidth ? elem.firstChild.offsetWidth : 0
                    };
                    return encodeUrl(JSON.stringify(rect));
                } catch (e) {
                    rect = {"top": 0, "right": 0, "left": 0, "height": 0, "width": 0};
                    return encodeUrl(JSON.stringify(rect));
                }
            }
            return JSON.stringify({
                "top": bounding.top,
                "right": bounding.right,
                "left": bounding.left,
                "height": bounding.height,
                "width": bounding.width
            });
        };

        var getScreenResolution = function () {
            return [win.screen.width, "x", win.screen.height].join("");
        };

        var buildPageviewMsg = function (obj) { // BUILD PAGEVIEW PARAMS
            var pvKey = "url ts lz lc lp fosp_aid fosp_gender bc2 eclick_ad_done".split(" ");
            var message = {
                id: win.eclick_frameId,
                type: "eclick_update_data",
                unique: win.eclick_unique_version
            };
            parseObj(obj, function (val, key) {
                for (var i = 0; i < pvKey.length; i++) {
                    if (pvKey[i] == key) {
                        message[key] = val
                    }
                }
            });
            return JSON.stringify(message);
        };

        var eclickTrueImpressionKey = {
            h: "h",
            m: "m",
            s: "s",
            lc: "lc",
            lz: "lz",
            lp: "lp",
            url: "url",
            ref: "urlref",
            host: "hostname",
            beacon: "beacon",
            res: "res",
            format: "zone_format",
            vid: "fosp_aid",
            gd: "gender",
            rand: "rand",
            rect: "rect",
            tsv: "tsv",
            t2r: "t2r",
            t2t: "t2t",
            dv: "device",
            vs: "v",
            os: "os"
        };

        var builtTrueImpressionUrl = function (params) {
            var now = new Date(),
                rand = ~~(Date.now() / 100),
                base = buildUrl(eclickLogImpDomain, "/l?"),
                tik = eclickTrueImpressionKey,
            //dv = win.eclick_device ? win.eclick_device : "1", // HARDCODE
                dv = "1",
                os = ios ? "1" : (adr ? "2" : (wdp ? "3" : ""));

            //var locZone, locCountry, locProvince, loc;
            //try {
            //    locZone = targetingLoc.zone.toString();
            //    locCountry = targetingLoc.country.toString();
            //    locProvince = targetingLoc.province.toString();
            //    if (locZone != "" || locCountry != "" || locProvince != "") {
            //        loc = [locProvince,"-",locZone,"-",locCountry].join("")
            //    }
            //} catch (e) {}

            var url = [];
            url.push(tik.h + EQUAL + now.getHours());
            url.push(tik.m + EQUAL + now.getMinutes());
            url.push(tik.s + EQUAL + now.getSeconds());
            url.push([tik.lc, EQUAL, params.zenv.lc].join(""));
            url.push([tik.lz, EQUAL, params.zenv.lz].join(""));
            url.push([tik.lp, EQUAL, params.zenv.lp].join(""));
            url.push(["loc", EQUAL, params.zenv.loc].join(""));
            url.push(tik.url + EQUAL + win.eclick_url);
            url.push(tik.ref + EQUAL + win.eclick_ref);
            url.push(tik.host + EQUAL + win.eclick_ad_host);
            url.push(tik.beacon + EQUAL + params.beacon);
            url.push(tik.res + EQUAL + getScreenResolution());
            url.push(tik.format + EQUAL + params.zoneFormat);
            url.push([tik.vid, EQUAL, win.fosp_aid].join(""));
            url.push([tik.gd, EQUAL, win.fosp_gender].join(""));
            url.push(tik.rand + EQUAL + rand);
            url.push(tik.rect + EQUAL + getZoneRect(params.zoneElm));
            url.push(tik.tsv + EQUAL + params.tsv);
            url.push(tik.t2r + EQUAL + params.time2render);
            url.push(tik.t2t + EQUAL + params.time2see);
            url.push(tik.dv + EQUAL + dv);
            url.push(tik.os + EQUAL + os);
            url.push(tik.vs + EQUAL + "4");
            return [base, url.join("&")].join("");
        };

        var availableWindowObj = detectEnv(win, doc);

        var shuffle = function (array) {
            var currentIndex = array.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        };

        var addComma = function (num) {
            if (!num) return;
            var length = 0, counter = 0, result = [];

            if (typeof num === 'number') {
                num = "" + num;
            } else {
                num = num.replace(/\D/g, '');
            }

            num = num.replace(/^0+(\d)/g,
                function ($0, $1) {
                    return $1;
                }).split('');

            length = num.length;
            while (length--) {
                result.push(num[length]);
                if (++counter % 3 == 0 && length) {
                    //length++;
                    result.push('.')
                }
            }

            return result.reverse().join('');
        };

        var random = function (min, max, integer) {
            var r = Math.random() * (max - min) + min;
            return integer ? r | 0 : r;
        };

        var setParams = function (arr, arg) {
            if (2 > arguments.length) return arr.length;
            for (var c = 1, d = arguments.length; c < d; ++c) arr.push(arguments[c]);
            return arr.length
        };

        var buildBatchRequest = function (obj, url) { // build ads client request // a = obj ; b = url
            var c = url.slice(-1),
                d = "?" == c || "#" == c ? "" : "&",
                arr = [url],
                callback = function (val, key) {
                    if (val || 0 === val || false === val) "boolean" == typeof val && (val = val ? 1 : 0), setParams(arr, d, key, "=", "function" == typeof encodeURIComponent ? encodeURIComponent(val) : escape(val)), d = "&"
                };
            parseObj(obj, callback);
            return arr.join("")
        };

        var eclickClickKey = {
            beacon: "beacon",
            link: "link",
            ts: "ts",
            url: "url",
            ref: "urlref",
            host: "hostname",
            tsv: "tsv",
            res: "res",
            format: "zone_format",
            loc: "loc",
            lp: "lp",
            lz: "lz",
            lc: "lc",
            vid: "fosp_aid",
            gd: "gender",
            rand: "rand",
            mt: "method",
            dv: "device",
            os: "os",
            bid: "bid",
            vs: "v"
        };

        var buildClickUrl = function (zoneData, bannerData, zenv) {
            var now, params, ck = eclickClickKey;
            now = Date.now();
            var rand = ~~(Date.now() / 100),
            //dv = win.eclick_device ? win.eclick_device : "1", // HARDCODE
                dv = "1",
                os = ios ? "1" : (adr ? "2" : (wdp ? "3" : ""));
            //try {
            //    var locationParam = targetingLoc,
            //        prov = locationParam.province || "29",
            //        zone = locationParam.zone || "1",
            //        country = locationParam.country || "vn";
            //    locationParam = [prov, zone, country].join("-");
            //} catch (e) {
            //    locationParam = win.JSON && JSON.stringify(targetingLoc);
            //    prov = zone = country = "";
            //}

            params = [];
            params.push(ck.beacon + EQUAL + bannerData.beacon);
            params.push(ck.link + EQUAL + encodeUrl(bannerData.url ? bannerData.url + "" : ""));
            params.push(ck.ts + EQUAL + ~~(now / 1000));
            params.push(ck.url + EQUAL + win.eclick_url);
            params.push(ck.ref + EQUAL + win.eclick_ref);
            params.push(ck.host + EQUAL + win.eclick_ad_host);
            params.push(ck.tsv + EQUAL +zoneData.serverTime );
            params.push(ck.res + EQUAL + getScreenResolution());
            params.push(ck.format + EQUAL + bannerData.zoneFormatId);
            params.push(ck.loc + EQUAL + zenv.loc);
            params.push(ck.lp + EQUAL + zenv.lp);
            params.push(ck.lz + EQUAL + zenv.lz);
            params.push(ck.lc + EQUAL + zenv.lc);
            params.push([ck.vid, EQUAL, win.fosp_aid].join(""));
            params.push([ck.gd, EQUAL, win.fosp_gender].join(""));
            params.push(ck.rand + EQUAL + rand);
            params.push(ck.mt + EQUAL + bannerData.method);
            params.push(ck.dv + EQUAL + dv);
            params.push(ck.os + EQUAL + os);
            params.push(ck.bid + EQUAL + bannerData.id);
            params.push(ck.vs + EQUAL + "4");

            return buildUrl(eclickClickDomain, "/r?" + params.join('&'));
        };

        var buildTrueImpressionMsg = function (url) {
            var message = {
                id: win.eclick_frameId,
                type: "eclick_update_imp_state",
                unique: win.eclick_unique_version
            };
            message.url = url;
            return JSON.stringify(message);
        };

        var deliveryMsg = function (msg) {
            try {
                return listener.postMessage(msg, "*"), true
            } catch (e) {}
            return false
        };

        var RECTANGLE = 1,
            HORIZONTAL = 2,
            VERTICAL = 4;

        var eclickZonePlacement = [{/* direction: 1 = rectangle, 2 = horizontal, 4 = vertical */
            width: 480,
            height: 720, // INPAGE
            direction: 4
        },{
            width: 1152,
            height: 1536, // INPAGE 1152x1536
            direction: 2
        },{
            width: 480,
            height: 960,
            direction: 4
        },{
            width: 640,
            height: 1280,
            direction: 2
        },{
            width: 970,
            height: 90,
            direction: 2
        }, {
            width: 970,
            height: 180,
            direction: 2
        }, {
            width: 920,
            height: 90,
            direction: 2
        }, {
            width: 920,
            height: 180,
            direction: 2
        }, {
            width: 728,
            height: 90,
            direction: 2
        }, {
            width: 728,
            height: 180,
            direction: 2
        }, {
            width: 670,
            height: 90,
            direction: 2
        }, {
            width: 670,
            height: 180,
            direction: 2
        }, {
            width: 640,
            height: 360, // BALLOON
            direction: 2
        }, {
            width: 468,
            height: 90,
            direction: 2
        }, {
            width: 468,
            height: 180,
            direction: 2
        }, {
            width: 375,
            height: 90,
            direction: 2
        }, {
            width: 375,
            height: 215,
            direction: 2
        }, {
            width: 320,
            height: 50,
            direction: 2
        }, {
            width: 300,
            height: 40, // BALLOON
            direction: 4
        }, {
            width: 300,
            height: 120,
            direction: 2
        }, {
            width: 300,
            height: 300,
            direction: 1
        }, {
            width: 300,
            height: 510, // ONLINE_FRIDAY
            direction: 4
        }, {
            width: 300,
            height: 250,
            direction: 4
        }, {
            width: 300,
            height: 600,
            direction: 4
        }, {
            width: 160,
            height: 600,
            direction: 4
        }, {
            width: 160,
            height: 300,
            direction: 4
        }, {
            width: 120,
            height: 300,
            direction: 4
        }, {
            width: 120,
            height: 600,
            direction: 4
        }];

        var eclickHtmlTemplates = {
            'eclick_zone_header':'{{? zone.feature_alternative_logo && zone.feature_alternative_logo == \'1\'}}<div class="logo_eclick_ads"> <a target="_blank" href="//eclick.vn/#!/vi/advertisers?{{= zone.view.utm.logo_bar }}">Ads by <span class="txt_by_eclick">eClick</span></a> </div>{{?}}',

            'widget_price':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> {{= zone.header}} <div class="list_item_eclick_banner"> {{~ zone.banners :banner:index}} <div class="item_banner_eclick"> <a href="{{= banner.url}}" target="_blank" class="eclick_item_block" data-banner-id="{{= banner.id}}"> <span class="eclick_thumb_banner"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}"> </span> <span class="eclick_content_banner"> {{? banner.title}}<span class="eclick_title_sp"> {{= banner.title}} </span>{{?}} {{? banner.oldPrice}}<span class="giacu">{{= banner.oldPrice}}đ</span>{{?}} {{? banner.newPrice}}<span class="giamoi">{{= banner.newPrice}}đ</span>{{?}} {{? banner.hostname}}<span class="eclick_host_name">{{= banner.hostname}}</span>{{?}} </span> </a> </div> {{~}} </div> </div> <div class="clear">&nbsp;</div> </div>',
            'widget_noprice':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> {{= zone.header}} <div class="list_item_eclick_banner"> {{~ zone.banners :banner:index}} <div class="item_banner_eclick"> <a href="{{= banner.url}}" target="_blank" class="eclick_item_block" data-banner-id="{{= banner.id}}"> <span class="eclick_thumb_banner"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}"> </span> <span class="eclick_content_banner"> {{? banner.title}}<span class="eclick_title_sp"> {{= banner.title}} </span>{{?}} {{? banner.content}}<span class="eclick_content_sp">{{= banner.content}}</span>{{?}} {{? banner.hostname}}<span class="eclick_host_name">{{= banner.hostname}}</span>{{?}} </span> </a> </div> {{~}} </div> </div> <div class="clear">&nbsp;</div> </div>',

            'creative_image':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> {{= zone.header}} <div class="list_item_eclick_banner"> <div class="item_banner_eclick"> <a target="_blank" href="{{= zone.banners[0].url}}" data-banner-id="{{= zone.banners[0].id}}"> <img src="{{= zone.banners[0].file}}" style="width: {{= zone.width - 2}}px;height: {{= zone.height - 2}}px;"> </a> </div> </div> </div> <div class="clear">&nbsp;</div></div>',
            'creative_flash':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> {{= zone.header}} <div class="list_item_eclick_banner"> <div class="item_banner_eclick"> <div id="eclick_flash" style="display:block; margin: 0; padding: 0; line-height: 0" data-banner-id="{{= zone.banners[0].id}}"><object data-banner-id="{{= zone.banners[0].id}}" border="0" width="{{= zone.width - 2}}" height="{{= zone.height- 2}}" codebase="//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" data="{{= zone.banners[0].file}}" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"><param name="movie" value="{{= zone.banners[0].file}}"><param name="bgcolor" value="#FFFFFF"><param name="quality" value="High"><param name="AllowScriptAccess" value="always"><param name="wmode" value="opaque"><param name="loop" value="true"><param name="flashvars" value="link={{= zone.banners[0].url}}&clickTag={{= zone.banners[0].url}}&clickTAG={{= zone.banners[0].url}}"><embed data-banner-id="{{= zone.banners[0].id}}" src="{{= zone.banners[0].file}}" flashvars="link={{= zone.banners[0].url}}&clickTag={{= zone.banners[0].url}}&clickTAG={{= zone.banners[0].url}}" pluginspage="//www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" play="true" loop="true" wmode="opaque" allowscriptaccess="always" width="{{= zone.width }}" height="{{= zone.height }}"></object></div> </div> </div> </div> <div class="clear">&nbsp;</div></div>',
            'creative_html5':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> {{= zone.header}} <div class="list_item_eclick_banner"> <div class="item_banner_eclick"> {{= zone.banners[0].clickOverlay}}<div class="html5_banner_holder" style="float: left; position: relative; width: 100%; height: {{= zone.height}}px;z-index: 1;">{{= zone.banners[0].html5}}</div> </div> </div> </div> <div class="clear">&nbsp;</div></div>',
            'html5_click_overlay':'<a href="{{= zone.banners[0].url}}" target="_blank" data-banner-id="{{= zone.banners[0].id}}"><div id="html5_protection" data-banner-id="{{= zone.banners[0].id}}" style="display: block; width: 100%; height: 100%; cursor: pointer; position: absolute; left: 0; top: 0; z-index: 2;float: left;"></div></a>',

            'widget_gallery':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}"> <div class="eclick_banner"> {{= zone.header}} {{? zone.randGallery == 1}} {{= zone.galleryLogo}} {{?}} <div class="list_item_eclick_banner"> {{= zone.galleryContent }} </div> {{? zone.randGallery == 2}} {{= zone.galleryLogo}} {{?}} </div> <div class="clear">&nbsp;</div> </div>',
            'gallery_brand_logo':'<div class="gallery_event {{= zone.height == "90" ? \'height_90 \' + zone.bannerRight : (zone.height == "600" && zone.width == "160" ? \'height_90\' : \'\')}}"> <a href="{{= zone.banners[0].e_url}}" target="_blank"> <img src="{{= zone.banners[0].e_image}}"> </a> </div>',
            'gallery_standard':'{{~ zone.banners[0].items :item:index}} <div class="item_banner_eclick"> <a href="{{= item.trackingUrl}}" target="_blank" class="eclick_item_block"> <span class="eclick_thumb_banner"> <img src="{{= item.image}}"> </span> <span class="eclick_content_banner"> {{? item.newPrice}}<span class="gia_gallery">{{= item.newPrice}} VND</span>{{??}}<span class="gia_gallery">{{= item.price ? item.price : \'\'}} VND</span> {{?}} {{? item.button}}<span class="eclick_txt_muangay">{{= item.button}} &gt;</span>{{?}} </span> </a> </div> {{~}}',
            'gallery_new_style':'{{~ zone.banners[0].items :item:index}} <div class="item_banner_eclick"> <a href="{{= item.trackingUrl}}" target="_blank" class="eclick_item_block"> <span class="eclick_thumb_banner"> <img src="{{= item.image}}"> </span> <span class="eclick_content_banner"> {{? item.name}}<span class="eclick_title_sp">{{= item.name}}</span>{{?}} {{? item.newPrice}}<span class="giamoi">{{= item.newPrice}} VND</span>{{?}} {{? item.oldPrice}}<span class="giacu">{{= item.oldPrice}} VND</span>{{?}} {{? item.button}}<span class="gallery_xemngay">{{= item.button}}</span>{{?}} </span> {{? item.percentage}}<span class="percent_discount">{{= item.percentage}}%</span>{{?}} </a> </div>{{~}}',
            'gallery_new_style_90':'{{~ zone.banners[0].items :item:index}} <div class="item_banner_eclick"> <a href="{{= item.trackingUrl}}" target="_blank" class="eclick_item_block"> <span class="eclick_thumb_banner"> <img src="{{= item.image}}"> </span> <span class="eclick_content_banner"> {{? item.name}}<span class="eclick_title_sp">{{= item.name}}</span>{{?}} {{? item.newPrice}}<span class="gia_gallery">{{= item.newPrice}} <br>VND</span>{{?}} {{? item.button}}<span class="eclick_txt_muangay">{{= item.button}} &gt;</span>{{?}} </span> <span class="mask_gallery"></span> </a> </div> {{~}}',

            'widget_native_ad':'<style>{{= zone.css}}</style><div class="box_nativeads width_common"><div class="row_nativeads width_common">{{~ zone.banners :banner:index}}<div class="item_nativeads {{= index == \'1\' ? \'item-no-right\' : \'\'}}"><a href="{{= banner.url}}" class="link_item" data-banner-id="{{= banner.id}}" target="_blank"><span class="sponsored sponsored-top">{{= zone.sponsored}}</span><img class="border-img" src="{{= banner.image}}" alt=""><span class="sponsored sponsored-right">{{= zone.sponsored}}</span><h2 class="title_article">{{= banner.title}}</h2><span class="sponsored sponsored-bottom">{{= banner.hostname}}</span></a></div>{{~}}</div></div>',
            'widget_native_ad_desktop':'<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item nativead"> <div class="eclick_banner"> <a href="#" class="link_taitro">{{= zone.sponsored}}</a> <div class="list_item_eclick_banner"> {{~ zone.banners :banner:index}} <div class="item_banner_eclick"> <a href="{{= banner.url}}" class="eclick_item_block" target="_blank" data-banner-id="{{= banner.id}}"> <span class="eclick_thumb_banner"> <img src="{{= banner.image}}" alt=""> </span> <span class="eclick_content_banner"> {{? banner.title}}<span class="eclick_title_sp"> {{= banner.title}} </span>{{?}} {{? banner.content}}<span class="eclick_content_sp">{{= banner.content}}</span>{{?}} {{? banner.brand_logo}}<span class="eclick_host_name"><img src="{{= banner.brand_logo}}" height="16"></span>{{?}} </span> </a> </div> {{~}} </div> </div> <div class="clear">&nbsp;</div> </div>',

            //'creative_inpage_fullscreen':'<style>#eclick_portrait { display: block;margin: 0 auto;}#eclick_landscape{ display: none; }@media screen and (orientation:portrait) {#eclick_portrait,#html5_frame_holder,#ifr { display: block;margin: 0 auto;width: {{= zone.pW}};height: {{= zone.pH}};}#eclick_landscape { display: none; }}@media screen and (orientation:landscape){#eclick_portrait { display: none; }#eclick_landscape,#html5_frame_holder,#ifr { display: block;margin: 0 auto;width: {{= zone.lW}};height: {{= zone.lH}}; }}</style><div class="eclick" data-zone="{{= zone.id}}">{{= zone.inpageContent}}</div>',
            'creative_inpage_fullscreen':'<div class="eclick" data-zone="{{= zone.id}}">{{= zone.inpageContent}}</div>',
            'inpage_image_content':'<a class="eclick_banner_inpage" style="top: 0;position: relative;z-index:0;margin: 0;text-align: center;width: 100%" target="_blank" href="{{= zone.banners[0].url}}" data-banner-id="{{= zone.banners[0].id}}"><img id="eclick_portrait" style="position: relative; width: 105%; left: -5%" sạnghe0src="{{= zone.banners[0].file_portrait}}"><img id="eclick_landscape" style="position: relative; width: 119%; left: -19%" src="{{= zone.banners[0].file_landscape}}"></a>',
            'inpage_html5_content':'{{= zone.banners[0].clickOverlay}}<div class="html5_banner_holder" style="float: left; position: relative; width: 100%; height: {{= zone.height}}px;z-index: 1;">{{= zone.banners[0].html5}}</div>',

            'creative_balloon':'<div class="eclick list_{{= zone.itemNum}}item eclick_balloon" data-zone-id="{{= zone.zoneId}}"> <div class="block_title_balloon"> <a target="_blank" href="//eclick.vn/#!/vi/advertisers?{{= zone.view.utm.logo_bar }}" class="logo_eclick"></a><span class="drash"></span> <a href="#" title="Expand/Collapse" class="toggle_banner"></a><span class="drash"></span> <a href="#" title="Close" class="close_banner"></a> </div>  {{= zone.formatContent }}  <div class="clear">&nbsp;</div></div>',

            'balloon_image_content':'<div class="eclick_banner"> <div class="list_item_eclick_banner"> <div class="item_banner_eclick"><a target="_blank" href="{{= zone.banners[0].url}}" data-banner-id="{{= zone.banners[0].id}}">{{? zone.smFile}} <img class="small" src="{{= zone.smFile}}" style="width: {{= zone.smW}}px;height: {{= zone.smH}}px;display: block;"> {{?}} {{? zone.lgFile}} <img class="large" src="{{= zone.lgFile}}" style="width: {{= zone.lgW}}px;height: {{= zone.lgH}}px;display: none;"> {{?}} </a> <div class="init" style="display: none;"> <img src="{{= zone.iniFile}}" style="width: {{= zone.iniW}}px;height: {{= zone.iniH}}px;"> </div> </div> </div> </div>',
            'balloon_html5_content':'<div class="eclick_banner"> <div class="list_item_eclick_banner"> <div class="item_banner_eclick">{{= zone.banners[0].clickOverlay}}<div class="html5_banner_holder" style="float: left; position: relative; width: 100%; height: {{= zone.height}}px;z-index: 1;"> {{? zone.banners[0].lgFile}} <div class="large" style="width: {{= zone.lgW}}px;height: {{= zone.lgH}}px;display: none;">{{= zone.banners[0].lgFile}}</div> {{?}} {{? zone.banners[0].smFile}}<div class="small" style="width: {{= zone.smW}}px;height: {{= zone.smH}}px;display:block;">{{= zone.banners[0].smFile}}</div> {{?}} <div class="init" style="width: {{= zone.iniW}}px;height: {{= zone.iniH}}px;display: none;"> {{= zone.banners[0].iniFile}}</div> </div> </div> </div> </div> </div> </div>',
            'balloon_flash_content':'<div class="eclick_banner"> <div class="list_item_eclick_banner"> <div class="item_banner_eclick"><div id="eclick_flash" style="display:block; margin: 0; padding: 0; line-height: 0" data-banner-id="{{= zone.banners[0].id}}"><object data-banner-id="{{= zone.banners[0].id}}" border="0" width="{{= zone.width - 2}}" height="{{= zone.height- 2}}" codebase="//fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0" data="{{= zone.banners[0].file}}" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"><param name="movie" value="{{= zone.banners[0].file}}"><param name="bgcolor" value="#FFFFFF"><param name="quality" value="High"><param name="AllowScriptAccess" value="always"><param name="wmode" value="opaque"><param name="loop" value="true"><param name="flashvars" value="link={{= zone.banners[0].url}}&clickTag={{= zone.banners[0].url}}&clickTAG={{= zone.banners[0].url}}"><embed data-banner-id="{{= zone.banners[0].id}}" src="{{= zone.banners[0].file}}" flashvars="link={{= zone.banners[0].url}}&clickTag={{= zone.banners[0].url}}&clickTAG={{= zone.banners[0].url}}" pluginspage="//www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" play="true" loop="true" wmode="opaque" allowscriptaccess="always" width="{{= zone.width }}" height="{{= zone.height }}"></object></div> </div> </div> </div>',
            'balloon_gallery_content':'<div class="large"></div><div class="small">{{= zone.balloonSmallContent}}</div> <div class="init" style="display: none;"> <img {{? zone.iniW == \'300\'}} src="{{= zone.banners[0].e_image}}" {{??}} src="{{= zone.iniFile}}" {{?}} style="width: {{= zone.iniW}}px;height: {{= zone.iniH}}px;"></div>',
            'balloon_widget_price_content':'<div class="large"></div><div class="small"><div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> <div class="list_item_eclick_banner"> {{~ zone.banners :banner:index}} <div class="item_banner_eclick"> <a href="{{= banner.url}}" target="_blank" class="eclick_item_block" data-banner-id="{{= banner.id}}"> <span class="eclick_thumb_banner"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}"> </span> <span class="eclick_content_banner"> {{? banner.title}}<span class="eclick_title_sp"> {{= banner.title}} </span>{{?}} {{? banner.oldPrice}}<span class="giacu">{{= banner.oldPrice}}đ</span>{{?}} {{? banner.newPrice}}<span class="giamoi">{{= banner.newPrice}}đ</span>{{?}} {{? banner.hostname}}<span class="eclick_host_name">{{= banner.hostname}}</span>{{?}} </span> </a> </div> {{~}} </div> </div> <div class="clear">&nbsp;</div> </div></div> <div class="init" style="display: none;"> <img src="{{= zone.iniFile}}" style="width: {{= zone.iniW}}px;height: {{= zone.iniH - 2}}px;"> </div>',
            'balloon_widget_noprice_content':'<div class="large"></div><div class="small"><div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_{{= zone.itemNum}}item {{= zone.formatName}}" data-zone-id="{{= zone.zoneId}}"> <div class="eclick_banner"> <div class="list_item_eclick_banner"> {{~ zone.banners :banner:index}} <div class="item_banner_eclick"> <a href="{{= banner.url}}" target="_blank" class="eclick_item_block" data-banner-id="{{= banner.id}}"> <span class="eclick_thumb_banner"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}"> </span> <span class="eclick_content_banner"> {{? banner.title}}<span class="eclick_title_sp"> {{= banner.title}} </span>{{?}} {{? banner.content}}<span class="eclick_content_sp">{{= banner.content}}</span>{{?}} {{? banner.hostname}}<span class="eclick_host_name">{{= banner.hostname}}</span>{{?}} </span> </a> </div> {{~}} </div> </div> <div class="clear">&nbsp;</div> </div></div> <div class="init" style="display: none;"> <img src="{{= zone.iniFile}}" style="width: {{= zone.iniW}}px;height: {{= zone.iniH}}px;"> </div>',
            'balloon_tvc_content':'',

            'widget_online_friday':'<div class="sales_top width_common" style="background: #eee"> <div class="item_sales width_common"> <div class="sales_big left"> <div class="box_item"> <a href="{{= zone.bigBannerUrl}}" target="_blank" class="item_block" data-banner-id="{{= zone.bigBannerId}}"> <div class="thumb_sp sp_315"> <img src="{{= zone.bigBannerImage}}" alt="" style="width: 380px;height: 315px;"/> </div> {{? zone.bigBannerPercentage}}<div class="giamgia"><div class="txt_giamgia">{{= zone.bigBannerPercentage}}%</div><div class="arrow_giamgia"></div></div>{{?}} <div class="info_sp"> <div class="sp_name one_line_16 width_common">{{= zone.bigBannerTitle}}</div> {{? zone.bigBannerOldPrice}}<div class="price_bf color_price_bf left">{{= zone.bigBannerOldPrice}}đ</div>{{?}} {{? zone.bigBannerNewPrice}}<div class="price_at color_price_at right">{{= zone.bigBannerNewPrice}}đ</div>{{?}} </div> </a> </div> </div> <div class="sales_sub right"> <div class="hidden_list"> <ul class="list_sales_sub"> {{~ zone.banners :banner:index}} <li> <div class="box_item"> <a href="{{= banner.url}}" class="item_block" target="_blank" data-banner-id="{{= banner.id}}"> <div class="thumb_sp sp_50x50 sp_180"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}" class="width_common" /> {{? banner.percentage}}<div class="giamgia"><div class="txt_giamgia">{{= banner.percentage}}%</div><div class="arrow_giamgia"></div></div>{{?}} </div> <div class="info_sp"> <div class="sp_name">{{= banner.title}}</div> {{? banner.oldPrice}}<div class="price_bf color_price_bf">{{= banner.oldPrice}}đ</div>{{?}} {{? banner.newPrice}}<div class="price_at color_price_at">{{= banner.newPrice}}đ</div>{{?}} </div> </a> </div> </li> {{~}}</ul> </div> </div> </div> </div>',
            'widget_online_friday_vertical':'<div class="sales_300"> <div class="hidden_list"> <div class="width_common top_ads_300">&nbsp;</div> <ul class="list_sales_sub"> {{~ zone.banners :banner:index}} <li> <div class="box_item"> <a href="{{= banner.url}}" class="item_block" data-banner-id="{{= banner.id}}" target="_blank"> <div class="thumb_sp sp_128"> <img src="{{= banner.image}}" alt="{{= banner.imgAlt}}" class="width_common"> {{? banner.percentage}}<div class="giamgia"><div class="txt_giamgia">{{= banner.percentage}}%</div><div class="arrow_giamgia"></div></div>{{?}} </div> <div class="info_sp"> <div class="sp_name">{{= banner.title}}</div> {{? banner.oldPrice}}<div class="price_bf color_price_bf">{{= banner.oldPrice}} đ</div>{{?}} {{? banner.newPrice}}<div class="price_at color_price_at">{{= banner.newPrice}} đ</div>{{?}} </div> </a> </div> </li> {{~}} </ul> </div> </div>',

            'template_none': '<div class="eclick height_{{= zone.height}} width_{{= zone.width}} list_1item" data-banner-id="{{= zone.zoneId}}"><div class="eclick_banner" style=\'width: {{= zone.width - 2}}px;height: {{= zone.height - 2}}px\'>{{= zone.header}} <a href="//eclick.vn/#!/vi/advertisers?{{= zone.view.utm.logo_bar }}" target="_blank"><img src=\'//s.eclick.vn/images/widget_eclick/banner_default_bg.gif\' alt=\'\' style=\'width: {{= zone.width}}px;height: {{= zone.height}}px\'></a></div></div>'
        };

        var html, name, templates;
        templates = {};
        for (name in eclickHtmlTemplates) {
            html = eclickHtmlTemplates[name];
            doT.templateSettings.varname = 'zone';
            templates[name] = doT.template(html);
        }


        var eclickKeywords = {
            eclick_fosp_aid: "fosp_aid",
            eclick_device: "device",
            eclick_gender: "fosp_gender",
            eclick_loc_zone: "lz",
            eclick_loc_country: "lc",
            eclick_loc_province: "lp",
            eclick_channel: "chnl",
            eclick_url: "url",
            eclick_ad_host: "host",
            eclick_start_time: "ts",
            eclick_version: "v",
            eclick_rd: "rand",
            eclick_debug: "debug",
            eclick_pv: "pv",
            eclick_zone: "id",
            eclick_srm_zone: "srm_zone",
            eclick_pvUrl: "pvUrl",
            eclick_batchUrl: "batchUrl",
            eclick_frameId: "frameId",
            eclick_unique_id: "unique_id"
        };

        var getItemOnRow = function(num, width, height, formatId) {
            /* NUMBER OF BANNER ITEMS ON ONE ROW - PRIORITY CHECK ORDER: formatId -> width/height -> num */
            if (formatId == ECLICK_CREATIVE_GALLERY) return "2";
            //if((formatId == ECLICK_WIDGET_PRICE || formatId == ECLICK_WIDGET_NOPRICE) && width == 300 && height == 600) return "2";
            if (width == 300 ||
                width == 160 ||
                width == 120 ){
                return "1"
            }

            return num
        };

        var percentageDiscount = function(oldPrice, newPrice){
            if (!oldPrice || !newPrice) return null;
            oldPrice = parseInt(oldPrice.replace(/\./g,''));
            newPrice = parseInt(newPrice.replace(/\./g,''));
            if (oldPrice < newPrice) return null;
            return ["-",Math.round((1 - (newPrice/oldPrice))* 100)].join(""); // dung Math.round thay vi Math.ceil va Math.floor
        };

        var inpageWidth = topDoc.documentElement.clientWidth
                || topWin.innerWidth
                || topDoc.body.clientWidth,
            inpageHeight = topDoc.documentElement.clientHeight
                || topWin.innerHeight
                || topDoc.body.clientHeight;

        if((ios || adr) && !wdp) {
            inpageWidth = topWin.screen.width || topWin.innerWidth || topDoc.body.clientWidth;
            inpageHeight = topWin.screen.height || topWin.innerHeight || topDoc.body.clientHeight;
        }

        function detectIE() {
            var ua = nav.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // IE 12 => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        }

        function topOffset(element) {
            var body = topDoc.body
                , docElem = topDoc.documentElement
                , box = element.getBoundingClientRect()
                , scroll = getTopScroll()
                , clientTop = docElem.clientTop || body.clientTop || 0
                , clientLeft = docElem.clientLeft || body.clientLeft || 0
                , scrollTop = scroll.top
                , scrollLeft = scroll.left;

            return {
                top: box.top + scrollTop - clientTop,
                left: box.left + scrollLeft - clientLeft
            };
        }

        function getTopScroll() {
            return {
                left: (topWin.pageXOffset !== void 0) ? topWin.pageXOffset : (topDoc.documentElement || topDoc.body.parentNode || topDoc.body).scrollLeft,
                top: (topWin.pageYOffset !== void 0) ? topWin.pageYOffset : (topDoc.documentElement || topDoc.body.parentNode || topDoc.body).scrollTop
            }
        }

        var effectSticky = function(elm, width, height, parentSelector, offset_top) {
            var parent = topWin.document.getElementsByClassName(parentSelector); // parent CLASS
            if (!parent || parent.length<1) {return;}
            parent = parent[0];
            var wrapperIns = elm.i,
                ecFrame = elm.f,
                divStyle = elm.d.style,
                frameStyle = ecFrame.style,
                stickyClass = "_sticky_active",
                setSticky,
                lastPos;

            if (offset_top == null) {
                offset_top = 0;
            }

            var from,
                styleTop = frameStyle.top;

            if (detectIE() != false) {
                topWin.onload = function() {
                    from = topOffset(ecFrame).top - offset_top;
                };
            } else {
                from = topOffset(ecFrame).top - offset_top;
            }

            if (!from) {
                from = topOffset(ecFrame).top - offset_top;
            }

            var css_position ='';
            setSticky = function() {
                var scrollY, to;
                scrollY = getTopScroll().top;
                to = topOffset(parent).top + parent.offsetHeight - ecFrame.offsetHeight;
                if (css_position !='relative' && scrollY <= from) {
                    css_position = 'relative';
                    removeClass(elm.d, stickyClass);
                    divStyle.position = 'relative';
                    divStyle.top = styleTop;
                    wrapperIns.style.cssText = "";
                } else if (css_position!='fixed' && scrollY <= to && scrollY > from) {
                    css_position = 'fixed';
                    addClass(elm.d, stickyClass);
                    divStyle.position = 'fixed';
                    divStyle.top = offset_top + "px";
                    wrapperIns.style.cssText = "position: static; width: " + width + "px; height: " + height + "px; display: block; vertical-align: baseline; float: left;";
                } else if (css_position!='absolute' && scrollY > to) {
                    css_position = 'absolute';
                    removeClass(elm.d, stickyClass);
                    wrapperIns.style.cssText = "position: static; width: " + width + "px; height: " + height + "px; display: block; vertical-align: baseline; float: left;";
                    divStyle.position = 'absolute';
                    divStyle.top = to + "px";
                    divStyle.bottom = "auto";
                }
            };

            setSticky();
            addEvent(topWin,SCROLL,setSticky);
        };
        var effectInpageFullscreen = function (elm, w, h, divMid, conf) {
            var parent = topDoc.getElementsByClassName(conf.container);
            if (!parent) return;
            parent && (parent = parent[0]);
            var adm = topDoc.getElementById(divMid),
                dFirst = topDoc.getElementById("divfirst"),
                dEnd = topDoc.getElementById("divend"),
                id = "#" + win.eclick_frameId,
                parRect,
                objInF = {
                    dvW: inpageWidth,
                    dvH: inpageHeight,
                    lW: 0,
                    lH: 0,
                    pW: 0,
                    pH: 0,
                    pLeft: 0,
                    lLeft: 0
                };

            var orientationChange = function () {
                var ScreenWidth = topWin.screen.width || topWin.innerWidth || topDoc.body.clientWidth;
                var ScreenHeight = topWin.screen.height || topWin.innerHeight || topDoc.body.clientHeight;
                parRect = parent.getBoundingClientRect();
                var styleP = doc.createElement("style"),styleF = doc.createElement("style");
                if (ScreenWidth < ScreenHeight) { // init PORTRAIT
                    if (objInF.pW>0) return;
                    objInF.pH = ScreenHeight;
                    objInF.pW = parRect.width;
                    styleP.innerHTML = ["@media screen and (orientation:portrait) {", id, ",#", divMid, " {width: ", objInF.pW, "px;height: ", objInF.pH, "px;}}"].join('');
                    styleF.innerHTML = ["@media screen and (orientation:portrait) {#eclick_landscape {display:none} #eclick_portrait {display:block;width:100%;top:-",(objInF.pW - objInF.pH/2),"px;} #html5_frame_holder,#ifr {width: ", objInF.pW, "px;height: ", objInF.pH, "px;}"].join('');
                } else {
                    if (objInF.lW>0) return;
                    objInF.lH = ScreenHeight;
                    objInF.lW = parRect.width;
                    styleP.innerHTML = ["@media screen and (orientation:landscape) {", id, ",#", divMid, " {width: ", objInF.lW, "px;height: ", objInF.lH, "px;}}"].join('');
                    styleF.innerHTML = ["@media screen and (orientation:landscape) {#eclick_portrait {display:none} #eclick_landscape {display:block;height:",objInF.lH,"px;left:-",(objInF.lH - objInF.lW/2),"px;} #html5_frame_holder,#ifr {width: ", objInF.lW, "px;height: ", objInF.lH, "px;}"].join('');

                }
                dFirst.appendChild(styleP);
                document.body.appendChild(styleF);

                if (objInF.pW && objInF.pH && objInF.lW && objInF.lH) {
                    removeEvent(topWin, RESIZE, orientationChange);
                }
            };

            if (dFirst) {
                dFirst.style.position = "relative";
                dFirst.style.zIndex = "20";
                dFirst.style.background = "#fff"
            }

            if (dEnd) {
                dEnd.style.position = "relative";
                dEnd.style.zIndex = "20";
                dEnd.style.background = "#fff"
            }

            css(elm.i, "-webkit-transform:translate3d(0,0,0);transform:translateZ(0px);background-color:#fff;overflow:hidden;position:fixed;visibility:visible;top:1px;width:100%;height:100%");
            css(elm.d, "position:relative;width:100%;height:100%;background:red");
            css(adm, "overflow: hidden;position: relative;z-index: 10;display: block;visibility: visible;background-color: rgb(255, 255, 255);");
            var show_inpage = false, timeout=false;

            /*var from = topOffset(adm).top - parseInt(h);
             var to = topOffset(adm).top + (parseInt(h));

             var scrollInpage = function() {
             timeout && topWin.clearTimeout(timeout);
             timeout = topWin.setTimeout(function(){
             var scrollY = getTopScroll().top;
             if (scrollY >= from && scrollY <= to) {
             //elm.d.style.visibility = 'visible'
             !show_inpage && (elm.d.style.visibility = 'visible', show_inpage = true);
             } else {
             //elm.d.style.visibility = 'hidden'
             show_inpage && (elm.d.style.visibility = 'hidden', show_inpage = false);
             }
             },100);

             };*/


            var scrollInpage = function () {
                parRect = parent.getBoundingClientRect();

                if (parRect.top < -100 && parRect.bottom > inpageHeight + 100) {

                    !show_inpage && (elm.d.style.visibility = 'visible', show_inpage = true);
                } else {
                    show_inpage && (elm.d.style.visibility = 'hidden', show_inpage = false);
                }
                timeout=false;
            };
            var scrollInpageEvent = function(){
                timeout ? topWin.clearTimeout(timeout) : scrollInpage();
                timeout = topWin.setTimeout(scrollInpage,100);
            };
            orientationChange();
            scrollInpage();
            addEvent(topWin, RESIZE, orientationChange);
            addEvent(topWin, SCROLL, scrollInpageEvent);
            return {}
        };
        /*
         var effectInpageFullscreen = function (elm, w, h, divMid, conf) {
         var parent = topDoc.getElementsByClassName(conf.container),
         adm = topDoc.getElementById(divMid),
         dFirst = topDoc.getElementById("divfirst"),
         dEnd = topDoc.getElementById("divend"),
         id = "#" + win.eclick_frameId,
         parRect,
         objInF = {
         dvW: inpageWidth,
         dvH: inpageHeight,
         lW: "",
         lH: "",
         pW: "",
         pH: "",
         parW: "",
         parH: "",
         pLeft: "",
         lLeft: ""
         };

         parent && (parent = parent[0], parRect = parent.getBoundingClientRect());
         objInF.parW = parRect.width;
         objInF.parH = parRect.height;

         css(elm.i, "-webkit-transform:translate3d(0,0,0);opacity:1;backface-visibility:hidden;transform:translateZ(0px);background-color:#fff;overflow:hidden;position:fixed;top:1px;visibility:visible;width:100%;height:100%;");

         if (dFirst) {
         dFirst.style.position = "relative";
         dFirst.style.zIndex = "20";
         if (!dFirst.style.background) dFirst.style.background = "#fff"
         }

         if (dEnd) {
         dEnd.style.position = "relative";
         dEnd.style.zIndex = "20";
         if (!dEnd.style.background) dEnd.style.background = "#fff"
         }

         if(objInF.dvW < objInF.dvH) { // init PORTRAIT
         objInF.pH = objInF.dvH + "px";
         objInF.pW = objInF.parW + "px";
         objInF.lH = objInF.dvW + "px";
         objInF.lW = objInF.dvH + "px";
         } else { // init LANDSCAPE
         objInF.pH = objInF.dvW + "px";
         objInF.pW = objInF.dvH + "px";
         objInF.lH = objInF.dvH + "px";
         objInF.lW = objInF.parW + "px";
         }

         var obj = inpageStyle(elm, id, objInF),
         node = obj.node,
         next = node.nextSibling;

         while (node) {
         elm.i.parentNode.insertBefore(node, elm.i);
         node = next;
         next = node ? node.nextSibling : undefined;
         }

         var rect,
         padding = -50,
         html = topWin.document.documentElement,
         visibility = true,
         display = true,
         from,
         to,
         scrollY;

         //adm && (adm.style.display = "none");
         elm.i.style.display = "none";
         from = topOffset(adm).top - (parseInt(inpageHeight)*1.3);
         to = topOffset(adm).top + (parseInt(inpageHeight)*2);

         var scrollInpage = function() {
         scrollY = getTopScroll().top;
         if (scrollY >= from && scrollY <= to) {
         elm.i.style.display = "block";
         //display && (display=false, elm.i.style.display = "block")
         } else {
         elm.i.style.display = "none";
         //!display && (display=true, elm.i.style.display = "none")
         }
         };

         scrollInpage();
         addEvent(topWin, SCROLL, scrollInpage);
         addEvent(topWin, "touchstart", scrollInpage);
         //addEvent(topWin, "touchmove", scrollInpage);
         addEvent(topWin, "touchend", scrollInpage);

         return objInF
         };

         var inpageStyle = function (elm, id, obj) {
         var temp = doc.createElement("div"), content;
         content = ["<style>#admbackground{overflow: hidden;position: relative;z-index: 10;display: block;visibility: visible;background-color: rgb(255, 255, 255);}", id,"_div{position:relative;width:100%;height:100%;} @media screen and (orientation:portrait) {",id,",#admbackground {width: 100%;height: ", obj.pH,";}}@media screen and (orientation:landscape) {",id,",#admbackground {width: 100%;height: ", obj.lH,";}}"];
         content.push("</style>");

         temp.innerHTML = content.join("");

         return {
         node: temp.firstChild  // get content
         }
         };*/

        var effectFloating = function(elm, width, height, offset_value) {
            var divStyle = elm.d.style,
                frameStyle = elm.f.style,
                offset = {
                    top: offset_value.top || 0,
                    right: offset_value.right || 0,
                    left: offset_value.left || 0,
                    bottom: offset_value.bottom || 0
                };

            offset_value = {
                top: offset.top,
                right: offset.right,
                left: offset.left,
                bottom: offset.bottom
            };

            frameStyle.position = "relative";

            // set floating position
            divStyle.position = "fixed";
            divStyle.right = offset_value.right + "px";
            divStyle.bottom = offset_value.bottom + "px";
        };

        var changeBalloonClass = function (el, add) {
            var status = "balloon_status_",
                add = add.toString();
            for (var i=1;i<5;i++) { // status from 1 to 5
                if (add && parseInt(add) == i) {
                    addClass(el, status + add);
                    continue;
                }
                removeClass(el, status + i.toString());
            }
        };

        var toggleBalloonContent = function (current, past, width, height, elm, states) {
            var sm = doc.getElementsByClassName("small")[0] && doc.getElementsByClassName("small")[0].style || {},
                lg = doc.getElementsByClassName("large")[0] && doc.getElementsByClassName("large")[0].style || {},
                ini = doc.getElementsByClassName("init")[0] && doc.getElementsByClassName("init")[0].style || {},
                marquee = doc.getElementsByTagName("marquee") && doc.getElementsByTagName("marquee")[0];

            var html5Frame = doc.getElementById("html5_frame_holder") || doc.getElementById("ifr"),
                buttonHolder = doc.getElementsByClassName("block_title_balloon")[0];

            if (html5Frame) {
                html5Frame.width = width;
                html5Frame.height = height;
            }

            switch (current) {
                case 0: // collapse
                    if (states[1] != "0x0") {
                        changeBalloonClass(buttonHolder, "1"); // 1 = up
                    } else {
                        changeBalloonClass(buttonHolder, "2"); // 2 = down
                    }
                    sm.display = "block";
                    lg.display = "none";
                    ini.display = "none";
                    try { marquee.stop(); } catch(e) {}
                    break;
                case 1: // expand
                    changeBalloonClass(buttonHolder, "2"); // 2 = down
                    sm.display = "none";
                    lg.display = "block";
                    ini.display = "none";
                    try { marquee.stop(); } catch(e) {}
                    break;
                case 2: // init
                    if(parseInt(width) > parseInt(height)) {
                        changeBalloonClass(buttonHolder, "1");
                    } else {
                        changeBalloonClass(buttonHolder, "4");
                    }
                    sm.display = "none";
                    lg.display = "none";
                    ini.display = "block";
                    try { marquee.start(); } catch(e) {}
                    break;
                default:
                    break;
            }
        };

        var setFrameSize = function (elm, state, current, past, defaultWidth, defaultHeight, states) {
            state = state.split("x"); // state[0] = width; state[1] = height
            if(state[0] == "0" || state[1] == "0") return;

            var aLeft = parseInt(defaultWidth) - parseInt(state[0]),
                aTop = parseInt(defaultHeight) - parseInt(state[1]);

            //if(elm.f.width == state[0]) {
            //    css(elm.f, "left:" + aLeft + "px;");
            //}
            //
            //if(elm.f.height == state[1]) {
            //    css(elm.f, "top:" + aTop + "px;");
            //}
            //
            //if(elm.f.width != state[0] && elm.f.height != state[1]) {
            //    css(elm.f, "left:" + aLeft + "px;top:" + aTop + "px;");
            //}

            elm.f.width = state[0];
            elm.f.height = state[1];
            elm.d.style.height = state[1] + "px";

            toggleBalloonContent(current, past, state[0], state[1], elm, states);
        };

        var effectBalloon = function(elm, width, height, states, zoneData, balCf) {
            if ((topDoc.documentElement.clientWidth || topDoc.innerWidth || topDoc.body.clientWidth) < 1024) return;

            var parent = topWin.document.getElementsByClassName(balCf.container),
                div_from = topWin.document.getElementsByClassName(balCf.bal_from), // topWin.document.getElementsByClassName("balloon_from"),
                div_to = topWin.document.getElementsByClassName(balCf.bal_to), // topWin.document.getElementsByClassName("go_head"),
                close = doc.getElementsByClassName("close_banner")[0],
                toggle = doc.getElementsByClassName("toggle_banner")[0],
                buttonHolder = doc.getElementsByClassName("block_title_balloon")[0],
                firstTimeScroll = true,
                aborted = false,
                closeClicked = false,
                bodyParent = false,
                fromDiv = false,
                toDiv = false;

            if (!parent || parent.length < 1) {
                parent = topWin.document.getElementsByTagName("body");
                bodyParent = true;
            }

            parent = parent[0];
            div_from = div_from[0];
            div_to = div_to[0];

            var divStyle = elm.d.style,
                frameStyle = elm.f.style,
                boom = parseInt(balCf.expandInSec) * 1000,
                pew = (boom || 0) + parseInt(balCf.collapseInSec) * 1000,
                initState = balCf.initState,
                scrollBalloon,
                clickClose,
                clickToggle,
                index,
                from,
                curr_index = "";

            elm.d.style.zIndex = "9999";
            elm.i.style.display = "";

            effectFloating(elm, width, height, {top: 0, right: 0, bottom: 0, left: 0}); // HARDCODE offset

            clickClose = function () {
                // close QC
                closeClicked = true;
                aborted = true;
                terminateElement(elm.d);
            };

            clickToggle = function () {
                var frameHeight = elm.f.height,
                    frameWidth = elm.f.width,
                    frameSize = [frameWidth, "x", frameHeight].join("");

                aborted = true;
                //if (aborted && !closeClicked) { // sau 30s ke tu khi click su kien scroll se tiep tuc
                //    setTimeout(function() {
                //        aborted = false;
                //    }, 30000)
                //}

                // toggle QC
                for (var j = 0, stLen = states.length;j<stLen;j++) {
                    if (frameSize == states[j]) {
                        index = j;
                        break;
                    }
                }

                switch (index) {
                    case 0: // current collapse
                        var s, next;
                        if (states[1] != "0x0") {
                            next = 1; // next = expand
                        } else {
                            next = 2; // next = init
                        }
                        s = states[next].split("x");
                        elm.f.width = s[0];
                        elm.f.height = s[1];
                        setFrameSize(elm, states[next], next, index, width, height, states);
                        curr_index = next.toString();
                        break;
                    case 1:  // current expand
                        next = 2;
                        s = states[next].split("x");
                        elm.f.width = s[0];
                        elm.f.height = s[1];
                        setFrameSize(elm, states[next], next, index, width, height, states);
                        curr_index = next.toString();
                        break;
                    case 2:  // current init
                        if (states[1] != "0x0") {
                            next = 1; // next = expand
                        } else {
                            next = 0; // next = init
                        }
                        s = states[next].split("x");
                        elm.f.width = s[0];
                        elm.f.height = s[1];
                        setFrameSize(elm, states[next], next, index, width, height, states);
                        curr_index = next.toString();
                        break;
                    default:
                        break;
                }
            };

            close && addEvent(close, CLICK, clickClose);
            toggle && addEvent(toggle, CLICK, clickToggle);

            if (boom > 0) {
                aborted = true;
                setTimeout(function () {
                    if (states[1] == "0x0") {
                        setFrameSize(elm, states[0], 0, 0, width, height, states);
                    } else {
                        setFrameSize(elm, states[1], 1, 1, width, height, states);
                    }
                }, boom);
            }

            if (pew > 0) {
                aborted = true;
                setTimeout(function () {
                    if (states[1] == "0x0") {
                        setFrameSize(elm, states[2], 2, 2, width, height, states);
                    } else {
                        setFrameSize(elm, states[0], 0, 0, width, height, states);
                    }
                }, pew);
            }

            if (initState) {
                var iniInd;
                aborted = true;
                if (initState == states[0]) { // init Collapse
                    iniInd = 0;
                } else if (initState == states[1]) { // init Expand
                    iniInd = 1;
                } else if (initState == states[2]) { // init Init
                    iniInd = 2;
                }
                setFrameSize(elm, states[iniInd], iniInd, iniInd, width, height, states);
            }

            var isEnter = false,
                milliEnter,
                balTimeout,
                mouseEnterBalloon = function () {
                    milliEnter = (new Date).getTime();
                    var frameHeight = elm.f.height,
                        frameWidth = elm.f.width,
                        frameSize = [frameWidth, "x", frameHeight].join("");

                    for (var j = 0, stLen = states.length;j<stLen;j++) {
                        if (frameSize == states[j]) {
                            index = j;
                            break;
                        }
                    }

                    if(index == 1 || index == 2) { // state expand/init => do nothing
                        return;
                    }

                    if(!isEnter) {
                        isEnter = true;
                        balTimeout = win.setTimeout(function() {
                            if (states[1] != "0x0") {
                                setFrameSize(elm, states[1], 1, 0, width, height, states);
                            } else {
                                setFrameSize(elm, states[0], 0, 0, width, height, states);
                            }
                        }, 3001);

                        //win.setTimeout(function() {
                        //    isEnter = false;
                        //}, 7000);
                    }
                },
                mouseLeaveBalloon = function () {
                    if((new Date).getTime() - milliEnter < 3000) {
                        clearTimeout(balTimeout);
                    }
                    if (isEnter) {
                        isEnter = false;
                    }
                };

            if (detectIE() != false) {
                topWin.onload = function() {
                    from = topOffset(parent).top - getTopScroll().top - topOffset(elm.f).top - parseInt(height);
                };
            } else {
                from = topOffset(parent).top - getTopScroll().top - topOffset(elm.f).top - parseInt(height);
            }

            if (!from) {
                from = topOffset(parent).top - getTopScroll().top - topOffset(elm.f).top - parseInt(height);
            }

            if(div_from) {
                from = topOffset(div_from).top - topOffset(elm.f).top - parseInt(height);
                fromDiv = true;
            }

            scrollBalloon = function() {
                if (aborted) { // for click buttons case
                    return;
                }

                var scrollY, to;
                scrollY = getTopScroll().top;

                if(div_to) {
                    to = topOffset(div_to).top + div_to.offsetHeight;
                } else {
                    to = topOffset(parent).top + parent.offsetHeight - (topDoc.documentElement.clientHeight - parseInt(height));
                }

                if ((scrollY <= to && scrollY > from) || scrollY <= from) {
                    effectFloating(elm, width, height, {top: 0, right: 0, bottom: 0, left: 0}); // HARDCODE
                    divStyle.top = "auto";
                    if (scrollY <= from && curr_index != "2") {
                        curr_index = "2";
                        if (firstTimeScroll) {
                            setFrameSize(elm, states[2], 2, 2, width, height, states); // set init frame size
                        } else {
                            setFrameSize(elm, states[2], 2, 0, width, height, states); // set init frame size
                        }
                    } else if ((scrollY <= to && scrollY > from) && curr_index != "0") {
                        firstTimeScroll = false;
                        curr_index = "0";
                        if (bodyParent && !fromDiv) {
                            setFrameSize(elm, states[2], 2, 2, width, height, states); // set init frame size
                        } else {
                            setFrameSize(elm, states[0], 0, 2, width, height, states); // set collapse frame size
                        }
                    }
                } else if (scrollY > to && !!parent) {
                    elm.i.style.cssText = "position: static; width: " + width + "px; height: " + height + "px; display: block; vertical-align: baseline; float: left;";
                    //divStyle.position = "absolute";
                    //divStyle.top = to + "px";
                    //divStyle.bottom = "auto";
                    divStyle.position = "fixed";
                    divStyle.top = (to - scrollY + (topDoc.documentElement.clientHeight - (2 * parseInt(height)))) + "px";
                }
            };

            try {
                scrollBalloon();
                addEvent(topWin, SCROLL, scrollBalloon);
                addEvent(elm.f, MOUSEENTER, mouseEnterBalloon);
                addEvent(elm.f, MOUSELEAVE, mouseLeaveBalloon);
            } catch (e) {}
        };

        var Banner = function (banners, obj) { // object Banner
            this.b = banners;

        };

        var DOMModify = function () { // object DOM Modify

        };

        var getDoT = function() {
            var html, name, templates;
            templates = {};
            for (name in eclickHtmlTemplates) {
                html = eclickHtmlTemplates[name];
                doT.templateSettings.varname = 'zone';
                templates[name] = doT.template(html);
            }
            return templates;
        };


        var Template = function(data) {
            /*
             *  OBJECT TEMPLATE
             * */
            this.templates = getDoT();
            this.input = data;
            this.strHeader = "eclick_zone_header";
            this.strStruct = "";
            this.strContent = "";
        };

        Template.prototype.header = function(input) {
            return this.templates[this.strHeader](input);
        };

        Template.prototype.content = function(input) {
            return this.templates[this.strContent](input);
        };

        Template.prototype.adStruct = function(input) {
            return this.templates[this.strStruct](input);
        };

        var DrawData = function (data) {
            /*
             *  OBJECT DRAW DATA
             * */
            this.input = data;
            this.drawAd = new Template(this.data);
            this.strHtml = this.drawAd.adStruct();
        };

        DrawData.prototype.getStrHtml = function () {
            return this.strHtml;
        };


        var Feature = function(data) {
            /*
             *  OBJECT FEATURE
             * */
            this.config = data.config;
        };


        var Zone = function (id, data, obj) {
            this.id = id; // zoneUniqueId
            this.zd = data; // zoneData
            this.zc = data.config || {}; // zoneConfig
            this.zenv = obj; // env Object
            this.ze = { // zoneElement
                i: topWin.document.getElementById(win.eclick_frameId + "_ins"), // ins
                d: topWin.document.getElementById(win.eclick_frameId + "_div"), // div
                f: topWin.document.getElementById(win.eclick_frameId) // frame
            };
            this.log = {
                trueImpSent: false
            };
            this.zdw = this.zd.width; // zoneWidth
            this.zdh = this.zd.height; // zoneHeight
            if (!this.id) throw Error("Eclick Zone without an id");
            if (this.zc.sticky && this.zc.sticky.container) effectSticky(this.ze, this.zdw, this.zdh, this.zc.sticky.container);
            if (this.zc.floating) effectFloating(this.ze, this.zdw, this.zdh, this.zc.floating.offset || {});
        };

        Zone.prototype.isViewed = function (padding) {
            var zoneData = this.zd,
                formatId = zoneData.view && zoneData.view.formatId,
                elm = this.ze,
                ecFrame = elm.f,
                keys = "i d f".split(" "),
                html = topWin.document.documentElement,
                rect;

            if (this.zc.floating || this.zc.balloon) return true;

            if (!padding) padding = 50;
            padding = ~~padding;

            for (var i=0;i<3;i++) {
                var style = elm[keys[i]].style;
                if(style.position == "fixed") return true;
            }

            try {
                rect = ecFrame.getBoundingClientRect();
            } catch (e) {}

            return (rect != null) && rect.bottom >= padding && rect.right >= padding && rect.top <= html.clientHeight - padding && rect.left <= html.clientWidth - padding;
        };

        Zone.prototype.logTrueImpression = function () {
            var zoneData = this.zd,
                zoneRenderFinish = this.renderFinish;

            if (zoneData && zoneData.INVALID != true) {
                var zoneId = this.id;
                var params = {
                    "beacon": zoneData.beacon,
                    "zoneId": zoneId,
                    "zoneFormat": zoneData.view && zoneData.view.formatId,
                    "zoneElm": this.ze.f,
                    "time2render": this.renderTime,
                    "tsv": zoneData.serverTime,
                    "zenv": this.zenv
                };

                if (this.isViewed() && this.log.trueImpSent == false) {
                    this.log.trueImpSent = true;
                    win.setTimeout(function () {
                        params.time2see = Date.now() - zoneRenderFinish;
                        var trueImpressionUrl = builtTrueImpressionUrl(params);
                        deliveryMsg(buildTrueImpressionMsg(trueImpressionUrl)) || sendLog(trueImpressionUrl, function () {});
                    }, 1000);
                }
            }
        };

        Zone.prototype.getFormatName = function(format_id) {
            var result = "",
                size = [this.zdw, this.zdh].join("x"),
                fid = format_id || this.zd.view.formatId;

            parseObj(FormatNameKeys, function(val, key){
                if (val == fid) {
                    result = key;
                }
            });

            return result;
        };

        Zone.prototype.chooseTemplate = function (single, multi) { // CHOOSE AD TEMPLATE
            var data = this.zd,
                info = single,
                zoneWidth = parseInt(this.zdw),
                zoneHeight = parseInt(this.zdh),
                zoneSize = [zoneWidth,"x",zoneHeight].join(""),
                zoneFormatId = data.view && parseInt(data.view.formatId) || 0,
                bannerNum = data.banners.length,
                template = "template_none",
                headerTemplate = "eclick_zone_header",
                html5ClickOverlay = "html5_click_overlay",
                portrait = "480x720",
                portrait1 = "480x960";

            if(isTablet()) {
                portrait = "1152x1536";
                portrait1 = "640x1280";
            }

            data.view.utm = buildLogoBar(data.id);
            data.header = templates[headerTemplate](data);

            var isDisplayAds = !!(info),
                isFlashAd = false,
                isHtml5Ad = false,
                isGifAd = false,
                isSrcHtml5Ad = false;

            if (isDisplayAds) {
                isFlashAd = !!(info.fileType &&
                info.fileType == RichMediaType.flash);
                isHtml5Ad = !!(info.fileType &&
                info.fileType == RichMediaType.html5);
                isSrcHtml5Ad = !!(info.fileType &&
                info.fileType == RichMediaType.srcHtml5);
                isGifAd = !!(info.fileType &&
                info.fileType == RichMediaType.gif);
            }

            for (var i = 0, size; size = eclickZonePlacement[i]; i++) {
                if (size.width == zoneWidth && size.height == zoneHeight) {
                    data.itemNum = getItemOnRow(bannerNum, zoneWidth, zoneHeight, zoneFormatId);
                    /* rectangle = 1; horizontal = 2; vertical = 4 */

                    /* ECLICK DISPLAY ADS
                     * STANDARD ADS CHECK FLASH OR IMAGE FORMAT
                     * CHECK ENVIRONMENT TO DISPLAY FLASH OR IMAGE
                     * */
                    if (getIEVersion() == 8 || (this.zenv.support.flash == "0" && isFlashAd)) {
                        template = "creative_image";
                        if (data.banners[0] && data.banners[0].file) {
                            if (data.banners[0].file.indexOf(".swf") > -1 || isHtml5Ad || isSrcHtml5Ad){
                                data.banners[0].file = data.banners[0].file_bk1 || "";
                            }
                        } else if(data.banners[0] && data.banners[0].file_bk1){
                            if (data.banners[0].file_bk1.indexOf(".swf") > -1 || isHtml5Ad || isSrcHtml5Ad){
                                data.banners[0].file = data.banners[0].file_bk2 || "";
                            } else {
                                data.banners[0].file = data.banners[0].file_bk1 || "";
                            }
                        }
                    } else {
                        if (zoneFormatId == ECLICK_CREATIVE_STANDARD_IMAGE ||
                            zoneFormatId == ECLICK_CREATIVE_DEFAULT ||
                            zoneFormatId == ECLICK_RICH_MEDIA_STANDARD) {
                            template = "creative_image";
                            if (isFlashAd){
                                data.banners[0].url =  encodeUrl(data.banners[0].url || "//eclick.vn");
                                template = "creative_flash";
                            } else if (isHtml5Ad || isSrcHtml5Ad) {
                                if (getIEVersion() == 9 || getIEVersion() == 10 || doc.location.protocol == "https:") {
                                    data.banners[0].file = data.banners[0].file_bk1 || ""; // html5 ko co file -> dung file_bk1
                                } else {
                                    template = "creative_html5";
                                    data.banners[0].clickOverlay = "";

                                    if (isSrcHtml5Ad){
                                        data.banners[0].clickOverlay = templates[html5ClickOverlay](data);
                                        data.banners[0].html5 = buildHtml5FrameStr("html5_frame_holder", data.banners[0].file, zoneWidth, zoneHeight);
                                    }
                                }
                            }
                        }
                    }

                    if (zoneFormatId == ECLICK_CREATIVE_INPAGE_FULLSCREEN) {
                        var inpageContent = "inpage_image_content",
                            file_portrait = data.banners[0].file_portrait,
                            file_landscape = data.banners[0].file_landscape;

                        if (isHtml5Ad || isSrcHtml5Ad) {
                            if (getIEVersion() == 9 || getIEVersion() == 10 || doc.location.protocol == "https:") {
                                file_portrait = data.banners[0].portraitInfo.file_bk1 || "";
                                file_landscape = data.banners[0].landscapeInfo.file_bk1 || "";
                            } else {
                                inpageContent = "inpage_html5_content";
                                data.banners[0].clickOverlay = "";
                                data.banners[0].html5 = info[portrait] && info[portrait].html5 || info[portrait1] && info[portrait1].html5;

                                if (isSrcHtml5Ad) {
                                    //data.banners[0].clickOverlay = templates[html5ClickOverlay](data);
                                    data.banners[0].clickOverlay = "";
                                    var linkIframeSrc = file_portrait + "?link=" + encodeUrl(data.banners[0].url) + "&otherlink=";
                                    data.banners[0].html5 = buildHtml5FrameStr("html5_frame_holder", linkIframeSrc, inpageWidth, inpageHeight);
                                }
                            }
                        }
                        data.inpageContent = templates[inpageContent](data);
                        template = "creative_inpage_fullscreen";
                    }

                    if (zoneFormatId == ECLICK_CREATIVE_GALLERY) {
                        var randGallery = random(1, 3, true),
                            galItem = data.banners[0].items,
                            firstItem = galItem[0],
                            itemLen = galItem.length,
                            content = "gallery_new_style",// contentTemplate = formatName = "gallery_new_style"
                            logo = "gallery_brand_logo";

                        data.randGallery = random(1, 3, true);
                        data.bannerRight = "";

                        template = "widget_gallery";

                        if (zoneSize == "468x90" ||
                            zoneSize == "728x90") {
                            content = "gallery_new_style_90";
                            data.bannerRight = "banner_right";
                            if (zoneSize == "468x90") {
                                galItem = galItem.slice(0, 3);
                            } else {
                                galItem = galItem.slice(0, 6);
                            }
                        } else if (zoneSize == "300x600") {
                            if (itemLen > 5) {
                                if (randGallery == 1) {
                                    galItem = galItem.slice(0, 6);
                                    content = "gallery_standard";
                                } else {
                                    galItem = galItem.slice(0, 2);
                                    data.formatName = content; // format name = "gallery_new_style" ### "eclick_gallery"
                                }
                            } else {
                                galItem = galItem.slice(0, 2);
                                data.formatName = content; // format name = "gallery_new_style" ### "eclick_gallery"
                            }

                        } else if (zoneSize == "160x600") {
                            galItem = galItem.slice(0, 2);
                            data.formatName = content; // format name = "gallery_new_style" ### "eclick_gallery"
                        } else if (zoneSize == "300x250" || zoneSize == "300x300") {
                            galItem = galItem.slice(0, 2);
                            content = "gallery_standard";
                        }

                        data.banners[0].items = galItem;
                        data.galleryLogo = templates[logo](data);
                        data.galleryContent = templates[content](data);
                    }

                    if (zoneFormatId == ECLICK_WIDGET_ONLINE_FRIDAY) {
                        if (zoneSize == "300x510") {
                            template = "widget_online_friday_vertical";
                        } else {
                            template = "widget_online_friday";
                        }
                    }

                    if (zoneFormatId == ECLICK_WIDGET_PRICE) {
                        template = "widget_price"
                    }

                    if (zoneFormatId == ECLICK_WIDGET_NOPRICE) {
                        template = "widget_noprice"
                    }

                    if (zoneFormatId == ECLICK_WIDGET_NATIVE_AD ||
                        zoneFormatId == ECLICK_WIDGET_NATIVE_AD_DETAIL ||
                        zoneFormatId == ECLICK_WIDGET_DEFAULT_NATIVE_AD) {
                        var elem = this.ze.f,
                            insEle = this.ze.i;

                        elem && (elem.style.cssText = "left:0;top:0;width:100%;overflow:hidden;");
                        insEle && (insEle.style.cssText = "display:block;border:none;margin:0;padding:0;position:relative;visibility:visible;width:100%;background-color:transparent;");
                        var resize_iframe = function() {
                            var adsHolderHeight = document.getElementsByClassName("eclick_ad_holder")[0].clientHeight;
                            elem && (elem.style.cssText = "left:0;position:absolute;top:0;width:100%;overflow:hidden;height: " + adsHolderHeight + "px;");
                            insEle && (insEle.style.cssText = "display:block;border:none;margin:0;padding:0;position:relative;visibility:visible;width:100%;background-color:transparent;height: " + adsHolderHeight + "px;");
                        };

                        data.sponsored = "Sponsored";
                        if (this.zc.sponsoredText) {
                            data.sponsored = this.zc.sponsoredText + ""
                        } else if (data.website && vne.test(data.website.url) && !gamethu.test(data.website.url)) {
                            data.sponsored = "Tài trợ";
                        }

                        for (var v=0,l=data.banners.length;v<l;v++) {
                            var banner = data.banners[v];
                            if (banner.id == this.zc.noSponsored) {
                                data.sponsored = "";
                            }
                        }

                        if (zoneSize == "300x120") {
                            template = "widget_native_ad_desktop";
                        } else {
                            window.onload = resize_iframe;
                            addEvent(topWin, RESIZE, resize_iframe);
                            template = "widget_native_ad";
                        }
                    }

                    if (this.zc && this.zc.balloon) {
                        var balloonContent = "balloon_image_content",
                            dfInitImg = data.banners[0].iniFile || data.iniFile;

                        if (isFlashAd){
                            data.banners[0].url = encodeUrl(data.banners[0].url || "//eclick.vn");
                            balloonContent = "balloon_flash_content";
                        } else if (isHtml5Ad || isSrcHtml5Ad) {
                            if (getIEVersion() == 9 || getIEVersion() == 10 || doc.location.protocol == "https:") {
                                data.banners[0].file = data.banners[0].file_bk1 || ""; // html5 ko co file -> dung file_bk1
                            } else {
                                balloonContent = "balloon_html5_content";
                                data.banners[0].clickOverlay = "";

                                if (isSrcHtml5Ad) {
                                    data.banners[0].clickOverlay = templates[html5ClickOverlay](data);
                                    data.banners[0].html5 = buildHtml5FrameStr("html5_frame_holder", data.banners[0].file, zoneWidth, zoneHeight) || "";
                                    data.banners[0].smFile = multi[this.zc.balloon.collapse] && buildHtml5FrameStr("html5_frame_holder", multi[this.zc.balloon.collapse].file, this.zc.balloon.collapse.split("x")[0], this.zc.balloon.collapse.split("x")[1]) || "";
                                    data.banners[0].lgFile = multi[this.zc.balloon.expand] && buildHtml5FrameStr("html5_frame_holder", multi[this.zc.balloon.expand].file, this.zc.balloon.expand.split("x")[0], this.zc.balloon.expand.split("x")[1]) || "";

                                    if(multi[this.zc.balloon.init]) {
                                        data.banners[0].iniFile = buildHtml5FrameStr("html5_frame_holder", multi[this.zc.balloon.init].file, this.zc.balloon.init.split("x")[0], this.zc.balloon.init.split("x")[1]);
                                    } else if (this.zc.balloon.defaultInitImg) {
                                        data.banners[0].iniFile = buildImgStr("init", this.zc.balloon.defaultInitImg, this.zc.balloon.init.split("x")[0], this.zc.balloon.init.split("x")[1]);
                                    } else {
                                        data.banners[0].iniFile = buildImgStr("init", dfInitImg, this.zc.balloon.init.split("x")[0], this.zc.balloon.init.split("x")[1])
                                    }
                                } else {
                                    var col_html5 = multi[this.zc.balloon.collapse] && multi[this.zc.balloon.collapse].html5 || "",
                                        exp_html5 = multi[this.zc.balloon.expand] && multi[this.zc.balloon.expand].html5 || "",
                                        ini_html5;

                                    if (multi[this.zc.balloon.init] && multi[this.zc.balloon.init].html5) {
                                        ini_html5 = multi[this.zc.balloon.init].html5;
                                    } else if (this.zc.balloon.defaultInitImg) {
                                        ini_html5 = buildImgStr("init", this.zc.balloon.defaultInitImg, this.zc.balloon.init.split("x")[0], this.zc.balloon.init.split("x")[1]);
                                    } else {
                                        ini_html5 = buildImgStr("init", dfInitImg, this.zc.balloon.init.split("x")[0], this.zc.balloon.init.split("x")[1]);
                                    }

                                    if (col_html5.indexOf(".write(") > -1) {
                                        data.banners[0].smFile = '<iframe id="frame_' + this.zc.balloon.collapse + '" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" height="' + zoneHeight + '"></ifra'+'me>';
                                    } else {
                                        data.banners[0].smFile = col_html5;
                                    }

                                    if (exp_html5.indexOf(".write(") > -1) {
                                        data.banners[0].lgFile = '<iframe id="frame_' + this.zc.balloon.expand + '" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" width="' + zoneWidth + '" height="' + zoneHeight + '"></ifra'+'me>';
                                    } else {
                                        data.banners[0].lgFile = exp_html5;
                                    }

                                    if (ini_html5.indexOf(".write(") > -1) {
                                        data.banners[0].iniFile = '<iframe id="frame_' + this.zc.balloon.init + '" frameborder="0" marginwidth="0" marginheight="0" vspace="0" hspace="0" allowtransparency="true" scrolling="no" allowfullscreen="true" width="' + zoneWidth + '" height="' + zoneHeight + '"></ifra'+'me>';
                                    } else {
                                        data.banners[0].iniFile = ini_html5;
                                    }

                                    var writeScriptToFrames = function () {
                                        if ( document.readyState !== 'complete' ) return;
                                        clearInterval( tid );
                                        // do your work

                                        var small_frame = doc.getElementById("frame_" + this.zc.balloon.collapse),
                                            large_frame = doc.getElementById("frame_" + this.zc.balloon.expand),
                                            ini_frame = doc.getElementById("frame_" + this.zc.balloon.init);

                                        small_frame && (small_frame.contentWindow.document.open(), small_frame.contentWindow.document.write(col_html5), small_frame.contentWindow.document.close());
                                        large_frame && (large_frame.contentWindow.document.open(), large_frame.contentWindow.document.write(exp_html5), large_frame.contentWindow.document.close());
                                        ini_frame && (ini_frame.contentWindow.document.open(), ini_frame.contentWindow.document.write(ini_html5), ini_frame.contentWindow.document.close());
                                    }, tid = setInterval(setScopeFunc(writeScriptToFrames, this), 100);
                                }
                            }
                        } else if (zoneFormatId == ECLICK_WIDGET_PRICE) {
                            balloonContent = "balloon_widget_price_content";
                        } else if (zoneFormatId == ECLICK_WIDGET_NOPRICE) {
                            balloonContent = "balloon_widget_noprice_content";
                        } else if (zoneFormatId == ECLICK_CREATIVE_GALLERY) {
                            data.balloonSmallContent = templates["widget_gallery"](data);
                            balloonContent = "balloon_gallery_content";
                        }

                        data.formatContent = templates[balloonContent](data);
                        template = "creative_balloon";
                    }

                    return !!(templates[template](data)) ? templates[template](data) : "";
                }
            }
            return !!(templates[template](data)) ? templates[template](data) : "";
        };

        Zone.prototype.trackingImp3rd = function(urlArray) {
            if (urlArray.length == 0) return;
            for(var i=0,url = urlArray[i]; i < urlArray.length;url = urlArray[i++]){
                url = url.replace("[timestamp]", (new Date).getTime());
                sendLog(url, function(){})
            }
        };

        Zone.prototype.trackingClick3rd = function(urlArray) {
            var zoneData = this.zd, id = this.id,
                urlObj = {};
            if (urlArray.length == 0) return;
            for(var i=0,url = urlArray[i]; i < urlArray.length;url = urlArray[i++]){
                url = url.replace("[timestamp]", (new Date).getTime());
                urlObj[zoneData.banners[i].id] = url;
            }

            var tid = setInterval( function () {
                if ( document.readyState !== 'complete' ) return;
                clearInterval( tid );
                // do your work
                for(var j=0, banner = zoneData.banners[j]; j < zoneData.banners.length;banner = zoneData.banners[j++]) {
                    //bannerIdArray.push(banner.id);
                    try {
                        var b = doc.querySelectorAll && doc.querySelectorAll("[data-banner-id='" + banner.id + "']")[0];
                        function handler(event) {
                            if (!event) {
                                event = window.event;
                            }
                            var callerElement = event.target || event.srcElement;
                            var bannerId = callerElement.getAttribute("data-banner-id");
                            sendLog(urlObj[bannerId], function(){});
                        }
                        addEvent(b, "mouseup", handler)
                    } catch(e){}
                }
            }, 100 );
        };

        Zone.prototype.renderDisplayAds = function () {
            var zoneData = this.zd,
                bannerData = zoneData.banners[0] ? zoneData.banners[0] : {},
                zoneWidth = zoneData.width,
                zoneHeight = zoneData.height,
                zoneSize = [zoneWidth,"x",zoneHeight].join(""),
                formatId = zoneData.view && zoneData.view.formatId,
                multiSizeInfo,
                singleSizeInfo,
                fileType,
                portrait = "480x720",
                portrait1 = "480x960",
                landscape = "720x480",
                landscape1 = "960x480";

            if(isTablet()) {
                portrait = "1152x1536";
                portrait1 = "640x1280";
                landscape = "1536x1152";
                landscape1 = "1280x640";
            }

            //if(this.zc && this.zc.balloon) {
            //    zoneData.formatName = this.getFormatName(602);
            //} else {
            //    zoneData.formatName = this.getFormatName();
            //}
            zoneData.formatName = this.getFormatName();

            bannerData.beacon = (zoneData.beacon ? zoneData.beacon : "");
            bannerData.zoneFormatId = formatId;
            bannerData.serverTime = zoneData.serverTime;

            try {
                multiSizeInfo = JSON.parse(bannerData.info);
            } catch (e) {
                return;
            }

            singleSizeInfo = multiSizeInfo.hasOwnProperty(zoneSize) ? multiSizeInfo[zoneSize] : multiSizeInfo;
            fileType = singleSizeInfo.fileType;

            parseObj(singleSizeInfo, function(val, key){
                if(!val){
                    bannerData[key] = "";
                }
                bannerData[key] = val;
            });

            bannerData.url = buildUtmTracking(getUrlComponent((doc.location.protocol == "https:" ? "https:" : "http:") + zoneData.links[0] + bannerData.clickTag));

            /* build banner url for buildClickUrl param link= */
            bannerData.url = buildClickUrl(zoneData, bannerData, this.zenv);

            if (formatId == ECLICK_CREATIVE_GALLERY) {
                try {
                    var itemObject = JSON.parse(bannerData.info);
                } catch (e) {}

                if(typeof itemObject.e_image == "object") {
                    try {
                        itemObject.e_image = itemObject.e_image[zoneSize]
                    } catch (e) {}
                }

                bannerData.e_image = itemObject.e_image;
                bannerData.e_url = itemObject.e_url;

                for (var j = 0; j < itemObject.items.length; j++) {
                    itemObject.items[j].trackingUrl = bannerData.url = buildUtmTracking(getUrlComponent((doc.location.protocol == "https:" ? "https:" : "http:") + zoneData.links[0] + itemObject.items[j].url));
                    itemObject.items[j].trackingUrl = buildClickUrl(zoneData, bannerData, this.zenv);
                    itemObject.items[j].percentage = percentageDiscount(itemObject.items[j].oldPrice, itemObject.items[j].newPrice);
                    itemObject.items[j].oldPrice = addComma(itemObject.items[j].oldPrice);
                    itemObject.items[j].newPrice = addComma(itemObject.items[j].newPrice);
                    if (zoneSize == "160x600") {
                        itemObject.items[j].name = null;
                        itemObject.items[j].oldPrice = null;
                        itemObject.items[j].newPrice = null;
                    }
                }
                try {
                    bannerData.items = JSON.parse(JSON.stringify(shuffle(itemObject.items)));
                    //bannerData.items = JSON.parse(JSON.stringify(itemObject.items.sort(function() { return 0.5 - Math.random() })));
                } catch (e) {}
            }

            if (formatId == ECLICK_CREATIVE_INPAGE_FULLSCREEN) {
                inpageWidth = inpageWidth - 20;
                effectInpageFullscreen(this.ze, this.zdw, this.zdh, "admbackground", this.zc.inpage);
                //var ipObj = effectInpageFullscreen(this.ze, this.zdw, this.zdh, "admbackground", this.zc.inpage);
                //
                //zoneData.lH = ipObj.lH;
                //zoneData.lW = ipObj.lW;
                //zoneData.pH = ipObj.pH;
                //zoneData.pW = ipObj.pW;
                //zoneData.pLeft = ipObj.pLeft;
                //zoneData.lLeft = ipObj.lLeft;

                bannerData.portraitInfo = multiSizeInfo[portrait] || multiSizeInfo[portrait1];
                bannerData.landscapeInfo = multiSizeInfo[landscape] || multiSizeInfo[portrait1];
                bannerData.file_portrait = (doc.location.protocol == "https:" ? "https:" : "http:") + (multiSizeInfo[portrait] && multiSizeInfo[portrait].file || multiSizeInfo[portrait1] && multiSizeInfo[portrait1].file);
                bannerData.file_landscape = (doc.location.protocol == "https:" ? "https:" : "http:") + (multiSizeInfo[landscape] && multiSizeInfo[landscape].file || multiSizeInfo[landscape1] && multiSizeInfo[landscape1].file);
            }

            if (this.zc && this.zc.balloon) {
                var st = [this.zc.balloon.collapse, this.zc.balloon.expand, this.zc.balloon.init],
                    smSize = st[0] && st[0].split("x") || ["0","0"],
                    lgSize = st[1] && st[1].split("x") || ["0","0"],
                    iniSize = st[2] && st[2].split("x") || ["300","40"],
                    smFile = multiSizeInfo[st[0]] && (multiSizeInfo[st[0]].file || multiSizeInfo[st[0]].html5) || "",
                    lgFile = multiSizeInfo[st[1]] && (multiSizeInfo[st[1]].file || multiSizeInfo[st[1]].html5) || "",
                    iniFile = multiSizeInfo[st[2]] && (multiSizeInfo[st[2]].file || multiSizeInfo[st[2]].html5) || "",
                    balloonInitImgUrl = this.zc.balloon.defaultInitImg || "//static.eclick.vn/delivery/css/images/graphics/balloon_horizontal.png",
                    displayDefaultInitImg = !!this.zc.balloon.defaultInitImg;

                smFile ? zoneData.smFile = smFile : (zoneData.smFile="",st[0]="0x0");
                lgFile ? zoneData.lgFile = lgFile : (zoneData.lgFile="",st[1]="0x0");
                iniFile ? zoneData.iniFile = iniFile : (displayDefaultInitImg = true);

                if( formatId == ECLICK_CREATIVE_GALLERY ) st[0] = [zoneWidth,"x",zoneHeight].join("");

                if (displayDefaultInitImg) {
                    if ( st[2] == "40x250" || st[2] == "40x300") {
                        balloonInitImgUrl = "//static.eclick.vn/delivery/css/images/graphics/balloon_vertical.png";
                    }

                    zoneData.iniFile = balloonInitImgUrl;
                    zoneData.banners[0].iniFile = balloonInitImgUrl;
                }

                zoneData.smW = smSize[0];
                zoneData.smH = smSize[1];
                zoneData.lgW = lgSize[0];
                zoneData.lgH = lgSize[1];
                zoneData.iniW = iniSize[0];
                zoneData.iniH = iniSize[1];

                try {
                    var implBalloonAd = function () {
                        if ( document.readyState !== 'complete' ) return;
                        clearInterval( tid );
                        // do your work

                        effectBalloon(this.ze, this.zdw, this.zdh, st, this.zd, this.zc.balloon);
                    }, tid = setInterval(setScopeFunc(implBalloonAd, this), 10 );
                } catch (e) {}
            }

            bannerData.tracking_imp && this.trackingImp3rd(bannerData.tracking_imp);
            bannerData.tracking_click && this.trackingClick3rd(bannerData.tracking_click);

            return this.chooseTemplate(singleSizeInfo, multiSizeInfo);
        };

        Zone.prototype.renderImg = function() {
            var zoneData = this.zd, id = this.id,
                outerDiv = ['<div ', 'class="eclick"', ' data-zone-id="', zoneData.zoneId, '">', '<a href="', buildUrl(zoneData.imageDefaultUrl,"") ,'" target="_blank">','<img src="', zoneData.imageDefaultPath,'" alt="" style="width: ', zoneData.width ,'px;height:', zoneData.height ,'px"></a>', '</div>'];
            return outerDiv.join("");
        };

        Zone.prototype.renderScript = function() {
            var zoneData = this.zd, id = this.id;
            return zoneData.scriptPathBack;
        };

        Zone.prototype.renderWidget = function () {
            var zoneData = this.zd,
                id = this.id,
                config = this.zc,
                formatId = parseInt(zoneData.view.formatId),
                serverTime = zoneData.serverTime;

            zoneData.formatName = this.getFormatName();

            var cssClassName = (formatId == 101 ? "noprice_" : (formatId == 102 ? "price_" : ""));
            var onlineFridayHomepage = false;

            if (formatId == ECLICK_WIDGET_ONLINE_FRIDAY && zoneData.banners.length == 5) {
                var bigBanner = zoneData.banners.shift();

                zoneData.bigBannerId = bigBanner.id;
                zoneData.bigBannerUrl = buildUtmTracking(getUrlComponent((doc.location.protocol == "https:" ? "https:" : "http:") + zoneData.links[0]));
                zoneData.bigBannerImage = bigBanner.image;
                zoneData.bigBannerPercentage = percentageDiscount(bigBanner.oldPrice, bigBanner.newPrice);
                zoneData.bigBannerTitle = bigBanner.title;
                zoneData.bigBannerOldPrice = bigBanner.oldPrice;
                zoneData.bigBannerNewPrice = bigBanner.newPrice;
                onlineFridayHomepage = true;
            }

            for (var i = 0, banner; banner = zoneData.banners[i]; i++) {
                banner.beacon = (zoneData.beacon ? zoneData.beacon : "");
                banner.zoneFormatId = formatId;
                banner.serverTime = serverTime;
                banner.imgAlt = (banner.title + "").replace(/(<([^>]+)>)/ig, "");
                banner.percentage = percentageDiscount(banner.oldPrice, banner.newPrice);
                if(config && config.v_img) {
                    banner.image = cstr(banner.image).replace("/thumb/", "/" + config.v_img + "/");
                }

                if (formatId == ECLICK_WIDGET_ONLINE_FRIDAY && onlineFridayHomepage) {
                    banner.url = buildUtmTracking(getUrlComponent((doc.location.protocol == "https:" ? "https:" : "http:") + zoneData.links[i + 1]));
                } else {
                    banner.url = buildUtmTracking(getUrlComponent((doc.location.protocol == "https:" ? "https:" : "http:") + zoneData.links[i]));
                }
                /* build banner url for buildClickUrl param link= */
                banner.url = buildClickUrl(zoneData, banner, this.zenv);
            }

            if (formatId == ECLICK_WIDGET_ONLINE_FRIDAY) { // shuffle nen phai de gan cuoi
                zoneData.banners = shuffle(zoneData.banners);
            }

            if (formatId == ECLICK_WIDGET_NATIVE_AD || formatId == ECLICK_WIDGET_DEFAULT_NATIVE_AD || formatId == ECLICK_WIDGET_NATIVE_AD_DETAIL) {
                zoneData.css = config && config.css ? config.css : "";
                var outerDiv = ['<div ', 'class="eclick ', (cssClassName != null ? (cssClassName + zoneData.view.width + "x" + zoneData.view.height) : ''), '" data-zone-id="', zoneData.zoneId, '">', this.chooseTemplate(), '</div>'];

                return outerDiv.join(""); // BUG get ad_holder height return 0
            }

            if (this.zc && this.zc.balloon) {
                var bConf = this.zc.balloon,
                    bStates = [this.zc.balloon.collapse, this.zc.balloon.expand, this.zc.balloon.init],
                    iniSize = bStates[2] && bStates[2].split("x"),
                    displayDefaultInitImg = true,
                    balloonInitImgUrl = this.zc.balloon.defaultInitImg || "//static.eclick.vn/delivery/css/images/graphics/balloon_horizontal.png";

                if (displayDefaultInitImg) {
                    if ( this.zc.balloon.init == "40x250" || this.zc.balloon.init == "40x300") {
                        balloonInitImgUrl = "//static.eclick.vn/delivery/css/images/graphics/balloon_vertical.png";
                    }
                    zoneData.iniFile=balloonInitImgUrl;
                }

                if( formatId == ECLICK_WIDGET_NOPRICE ||
                    formatId == ECLICK_WIDGET_PRICE) {
                    bStates[1] = "0x0";
                }

                zoneData.iniW = iniSize[0]; // "40"
                zoneData.iniH = iniSize[1]; // "300"

                var _this = this;
                try {
                    var tid = setInterval( function () {
                        if ( document.readyState !== 'complete' ) return;
                        clearInterval( tid );
                        // do your work

                        effectBalloon(_this.ze, _this.zdw, _this.zdh, bStates, _this.zd, _this.zc.balloon);
                    }, 10 );
                } catch (e) {}
            }

            return this.chooseTemplate();
        };

        var setFrameArray = function (a, b) {
            if (!(2 > arguments.length))
                for (var c = 1, d = arguments.length; c < d; ++c) a.push(arguments[c])
        };

        var buildHtml5FrameStr = function(name, src, width, height){
            var strIframe = ["<iframe "],
                ifm = {};
            if(src) ifm.src = '"' + src + '"';
            ifm.width = '"' + width + '"';
            ifm.height = '"' + height + '"';
            ifm.frameborder = '"0"';
            ifm.marginwidth = '"0"';
            ifm.marginheight = '"0"';
            ifm.vspace = '"0"';
            ifm.hspace = '"0"';
            ifm.allowtransparency = '"true"';
            ifm.scrolling = '"no"';
            ifm.allowfullscreen = '"true"';
            ifm.id = name;
            ifm.name = name;

            for (var ifrAttr in ifm) ifm.hasOwnProperty(ifrAttr) && setFrameArray(strIframe, ifrAttr + "=" + ifm[ifrAttr]);
            strIframe.push('style="left:0;position:absolute;top:0;"');
            strIframe.push("></iframe>");
            return strIframe.join(" ")
        };

        var buildImgStr = function(name, src, w, h) {
            var strImg = ["<img "];
            strImg.push("class='init'");
            strImg.push("style='width: " + w + "px;height: " + h +"px;'");
            strImg.push("src='" + src + "'>");
            return strImg.join(" ")
        };

        var eclickTrueImpressionExperiment = function (zone) {
            var checkLog = function () {
                zone.logTrueImpression();
            };

            setTimeout(function () {
                checkLog();
            }, 0);
            addEvent(topWin, SCROLL, _.debounce(checkLog));
        };

        var thisZone;

        var eclickFormatSwitcher = function (id, data, type, obj, now) {
            var elemStr = "";

            if (!now) now = (new Date).getTime();

            var zone = new Zone(id, data, obj);

            thisZone = zone;
            /* elem = <ins> */
            if (type) {
                switch (type) {
                    case 3:
                        elemStr = zone.renderScript();
                        break;
                    case 4:
                        elemStr = zone.renderImg();
                        break;
                }
            } else {
                var formatId = data.view.formatId || 9E3; //over 9 thousand
                switch (formatId){
                    case ECLICK_CREATIVE_DEFAULT:
                    case ECLICK_CREATIVE_STANDARD_IMAGE:
                    case ECLICK_RICH_MEDIA_BALLOON:
                    case ECLICK_CREATIVE_GALLERY:
                    case ECLICK_RICH_MEDIA_STANDARD:
                    case ECLICK_CREATIVE_INPAGE_FULLSCREEN:
                        elemStr = zone.renderDisplayAds();
                        break;
                    case ECLICK_WIDGET_NOPRICE:
                    case ECLICK_WIDGET_PRICE:
                    case ECLICK_WIDGET_METRO_PRICE:
                    case ECLICK_WIDGET_BIG_METRO:
                    case ECLICK_WIDGET_METRO_NOPRICE:
                    case ECLICK_WIDGET_PRODUCT_LIST:
                    case ECLICK_WIDGET_TEXT_LINK:
                    case ECLICK_WIDGET_ARTICLE_SPOTLIGHT:
                    case ECLICK_WIDGET_ONLINE_FRIDAY:
                    case ECLICK_WIDGET_DEFAULT_NATIVE_AD:
                    case ECLICK_WIDGET_NATIVE_AD_DETAIL:
                    case ECLICK_WIDGET_NATIVE_AD:
                        elemStr = zone.renderWidget();
                        break;
                }
            }

            zone.renderFinish = (new Date).getTime();
            zone.renderTime = zone.renderFinish - now;

            if (elemStr && !eclickSimpleRender) {
                eclickTrueImpressionExperiment(thisZone);
            }

            return {
                elem: elemStr,
                type: type || formatId
            };
        };

        var targetingLoc = {
            zone: win.loc_zone || getTopWin().fosp_location_zone,
            country:  win.loc_country || getTopWin().fosp_country,
            province: win.loc_province || getTopWin().fosp_location,
            isp: win.loc_isp || getTopWin().fosp_isp,
            ip: win.loc_ip || getTopWin().fosp_ip
        };

        var closeIframe = function (wyn) {
            wyn != wyn.parent && wyn.setTimeout(function () {
                wyn.document.close();
            }, 0)
        };

        var cssStrUrl = function(url){
            var l = ["<link "];
            l.push('rel=','\"stylesheet\" ');
            l.push('type=','\"text/css\" ');
            l.push('href=','\"'+ url +'\" >');
            return l.join("");
        };

        var builtCssNode = function(url) {
            var link = doc.createElement("link");
            link.setAttribute("rel","stylesheet");
            link.setAttribute("type","text/css");
            link.setAttribute("href", url);
            return link
        };

        var buildAdNode = function(content, style) {
            var div = doc.createElement("div");
            div.setAttribute("class", "eclick_ad_holder ad_frame_protection");
            if(style) div.setAttribute("style", style);
            div.innerHTML = content;

            var s = div.getElementsByTagName('script');
            for (var i = 0; i < s.length ; i++) {
                var node=s[i], parent=node.parentElement, d = doc.createElement('script');
                if(node.getAttribute("async") == "" || node.getAttribute("async") == "true") {
                    d.async = true;
                }
                //d.async=node.async;
                if(node.src) d.src=node.src;
                if(node.text) d.text=node.text;
                parent.insertBefore(d,node);
                parent.removeChild(node);
            }
            return div; // or div.firstChild
        };

        var tb = {
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
            ub = {
                "'": "\\'"
            },
            reformatCnt = function (a) {
                a = String(a);
                if (a.quote) return a.quote();
                for (var b = ['"'], c = 0; c < a.length; c++) {
                    var d = a.charAt(c),
                        e = d.charCodeAt(0);
                    b[c + 1] = tb[d] || (31 < e && 127 > e ? d : vb(d))
                }
                b.push('"');
                return b.join("")
            },
            vb = function (a) {
                if (a in ub) return ub[a];
                if (a in tb) return ub[a] = tb[a];
                var b = a,
                    c = a.charCodeAt(0);
                if (31 < c && 127 > c) b = a;
                else {
                    if (256 > c) {
                        if (b = "\\x", 16 > c || 256 < c) b += "0"
                    } else b = "\\u", 4096 > c && (b += "0");
                    b += c.toString(16).toUpperCase()
                }
                return ub[a] = b
            };

        var writeAdFrameContent = function (winFrame, id, obj, data, bool, type) { // DATA OF 1 ZONE -- DECIDE TO DISPLAY DEFAULT/3rd-SCRIPT
            var ifrDoc = winFrame.document,
                zone = win.eclick_zone,
                elemObject,
                strContent,
                content,
                strVal = "";

            data[zone] && (data[zone].serverTime = data.serverTime ? data.serverTime : (new Date).getTime());
            obj.beacon2 = data[zone] && data[zone].beacon2 ? data[zone].beacon2 : "";

            parseObj(obj, function(val, key){
                strVal += "eclick_" + key + "=\"" + val + "\";"
            });

            elemObject = eclickFormatSwitcher(id, data[zone], type, obj);

            strContent = elemObject.elem || ""; // friendly iframe
            content = "<!DOCTYPE html><html><head>" + cssStrUrl(_css) + "</head><body><script>" + strVal + "</script>" + strContent + "</body></html>"; // unfriendly iframe

            if (bool) {
                if (ifrDoc.body && ifrDoc.body.firstChild) {
                    var body = ifrDoc.getElementsByTagName('body')[0];
                    if (elemObject.type == SimpleType.espb) {
                        var logo_eclick = ['<style>.logo_eclick_ads{position:absolute;z-index:999;left:-70px;bottom:0;width:66px;height:16px;padding:0 18px 0 5px;cursor:pointer;overflow:hidden;background:url(https://static.eclick.vn/delivery/css/images/graphics/icon_eclick.png) 75px 3px no-repeat #fff}.logo_eclick_ads a{width:100%;font:400 10px/16px arial;display:block;float:left;text-decoration:none;}.logo_eclick_ads:hover{-webkit-transition-duration:.5s;-moz-transition-duration:.5s;-o-transition-duration:.5s;-ms-transition-duration:.5s;transition-duration:.5s;left:0}.logo_eclick_ads:hover a{color:#464646}.txt_by_eclick{color:#009444}','</style>','<div class="logo_eclick_ads"> <a target="_blank" href="//eclick.vn/">Ads by <span class="txt_by_eclick">eClick</span></a> </div>'].join("")
                        var framePassbackId = "frame_passback";
                        var third_ifr = buildHtml5FrameStr(framePassbackId, "", obj.w, obj.h);
                        third_ifr = logo_eclick + third_ifr;
                        ifrDoc.open();
                        ifrDoc.write(third_ifr);
                        closeIframe(winFrame);
                        third_ifr = doc.getElementById(framePassbackId);
                        third_ifr.contentWindow.document.open();
                        third_ifr.contentWindow.document.write(strContent);
                        third_ifr.contentWindow.document.close();
                    } else {
                        body.appendChild(buildAdNode(strContent));
                    }
                }
            } else {
                winFrame.location.replace("javascript:" + reformatCnt(content));
            }

            return obj
        };

        var unfriendlyIframe = function (winFrame, id, obj, data, type) {
            return writeAdFrameContent(winFrame, id, obj, data, false, type);
        };

        var friendlyIframe = function (winFrame, id, obj, data, type) {
            return writeAdFrameContent(winFrame, id, obj, data, true, type);
        };

        var createSpanElement = function (name) {
            var b = win,
                elem = b.document.getElementById(name);
            elem || !name || (b.document.write("<span id=" + name + "></span>"), elem = b.document.getElementById(name));
            return elem
        };

        var renderAd = function (elem, obj, zonesData) {
            var winFrame = elem.contentWindow,
                id = win.eclick_unique_id;

            if (Fb(winFrame)){
                obj = friendlyIframe(winFrame, id, obj, zonesData);
            } else {
                obj = unfriendlyIframe(winFrame, id, obj, zonesData);
            }

            if (obj.beacon2){
                obj.eclick_ad_done = "true";
                win.eclick_pvUrl = win.eclick_pvUrl ? win.eclick_pvUrl : obj.eclick_pvUrl;
                win.eclick_pvUrl = [win.eclick_pvUrl,"+",obj.beacon2].join("");
            } else {
                obj.eclick_ad_done = "false";
            }
            obj.bc2 = win.eclick_bc2 = obj.beacon2;

            deliveryMsg(buildPageviewMsg(obj)) || sendLog(win.eclick_pvUrl, function(){});
        };

        var terminateElement = function (frame) {
            return frame &&
            frame.parentNode ? frame.parentNode.removeChild(frame) : null
        };

        var showImage = function(elem, obj, data, type) {
            var winFrame = elem.contentWindow,
                id = win.eclick_unique_id;
            if (Fb(winFrame)){
                obj = friendlyIframe(winFrame, id, obj, data, type);
            } else {
                obj = unfriendlyIframe(winFrame, id, obj, data, type);
            }
        };

        var showScript = function(elem, obj, data, type){
            var winFrame = elem.contentWindow,
                id = win.eclick_unique_id;
            if (Fb(winFrame)){
                obj = friendlyIframe(winFrame, id, obj, data, type);
            } else {
                obj = unfriendlyIframe(winFrame, id, obj, data, type);
            }
        };

        var showNothing = function(elem) {
            terminateElement(elem.parentNode.parentNode);
        };

        var switchAdsType = function(type, elem, obj, data) {
            switch (type) {
                case SimpleType.eca:
                    return showNothing(elem);
                    break;
                case SimpleType.espb:
                    return showScript(elem, obj, data, SimpleType.espb);
                    break;
                case SimpleType.esdi:
                    return showImage(elem, obj, data, SimpleType.esdi);
                    break;
            }
        };

        var renderAdJob = function (obj, data) {
            //data = {"data":{"934":{"banners":[{"bid":2000012160,"campaign":{"id":2000002963,"user":{"id":10273}},"cat":1281,"clid":10273,"cpid":2000002963,"format":[602],"h":250,"host":"thammythucuc.vn","id":2000012160,"info":"{\"40x300\":{\"file\":\"http:\\/\\/placehold.it\\/40x300\"},\"300x40\":{\"file\":\"http:\\/\\/placehold.it\\/300x40\"},\"300x250\":{\"file\":\"http:\\/\\/placehold.it\\/300x250\"},\"640x360\":{\"file\":\"http:\\/\\/placehold.it\\/640x360\"},\"300x600\":{\"file\":\"http:\\/\\/placehold.it\\/300x600\"},\"160x600\":{\"file\":\"http:\\/\\/placehold.it\\/160x600\",\"file_bk1\":\"\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/thammythucuc.vn\\/dep-theo-xu-huong-thang-10?utm_source=Eclick\u0026utm_medium=Banner\u0026utm_content=Eclick_Banner_Deptheoxuthethang10160x600\u0026utm_campaign=Thang10_DeptheoxutheSG\"}}","method":1,"plmIds":3,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":1}],"beacon":"ziznznznzrzrznzrzqzjzozqzgznzozqzizizozizjzhzkzg2pzhzjzjzjzjzjzhzqzlzg2pzhzjzjzjzjzizhzizlzjzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"508f762e22:911:934:1:f_601:1:2000002963_2000012160","config":{"balloon":{"container":"news_head_left","init":"40x300","expand":"640x380","collapse":"300x250","text":"Mạng Quảng Cáo eClick"}},"feature_alternative_logo":1,"height":250,"id":934,"links":["//c.eclick.vn/r/2000012160/934/ziznznznzrzrznzrzqzjzozqzgznzozhzjzjzjzjzizhzizlzjzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"160 x 600","plmId":3,"view":{"format":"richmedia-format","formatId":602},"website":{"id":911,"url":"phunutoday.vn"},"width":300,"zoneId":934}},"meta":{"city":"29","code":200,"country":"vn","gender":"3","ip":"172.30.113.133","isp":"3","region":"1","time":1444884890}};
            //data = {"data":{"2988":{"banners":[{"bid":2000013382,"campaign":{"id":2000003393,"user":{"id":10916}},"cat":1331,"clid":10916,"cpid":2000003393,"format":[401],"h":250,"host":"caganu.com","id":2000013382,"info":"{\"40x300\":{\"file\":\"http:\\/\\/placehold.it\\/40x300\"},\"300x40\":{\"file\":\"http:\\/\\/placehold.it\\/300x40\"},\"e_image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/a60k8258102896659946c874073.png\",\"e_url\":\"http:\\/\\/caganu.com\\/that-lung-da-ca-sau?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau\",\"items\":[{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/7227qho498717725b5635c98.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/Day-that-lung-nam-da-ca-sau-cao-cap-mau-nau-dau-vang-loai-dac-biet-VNLDLCS0A22NB.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLDLCS0A22NB\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLDLCS0A22NB\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"}]}","method":1,"plmIds":5,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":4,"w":300,"weight":1}],"beacon":"ziznznzlzkzrzizrzmznzozhzlzizjzozmzhzozizjzqzizl2pzhzjzjzjzjzjzgzgzqzg2pzhzjzjzjzjzizgzgzrzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"43c6ff97f5:52:2988:1:f_401:1:2000003393_2000013382","config":{"balloon":{"container":"news_head_left11","bal_from":"balloon_from","bal_to":"balloon_to","init":"300x40","expand":"640x380","collapse":"300x250","expandIn":5,"collapseIn":8}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000013382/2988/ziznznzlzkzrzizrzmznzozhzlzizjzozhzjzjzjzjzizgzgzrzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"[Thethao.vnexpress.net] All - Large 3 - 300x250 (3.2015)","plmId":5,"view":{"format":"gallery-format","formatId":401},"website":{"id":52,"url":"thethao.vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"time":1446781854}}
            //data = {"data":{"2988":{"banners":[{"bid":2000013382,"campaign":{"id":2000003393,"user":{"id":10916}},"cat":1331,"clid":10916,"cpid":2000003393,"format":[401],"h":600,"host":"caganu.com","id":2000013382,"info":"{\"e_image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/a60k8258102896659946c874073.png\",\"e_url\":\"http:\\/\\/caganu.com\\/that-lung-da-ca-sau?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau\",\"items\":[{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/7227qho498717725b5635c98.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/Day-that-lung-nam-da-ca-sau-cao-cap-mau-nau-dau-vang-loai-dac-biet-VNLDLCS0A22NB.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLDLCS0A22NB\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLDLCS0A22NB\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/11\\/06\\/107239439995416262268862b7761.jpeg\",\"url\":\"http:\\/\\/caganu.com\\/day-that-lung-ca-sau-nam-da-that-100-percent-chinh-hang-loai-dac-biet.html?utm_source=eclick\u0026utm_medium=gallery\u0026utm_campaign=that-lung-ca-sau-VNLCS20A4\",\"name\":\"Th\\u1eaft l\\u01b0ng c\\u00e1 s\\u1ea5u VNLCS20A4\",\"oldPrice\":\"2169000\",\"newPrice\":\"1169000\",\"button\":\"MUA NGAY\"}]}","method":1,"plmIds":5,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":4,"w":300,"weight":1}],"beacon":"ziznznzlzkzrzizrzmznzozhzlzizjzozmzhzozizjzqzizl2pzhzjzjzjzjzjzgzgzqzg2pzhzjzjzjzjzizgzgzrzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"43c6ff97f5:52:2988:1:f_401:1:2000003393_2000013382","config":{},"feature_alternative_logo":1,"height":600,"id":2988,"links":["//c.eclick.vn/r/2000013382/2988/ziznznzlzkzrzizrzmznzozhzlzizjzozhzjzjzjzjzizgzgzrzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"[Thethao.vnexpress.net] All - Large 3 - 300x250 (3.2015)","plmId":5,"view":{"format":"gallery-format","formatId":401},"website":{"id":52,"url":"thethao.vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"time":1446781854}}
            //data = {"data":{"934":{"banners":[{"bannerType":null,"campaign":{"id":2000003389,"user":{"id":6553}},"cate":"Sản phẩm","content":"Học Online 16 ca/ ngày với 100% thầy Tây, tùy ý chọn ca học.","hostname":"topicanative.edu.vn","id":2000013353,"image":"//static.eclick.vn/uploads/thumb/2015/11/05/4733117378l64s41rj59i7476.jpeg","method":1,"newPrice":"","oldPrice":"","percentage":null,"title":"Tuyệt chiêu tiếng Anh cho người bận rộn","tracking_click":[],"tracking_imp":[],"url":"http://topicanative.edu.vn/?code_chanel=EC099\u0026id_landingpage=68\u0026id_campaign=5\u0026id=5776"},{"bannerType":null,"campaign":{"id":2000003389,"user":{"id":6553}},"cate":"Sản phẩm","content":"Luyện nói online cùng 100% thầy Âu Úc Mỹ. Lộ trình học riêng","hostname":"topicanative.edu.vn","id":2000013355,"image":"//static.eclick.vn/uploads/thumb/2015/11/05/829879y877890p28q364895c25.jpeg","method":1,"newPrice":"","oldPrice":"","percentage":null,"title":"Học tiếng Anh online xu hướng Harvard","tracking_click":[],"tracking_imp":[],"url":"http://topicanative.edu.vn/?code_chanel=EC093\u0026id_landingpage=68\u0026id_campaign=5\u0026id=5567"}],"beacon":"ziznznzlzkzqzqznznzjzozizqzrznzozhzgzlzqzozlzmzmzg2pzhzjzjzjzjzjzgzgzrzq2pzhzjzjzjzjzizgzgzmzgzfzlzmzmzg2pzhzjzjzjzjzjzgzgzrzq2pzhzjzjzjzjzizgzgzmzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"6f78c21891:2369:934:1:f_101:2:2000003389_2000013353:2000003389_2000013355","config":{"balloon":{"container":"news_head_left","init":"300x40","expand":"640x380","collapse":"300x250"}},"feature_alternative_logo":1,"height":250,"id":934,"links":["//c.eclick.vn/r/2000013353/934/ziznznzlzkzqzqznznzjzozizqzrznzozhzjzjzjzjzizgzgzmzgzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/http://topicanative.edu.vn/?code_chanel=EC099\u0026id_landingpage=68\u0026id_campaign=5\u0026id=5776","//c.eclick.vn/r/2000013355/934/ziznznzlzkzqzqznznzjzozizqzrznzozhzjzjzjzjzizgzgzmzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/http://topicanative.edu.vn/?code_chanel=EC093\u0026id_landingpage=68\u0026id_campaign=5\u0026id=5567"],"name":"Inpage 2 - 670 x 90","plmId":17,"view":{"formatId":101,"height":250,"layout":"widget-classic-no-price","total":2,"width":300},"website":{"id":2369,"url":"vitalk.vn"},"width":300,"zoneId":934}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production7","time":1446799440}};
            //data = {"data":{"2988":{"banners":[{"bid":2000014565,"campaign":{"id":2000003648,"user":{"id":10672}},"cat":[1287],"cate_arr":[1287],"clid":10672,"cpid":2000003648,"format":[601],"h":250,"host":"nhakhoanucuoiduyen.com","id":2000014565,"info":"{\"300x250\":{\"file\":\"http:\\/\\/static.eclick.vn\\/html5\\/2015\\/n\\/nucuoiduyen\\/1126\\/2\\/index.html\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/30\\/10094g374843kw8410o9138902.jpeg\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/nhakhoanucuoiduyen.com\\/cho-nu-cuoi-them-duyen-2015\\/\"}}","method":1,"plmIds":5,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":100}],"beacon":"ziznznzqzhzizlzmzkzjzozhzqzrzrzozkzgzozizjzlzkzh2pzhzjzjzjzjzjzgzlznzr2pzhzjzjzjzjziznzmzlzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"906a6fe688:73:2988:1:f_601:1:2000003648_2000014565","config":{"balloon":{"collapse":"300x250","container":"width_common line_col","expand":"640x360","init":"300x40","initState":"300x40"}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000014565/2988/ziznznzqzhzizlzmzkzjzozhzqzrzrzozhzjzjzjzjziznzmzlzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Balloon test Folder test","plmId":36,"view":{"format":"richmedia-format","formatId":601},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production6","time":1449216570}};
            //data = {"data":{"2988":{"banners":[{"bid":2000013568,"campaign":{"id":2000003427,"user":{"id":33}},"cat":2060,"clid":33,"cpid":2000003427,"format":[602],"h":250,"host":"eclick.vn","id":2000013568,"info":"{\"640x380\":{\"file\":\"http:\\/\\/placehold.it\\/640x360\"},\"300x250\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/10\\/611726444721589e4710035932892.jpeg\",\"fileType\":2,\"clickTag\":\"http:\\/\\/eclick.vn\"},\"640x360\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/10\\/k10367730229882864r4069172034.jpeg\",\"fileType\":2,\"clickTag\":\"http:\\/\\/eclick.vn\"},\"300x40\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/10\\/852753452656281852m547120v78.jpeg\",\"fileType\":2,\"clickTag\":\"http:\\/\\/eclick.vn\"}}","method":1,"plmIds":36,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":-99}],"beacon":"ziznznzkzhzgznzrzlzjzozhzqzrzrzozkzgzozgzg2pzhzjzjzjzjzjzgznzhzk2pzhzjzjzjzjzizgzmzlzrzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"bbdda56302:73:2988:1:f_602:1:2000003427_2000013568","config":{"balloon":{"container":"test_balloon_div","expandIn":3,"collapseIn":5,"init":"300x40","expand":"640x380","collapse":"300x250"}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000013568/2988/ziznznzkzhzgznzrzlzjzozhzqzrzrzozhzjzjzjzjzizgzmzlzrzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Balloon test Folder test","plmId":36,"view":{"format":"richmedia-format","formatId":602},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":0,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production26","time":1447234860}};
            //data = {"data":{"2988":{"banners":[{"bid":2000013252,"campaign":{"id":2000002641,"user":{"id":281}},"cat":1189,"clid":281,"cpid":2000002641,"format":[201],"h":0,"host":"lazada.vn","id":2000013252,"info":"{\"300x250\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/13\\/y64352b60736330417559e12b.jpeg\",\"fileType\":2,\"clickTag\":\"http:\\/\\/www.lazada.vn\\/bep-gas-hong-ngoai-kokoro-kr-hnl-den-237108.html?wt_dp_l=vn.display_local.eclick.[ae]_050000000000_PE833HLAF2YCVNAMZ-252212_bepgaskokoroearlydeal-300x250..\u0026utm_source=eclick\u0026utm_medium=display_local\u0026utm_campaign=[ae]_050000000000_PE833HLAF2YCVNAMZ-252212_bepgaskokoroearlydeal-300x250_\u0026utm_content=\u0026utm_term=xxvo0000sleat0500\"}}","method":1,"plmIds":0,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":2,"w":0,"weight":1}],"beacon":"ziznznzkznzjzjznzqznzozhzqzrzrzozkzgzozhzrzi2pzhzjzjzjzjzjzhzlznzi2pzhzjzjzjzjzizgzhzmzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"0dbafa0c9b:73:2988:1:f_201:1:2000002641_2000013252","config":{"balloon":{"container":"asdasd","expandIn":3,"collapseIn":5,"init":"300x40","expand":"640x380","collapse":"300x250"}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000013252/2988/ziznznzkznzjzjznzqznzozhzqzrzrzozhzjzjzjzjzizgzhzmzhzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Balloon test Folder test","plmId":36,"view":{"format":"banner-format","formatId":201},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production5","time":1447400494}};
            //data = {"data":{"2988":{"banners":[{"bannerType":null,"campaign":{"id":2000002429,"user":{"id":3834}},"cate":"Sản phẩm","content":"","hostname":"fnu.vn","id":2000012989,"image":"//static.eclick.vn/uploads/thumb/2015/10/29/993742g4556c894115553w44x.jpeg","method":1,"newPrice":"890.000","oldPrice":"1.750.000","percentage":null,"title":"Giầy lười da bò sang trọng đẳng cấp  FNU","tracking_click":[],"tracking_imp":[],"url":"http://www.fnu.vn/shop-9966/giay-luoi-da-bo-sang-trong-dang-cap-fnu-10.html"},{"bannerType":null,"campaign":{"id":2000002468,"user":{"id":281}},"cate":"Sản phẩm","content":"","hostname":"lazada.vn","id":2000012936,"image":"//static.eclick.vn/uploads/thumb/2015/10/28/21k518341619145d3940203682n.jpeg","method":1,"newPrice":"339.000","oldPrice":"490.000","percentage":null,"title":"Bộ lau sàn 360 độ lồng inox","tracking_click":[],"tracking_imp":[],"url":"http://www.lazada.vn/bo-lau-san-360-do-long-inox-fujipan-speed-mop-xanh-chuoi-1379732.html?wt_dp_l=vn.display_local.eclick.[ae]_060000000000_FU783HLAA0TKLWVNAMZ-1033886_bolausanxanhla-wd..\u0026utm_source=eclick\u0026utm_medium=display_local\u0026utm_campaign=[ae]_060000000000_FU783HLAA0TKLWVNAMZ-1033886_bolausanxanhla-wd_\u0026utm_content=\u0026utm_term=xxvo0000sleat0600"}],"beacon":"ziznznzkzlzmzkzqzqzlzozhzqzrzrzozkzgzozgzrzgzn2pzhzjzjzjzjzjzhznzhzq2pzhzjzjzjzjzizhzqzrzqzfzhzrzi2pzhzjzjzjzjzjzhznzlzr2pzhzjzjzjzjzizhzqzgzlzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"005038b600:73:2988:1:f_102:2:2000002429_2000012989:2000002468_2000012936","config":{"balloon":{"collapse":"300x250","container":"asdadsadsa","expand":"640x360","init":"300x40","expandIn":3,"collapseIn":5}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000012989/2988/ziznznzkzlzmzkzqzqzlzozhzqzrzrzozhzjzjzjzjzizhzqzrzqzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/http://www.fnu.vn/shop-9966/giay-luoi-da-bo-sang-trong-dang-cap-fnu-10.html","//c.eclick.vn/r/2000012936/2988/ziznznzkzlzmzkzqzqzlzozhzqzrzrzozhzjzjzjzjzizhzqzgzlzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/http://www.lazada.vn/bo-lau-san-360-do-long-inox-fujipan-speed-mop-xanh-chuoi-1379732.html?wt_dp_l=vn.display_local.eclick.[ae]_060000000000_FU783HLAA0TKLWVNAMZ-1033886_bolausanxanhla-wd..\u0026utm_source=eclick\u0026utm_medium=display_local\u0026utm_campaign=[ae]_060000000000_FU783HLAA0TKLWVNAMZ-1033886_bolausanxanhla-wd_\u0026utm_content=\u0026utm_term=xxvo0000sleat0600"],"name":"Balloon test Folder test","plmId":36,"view":{"formatId":102,"height":250,"layout":"widget-classic-price","total":2,"width":300},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production27","time":1447657996}};
            //data = {"data":{"2952":{"banners":[{"bid":2000014134,"campaign":{"id":2000003338,"user":{"id":33}},"cat":2175,"clid":33,"cpid":2000003338,"format":[701],"h":0,"host":"ngoisao.net","id":2000014134,"info":"{\"720x480\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/16\\/55865872452049898489928z7884.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/ngoisao.net\"},\"480x720\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/16\\/59p11297518443954101009911o.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/ngoisao.net\"},\"1152x1536\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/16\\/t55uv1008297456147d30y4364.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/ngoisao.net\"},\"1536x1152\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/16\\/9713l4737t48397106348s42.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/ngoisao.net\"}}","method":2,"plmIds":0,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":7,"w":0,"weight":1}],"beacon":"ziznznzkzlzlzrzrznznzozhzqzmzhzozkzhzozgzg2pzhzjzjzjzjzjzgzgzgzr2pzhzjzjzjzjziznzizgznzozizkzhzdzgzjzdzizizgzdzizgzgzozc","beacon2":"1e5e2c99fb:72:2952:1:f_701:1:2000003338_2000014134","config":{"inpage":{"container":"fck_detail"}},"feature_alternative_logo":0,"height":720,"id":2952,"links":["//c.eclick.vn/r/2000014134/2952/ziznznzkzlzlzrzrznznzozhzqzmzhzozhzjzjzjzjziznzizgznzozizkzhzdzgzjzdzizizgzdzizgzgzozc/"],"name":"Inpage","plmId":30,"view":{"format":"inpage-format","formatId":701},"website":{"id":72,"url":"ngoisao.net"},"width":480,"zoneId":2952}},"meta":{"city":29,"code":200,"country":"vn","gender":0,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production27","time":1447668844}};
            //data = {"data":{"2808":{"banners":[{"bannerType":null,"campaign":{"id":2000002318,"user":{"id":9045}},"cate":"Sản phẩm","content":"","hostname":"","id":2000014141,"image":"//static.eclick.vn/uploads/thumb/2015/11/17/55cj2528383ts60496192n52.jpeg","method":1,"newPrice":"","oldPrice":"","percentage":null,"title":"7 loại thực phẩm nên ăn nhiều để là phẳng bụng","tracking_click":[],"tracking_imp":[],"url":"http://video.ngoisao.net/thoi-trang/7-loai-thuc-pham-nen-an-nhieu-de-la-phang-bung-3313052.html"}],"beacon":"ziznznzkzkzmzmzgzqzizozhzrzjzrzozkzhzozizjzizqzj2pzhzjzjzjzjzjzgznznzj2pzhzjzjzjzjziznzizhzgzfzqzjznzm2pzhzjzjzjzjzjzhzgzizr2pzhzjzjzjzjziznziznzizozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"2de65e2ddb:72:2808:1:f_501:2:2000003440_2000014123:2000002318_2000014141","config":{"css":".width_common{width:100%;float:left}.box_nativeads{font-family:Arial;display:inline-block}.row_nativeads{background:#dee8f1;padding:0}.item_nativeads{margin:0 1.5%;padding:10px 0;width:47%;float:left;border-top:1px dotted #dedede}.item_nativeads .link_item{display:inline-block;text-decoration:none;width:100%;text-align:left;padding-right:0}.item_nativeads img{float:left;margin-right:10px;width:100%}.item-no-right .sponsored-top{text-indent:-9000px}.item_nativeads .sponsored{color:#888;font-size:11px;height:auto;margin:0;font-weight:400;display:block}.item_nativeads .sponsored-top{display:block;width:100%;float:left;margin-bottom:5px}.item_nativeads .sponsored-right{display:none}.item_nativeads .sponsored-bottom{display:none}.item_nativeads .title_article{color:#000;font-size:13px;margin:8px 0;width:100%;float:left}","v_img":"4x3"},"feature_alternative_logo":0,"height":120,"id":2808,"links":["//c.eclick.vn/r/2000014123/2808/ziznznzkzkzmzmzgzqzizozhzrzjzrzozhzjzjzjzjziznzizhzgzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/https://www.thammyvienkhothi.com/co-hoi-vang-uu-dai-40-trai-nghiem-lan-dau.html?utm_source=eClick_NgoiSao\u0026utm_medium=CPC\u0026utm_term=le2011\u0026utm_content=le2011\u0026utm_campaign=MobilePost_le2011","//c.eclick.vn/r/2000014141/2808/ziznznzkzkzmzmzgzqzizozhzrzjzrzozhzjzjzjzjziznziznzizozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/http://video.ngoisao.net/thoi-trang/7-loai-thuc-pham-nen-an-nhieu-de-la-phang-bung-3313052.html"],"name":"Infeed","plmId":28,"view":{"formatId":501,"height":120,"layout":"native-ads","total":2,"width":300},"website":{"id":72,"url":"ngoisao.net"},"width":300,"zoneId":2808}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production48","time":1447755391}};
            //data = {"data":{"2988":{"banners":[{"bid":2000013039,"campaign":{"id":2000003331,"user":{"id":2129}},"cat":2060,"clid":2129,"cpid":2000003331,"format":[601],"h":250,"host":"vnexpress.net","id":2000013039,"info":"{\"300x250\":{\"file\":\"\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/10\\/30\\/49254fb19615877t5653z96h.jpeg\",\"file_bk2\":\"\",\"html5\":\"\u003cscript\u003edocument.open();document.write(\\\"\\\\x3cscript src='https:\\/\\/rtb.adnemo.com\\/sys\\/adnemo.js?pzoneid=236\u0026dmid=46\u0026height=250\u0026width=300\u0026tld=ione.vnexpress.net\u0026cb=1028165724'\\/\\\\x3e\\\\x3c\\/script\\\\x3e\\\\x3ciframe src='https:\\/\\/iad.eclick.vn\\/tracking_ione.html?s=300x250' width='0' height='0' style='display: none;'\\/\\\\x3e\\\\x3c\\/iframe\\\\x3e\\\");document.close();\u003c\\/script\u003e\",\"fileType\":\"16\",\"clickTag\":\"http:\\/\\/vnexpress.net\\/\"}}","method":1,"plmIds":5,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":-99}],"beacon":"ziznznzrzjzizlznzizizozhzqzqzqzozmzjzozhzizhzq2pzhzjzjzjzjzjzgzgzgzi2pzhzjzjzjzjzizgzjzgzqzozizlzdzjzdzjzdzgzozhzi2021zrzkzmzm1vzrzizkzj1u1vzl","beacon2":"ce7eee057e:50:2988:1:f_601:1:2000003331_2000013039","config":{"balloon":{"collapse":"300x250","expand":"640x360","init":"300x40"}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000013039/2988/ziznznzrzjzizlznzizizozhzqzqzqzozhzjzjzjzjzizgzjzgzqzozizlzdzjzdzjzdzgzozhzi2021zrzkzmzm1vzrzizkzj1u1vzl/"],"name":"Balloon 300x250","plmId":36,"view":{"format":"richmedia-format","formatId":601},"website":{"id":50,"url":"ione.net"},"width":300,"zoneId":2988}},"meta":{"city":0,"code":200,"country":"","gender":3,"ip":"16.0.0.3","isp":0,"region":0,"sid":"production7","time":1448016411}};
            //data = {"data":{"2988":{"banners":[{"bid":2000014399,"campaign":{"id":2000003608,"user":{"id":11098}},"cat":2029,"clid":11098,"cpid":2000003608,"format":[601],"h":250,"host":"celadoncity.sieuthiduan.vn","id":2000014399,"info":"{\"300x250\":{\"file\":\"http:\\/\\/static.eclick.vn\\/html5\\/2015\\/c\\/celadon\\/1123\\/300x250\\/V2\\/index.html\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/24\\/9122945867r12l8544f49292254.jpeg\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/celadoncity.sieuthiduan.vn\\/?utm_source=eclick\u0026utm_medium=cpc\u0026utm_content=banner\u0026utm_campaign=celadon-rsm-sg\"}}","method":1,"plmIds":5,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":100}],"beacon":"ziznznzrznzgzrzmzkzlzozhzqzrzrzozkzgzozizizjzqzr2pzhzjzjzjzjzjzgzlzjzr2pzhzjzjzjzjziznzgzqzqzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"990eaf78ae:73:2988:1:f_601:1:2000003608_2000014399","config":{"balloon":{"collapse":"300x250","container":"main_content_detail","expand":"640x360","init":"300x40"}},"feature_alternative_logo":1,"height":250,"id":2988,"links":["//c.eclick.vn/r/2000014399/2988/ziznznzrznzgzrzmzkzlzozhzqzrzrzozhzjzjzjzjziznzgzqzqzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Balloon test Folder test","plmId":36,"view":{"format":"richmedia-format","formatId":601},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2988}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production7","time":1448438576}};
            //data = {"data":{"2952":{"banners":[{"bid":2000014368,"campaign":{"id":2000003594,"user":{"id":11167}},"cat":1319,"clid":11167,"cpid":2000003594,"format":[701],"h":0,"host":"sacngockhang.com","id":2000014368,"info":"{\"480x960\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/25\\/2079py1672g3857i632536745.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/sacngockhang.com\\/tin-tuc\\/sac-ngoc-khang-moi-cam-ket-hoan-tien-neu-khong-hieu-qua.html?utm_campaign=CKHTthang11\u0026utm_medium=statis\u0026utm_source=inpagengoisao\"},\"640x1280\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/25\\/67p8746602577743323560qfm.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/sacngockhang.com\\/tin-tuc\\/sac-ngoc-khang-moi-cam-ket-hoan-tien-neu-khong-hieu-qua.html?utm_campaign=CKHTthang11\u0026utm_medium=statis\u0026utm_source=inpagengoisao\"},\"960x480\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/25\\/90m84k60l977658t413z16b.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/sacngockhang.com\\/tin-tuc\\/sac-ngoc-khang-moi-cam-ket-hoan-tien-neu-khong-hieu-qua.html?utm_campaign=CKHTthang11\u0026utm_medium=statis\u0026utm_source=inpagengoisao\"},\"1280x640\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/25\\/1283wq72241367g872340426551.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/sacngockhang.com\\/tin-tuc\\/sac-ngoc-khang-moi-cam-ket-hoan-tien-neu-khong-hieu-qua.html?utm_campaign=CKHTthang11\u0026utm_medium=statis\u0026utm_source=inpagengoisao\"}}","method":2,"plmIds":0,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":7,"w":0,"weight":100}],"beacon":"ziznznzrznznznzgzkzrzozhzqzmzhzozkzhzozizizizlzk2pzhzjzjzjzjzjzgzmzqzn2pzhzjzjzjzjziznzgzlzrzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"2ed5ae62af:72:2952:1:f_701:1:2000003594_2000014368","config":{"inpage":{"container":"fck_detail"}},"feature_alternative_logo":0,"height":960,"id":2952,"links":["//c.eclick.vn/r/2000014368/2952/ziznznzrznznznzgzkzrzozhzqzmzhzozhzjzjzjzjziznzgzlzrzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Inpage","plmId":30,"view":{"format":"inpage-format","formatId":701},"website":{"id":72,"url":"ngoisao.net"},"width":480,"zoneId":2952}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production6","time":1448444378}}
            //data = {"data":{"2952":{"banners":[{"bid":2000014451,"campaign":{"id":2000003628,"user":{"id":11195}},"cat":1281,"clid":11195,"cpid":2000003628,"format":[701],"h":0,"host":"lavenderspa.vn","id":2000014451,"info":"{\"480x960\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/26\\/gf9989q46o14c108391297331.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/www.lavenderspa.vn\\/tin-tuc\\/su-kien\\/1318-lavender-khai-truong-vien-tham-my-5-sa0.html\"},\"960x480\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/26\\/p694l61444351sgt80p1545.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/www.lavenderspa.vn\\/tin-tuc\\/su-kien\\/1318-lavender-khai-truong-vien-tham-my-5-sa0.html\"},\"640x1280\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/26\\/422043w6477z2021477658469014.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/www.lavenderspa.vn\\/tin-tuc\\/su-kien\\/1318-lavender-khai-truong-vien-tham-my-5-sa0.html\"},\"1280x640\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/11\\/26\\/4925h333h893383a8151q671.jpeg\",\"fileType\":\"4\",\"clickTag\":\"http:\\/\\/www.lavenderspa.vn\\/tin-tuc\\/su-kien\\/1318-lavender-khai-truong-vien-tham-my-5-sa0.html\"}}","method":2,"plmIds":0,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":7,"w":0,"weight":100}],"beacon":"ziznznzrzmzhzjznzqzqzozhzqzmzhzozkzhzozizizizqzm2pzhzjzjzjzjzjzgzlzhzr2pzhzjzjzjzjziznznzmzizozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"3a0618f9c3:72:2952:1:f_701:1:2000003628_2000014451","config":{"inpage":{"container":"fck_detail"}},"feature_alternative_logo":0,"height":960,"id":2952,"links":["//c.eclick.vn/r/2000014451/2952/ziznznzrzmzhzjznzqzqzozhzqzmzhzozhzjzjzjzjziznznzmzizozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"Inpage","plmId":30,"view":{"format":"inpage-format","formatId":701},"website":{"id":72,"url":"ngoisao.net"},"width":480,"zoneId":2952}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production6","time":1448520499}};
            //data = {"data":{"3017":{"defaultType":3,"scriptPathBack":"\u003cscript type=\"text/javascript\"\u003egoogle_ad_client=\"ca-pub-1481019754184955\";google_ad_slot=\"3367682884\";google_ad_width=300;google_ad_height=250;\u003c/script\u003e\u003cscript type=\"text/javascript\" src=\"//pagead2.googlesyndication.com/pagead/show_ads.js\"\u003e\u003c/script\u003e","zoneId":3017}},"meta":{"city":29,"code":200,"country":"vn","gender":0,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production7","time":1448608872}};
            //data = {"data":{"2952":{"banners":[{"bid":2000015038,"campaign":{"id":2000003338,"user":{"id" :33}},"cat":[919],"cate_arr":[919],"clid":33,"cpid":2000003338,"format":[701],"h":0,"host":"vnexpress.net","id":2000015038,"info":"{\"960x480\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/11\\/79882482iaw1008y5029842554.jpeg\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/vnexpress.net\"},\"640x1280\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/11\\/787323e45a69884828q46785123.jpeg\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/vnexpress.net\"},\"1280x640\":{\"file\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/11\\/568i394256314421969027z2050.jpeg\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/vnexpress.net\"},\"480x960\":{\"file\":\"\\/\\/customers.fptad.com\\/QC\\/SG\\/K\\/KYMDAN\\/2015_12_17\\/V3\\/\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/vnexpress.net\"}}","method":2,"plmIds":0,"price":0,"status":2,"tracking_click":[],"tracking_imp":[],"type":7,"w":0,"weight":1}],"beacon":"ziznznzqzrzgzizrzjzrzozhzqznzhzozkzgzozgzg2pzhzjzjzjzjzjzgzgzgzr2pzhzjzjzjzjzizmzjzgzrzozizkzhzdzgzjzdzizizgzdzizgzgzo1vzjzqzhzjzq1yzqzj1y1vzlzlzgzhzn","beacon2":"80f0d722a6:73:2952:1:f_701:1:2000003338_2000015038","config":{"inpage":{"container":"fck_detail"}},"feature_alternative_logo":0,"height":960,"id":2952,"links":["//c.eclick.vn/r/2000015038/2952/ziznznzqzrzgzizrzjzrzozhzqznzhzozhzjzjzjzjzizmzjzgzrzozizkzhzdzgzjzdzizizgzdzizgzgzo1vzjzqzhzjzq1yzqzj1y1vzlzlzgzhzn/"],"name":"Inpage VNE","plmId":30,"view":{"format":"inpage-format","formatId":701},"website":{"id":73,"url":"vnexpress.net"},"width":480,"zoneId":2952}},"meta":{"city":29,"code":200,"country":"vn","gender":3,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production6","time":1449831808}};
            //data = {"data":{"3031":{"banners":[{"bid":2000015175,"campaign":{"id":2000003856,"user":{"id":3566}},"cat":[1390],"cate_arr":[1390],"clid":3566,"cpid":2000003856,"format":[401],"h":0,"host":"vnexpress.net","id":2000015175,"index":144,"info":"{\"e_image\":{\"300x250\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/js655744569180a478l875055.jpeg\",\"300x300\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/js655744569180a478l875055.jpeg\",\"300x600\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/js655744569180a478l875055.jpeg\",\"160x600\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/4075c55r91308966q5394da34.jpeg\",\"486x90\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/4075c55r91308966q5394da34.jpeg\",\"728x90\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/4075c55r91308966q5394da34.jpeg\"},\"e_url\":\"http:\\/\\/vnexpress.net\\/tin-tuc\\/khoa-hoc\\/nhung-ma-ca-rong-an-minh-trong-vu-tru-3328840.html\",\"items\":[{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/48c23549m7n23100z1187014.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/1288412928772449324851z88m55.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25% M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/779278yt83w35c31361634t.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/az20134286963952292917767.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/175011632182952980479943n665.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"},{\"image\":\"\\/\\/static.eclick.vn\\/uploads\\/thumb\\/2015\\/12\\/17\\/58g34258796c674424pu65zo.jpeg\",\"url\":\"http:\\/\\/vnexpress.net\\/\",\"name\":\"M\\u1ef9 t\\u0103ng l\\u00e3i su\\u1ea5t 0,25%\",\"oldPrice\":\"1000000\",\"newPrice\":\"1000000\",\"button\":\"MUA NGAY\"}]}","method":1,"plmIds":0,"price":1980,"status":2,"tracking_click":[],"tracking_imp":[],"type":4,"w":0,"weight":100}],"beacon":"ziznzmzjznzizhzizqzmzozgzjzgzizozgzhzizqzozgzmzlzl2pzhzjzjzjzjzjzgzrzmzl2pzhzjzjzjzjzizmzizkzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh","beacon2":"a4367d5ccc:3219:3031:1:f_401:1:2000003856_2000015175","config":[],"feature_alternative_logo":1,"height":250,"id":3031,"links":["//c.eclick.vn/r/2000015175/3031/ziznzmzjznzizhzizqzmzozgzjzgzizozhzjzjzjzjzizmzizkzmzozizkzhzdzgzjzdzizizgzdzizgzgzozi1tzmzmzh211vzm1t1yzqzrzizj1tzh/"],"name":"QC","plmId":5,"view":{"format":"gallery-format","formatId":401},"website":{"id":3219,"url":"fptplay.net"},"width":300,"zoneId":3031}},"meta":{"city":29,"code":200,"country":"vn","gender":0,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production25","time":1450412195}};
            //data = {"data":{"2607":{"banners":[{"bid":2000014835,"campaign":{"id":2000003717,"user":{"id":11225}},"cat":[1211],"cate_arr":[1211],"clid":11225,"cpid":2000003717,"format":[601],"h":90,"host":"sunhouse.com.vn","id":2000014835,"index":200,"info":"{\"728x90\":{\"file\":\"http:\\/\\/static.eclick.vn\\/html5\\/2015\\/u\\/ureka\\/1208\\/728x90\\/index.html\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/08\\/5323147279f714211363840100ot.jpeg\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/sunhouse.com.vn\\/media\\/marketing\\/khuyen-mai-tet\\/sunhouse\\/infographic.html?utm_source=ureka\u0026utm_medium=eclick\u0026utm_campaign=7December\"}}","method":1,"plmIds":10,"price":3300,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":728,"weight":100}],"beacon":"ziznzmzjzlzlzlzqzqzjzozhzlzjzkzozmzhzozizizhzhzm2pzhzjzjzjzjzjzgzkzizk2pzhzjzjzjzjziznzrzgzmzozizkzhzdzgzjzdzizizgzdzizgzgzozqzizjznzizizg1uzkzrzjzg20zn2120","beacon2":"d4743f8ae1:52:2607:1:f_601:1:2000003717_2000014835","config":[],"feature_alternative_logo":1,"height":90,"id":2607,"links":["//c.eclick.vn/r/2000014835/2607/ziznzmzjzlzlzlzqzqzjzozhzlzjzkzozhzjzjzjzjziznzrzgzmzozizkzhzdzgzjzdzizizgzdzizgzgzozqzizjznzizizg1uzkzrzjzg20zn2120/"],"name":"[Thethao.vnexpress.net] All - Leader Board - 728x90 (3.2015)","plmId":10,"view":{"format":"richmedia-format","formatId":601},"website":{"id":52,"url":"thethao.vnexpress.net"},"width":728,"zoneId":2607}},"meta":{"city":29,"code":200,"country":"vn","gender":0,"ip":"172.30.113.133","isp":3,"region":1,"sid":"production49","time":1450666990}};
            // data = {"data":{"2766":{"banners":[{"bid":2000015304,"campaign":{"id":2000003918,"user":{"id":9472}},"cat":[1977],"cate_arr":[1977],"clid":9472,"cpid":2000003918,"format":[601],"h":250,"host":"cachchuabenhtri.vn","id":2000015304,"index":200,"info":"{\"300x250\":{\"file\":\"http:\\/\\/static.eclick.vn\\/html5\\/2015\\/a\\/adnetwork\\/motaphan\\/300x250\\/index.html\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/21\\/32165s64575437w49j10858970.jpeg\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/cachchuabenhtri.vn\\/trang\\/lam-sao-chua-khoi-han-benh-tri.html\"}}","method":1,"plmIds":5,"price":3300,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":100}],"beacon":"ziznzmzjzqzhzgzhzhzqzozhzkzlzlzozkzgzozqznzkzh2pzhzjzjzjzjzjzgzqzizr2pzhzjzjzjzjzizmzgzjznzozizkzhzdzgzjzdzizizgzdzizlzrzozm1t20zm20zn1vzk1y1u20zqzi20zm21","beacon2":"045a43591f:73:2766:1:f_601:1:2000003918_2000015304","config":[],"feature_alternative_logo":1,"height":250,"id":2766,"links":["//c.eclick.vn/r/2000015304/2766/ziznzmzjzqzhzgzhzhzqzozhzkzlzlzozhzjzjzjzjzizmzgzjznzozizkzhzdzgzjzdzizizgzdzizlzrzozm1t20zm20zn1vzk1y1u20zqzi20zm21/"],"name":"Zone theo Placement 300x250","plmId":5,"view":{"format":"richmedia-format","formatId":601},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2766}},"meta":{"city":29,"code":200,"country":"vn","gender":1,"ip":"172.30.113.168","isp":3,"region":1,"sid":"production5","time":1450923229}};
            data = {"data":{"2596":{"banners":[{"bid":2000015304,"campaign":{"id":2000003918,"user":{"id":9472}},"cat":[1977],"cate_arr":[1977],"clid":9472,"cpid":2000003918,"format":[601],"h":250,"host":"cachchuabenhtri.vn","id":2000015304,"index":200,"info":"{\"300x250\":{\"file\":\"http:\\/\\/static.eclick.vn\\/html5\\/2015\\/a\\/adnetwork\\/motaphan\\/300x250\\/index.html\",\"file_bk1\":\"\\/\\/static.eclick.vn\\/uploads\\/source\\/2015\\/12\\/21\\/32165s64575437w49j10858970.jpeg\",\"file_bk2\":\"\",\"html5\":\"\",\"fileType\":\"32\",\"clickTag\":\"http:\\/\\/cachchuabenhtri.vn\\/trang\\/lam-sao-chua-khoi-han-benh-tri.html\"}}","method":1,"plmIds":5,"price":3300,"status":2,"tracking_click":[],"tracking_imp":[],"type":6,"w":300,"weight":100}],"beacon":"ziznzmzjzqzhzgzhzhzqzozhzkzlzlzozkzgzozqznzkzh2pzhzjzjzjzjzjzgzqzizr2pzhzjzjzjzjzizmzgzjznzozizkzhzdzgzjzdzizizgzdzizlzrzozm1t20zm20zn1vzk1y1u20zqzi20zm21","beacon2":"045a43591f:73:2766:1:f_601:1:2000003918_2000015304","config":[],"feature_alternative_logo":1,"height":250,"id":2766,"links":["//c.eclick.vn/r/2000015304/2766/ziznzmzjzqzhzgzhzhzqzozhzkzlzlzozhzjzjzjzjzizmzgzjznzozizkzhzdzgzjzdzizizgzdzizlzrzozm1t20zm20zn1vzk1y1u20zqzi20zm21/"],"name":"Zone theo Placement 300x250","plmId":5,"view":{"format":"richmedia-format","formatId":601},"website":{"id":73,"url":"vnexpress.net"},"width":300,"zoneId":2766}},"meta":{"city":29,"code":200,"country":"vn","gender":1,"ip":"172.30.113.168","isp":3,"region":1,"sid":"production5","time":1450923229}};
            var zonesData = data.data;
            if (zonesData[obj.id] && zonesData[obj.id].INVALID || zonesData[obj.id].banners && zonesData[obj.id].banners.length == 0) {
                try {
                    document.getElementsByTagName("body")[0].style.background = "transparent";
                } catch (e) {}
                return;
            }
            zonesData.serverTime = data.meta.time;

            // check type to display
            var zone = zonesData[obj.id] || {},
                spanTempName = "",
                type;

            var elemId = win.eclick_frameId,
                elem;
            elemId ? elem = topWin.document.getElementById(elemId) : (spanTempName = "eclick_temp_span", elem = createSpanElement(spanTempName)); // fallback something else

            if (zone.defaultType) type = zone.defaultType;
            if (type == SimpleType.eca ||
                type == SimpleType.espb ||
                type == SimpleType.esdi) eclickSimpleRender = true;

            if (eclickSimpleRender) {
                switchAdsType(type, elem, obj, zonesData);
            } else {
                renderAd(elem, obj, zonesData);
            }
        };

        var targetingData2Object = function (obj, aid, gender) {
            for (var c = 1; c < arguments.length; c++) {
                var arg = arguments[c];
                if (arg != "undefined") {
                    obj[visitorid] = aid; // visitor id
                    obj[genderid] = gender; // gender id
                }
            }
            obj.h = win.eclick_ad_height ? win.eclick_ad_height : "0";
            obj.w = win.eclick_ad_width ? win.eclick_ad_width : "0";
            parseObj(eclickKeywords, function (value, key) {
                if (typeof obj[value] !== "undefined") win[key] = obj[value];
            });
            return obj;
        };

        var gp = { // go batch.json params
            chn: "chnl",
            db: "debug",
            dv: "device",
            fosp_aid: "fosp_aid",
            fosp_gender: "fosp_gender",
            h: "host",
            id: "id",
            lz: "lz",
            lc: "lc",
            lp: "lp",
            lisp: "lisp",
            loc: "loc",
            pv: "pv",
            rand: "rand",
            ts: "ts",
            url: "url",
            v: "v"
        };

        var eclickData2Object = function (obj) {
            var locZone, locCountry, locProvince;
            try {
                locZone = targetingLoc.zone.toString();
                locCountry = targetingLoc.country.toString();
                locProvince = targetingLoc.province.toString();
            } catch (e) {}

            obj[gp.chn] = _.cookies("channel") ? _.cookies("channel") : "0";
            obj[gp.lz] = locZone ? locZone : (win.loc_zone ? win.loc_zone : "1");
            obj[gp.lc] = locCountry ? locCountry : (win.loc_country ? win.loc_country : "vn");
            obj[gp.lp] = locProvince ? locProvince : (win.loc_province ? win.loc_province : "29");
            //obj[gp.dv] = win.eclick_device; // HARDCODE
            obj[gp.dv] = "1";
            obj[gp.db] = obj.eclick_debug == "on" ? "true" : "false";
            obj[gp.url] = win.eclick_url;
            obj[gp.h] = win.eclick_ad_host;
            obj[gp.rand] = ~~((new Date).getTime() / 100); // random number

            parseObj(eclickKeywords, function (value, key) {
                if (typeof obj[value] !== "undefined") win[key] = obj[value];
            });
        };

        var updateLocationCookie = function(){
            var urlGetId = buildUrl(eclickLogImpDomain, "/getid?nid=fosp_aid"),
                flag = false;

            JSONP.get(urlGetId, {}, function (resp) {
                flag = true;
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

                _.cookies('fosp_location_zone', resp.zone, opt.loc);
                _.cookies('fosp_location', resp.province, opt.loc);
                _.cookies('fosp_isp', resp.isp, opt.loc);
                _.cookies('fosp_country', resp.country, opt.loc);
                _.cookies('fosp_ip', resp.ip, opt.loc);
            });
        };

        var buildLogIpUrl = function (ip) {
            var param = [];
            param.push("ip" + EQUAL + ip);
            return buildUrl(eclickLogIp,"/log?" + param.join("&"));
        };

        var checkIpQuocTe = function (meta) {
            if(meta && meta.country != "vn") {
                sendLog(buildLogIpUrl(meta.ip), function (){});
            }
        };

        var requestSingleAdAsync = function (obj) {
            parseObj(eclickKeywords, function (value, key) {
                obj[value] = win[key];
            });
            var batchParamObj = {};
            parseObj(obj, function (val, key) {
                parseObj(gp, function (v, k) {
                    if (key == v) {
                        if (key == genderid) {
                            batchParamObj["gender"] = val
                        } else {
                            batchParamObj[key] = val;
                        }
                    }
                });
            });

            if (eclickRenderAdsAsync) {
                var url = win.eclick_batchUrl ? (win.eclick_batchUrl + "&id=" + win.eclick_zone) : buildBatchRequest(batchParamObj, buildUrl(eclickDeliveryGo, "/delivery/zone/batch.json?")); // eclickDeliveryGo

                JSONP.get(url, {}, function (resp) {
                    if (resp.data && resp.data[""] && resp.data[""].INVALID) {
                        return false;
                    }

                    var meta = resp.meta;
                    obj[gp.lc] = win.eclick_loc_country = meta.country || "";
                    obj[gp.lp] = win.eclick_loc_province = meta.city || "";
                    obj[gp.lz] = win.eclick_loc_zone = meta.region || "";
                    obj[gp.lisp] = win.eclick_loc_isp = meta.isp || "";
                    obj[gp.loc] = win.eclick_loc = obj['lp']+"-"+obj['lz']+"-"+obj['lc'];

                    //checkIpQuocTe(meta);
                    renderAdJob(obj, resp);
                });
            } else {
                // lay data tu adsbyeclick va goi renderAdJob(obj, dataFromEclick);
            }
            closeIframe(win);
        };

        var getEnvInfo = function (aid, gender) {
            var eclickObjectData = {};
            if (!aid || !gender) {
                eclickObjectData.experiment_no_targeting = 1;
            }

            try {
                eclickObjectData.support = JSON.parse(decodeUrl(win.eclick_support));
            } catch (e) {}

            eclickData2Object(targetingData2Object(eclickObjectData, aid, gender));
            requestSingleAdAsync(eclickObjectData);
        };

        var init = function () {
            optimizeEvents();
            getEnvInfo(win[visitorid], win[genderid]);
        };

        init();
    })();




})(window);
////////////////////////////////////////////////////////////// END HERE////////////////////////////////////////////////////////////// END HERE
