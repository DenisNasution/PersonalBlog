(function () { function r(e, n, t) { function o(i, f) { if (!n[i]) { if (!e[i]) { var c = "function" == typeof require && require; if (!f && c) return c(i, !0); if (u) return u(i, !0); var a = new Error("Cannot find module '" + i + "'"); throw a.code = "MODULE_NOT_FOUND", a } var p = n[i] = { exports: {} }; e[i][0].call(p.exports, function (r) { var n = e[i][1][r]; return o(n || r) }, p, p.exports, r, e, n, t) } return n[i].exports } for (var u = "function" == typeof require && require, i = 0; i < t.length; i++)o(t[i]); return o } return r })()({
  1: [function (require, module, exports) {
    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout() {
      throw new Error('clearTimeout has not been defined');
    }
    (function () {
      try {
        if (typeof setTimeout === 'function') {
          cachedSetTimeout = setTimeout;
        } else {
          cachedSetTimeout = defaultSetTimout;
        }
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        if (typeof clearTimeout === 'function') {
          cachedClearTimeout = clearTimeout;
        } else {
          cachedClearTimeout = defaultClearTimeout;
        }
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    }())
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
          return cachedSetTimeout.call(this, fun, 0);
        }
      }


    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
          // Some versions of I.E. have different rules for clearTimeout vs setTimeout
          return cachedClearTimeout.call(this, marker);
        }
      }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
      if (!draining || !currentQueue) {
        return;
      }
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
      }
    }

    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
          }
        }
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }

    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    };

    // v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() { }

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;

    process.listeners = function (name) { return [] }

    process.binding = function (name) {
      throw new Error('process.binding is not supported');
    };

    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function () { return 0; };

  }, {}], 2: [function (require, module, exports) {
    module.exports = require('./lib/axios');
  }, { "./lib/axios": 4 }], 3: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');
    var settle = require('./../core/settle');
    var cookies = require('./../helpers/cookies');
    var buildURL = require('./../helpers/buildURL');
    var buildFullPath = require('../core/buildFullPath');
    var parseHeaders = require('./../helpers/parseHeaders');
    var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
    var createError = require('../core/createError');
    var transitionalDefaults = require('../defaults/transitional');
    var Cancel = require('../cancel/Cancel');

    module.exports = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;
        var responseType = config.responseType;
        var onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          var transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(
            timeoutErrorMessage,
            config,
            transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = function (cancel) {
            if (!request) {
              return;
            }
            reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        if (!requestData) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

  }, { "../cancel/Cancel": 5, "../core/buildFullPath": 10, "../core/createError": 11, "../defaults/transitional": 18, "./../core/settle": 15, "./../helpers/buildURL": 21, "./../helpers/cookies": 23, "./../helpers/isURLSameOrigin": 26, "./../helpers/parseHeaders": 28, "./../utils": 31 }], 4: [function (require, module, exports) {
    'use strict';

    var utils = require('./utils');
    var bind = require('./helpers/bind');
    var Axios = require('./core/Axios');
    var mergeConfig = require('./core/mergeConfig');
    var defaults = require('./defaults');

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios(defaultConfig);
      var instance = bind(Axios.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios;

    // Expose Cancel & CancelToken
    axios.Cancel = require('./cancel/Cancel');
    axios.CancelToken = require('./cancel/CancelToken');
    axios.isCancel = require('./cancel/isCancel');
    axios.VERSION = require('./env/data').version;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = require('./helpers/spread');

    // Expose isAxiosError
    axios.isAxiosError = require('./helpers/isAxiosError');

    module.exports = axios;

    // Allow use of default import syntax in TypeScript
    module.exports.default = axios;

  }, { "./cancel/Cancel": 5, "./cancel/CancelToken": 6, "./cancel/isCancel": 7, "./core/Axios": 8, "./core/mergeConfig": 14, "./defaults": 17, "./env/data": 19, "./helpers/bind": 20, "./helpers/isAxiosError": 25, "./helpers/spread": 29, "./utils": 31 }], 5: [function (require, module, exports) {
    'use strict';

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    module.exports = Cancel;

  }, {}], 6: [function (require, module, exports) {
    'use strict';

    var Cancel = require('./Cancel');

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;

      // eslint-disable-next-line func-names
      this.promise.then(function (cancel) {
        if (!token._listeners) return;

        var i;
        var l = token._listeners.length;

        for (i = 0; i < l; i++) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = function (onfulfilled) {
        var _resolve;
        // eslint-disable-next-line func-names
        var promise = new Promise(function (resolve) {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Subscribe to the cancel signal
     */

    CancelToken.prototype.subscribe = function subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    };

    /**
     * Unsubscribe from the cancel signal
     */

    CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      var index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    module.exports = CancelToken;

  }, { "./Cancel": 5 }], 7: [function (require, module, exports) {
    'use strict';

    module.exports = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

  }, {}], 8: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');
    var buildURL = require('../helpers/buildURL');
    var InterceptorManager = require('./InterceptorManager');
    var dispatchRequest = require('./dispatchRequest');
    var mergeConfig = require('./mergeConfig');
    var validator = require('../helpers/validator');

    var validators = validator.validators;
    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      var transitional = config.transitional;

      if (transitional !== undefined) {
        validator.assertOptions(transitional, {
          silentJSONParsing: validators.transitional(validators.boolean),
          forcedJSONParsing: validators.transitional(validators.boolean),
          clarifyTimeoutError: validators.transitional(validators.boolean)
        }, false);
      }

      // filter out skipped interceptors
      var requestInterceptorChain = [];
      var synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      var responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      var promise;

      if (!synchronousRequestInterceptors) {
        var chain = [dispatchRequest, undefined];

        Array.prototype.unshift.apply(chain, requestInterceptorChain);
        chain = chain.concat(responseInterceptorChain);

        promise = Promise.resolve(config);
        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }


      var newConfig = config;
      while (requestInterceptorChain.length) {
        var onFulfilled = requestInterceptorChain.shift();
        var onRejected = requestInterceptorChain.shift();
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected(error);
          break;
        }
      }

      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      while (responseInterceptorChain.length) {
        promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function (url, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function (url, data, config) {
        return this.request(mergeConfig(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    module.exports = Axios;

  }, { "../helpers/buildURL": 21, "../helpers/validator": 30, "./../utils": 31, "./InterceptorManager": 9, "./dispatchRequest": 12, "./mergeConfig": 14 }], 9: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    module.exports = InterceptorManager;

  }, { "./../utils": 31 }], 10: [function (require, module, exports) {
    'use strict';

    var isAbsoluteURL = require('../helpers/isAbsoluteURL');
    var combineURLs = require('../helpers/combineURLs');

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    module.exports = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

  }, { "../helpers/combineURLs": 22, "../helpers/isAbsoluteURL": 24 }], 11: [function (require, module, exports) {
    'use strict';

    var enhanceError = require('./enhanceError');

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    module.exports = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

  }, { "./enhanceError": 13 }], 12: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');
    var transformData = require('./transformData');
    var isCancel = require('../cancel/isCancel');
    var defaults = require('../defaults');
    var Cancel = require('../cancel/Cancel');

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new Cancel('canceled');
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    module.exports = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData.call(
        config,
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

  }, { "../cancel/Cancel": 5, "../cancel/isCancel": 7, "../defaults": 17, "./../utils": 31, "./transformData": 16 }], 13: [function (require, module, exports) {
    'use strict';

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    module.exports = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      };
      return error;
    };

  }, {}], 14: [function (require, module, exports) {
    'use strict';

    var utils = require('../utils');

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    module.exports = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      function getMergedValue(target, source) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge(target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(prop) {
        if (!utils.isUndefined(config2[prop])) {
          return getMergedValue(undefined, config2[prop]);
        } else if (!utils.isUndefined(config1[prop])) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(prop) {
        if (prop in config2) {
          return getMergedValue(config1[prop], config2[prop]);
        } else if (prop in config1) {
          return getMergedValue(undefined, config1[prop]);
        }
      }

      var mergeMap = {
        'url': valueFromConfig2,
        'method': valueFromConfig2,
        'data': valueFromConfig2,
        'baseURL': defaultToConfig2,
        'transformRequest': defaultToConfig2,
        'transformResponse': defaultToConfig2,
        'paramsSerializer': defaultToConfig2,
        'timeout': defaultToConfig2,
        'timeoutMessage': defaultToConfig2,
        'withCredentials': defaultToConfig2,
        'adapter': defaultToConfig2,
        'responseType': defaultToConfig2,
        'xsrfCookieName': defaultToConfig2,
        'xsrfHeaderName': defaultToConfig2,
        'onUploadProgress': defaultToConfig2,
        'onDownloadProgress': defaultToConfig2,
        'decompress': defaultToConfig2,
        'maxContentLength': defaultToConfig2,
        'maxBodyLength': defaultToConfig2,
        'transport': defaultToConfig2,
        'httpAgent': defaultToConfig2,
        'httpsAgent': defaultToConfig2,
        'cancelToken': defaultToConfig2,
        'socketPath': defaultToConfig2,
        'responseEncoding': defaultToConfig2,
        'validateStatus': mergeDirectKeys
      };

      utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
        var merge = mergeMap[prop] || mergeDeepProperties;
        var configValue = merge(prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    };

  }, { "../utils": 31 }], 15: [function (require, module, exports) {
    'use strict';

    var createError = require('./createError');

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    module.exports = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

  }, { "./createError": 11 }], 16: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');
    var defaults = require('../defaults');

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    module.exports = function transformData(data, headers, fns) {
      var context = this || defaults;
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn.call(context, data, headers);
      });

      return data;
    };

  }, { "../defaults": 17, "./../utils": 31 }], 17: [function (require, module, exports) {
    (function (process) {
      (function () {
        'use strict';

        var utils = require('../utils');
        var normalizeHeaderName = require('../helpers/normalizeHeaderName');
        var enhanceError = require('../core/enhanceError');
        var transitionalDefaults = require('./transitional');

        var DEFAULT_CONTENT_TYPE = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        function setContentTypeIfUnset(headers, value) {
          if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
            headers['Content-Type'] = value;
          }
        }

        function getDefaultAdapter() {
          var adapter;
          if (typeof XMLHttpRequest !== 'undefined') {
            // For browsers use XHR adapter
            adapter = require('../adapters/xhr');
          } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
            // For node use HTTP adapter
            adapter = require('../adapters/http');
          }
          return adapter;
        }

        function stringifySafely(rawValue, parser, encoder) {
          if (utils.isString(rawValue)) {
            try {
              (parser || JSON.parse)(rawValue);
              return utils.trim(rawValue);
            } catch (e) {
              if (e.name !== 'SyntaxError') {
                throw e;
              }
            }
          }

          return (encoder || JSON.stringify)(rawValue);
        }

        var defaults = {

          transitional: transitionalDefaults,

          adapter: getDefaultAdapter(),

          transformRequest: [function transformRequest(data, headers) {
            normalizeHeaderName(headers, 'Accept');
            normalizeHeaderName(headers, 'Content-Type');

            if (utils.isFormData(data) ||
              utils.isArrayBuffer(data) ||
              utils.isBuffer(data) ||
              utils.isStream(data) ||
              utils.isFile(data) ||
              utils.isBlob(data)
            ) {
              return data;
            }
            if (utils.isArrayBufferView(data)) {
              return data.buffer;
            }
            if (utils.isURLSearchParams(data)) {
              setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
              return data.toString();
            }
            if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
              setContentTypeIfUnset(headers, 'application/json');
              return stringifySafely(data);
            }
            return data;
          }],

          transformResponse: [function transformResponse(data) {
            var transitional = this.transitional || defaults.transitional;
            var silentJSONParsing = transitional && transitional.silentJSONParsing;
            var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
            var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

            if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
              try {
                return JSON.parse(data);
              } catch (e) {
                if (strictJSONParsing) {
                  if (e.name === 'SyntaxError') {
                    throw enhanceError(e, this, 'E_JSON_PARSE');
                  }
                  throw e;
                }
              }
            }

            return data;
          }],

          /**
           * A timeout in milliseconds to abort a request. If set to 0 (default) a
           * timeout is not created.
           */
          timeout: 0,

          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN',

          maxContentLength: -1,
          maxBodyLength: -1,

          validateStatus: function validateStatus(status) {
            return status >= 200 && status < 300;
          },

          headers: {
            common: {
              'Accept': 'application/json, text/plain, */*'
            }
          }
        };

        utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
          defaults.headers[method] = {};
        });

        utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
          defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
        });

        module.exports = defaults;

      }).call(this)
    }).call(this, require('_process'))
  }, { "../adapters/http": 3, "../adapters/xhr": 3, "../core/enhanceError": 13, "../helpers/normalizeHeaderName": 27, "../utils": 31, "./transitional": 18, "_process": 1 }], 18: [function (require, module, exports) {
    'use strict';

    module.exports = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

  }, {}], 19: [function (require, module, exports) {
    module.exports = {
      "version": "0.26.1"
    };
  }, {}], 20: [function (require, module, exports) {
    'use strict';

    module.exports = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

  }, {}], 21: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    module.exports = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

  }, { "./../utils": 31 }], 22: [function (require, module, exports) {
    'use strict';

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    module.exports = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

  }, {}], 23: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    module.exports = (
      utils.isStandardBrowserEnv() ?

        // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

        // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() { },
            read: function read() { return null; },
            remove: function remove() { }
          };
        })()
    );

  }, { "./../utils": 31 }], 24: [function (require, module, exports) {
    'use strict';

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    module.exports = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    };

  }, {}], 25: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    module.exports = function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    };

  }, { "./../utils": 31 }], 26: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    module.exports = (
      utils.isStandardBrowserEnv() ?

        // Standard browser envs have full support of the APIs needed to test
        // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
              // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
          };
        })() :

        // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

  }, { "./../utils": 31 }], 27: [function (require, module, exports) {
    'use strict';

    var utils = require('../utils');

    module.exports = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

  }, { "../utils": 31 }], 28: [function (require, module, exports) {
    'use strict';

    var utils = require('./../utils');

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    module.exports = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

  }, { "./../utils": 31 }], 29: [function (require, module, exports) {
    'use strict';

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    module.exports = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

  }, {}], 30: [function (require, module, exports) {
    'use strict';

    var VERSION = require('../env/data').version;

    var validators = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function (type, i) {
      validators[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    var deprecatedWarnings = {};

    /**
     * Transitional option validator
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     * @returns {function}
     */
    validators.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return function (value, opt, opts) {
        if (validator === false) {
          throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      var keys = Object.keys(options);
      var i = keys.length;
      while (i-- > 0) {
        var opt = keys[i];
        var validator = schema[opt];
        if (validator) {
          var value = options[opt];
          var result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new TypeError('option ' + opt + ' must be ' + result);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw Error('Unknown option ' + opt);
        }
      }
    }

    module.exports = {
      assertOptions: assertOptions,
      validators: validators
    };

  }, { "../env/data": 19 }], 31: [function (require, module, exports) {
    'use strict';

    var bind = require('./helpers/bind');

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return Array.isArray(val);
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return toString.call(val) === '[object FormData]';
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a plain Object
     *
     * @param {Object} val The value to test
     * @return {boolean} True if value is a plain Object, otherwise false
     */
    function isPlainObject(val) {
      if (toString.call(val) !== '[object Object]') {
        return false;
      }

      var prototype = Object.getPrototypeOf(val);
      return prototype === null || prototype === Object.prototype;
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return toString.call(val) === '[object URLSearchParams]';
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
        navigator.product === 'NativeScript' ||
        navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (isPlainObject(result[key]) && isPlainObject(val)) {
          result[key] = merge(result[key], val);
        } else if (isPlainObject(val)) {
          result[key] = merge({}, val);
        } else if (isArray(val)) {
          result[key] = val.slice();
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     * @return {string} content value without BOM
     */
    function stripBOM(content) {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    }

    module.exports = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isPlainObject: isPlainObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      extend: extend,
      trim: trim,
      stripBOM: stripBOM
    };

  }, { "./helpers/bind": 20 }], 32: [function (require, module, exports) {
    /**
     * matchesSelector v2.0.2
     * matchesSelector( element, '.selector' )
     * MIT license
     */

    /*jshint browser: true, strict: true, undef: true, unused: true */

    (function (window, factory) {
      /*global define: false, module: false */
      'use strict';
      // universal module definition
      if (typeof define == 'function' && define.amd) {
        // AMD
        define(factory);
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.matchesSelector = factory();
      }

    }(window, function factory() {
      'use strict';

      var matchesMethod = (function () {
        var ElemProto = window.Element.prototype;
        // check for the standard method name first
        if (ElemProto.matches) {
          return 'matches';
        }
        // check un-prefixed
        if (ElemProto.matchesSelector) {
          return 'matchesSelector';
        }
        // check vendor prefixes
        var prefixes = ['webkit', 'moz', 'ms', 'o'];

        for (var i = 0; i < prefixes.length; i++) {
          var prefix = prefixes[i];
          var method = prefix + 'MatchesSelector';
          if (ElemProto[method]) {
            return method;
          }
        }
      })();

      return function matchesSelector(elem, selector) {
        return elem[matchesMethod](selector);
      };

    }));

  }, {}], 33: [function (require, module, exports) {
    /**
     * EvEmitter v1.1.0
     * Lil' event emitter
     * MIT License
     */

    /* jshint unused: true, undef: true, strict: true */

    (function (global, factory) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, window */
      if (typeof define == 'function' && define.amd) {
        // AMD - RequireJS
        define(factory);
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory();
      } else {
        // Browser globals
        global.EvEmitter = factory();
      }

    }(typeof window != 'undefined' ? window : this, function () {

      "use strict";

      function EvEmitter() { }

      var proto = EvEmitter.prototype;

      proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
          return;
        }
        // set events hash
        var events = this._events = this._events || {};
        // set listeners array
        var listeners = events[eventName] = events[eventName] || [];
        // only add once
        if (listeners.indexOf(listener) == -1) {
          listeners.push(listener);
        }

        return this;
      };

      proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
          return;
        }
        // add event
        this.on(eventName, listener);
        // set once flag
        // set onceEvents hash
        var onceEvents = this._onceEvents = this._onceEvents || {};
        // set onceListeners object
        var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
        // set flag
        onceListeners[listener] = true;

        return this;
      };

      proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
          return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
          listeners.splice(index, 1);
        }

        return this;
      };

      proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
          return;
        }
        // copy over to avoid interference if .off() in listener
        listeners = listeners.slice(0);
        args = args || [];
        // once stuff
        var onceListeners = this._onceEvents && this._onceEvents[eventName];

        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i]
          var isOnce = onceListeners && onceListeners[listener];
          if (isOnce) {
            // remove listener
            // remove before trigger to prevent recursion
            this.off(eventName, listener);
            // unset once flag
            delete onceListeners[listener];
          }
          // trigger listener
          listener.apply(this, args);
        }

        return this;
      };

      proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
      };

      return EvEmitter;

    }));

  }, {}], 34: [function (require, module, exports) {
    /**
     * Fizzy UI utils v2.0.7
     * MIT license
     */

    /*jshint browser: true, undef: true, unused: true, strict: true */

    (function (window, factory) {
      // universal module definition
      /*jshint strict: false */ /*globals define, module, require */

      if (typeof define == 'function' && define.amd) {
        // AMD
        define([
          'desandro-matches-selector/matches-selector'
        ], function (matchesSelector) {
          return factory(window, matchesSelector);
        });
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
          window,
          require('desandro-matches-selector')
        );
      } else {
        // browser global
        window.fizzyUIUtils = factory(
          window,
          window.matchesSelector
        );
      }

    }(window, function factory(window, matchesSelector) {

      'use strict';

      var utils = {};

      // ----- extend ----- //

      // extends objects
      utils.extend = function (a, b) {
        for (var prop in b) {
          a[prop] = b[prop];
        }
        return a;
      };

      // ----- modulo ----- //

      utils.modulo = function (num, div) {
        return ((num % div) + div) % div;
      };

      // ----- makeArray ----- //

      var arraySlice = Array.prototype.slice;

      // turn element or nodeList into an array
      utils.makeArray = function (obj) {
        if (Array.isArray(obj)) {
          // use object if already an array
          return obj;
        }
        // return empty array if undefined or null. #6
        if (obj === null || obj === undefined) {
          return [];
        }

        var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
        if (isArrayLike) {
          // convert nodeList to array
          return arraySlice.call(obj);
        }

        // array of single index
        return [obj];
      };

      // ----- removeFrom ----- //

      utils.removeFrom = function (ary, obj) {
        var index = ary.indexOf(obj);
        if (index != -1) {
          ary.splice(index, 1);
        }
      };

      // ----- getParent ----- //

      utils.getParent = function (elem, selector) {
        while (elem.parentNode && elem != document.body) {
          elem = elem.parentNode;
          if (matchesSelector(elem, selector)) {
            return elem;
          }
        }
      };

      // ----- getQueryElement ----- //

      // use element as selector string
      utils.getQueryElement = function (elem) {
        if (typeof elem == 'string') {
          return document.querySelector(elem);
        }
        return elem;
      };

      // ----- handleEvent ----- //

      // enable .ontype to trigger from .addEventListener( elem, 'type' )
      utils.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
          this[method](event);
        }
      };

      // ----- filterFindElements ----- //

      utils.filterFindElements = function (elems, selector) {
        // make array of elems
        elems = utils.makeArray(elems);
        var ffElems = [];

        elems.forEach(function (elem) {
          // check that elem is an actual element
          if (!(elem instanceof HTMLElement)) {
            return;
          }
          // add elem if no selector
          if (!selector) {
            ffElems.push(elem);
            return;
          }
          // filter & find items if we have a selector
          // filter
          if (matchesSelector(elem, selector)) {
            ffElems.push(elem);
          }
          // find children
          var childElems = elem.querySelectorAll(selector);
          // concat childElems to filterFound array
          for (var i = 0; i < childElems.length; i++) {
            ffElems.push(childElems[i]);
          }
        });

        return ffElems;
      };

      // ----- debounceMethod ----- //

      utils.debounceMethod = function (_class, methodName, threshold) {
        threshold = threshold || 100;
        // original method
        var method = _class.prototype[methodName];
        var timeoutName = methodName + 'Timeout';

        _class.prototype[methodName] = function () {
          var timeout = this[timeoutName];
          clearTimeout(timeout);

          var args = arguments;
          var _this = this;
          this[timeoutName] = setTimeout(function () {
            method.apply(_this, args);
            delete _this[timeoutName];
          }, threshold);
        };
      };

      // ----- docReady ----- //

      utils.docReady = function (callback) {
        var readyState = document.readyState;
        if (readyState == 'complete' || readyState == 'interactive') {
          // do async to allow for other scripts to run. metafizzy/flickity#441
          setTimeout(callback);
        } else {
          document.addEventListener('DOMContentLoaded', callback);
        }
      };

      // ----- htmlInit ----- //

      // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
      utils.toDashed = function (str) {
        return str.replace(/(.)([A-Z])/g, function (match, $1, $2) {
          return $1 + '-' + $2;
        }).toLowerCase();
      };

      var console = window.console;
      /**
       * allow user to initialize classes via [data-namespace] or .js-namespace class
       * htmlInit( Widget, 'widgetName' )
       * options are parsed from data-namespace-options
       */
      utils.htmlInit = function (WidgetClass, namespace) {
        utils.docReady(function () {
          var dashedNamespace = utils.toDashed(namespace);
          var dataAttr = 'data-' + dashedNamespace;
          var dataAttrElems = document.querySelectorAll('[' + dataAttr + ']');
          var jsDashElems = document.querySelectorAll('.js-' + dashedNamespace);
          var elems = utils.makeArray(dataAttrElems)
            .concat(utils.makeArray(jsDashElems));
          var dataOptionsAttr = dataAttr + '-options';
          var jQuery = window.jQuery;

          elems.forEach(function (elem) {
            var attr = elem.getAttribute(dataAttr) ||
              elem.getAttribute(dataOptionsAttr);
            var options;
            try {
              options = attr && JSON.parse(attr);
            } catch (error) {
              // log error, do not initialize
              if (console) {
                console.error('Error parsing ' + dataAttr + ' on ' + elem.className +
                  ': ' + error);
              }
              return;
            }
            // initialize
            var instance = new WidgetClass(elem, options);
            // make available via $().data('namespace')
            if (jQuery) {
              jQuery.data(elem, namespace, instance);
            }
          });

        });
      };

      // -----  ----- //

      return utils;

    }));

  }, { "desandro-matches-selector": 32 }], 35: [function (require, module, exports) {
    /*!
     * getSize v2.0.3
     * measure size of elements
     * MIT license
     */

    /* jshint browser: true, strict: true, undef: true, unused: true */
    /* globals console: false */

    (function (window, factory) {
      /* jshint strict: false */ /* globals define, module */
      if (typeof define == 'function' && define.amd) {
        // AMD
        define(factory);
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory();
      } else {
        // browser global
        window.getSize = factory();
      }

    })(window, function factory() {
      'use strict';

      // -------------------------- helpers -------------------------- //

      // get a number from a string, not a percentage
      function getStyleSize(value) {
        var num = parseFloat(value);
        // not a percent like '100%', and a number
        var isValid = value.indexOf('%') == -1 && !isNaN(num);
        return isValid && num;
      }

      function noop() { }

      var logError = typeof console == 'undefined' ? noop :
        function (message) {
          console.error(message);
        };

      // -------------------------- measurements -------------------------- //

      var measurements = [
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'paddingBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth'
      ];

      var measurementsLength = measurements.length;

      function getZeroSize() {
        var size = {
          width: 0,
          height: 0,
          innerWidth: 0,
          innerHeight: 0,
          outerWidth: 0,
          outerHeight: 0
        };
        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          size[measurement] = 0;
        }
        return size;
      }

      // -------------------------- getStyle -------------------------- //

      /**
       * getStyle, get style of element, check for Firefox bug
       * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
       */
      function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
          logError('Style returned ' + style +
            '. Are you running this code in a hidden iframe on Firefox? ' +
            'See https://bit.ly/getsizebug1');
        }
        return style;
      }

      // -------------------------- setup -------------------------- //

      var isSetup = false;

      var isBoxSizeOuter;

      /**
       * setup
       * check isBoxSizerOuter
       * do on first getSize() rather than on page load for Firefox bug
       */
      function setup() {
        // setup once
        if (isSetup) {
          return;
        }
        isSetup = true;

        // -------------------------- box sizing -------------------------- //

        /**
         * Chrome & Safari measure the outer-width on style.width on border-box elems
         * IE11 & Firefox<29 measures the inner-width
         */
        var div = document.createElement('div');
        div.style.width = '200px';
        div.style.padding = '1px 2px 3px 4px';
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '1px 2px 3px 4px';
        div.style.boxSizing = 'border-box';

        var body = document.body || document.documentElement;
        body.appendChild(div);
        var style = getStyle(div);
        // round value for browser zoom. desandro/masonry#928
        isBoxSizeOuter = Math.round(getStyleSize(style.width)) == 200;
        getSize.isBoxSizeOuter = isBoxSizeOuter;

        body.removeChild(div);
      }

      // -------------------------- getSize -------------------------- //

      function getSize(elem) {
        setup();

        // use querySeletor if elem is string
        if (typeof elem == 'string') {
          elem = document.querySelector(elem);
        }

        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
          return;
        }

        var style = getStyle(elem);

        // if hidden, everything is 0
        if (style.display == 'none') {
          return getZeroSize();
        }

        var size = {};
        size.width = elem.offsetWidth;
        size.height = elem.offsetHeight;

        var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

        // get all measurements
        for (var i = 0; i < measurementsLength; i++) {
          var measurement = measurements[i];
          var value = style[measurement];
          var num = parseFloat(value);
          // any 'auto', 'medium' value will be 0
          size[measurement] = !isNaN(num) ? num : 0;
        }

        var paddingWidth = size.paddingLeft + size.paddingRight;
        var paddingHeight = size.paddingTop + size.paddingBottom;
        var marginWidth = size.marginLeft + size.marginRight;
        var marginHeight = size.marginTop + size.marginBottom;
        var borderWidth = size.borderLeftWidth + size.borderRightWidth;
        var borderHeight = size.borderTopWidth + size.borderBottomWidth;

        var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

        // overwrite width and height if we can get it from style
        var styleWidth = getStyleSize(style.width);
        if (styleWidth !== false) {
          size.width = styleWidth +
            // add padding and border unless it's already including it
            (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
        }

        var styleHeight = getStyleSize(style.height);
        if (styleHeight !== false) {
          size.height = styleHeight +
            // add padding and border unless it's already including it
            (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
        }

        size.innerWidth = size.width - (paddingWidth + borderWidth);
        size.innerHeight = size.height - (paddingHeight + borderHeight);

        size.outerWidth = size.width + marginWidth;
        size.outerHeight = size.height + marginHeight;

        return size;
      }

      return getSize;

    });

  }, {}], 36: [function (require, module, exports) {
    /*!
     * Masonry v4.2.2
     * Cascading grid layout library
     * https://masonry.desandro.com
     * MIT License
     * by David DeSandro
     */

    (function (window, factory) {
      // universal module definition
      /* jshint strict: false */ /*globals define, module, require */
      if (typeof define == 'function' && define.amd) {
        // AMD
        define([
          'outlayer/outlayer',
          'get-size/get-size'
        ],
          factory);
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
          require('outlayer'),
          require('get-size')
        );
      } else {
        // browser global
        window.Masonry = factory(
          window.Outlayer,
          window.getSize
        );
      }

    }(window, function factory(Outlayer, getSize) {

      'use strict';

      // -------------------------- masonryDefinition -------------------------- //

      // create an Outlayer layout class
      var Masonry = Outlayer.create('masonry');
      // isFitWidth -> fitWidth
      Masonry.compatOptions.fitWidth = 'isFitWidth';

      var proto = Masonry.prototype;

      proto._resetLayout = function () {
        this.getSize();
        this._getMeasurement('columnWidth', 'outerWidth');
        this._getMeasurement('gutter', 'outerWidth');
        this.measureColumns();

        // reset column Y
        this.colYs = [];
        for (var i = 0; i < this.cols; i++) {
          this.colYs.push(0);
        }

        this.maxY = 0;
        this.horizontalColIndex = 0;
      };

      proto.measureColumns = function () {
        this.getContainerWidth();
        // if columnWidth is 0, default to outerWidth of first item
        if (!this.columnWidth) {
          var firstItem = this.items[0];
          var firstItemElem = firstItem && firstItem.element;
          // columnWidth fall back to item of first element
          this.columnWidth = firstItemElem && getSize(firstItemElem).outerWidth ||
            // if first elem has no width, default to size of container
            this.containerWidth;
        }

        var columnWidth = this.columnWidth += this.gutter;

        // calculate columns
        var containerWidth = this.containerWidth + this.gutter;
        var cols = containerWidth / columnWidth;
        // fix rounding errors, typically with gutters
        var excess = columnWidth - containerWidth % columnWidth;
        // if overshoot is less than a pixel, round up, otherwise floor it
        var mathMethod = excess && excess < 1 ? 'round' : 'floor';
        cols = Math[mathMethod](cols);
        this.cols = Math.max(cols, 1);
      };

      proto.getContainerWidth = function () {
        // container is parent if fit width
        var isFitWidth = this._getOption('fitWidth');
        var container = isFitWidth ? this.element.parentNode : this.element;
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var size = getSize(container);
        this.containerWidth = size && size.innerWidth;
      };

      proto._getItemLayoutPosition = function (item) {
        item.getSize();
        // how many columns does this brick span
        var remainder = item.size.outerWidth % this.columnWidth;
        var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
        // round if off by 1 pixel, otherwise use ceil
        var colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
        colSpan = Math.min(colSpan, this.cols);
        // use horizontal or top column position
        var colPosMethod = this.options.horizontalOrder ?
          '_getHorizontalColPosition' : '_getTopColPosition';
        var colPosition = this[colPosMethod](colSpan, item);
        // position the brick
        var position = {
          x: this.columnWidth * colPosition.col,
          y: colPosition.y
        };
        // apply setHeight to necessary columns
        var setHeight = colPosition.y + item.size.outerHeight;
        var setMax = colSpan + colPosition.col;
        for (var i = colPosition.col; i < setMax; i++) {
          this.colYs[i] = setHeight;
        }

        return position;
      };

      proto._getTopColPosition = function (colSpan) {
        var colGroup = this._getTopColGroup(colSpan);
        // get the minimum Y value from the columns
        var minimumY = Math.min.apply(Math, colGroup);

        return {
          col: colGroup.indexOf(minimumY),
          y: minimumY,
        };
      };

      /**
       * @param {Number} colSpan - number of columns the element spans
       * @returns {Array} colGroup
       */
      proto._getTopColGroup = function (colSpan) {
        if (colSpan < 2) {
          // if brick spans only one column, use all the column Ys
          return this.colYs;
        }

        var colGroup = [];
        // how many different places could this brick fit horizontally
        var groupCount = this.cols + 1 - colSpan;
        // for each group potential horizontal position
        for (var i = 0; i < groupCount; i++) {
          colGroup[i] = this._getColGroupY(i, colSpan);
        }
        return colGroup;
      };

      proto._getColGroupY = function (col, colSpan) {
        if (colSpan < 2) {
          return this.colYs[col];
        }
        // make an array of colY values for that one group
        var groupColYs = this.colYs.slice(col, col + colSpan);
        // and get the max value of the array
        return Math.max.apply(Math, groupColYs);
      };

      // get column position based on horizontal index. #873
      proto._getHorizontalColPosition = function (colSpan, item) {
        var col = this.horizontalColIndex % this.cols;
        var isOver = colSpan > 1 && col + colSpan > this.cols;
        // shift to next row if item can't fit on current row
        col = isOver ? 0 : col;
        // don't let zero-size items take up space
        var hasSize = item.size.outerWidth && item.size.outerHeight;
        this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

        return {
          col: col,
          y: this._getColGroupY(col, colSpan),
        };
      };

      proto._manageStamp = function (stamp) {
        var stampSize = getSize(stamp);
        var offset = this._getElementOffset(stamp);
        // get the columns that this stamp affects
        var isOriginLeft = this._getOption('originLeft');
        var firstX = isOriginLeft ? offset.left : offset.right;
        var lastX = firstX + stampSize.outerWidth;
        var firstCol = Math.floor(firstX / this.columnWidth);
        firstCol = Math.max(0, firstCol);
        var lastCol = Math.floor(lastX / this.columnWidth);
        // lastCol should not go over if multiple of columnWidth #425
        lastCol -= lastX % this.columnWidth ? 0 : 1;
        lastCol = Math.min(this.cols - 1, lastCol);
        // set colYs to bottom of the stamp

        var isOriginTop = this._getOption('originTop');
        var stampMaxY = (isOriginTop ? offset.top : offset.bottom) +
          stampSize.outerHeight;
        for (var i = firstCol; i <= lastCol; i++) {
          this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
        }
      };

      proto._getContainerSize = function () {
        this.maxY = Math.max.apply(Math, this.colYs);
        var size = {
          height: this.maxY
        };

        if (this._getOption('fitWidth')) {
          size.width = this._getContainerFitWidth();
        }

        return size;
      };

      proto._getContainerFitWidth = function () {
        var unusedCols = 0;
        // count unused columns
        var i = this.cols;
        while (--i) {
          if (this.colYs[i] !== 0) {
            break;
          }
          unusedCols++;
        }
        // fit container to columns that have been used
        return (this.cols - unusedCols) * this.columnWidth - this.gutter;
      };

      proto.needsResizeLayout = function () {
        var previousWidth = this.containerWidth;
        this.getContainerWidth();
        return previousWidth != this.containerWidth;
      };

      return Masonry;

    }));

  }, { "get-size": 35, "outlayer": 38 }], 37: [function (require, module, exports) {
    /**
     * Outlayer Item
     */

    (function (window, factory) {
      // universal module definition
      /* jshint strict: false */ /* globals define, module, require */
      if (typeof define == 'function' && define.amd) {
        // AMD - RequireJS
        define([
          'ev-emitter/ev-emitter',
          'get-size/get-size'
        ],
          factory
        );
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
          require('ev-emitter'),
          require('get-size')
        );
      } else {
        // browser global
        window.Outlayer = {};
        window.Outlayer.Item = factory(
          window.EvEmitter,
          window.getSize
        );
      }

    }(window, function factory(EvEmitter, getSize) {
      'use strict';

      // ----- helpers ----- //

      function isEmptyObj(obj) {
        for (var prop in obj) {
          return false;
        }
        prop = null;
        return true;
      }

      // -------------------------- CSS3 support -------------------------- //


      var docElemStyle = document.documentElement.style;

      var transitionProperty = typeof docElemStyle.transition == 'string' ?
        'transition' : 'WebkitTransition';
      var transformProperty = typeof docElemStyle.transform == 'string' ?
        'transform' : 'WebkitTransform';

      var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        transition: 'transitionend'
      }[transitionProperty];

      // cache all vendor properties that could have vendor prefix
      var vendorProperties = {
        transform: transformProperty,
        transition: transitionProperty,
        transitionDuration: transitionProperty + 'Duration',
        transitionProperty: transitionProperty + 'Property',
        transitionDelay: transitionProperty + 'Delay'
      };

      // -------------------------- Item -------------------------- //

      function Item(element, layout) {
        if (!element) {
          return;
        }

        this.element = element;
        // parent layout class, i.e. Masonry, Isotope, or Packery
        this.layout = layout;
        this.position = {
          x: 0,
          y: 0
        };

        this._create();
      }

      // inherit EvEmitter
      var proto = Item.prototype = Object.create(EvEmitter.prototype);
      proto.constructor = Item;

      proto._create = function () {
        // transition objects
        this._transn = {
          ingProperties: {},
          clean: {},
          onEnd: {}
        };

        this.css({
          position: 'absolute'
        });
      };

      // trigger specified handler for event type
      proto.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
          this[method](event);
        }
      };

      proto.getSize = function () {
        this.size = getSize(this.element);
      };

      /**
       * apply CSS styles to element
       * @param {Object} style
       */
      proto.css = function (style) {
        var elemStyle = this.element.style;

        for (var prop in style) {
          // use vendor property if available
          var supportedProp = vendorProperties[prop] || prop;
          elemStyle[supportedProp] = style[prop];
        }
      };

      // measure position, and sets it
      proto.getPosition = function () {
        var style = getComputedStyle(this.element);
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');
        var xValue = style[isOriginLeft ? 'left' : 'right'];
        var yValue = style[isOriginTop ? 'top' : 'bottom'];
        var x = parseFloat(xValue);
        var y = parseFloat(yValue);
        // convert percent to pixels
        var layoutSize = this.layout.size;
        if (xValue.indexOf('%') != -1) {
          x = (x / 100) * layoutSize.width;
        }
        if (yValue.indexOf('%') != -1) {
          y = (y / 100) * layoutSize.height;
        }
        // clean up 'auto' or other non-integer values
        x = isNaN(x) ? 0 : x;
        y = isNaN(y) ? 0 : y;
        // remove padding from measurement
        x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
        y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

        this.position.x = x;
        this.position.y = y;
      };

      // set settled position, apply padding
      proto.layoutPosition = function () {
        var layoutSize = this.layout.size;
        var style = {};
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');

        // x
        var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
        var xProperty = isOriginLeft ? 'left' : 'right';
        var xResetProperty = isOriginLeft ? 'right' : 'left';

        var x = this.position.x + layoutSize[xPadding];
        // set in percentage or pixels
        style[xProperty] = this.getXValue(x);
        // reset other property
        style[xResetProperty] = '';

        // y
        var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
        var yProperty = isOriginTop ? 'top' : 'bottom';
        var yResetProperty = isOriginTop ? 'bottom' : 'top';

        var y = this.position.y + layoutSize[yPadding];
        // set in percentage or pixels
        style[yProperty] = this.getYValue(y);
        // reset other property
        style[yResetProperty] = '';

        this.css(style);
        this.emitEvent('layout', [this]);
      };

      proto.getXValue = function (x) {
        var isHorizontal = this.layout._getOption('horizontal');
        return this.layout.options.percentPosition && !isHorizontal ?
          ((x / this.layout.size.width) * 100) + '%' : x + 'px';
      };

      proto.getYValue = function (y) {
        var isHorizontal = this.layout._getOption('horizontal');
        return this.layout.options.percentPosition && isHorizontal ?
          ((y / this.layout.size.height) * 100) + '%' : y + 'px';
      };

      proto._transitionTo = function (x, y) {
        this.getPosition();
        // get current x & y from top/left
        var curX = this.position.x;
        var curY = this.position.y;

        var didNotMove = x == this.position.x && y == this.position.y;

        // save end position
        this.setPosition(x, y);

        // if did not move and not transitioning, just go to layout
        if (didNotMove && !this.isTransitioning) {
          this.layoutPosition();
          return;
        }

        var transX = x - curX;
        var transY = y - curY;
        var transitionStyle = {};
        transitionStyle.transform = this.getTranslate(transX, transY);

        this.transition({
          to: transitionStyle,
          onTransitionEnd: {
            transform: this.layoutPosition
          },
          isCleaning: true
        });
      };

      proto.getTranslate = function (x, y) {
        // flip cooridinates if origin on right or bottom
        var isOriginLeft = this.layout._getOption('originLeft');
        var isOriginTop = this.layout._getOption('originTop');
        x = isOriginLeft ? x : -x;
        y = isOriginTop ? y : -y;
        return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      };

      // non transition + transform support
      proto.goTo = function (x, y) {
        this.setPosition(x, y);
        this.layoutPosition();
      };

      proto.moveTo = proto._transitionTo;

      proto.setPosition = function (x, y) {
        this.position.x = parseFloat(x);
        this.position.y = parseFloat(y);
      };

      // ----- transition ----- //

      /**
       * @param {Object} style - CSS
       * @param {Function} onTransitionEnd
       */

      // non transition, just trigger callback
      proto._nonTransition = function (args) {
        this.css(args.to);
        if (args.isCleaning) {
          this._removeStyles(args.to);
        }
        for (var prop in args.onTransitionEnd) {
          args.onTransitionEnd[prop].call(this);
        }
      };

      /**
       * proper transition
       * @param {Object} args - arguments
       *   @param {Object} to - style to transition to
       *   @param {Object} from - style to start transition from
       *   @param {Boolean} isCleaning - removes transition styles after transition
       *   @param {Function} onTransitionEnd - callback
       */
      proto.transition = function (args) {
        // redirect to nonTransition if no transition duration
        if (!parseFloat(this.layout.options.transitionDuration)) {
          this._nonTransition(args);
          return;
        }

        var _transition = this._transn;
        // keep track of onTransitionEnd callback by css property
        for (var prop in args.onTransitionEnd) {
          _transition.onEnd[prop] = args.onTransitionEnd[prop];
        }
        // keep track of properties that are transitioning
        for (prop in args.to) {
          _transition.ingProperties[prop] = true;
          // keep track of properties to clean up when transition is done
          if (args.isCleaning) {
            _transition.clean[prop] = true;
          }
        }

        // set from styles
        if (args.from) {
          this.css(args.from);
          // force redraw. http://blog.alexmaccaw.com/css-transitions
          var h = this.element.offsetHeight;
          // hack for JSHint to hush about unused var
          h = null;
        }
        // enable transition
        this.enableTransition(args.to);
        // set styles that are transitioning
        this.css(args.to);

        this.isTransitioning = true;

      };

      // dash before all cap letters, including first for
      // WebkitTransform => -webkit-transform
      function toDashedAll(str) {
        return str.replace(/([A-Z])/g, function ($1) {
          return '-' + $1.toLowerCase();
        });
      }

      var transitionProps = 'opacity,' + toDashedAll(transformProperty);

      proto.enableTransition = function (/* style */) {
        // HACK changing transitionProperty during a transition
        // will cause transition to jump
        if (this.isTransitioning) {
          return;
        }

        // make `transition: foo, bar, baz` from style object
        // HACK un-comment this when enableTransition can work
        // while a transition is happening
        // var transitionValues = [];
        // for ( var prop in style ) {
        //   // dash-ify camelCased properties like WebkitTransition
        //   prop = vendorProperties[ prop ] || prop;
        //   transitionValues.push( toDashedAll( prop ) );
        // }
        // munge number to millisecond, to match stagger
        var duration = this.layout.options.transitionDuration;
        duration = typeof duration == 'number' ? duration + 'ms' : duration;
        // enable transition styles
        this.css({
          transitionProperty: transitionProps,
          transitionDuration: duration,
          transitionDelay: this.staggerDelay || 0
        });
        // listen for transition end event
        this.element.addEventListener(transitionEndEvent, this, false);
      };

      // ----- events ----- //

      proto.onwebkitTransitionEnd = function (event) {
        this.ontransitionend(event);
      };

      proto.onotransitionend = function (event) {
        this.ontransitionend(event);
      };

      // properties that I munge to make my life easier
      var dashedVendorProperties = {
        '-webkit-transform': 'transform'
      };

      proto.ontransitionend = function (event) {
        // disregard bubbled events from children
        if (event.target !== this.element) {
          return;
        }
        var _transition = this._transn;
        // get property name of transitioned property, convert to prefix-free
        var propertyName = dashedVendorProperties[event.propertyName] || event.propertyName;

        // remove property that has completed transitioning
        delete _transition.ingProperties[propertyName];
        // check if any properties are still transitioning
        if (isEmptyObj(_transition.ingProperties)) {
          // all properties have completed transitioning
          this.disableTransition();
        }
        // clean style
        if (propertyName in _transition.clean) {
          // clean up style
          this.element.style[event.propertyName] = '';
          delete _transition.clean[propertyName];
        }
        // trigger onTransitionEnd callback
        if (propertyName in _transition.onEnd) {
          var onTransitionEnd = _transition.onEnd[propertyName];
          onTransitionEnd.call(this);
          delete _transition.onEnd[propertyName];
        }

        this.emitEvent('transitionEnd', [this]);
      };

      proto.disableTransition = function () {
        this.removeTransitionStyles();
        this.element.removeEventListener(transitionEndEvent, this, false);
        this.isTransitioning = false;
      };

      /**
       * removes style property from element
       * @param {Object} style
      **/
      proto._removeStyles = function (style) {
        // clean up transition styles
        var cleanStyle = {};
        for (var prop in style) {
          cleanStyle[prop] = '';
        }
        this.css(cleanStyle);
      };

      var cleanTransitionStyle = {
        transitionProperty: '',
        transitionDuration: '',
        transitionDelay: ''
      };

      proto.removeTransitionStyles = function () {
        // remove transition
        this.css(cleanTransitionStyle);
      };

      // ----- stagger ----- //

      proto.stagger = function (delay) {
        delay = isNaN(delay) ? 0 : delay;
        this.staggerDelay = delay + 'ms';
      };

      // ----- show/hide/remove ----- //

      // remove element from DOM
      proto.removeElem = function () {
        this.element.parentNode.removeChild(this.element);
        // remove display: none
        this.css({ display: '' });
        this.emitEvent('remove', [this]);
      };

      proto.remove = function () {
        // just remove element if no transition support or no transition
        if (!transitionProperty || !parseFloat(this.layout.options.transitionDuration)) {
          this.removeElem();
          return;
        }

        // start transition
        this.once('transitionEnd', function () {
          this.removeElem();
        });
        this.hide();
      };

      proto.reveal = function () {
        delete this.isHidden;
        // remove display: none
        this.css({ display: '' });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
        onTransitionEnd[transitionEndProperty] = this.onRevealTransitionEnd;

        this.transition({
          from: options.hiddenStyle,
          to: options.visibleStyle,
          isCleaning: true,
          onTransitionEnd: onTransitionEnd
        });
      };

      proto.onRevealTransitionEnd = function () {
        // check if still visible
        // during transition, item may have been hidden
        if (!this.isHidden) {
          this.emitEvent('reveal');
        }
      };

      /**
       * get style property use for hide/reveal transition end
       * @param {String} styleProperty - hiddenStyle/visibleStyle
       * @returns {String}
       */
      proto.getHideRevealTransitionEndProperty = function (styleProperty) {
        var optionStyle = this.layout.options[styleProperty];
        // use opacity
        if (optionStyle.opacity) {
          return 'opacity';
        }
        // get first property
        for (var prop in optionStyle) {
          return prop;
        }
      };

      proto.hide = function () {
        // set flag
        this.isHidden = true;
        // remove display: none
        this.css({ display: '' });

        var options = this.layout.options;

        var onTransitionEnd = {};
        var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
        onTransitionEnd[transitionEndProperty] = this.onHideTransitionEnd;

        this.transition({
          from: options.visibleStyle,
          to: options.hiddenStyle,
          // keep hidden stuff hidden
          isCleaning: true,
          onTransitionEnd: onTransitionEnd
        });
      };

      proto.onHideTransitionEnd = function () {
        // check if still hidden
        // during transition, item may have been un-hidden
        if (this.isHidden) {
          this.css({ display: 'none' });
          this.emitEvent('hide');
        }
      };

      proto.destroy = function () {
        this.css({
          position: '',
          left: '',
          right: '',
          top: '',
          bottom: '',
          transition: '',
          transform: ''
        });
      };

      return Item;

    }));

  }, { "ev-emitter": 33, "get-size": 35 }], 38: [function (require, module, exports) {
    /*!
     * Outlayer v2.1.1
     * the brains and guts of a layout library
     * MIT license
     */

    (function (window, factory) {
      'use strict';
      // universal module definition
      /* jshint strict: false */ /* globals define, module, require */
      if (typeof define == 'function' && define.amd) {
        // AMD - RequireJS
        define([
          'ev-emitter/ev-emitter',
          'get-size/get-size',
          'fizzy-ui-utils/utils',
          './item'
        ],
          function (EvEmitter, getSize, utils, Item) {
            return factory(window, EvEmitter, getSize, utils, Item);
          }
        );
      } else if (typeof module == 'object' && module.exports) {
        // CommonJS - Browserify, Webpack
        module.exports = factory(
          window,
          require('ev-emitter'),
          require('get-size'),
          require('fizzy-ui-utils'),
          require('./item')
        );
      } else {
        // browser global
        window.Outlayer = factory(
          window,
          window.EvEmitter,
          window.getSize,
          window.fizzyUIUtils,
          window.Outlayer.Item
        );
      }

    }(window, function factory(window, EvEmitter, getSize, utils, Item) {
      'use strict';

      // ----- vars ----- //

      var console = window.console;
      var jQuery = window.jQuery;
      var noop = function () { };

      // -------------------------- Outlayer -------------------------- //

      // globally unique identifiers
      var GUID = 0;
      // internal store of all Outlayer intances
      var instances = {};


      /**
       * @param {Element, String} element
       * @param {Object} options
       * @constructor
       */
      function Outlayer(element, options) {
        var queryElement = utils.getQueryElement(element);
        if (!queryElement) {
          if (console) {
            console.error('Bad element for ' + this.constructor.namespace +
              ': ' + (queryElement || element));
          }
          return;
        }
        this.element = queryElement;
        // add jQuery
        if (jQuery) {
          this.$element = jQuery(this.element);
        }

        // options
        this.options = utils.extend({}, this.constructor.defaults);
        this.option(options);

        // add id for Outlayer.getFromElement
        var id = ++GUID;
        this.element.outlayerGUID = id; // expando
        instances[id] = this; // associate via id

        // kick it off
        this._create();

        var isInitLayout = this._getOption('initLayout');
        if (isInitLayout) {
          this.layout();
        }
      }

      // settings are for internal use only
      Outlayer.namespace = 'outlayer';
      Outlayer.Item = Item;

      // default options
      Outlayer.defaults = {
        containerStyle: {
          position: 'relative'
        },
        initLayout: true,
        originLeft: true,
        originTop: true,
        resize: true,
        resizeContainer: true,
        // item options
        transitionDuration: '0.4s',
        hiddenStyle: {
          opacity: 0,
          transform: 'scale(0.001)'
        },
        visibleStyle: {
          opacity: 1,
          transform: 'scale(1)'
        }
      };

      var proto = Outlayer.prototype;
      // inherit EvEmitter
      utils.extend(proto, EvEmitter.prototype);

      /**
       * set options
       * @param {Object} opts
       */
      proto.option = function (opts) {
        utils.extend(this.options, opts);
      };

      /**
       * get backwards compatible option value, check old name
       */
      proto._getOption = function (option) {
        var oldOption = this.constructor.compatOptions[option];
        return oldOption && this.options[oldOption] !== undefined ?
          this.options[oldOption] : this.options[option];
      };

      Outlayer.compatOptions = {
        // currentName: oldName
        initLayout: 'isInitLayout',
        horizontal: 'isHorizontal',
        layoutInstant: 'isLayoutInstant',
        originLeft: 'isOriginLeft',
        originTop: 'isOriginTop',
        resize: 'isResizeBound',
        resizeContainer: 'isResizingContainer'
      };

      proto._create = function () {
        // get items from children
        this.reloadItems();
        // elements that affect layout, but are not laid out
        this.stamps = [];
        this.stamp(this.options.stamp);
        // set container style
        utils.extend(this.element.style, this.options.containerStyle);

        // bind resize method
        var canBindResize = this._getOption('resize');
        if (canBindResize) {
          this.bindResize();
        }
      };

      // goes through all children again and gets bricks in proper order
      proto.reloadItems = function () {
        // collection of item elements
        this.items = this._itemize(this.element.children);
      };


      /**
       * turn elements into Outlayer.Items to be used in layout
       * @param {Array or NodeList or HTMLElement} elems
       * @returns {Array} items - collection of new Outlayer Items
       */
      proto._itemize = function (elems) {

        var itemElems = this._filterFindItemElements(elems);
        var Item = this.constructor.Item;

        // create new Outlayer Items for collection
        var items = [];
        for (var i = 0; i < itemElems.length; i++) {
          var elem = itemElems[i];
          var item = new Item(elem, this);
          items.push(item);
        }

        return items;
      };

      /**
       * get item elements to be used in layout
       * @param {Array or NodeList or HTMLElement} elems
       * @returns {Array} items - item elements
       */
      proto._filterFindItemElements = function (elems) {
        return utils.filterFindElements(elems, this.options.itemSelector);
      };

      /**
       * getter method for getting item elements
       * @returns {Array} elems - collection of item elements
       */
      proto.getItemElements = function () {
        return this.items.map(function (item) {
          return item.element;
        });
      };

      // ----- init & layout ----- //

      /**
       * lays out all items
       */
      proto.layout = function () {
        this._resetLayout();
        this._manageStamps();

        // don't animate first layout
        var layoutInstant = this._getOption('layoutInstant');
        var isInstant = layoutInstant !== undefined ?
          layoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, isInstant);

        // flag for initalized
        this._isLayoutInited = true;
      };

      // _init is alias for layout
      proto._init = proto.layout;

      /**
       * logic before any new layout
       */
      proto._resetLayout = function () {
        this.getSize();
      };


      proto.getSize = function () {
        this.size = getSize(this.element);
      };

      /**
       * get measurement from option, for columnWidth, rowHeight, gutter
       * if option is String -> get element from selector string, & get size of element
       * if option is Element -> get size of element
       * else use option as a number
       *
       * @param {String} measurement
       * @param {String} size - width or height
       * @private
       */
      proto._getMeasurement = function (measurement, size) {
        var option = this.options[measurement];
        var elem;
        if (!option) {
          // default to 0
          this[measurement] = 0;
        } else {
          // use option as an element
          if (typeof option == 'string') {
            elem = this.element.querySelector(option);
          } else if (option instanceof HTMLElement) {
            elem = option;
          }
          // use size of element, if element
          this[measurement] = elem ? getSize(elem)[size] : option;
        }
      };

      /**
       * layout a collection of item elements
       * @api public
       */
      proto.layoutItems = function (items, isInstant) {
        items = this._getItemsForLayout(items);

        this._layoutItems(items, isInstant);

        this._postLayout();
      };

      /**
       * get the items to be laid out
       * you may want to skip over some items
       * @param {Array} items
       * @returns {Array} items
       */
      proto._getItemsForLayout = function (items) {
        return items.filter(function (item) {
          return !item.isIgnored;
        });
      };

      /**
       * layout items
       * @param {Array} items
       * @param {Boolean} isInstant
       */
      proto._layoutItems = function (items, isInstant) {
        this._emitCompleteOnItems('layout', items);

        if (!items || !items.length) {
          // no items, emit event with empty array
          return;
        }

        var queue = [];

        items.forEach(function (item) {
          // get x/y object from method
          var position = this._getItemLayoutPosition(item);
          // enqueue
          position.item = item;
          position.isInstant = isInstant || item.isLayoutInstant;
          queue.push(position);
        }, this);

        this._processLayoutQueue(queue);
      };

      /**
       * get item layout position
       * @param {Outlayer.Item} item
       * @returns {Object} x and y position
       */
      proto._getItemLayoutPosition = function ( /* item */) {
        return {
          x: 0,
          y: 0
        };
      };

      /**
       * iterate over array and position each item
       * Reason being - separating this logic prevents 'layout invalidation'
       * thx @paul_irish
       * @param {Array} queue
       */
      proto._processLayoutQueue = function (queue) {
        this.updateStagger();
        queue.forEach(function (obj, i) {
          this._positionItem(obj.item, obj.x, obj.y, obj.isInstant, i);
        }, this);
      };

      // set stagger from option in milliseconds number
      proto.updateStagger = function () {
        var stagger = this.options.stagger;
        if (stagger === null || stagger === undefined) {
          this.stagger = 0;
          return;
        }
        this.stagger = getMilliseconds(stagger);
        return this.stagger;
      };

      /**
       * Sets position of item in DOM
       * @param {Outlayer.Item} item
       * @param {Number} x - horizontal position
       * @param {Number} y - vertical position
       * @param {Boolean} isInstant - disables transitions
       */
      proto._positionItem = function (item, x, y, isInstant, i) {
        if (isInstant) {
          // if not transition, just set CSS
          item.goTo(x, y);
        } else {
          item.stagger(i * this.stagger);
          item.moveTo(x, y);
        }
      };

      /**
       * Any logic you want to do after each layout,
       * i.e. size the container
       */
      proto._postLayout = function () {
        this.resizeContainer();
      };

      proto.resizeContainer = function () {
        var isResizingContainer = this._getOption('resizeContainer');
        if (!isResizingContainer) {
          return;
        }
        var size = this._getContainerSize();
        if (size) {
          this._setContainerMeasure(size.width, true);
          this._setContainerMeasure(size.height, false);
        }
      };

      /**
       * Sets width or height of container if returned
       * @returns {Object} size
       *   @param {Number} width
       *   @param {Number} height
       */
      proto._getContainerSize = noop;

      /**
       * @param {Number} measure - size of width or height
       * @param {Boolean} isWidth
       */
      proto._setContainerMeasure = function (measure, isWidth) {
        if (measure === undefined) {
          return;
        }

        var elemSize = this.size;
        // add padding and border width if border box
        if (elemSize.isBorderBox) {
          measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
            elemSize.borderLeftWidth + elemSize.borderRightWidth :
            elemSize.paddingBottom + elemSize.paddingTop +
            elemSize.borderTopWidth + elemSize.borderBottomWidth;
        }

        measure = Math.max(measure, 0);
        this.element.style[isWidth ? 'width' : 'height'] = measure + 'px';
      };

      /**
       * emit eventComplete on a collection of items events
       * @param {String} eventName
       * @param {Array} items - Outlayer.Items
       */
      proto._emitCompleteOnItems = function (eventName, items) {
        var _this = this;
        function onComplete() {
          _this.dispatchEvent(eventName + 'Complete', null, [items]);
        }

        var count = items.length;
        if (!items || !count) {
          onComplete();
          return;
        }

        var doneCount = 0;
        function tick() {
          doneCount++;
          if (doneCount == count) {
            onComplete();
          }
        }

        // bind callback
        items.forEach(function (item) {
          item.once(eventName, tick);
        });
      };

      /**
       * emits events via EvEmitter and jQuery events
       * @param {String} type - name of event
       * @param {Event} event - original event
       * @param {Array} args - extra arguments
       */
      proto.dispatchEvent = function (type, event, args) {
        // add original event to arguments
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);

        if (jQuery) {
          // set this.$element
          this.$element = this.$element || jQuery(this.element);
          if (event) {
            // create jQuery event
            var $event = jQuery.Event(event);
            $event.type = type;
            this.$element.trigger($event, args);
          } else {
            // just trigger with type if no event available
            this.$element.trigger(type, args);
          }
        }
      };

      // -------------------------- ignore & stamps -------------------------- //


      /**
       * keep item in collection, but do not lay it out
       * ignored items do not get skipped in layout
       * @param {Element} elem
       */
      proto.ignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
          item.isIgnored = true;
        }
      };

      /**
       * return item to layout collection
       * @param {Element} elem
       */
      proto.unignore = function (elem) {
        var item = this.getItem(elem);
        if (item) {
          delete item.isIgnored;
        }
      };

      /**
       * adds elements to stamps
       * @param {NodeList, Array, Element, or String} elems
       */
      proto.stamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
          return;
        }

        this.stamps = this.stamps.concat(elems);
        // ignore
        elems.forEach(this.ignore, this);
      };

      /**
       * removes elements to stamps
       * @param {NodeList, Array, or Element} elems
       */
      proto.unstamp = function (elems) {
        elems = this._find(elems);
        if (!elems) {
          return;
        }

        elems.forEach(function (elem) {
          // filter out removed stamp elements
          utils.removeFrom(this.stamps, elem);
          this.unignore(elem);
        }, this);
      };

      /**
       * finds child elements
       * @param {NodeList, Array, Element, or String} elems
       * @returns {Array} elems
       */
      proto._find = function (elems) {
        if (!elems) {
          return;
        }
        // if string, use argument as selector string
        if (typeof elems == 'string') {
          elems = this.element.querySelectorAll(elems);
        }
        elems = utils.makeArray(elems);
        return elems;
      };

      proto._manageStamps = function () {
        if (!this.stamps || !this.stamps.length) {
          return;
        }

        this._getBoundingRect();

        this.stamps.forEach(this._manageStamp, this);
      };

      // update boundingLeft / Top
      proto._getBoundingRect = function () {
        // get bounding rect for container element
        var boundingRect = this.element.getBoundingClientRect();
        var size = this.size;
        this._boundingRect = {
          left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
          top: boundingRect.top + size.paddingTop + size.borderTopWidth,
          right: boundingRect.right - (size.paddingRight + size.borderRightWidth),
          bottom: boundingRect.bottom - (size.paddingBottom + size.borderBottomWidth)
        };
      };

      /**
       * @param {Element} stamp
      **/
      proto._manageStamp = noop;

      /**
       * get x/y position of element relative to container element
       * @param {Element} elem
       * @returns {Object} offset - has left, top, right, bottom
       */
      proto._getElementOffset = function (elem) {
        var boundingRect = elem.getBoundingClientRect();
        var thisRect = this._boundingRect;
        var size = getSize(elem);
        var offset = {
          left: boundingRect.left - thisRect.left - size.marginLeft,
          top: boundingRect.top - thisRect.top - size.marginTop,
          right: thisRect.right - boundingRect.right - size.marginRight,
          bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
        };
        return offset;
      };

      // -------------------------- resize -------------------------- //

      // enable event handlers for listeners
      // i.e. resize -> onresize
      proto.handleEvent = utils.handleEvent;

      /**
       * Bind layout to window resizing
       */
      proto.bindResize = function () {
        window.addEventListener('resize', this);
        this.isResizeBound = true;
      };

      /**
       * Unbind layout to window resizing
       */
      proto.unbindResize = function () {
        window.removeEventListener('resize', this);
        this.isResizeBound = false;
      };

      proto.onresize = function () {
        this.resize();
      };

      utils.debounceMethod(Outlayer, 'onresize', 100);

      proto.resize = function () {
        // don't trigger if size did not change
        // or if resize was unbound. See #9
        if (!this.isResizeBound || !this.needsResizeLayout()) {
          return;
        }

        this.layout();
      };

      /**
       * check if layout is needed post layout
       * @returns Boolean
       */
      proto.needsResizeLayout = function () {
        var size = getSize(this.element);
        // check that this.size and size are there
        // IE8 triggers resize on body size change, so they might not be
        var hasSizes = this.size && size;
        return hasSizes && size.innerWidth !== this.size.innerWidth;
      };

      // -------------------------- methods -------------------------- //

      /**
       * add items to Outlayer instance
       * @param {Array or NodeList or Element} elems
       * @returns {Array} items - Outlayer.Items
      **/
      proto.addItems = function (elems) {
        var items = this._itemize(elems);
        // add items to collection
        if (items.length) {
          this.items = this.items.concat(items);
        }
        return items;
      };

      /**
       * Layout newly-appended item elements
       * @param {Array or NodeList or Element} elems
       */
      proto.appended = function (elems) {
        var items = this.addItems(elems);
        if (!items.length) {
          return;
        }
        // layout and reveal just the new items
        this.layoutItems(items, true);
        this.reveal(items);
      };

      /**
       * Layout prepended elements
       * @param {Array or NodeList or Element} elems
       */
      proto.prepended = function (elems) {
        var items = this._itemize(elems);
        if (!items.length) {
          return;
        }
        // add items to beginning of collection
        var previousItems = this.items.slice(0);
        this.items = items.concat(previousItems);
        // start new layout
        this._resetLayout();
        this._manageStamps();
        // layout new stuff without transition
        this.layoutItems(items, true);
        this.reveal(items);
        // layout previous items
        this.layoutItems(previousItems);
      };

      /**
       * reveal a collection of items
       * @param {Array of Outlayer.Items} items
       */
      proto.reveal = function (items) {
        this._emitCompleteOnItems('reveal', items);
        if (!items || !items.length) {
          return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
          item.stagger(i * stagger);
          item.reveal();
        });
      };

      /**
       * hide a collection of items
       * @param {Array of Outlayer.Items} items
       */
      proto.hide = function (items) {
        this._emitCompleteOnItems('hide', items);
        if (!items || !items.length) {
          return;
        }
        var stagger = this.updateStagger();
        items.forEach(function (item, i) {
          item.stagger(i * stagger);
          item.hide();
        });
      };

      /**
       * reveal item elements
       * @param {Array}, {Element}, {NodeList} items
       */
      proto.revealItemElements = function (elems) {
        var items = this.getItems(elems);
        this.reveal(items);
      };

      /**
       * hide item elements
       * @param {Array}, {Element}, {NodeList} items
       */
      proto.hideItemElements = function (elems) {
        var items = this.getItems(elems);
        this.hide(items);
      };

      /**
       * get Outlayer.Item, given an Element
       * @param {Element} elem
       * @param {Function} callback
       * @returns {Outlayer.Item} item
       */
      proto.getItem = function (elem) {
        // loop through items to get the one that matches
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];
          if (item.element == elem) {
            // return item
            return item;
          }
        }
      };

      /**
       * get collection of Outlayer.Items, given Elements
       * @param {Array} elems
       * @returns {Array} items - Outlayer.Items
       */
      proto.getItems = function (elems) {
        elems = utils.makeArray(elems);
        var items = [];
        elems.forEach(function (elem) {
          var item = this.getItem(elem);
          if (item) {
            items.push(item);
          }
        }, this);

        return items;
      };

      /**
       * remove element(s) from instance and DOM
       * @param {Array or NodeList or Element} elems
       */
      proto.remove = function (elems) {
        var removeItems = this.getItems(elems);

        this._emitCompleteOnItems('remove', removeItems);

        // bail if no items to remove
        if (!removeItems || !removeItems.length) {
          return;
        }

        removeItems.forEach(function (item) {
          item.remove();
          // remove item from collection
          utils.removeFrom(this.items, item);
        }, this);
      };

      // ----- destroy ----- //

      // remove and disable Outlayer instance
      proto.destroy = function () {
        // clean up dynamic styles
        var style = this.element.style;
        style.height = '';
        style.position = '';
        style.width = '';
        // destroy items
        this.items.forEach(function (item) {
          item.destroy();
        });

        this.unbindResize();

        var id = this.element.outlayerGUID;
        delete instances[id]; // remove reference to instance by id
        delete this.element.outlayerGUID;
        // remove data for jQuery
        if (jQuery) {
          jQuery.removeData(this.element, this.constructor.namespace);
        }

      };

      // -------------------------- data -------------------------- //

      /**
       * get Outlayer instance from element
       * @param {Element} elem
       * @returns {Outlayer}
       */
      Outlayer.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.outlayerGUID;
        return id && instances[id];
      };


      // -------------------------- create Outlayer class -------------------------- //

      /**
       * create a layout class
       * @param {String} namespace
       */
      Outlayer.create = function (namespace, options) {
        // sub-class Outlayer
        var Layout = subclass(Outlayer);
        // apply new options and compatOptions
        Layout.defaults = utils.extend({}, Outlayer.defaults);
        utils.extend(Layout.defaults, options);
        Layout.compatOptions = utils.extend({}, Outlayer.compatOptions);

        Layout.namespace = namespace;

        Layout.data = Outlayer.data;

        // sub-class Item
        Layout.Item = subclass(Item);

        // -------------------------- declarative -------------------------- //

        utils.htmlInit(Layout, namespace);

        // -------------------------- jQuery bridge -------------------------- //

        // make into jQuery plugin
        if (jQuery && jQuery.bridget) {
          jQuery.bridget(namespace, Layout);
        }

        return Layout;
      };

      function subclass(Parent) {
        function SubClass() {
          Parent.apply(this, arguments);
        }

        SubClass.prototype = Object.create(Parent.prototype);
        SubClass.prototype.constructor = SubClass;

        return SubClass;
      }

      // ----- helpers ----- //

      // how many milliseconds are in each unit
      var msUnits = {
        ms: 1,
        s: 1000
      };

      // munge time-like parameter into millisecond number
      // '0.4s' -> 40
      function getMilliseconds(time) {
        if (typeof time == 'number') {
          return time;
        }
        var matches = time.match(/(^\d*\.?\d*)(\w*)/);
        var num = matches && matches[1];
        var unit = matches && matches[2];
        if (!num.length) {
          return 0;
        }
        num = parseFloat(num);
        var mult = msUnits[unit] || 1;
        return num * mult;
      }

      // ----- fin ----- //

      // back in global
      Outlayer.Item = Item;

      return Outlayer;

    }));

  }, { "./item": 37, "ev-emitter": 33, "fizzy-ui-utils": 34, "get-size": 35 }], 39: [function (require, module, exports) {
    // const socket = io()

    const Axios = require('axios')
    const Masonry = require('masonry-layout')

    const element = document.getElementById('tampilPesan')
    const blogForm = document.querySelector('#blogForm')
    const judul = document.getElementById('judul')
    const description = document.getElementById('description')
    const tombol = document.querySelector('#tombol')
    const tombol1 = document.querySelector('#tombol1')
    const tombolEdit = document.querySelector('.tombolEdit')
    const idBlog = document.querySelector('#idBlog')





    // const tampilanPesan = message => {
    //   message.forEach(mess => {
    //     element.innerHTML += `
    //       <li class="uppercase font-bold list">
    //         ${mess.judul}
    //         ${mess.id}
    //         <ul>
    //           <li class="mt-1 ml-8 font-normal normal-case ">
    //             ${mess.description}
    //           </li>
    //         </ul>
    //         <div class=" flex flex-roww-full mb-6 justify-end gap-x-4 ">
    //           <input type="hidden" value="${mess.id}" id="idBlog">
    //           <button class="bg-red-500 py-1 px-3 rounded-lg text-sm tombolDelete"  onclick="onDelete(this)" data-id="${mess.id}">
    //               Delete
    //           </button>
    //           <button class="bg-yellow-400 py-1 px-5 rounded-lg text-sm " onclick="onedit(this)" data-id="${mess.id}">Edit</button>
    //         </div>
    //       </li>
    //       `
    //     return element
    //   })
    // }

    const getData = async () => {
      await Axios.get('http://localhost:2500/getData')
        .then(response => {
          // while (element.hasChildNodes()) {
          //   element.removeChild(element.firstChild)
          // }
          // tampilanPesan(response.data)
          const test = document.cookie;
        })
    }
    getData()

    window.onDelete = async (e) => {
      const id = e.dataset.id;
      await Axios.delete(`http://localhost:2500/deleteData/${id}`)
        .then(response => {
          getData()
        })

    }
    window.onload = () => {
      const card = document.querySelector('.card')
      const even = document.querySelectorAll('.grid-item-card')

      even.forEach((ev, index) => {
        if (index % 2 != 0) {
          // ev.firstElementChild.classList.add('h-[250px]')
        }
        // (index % 2 == 0) ? ev.classList.add('h-[550px]') : ev.classList.add('')
      });

      // const masonry = new Masonry(card, {
      //   itemSelector: '.grid-item-card',
      //   // fitWidth: true,
      //   gutter: 1,
      //   percentPosition: true
      // })

    }

    function clearData() {
      judul.value = ""
      description.value = " "
    }

    window.onedit = async (e) => {
      const id = e.dataset.id;
      await Axios.get(`http://localhost:2500/getData/${id}`)
        .then(response => {
          const juduls = response.data[0].judul
          const descriptions = response.data[0].description
          judul.value = juduls
          description.value = descriptions
          idBlog.value = id
        })
    }

    if (blogForm) {
      blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("test");
        // if (idBlog.value) {
        // const idBlog = blogForm['idBlog'].value
        // const judul = blogForm['judul'].value
        // const description = blogForm['description'].value
        // console.log(idBlog, judul, description);
        //   await Axios.put('http://localhost:2500/updateData', {
        //     idBlog: blogForm['idBlog'].value,
        //     judul: blogForm['judul'].value,
        //     description: blogForm['description'].value
        //   }).then(response => {
        //     clearData()
        //     getData()
        //   })
        // } else {
        //   await Axios.post('http://localhost:2500/input', {
        //     judul: blogForm['judul'].value,
        //     description: blogForm['description'].value
        //   }).then(response => {
        //     clearData()
        //     // element.append(tampilanPesan(response.data))
        //     getData()
        //   })

        // }
      })
    }

    if (tombol) {
      tombol.addEventListener('click', async () => {
        // await getData()
        console.log('test');
      })
    }


  }, { "axios": 2, "masonry-layout": 36 }]
}, {}, [39]);
