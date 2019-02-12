'use strict';

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

var arrayWithoutHoles = _arrayWithoutHoles;

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

var iterableToArray = _iterableToArray;

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var nonIterableSpread = _nonIterableSpread;

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

var toConsumableArray = _toConsumableArray;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

// Android 与 JS 通信，只能接收 string，返回传入 object
// IOS 与 JS 通信，接收 && 返回都是 object
var WebView =
/*#__PURE__*/
function () {
  function WebView() {
    classCallCheck(this, WebView);

    this.uid = 1;
    this.eventListeners = [];
    this.promiseMap = {};
    this.setSupportProperty();
    this.bindDispatchMethods();
  }

  createClass(WebView, [{
    key: "setSupportProperty",
    value: function setSupportProperty() {
      var callHandlerName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'YTKJsBridge';
      var sendEventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'sendEvent';
      var makeCallbackName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'makeCallback';
      this.callHandlerName = callHandlerName;
      this.sendEventName = sendEventName;
      this.makeCallbackName = makeCallbackName;
      this.supportHandler = window[callHandlerName] && typeof window[callHandlerName] === 'function';
      this.supportEventHandler = window[sendEventName] && typeof window[sendEventName] === 'function';
      this.supportCallback = window[makeCallbackName] && typeof window[makeCallbackName] === 'function';
      this.supportHandlerObject = window[callHandlerName] && _typeof_1(window[callHandlerName]) === 'object';
    }
  }, {
    key: "bindDispatchMethods",
    value: function bindDispatchMethods() {
      var nativeCallbackName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'dispatchCallbackFromNative';
      var nativeCallName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'dispatchNativeCall';
      var nativeEventName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'dispatchNativeEvent';
      // 处理异步调用时的回调方法
      window[nativeCallbackName] = this.dispatchCallbackFromNative.bind(this); // 处理 native 调用 JS 提供的服务

      window[nativeCallName] = this.dispatchNativeCall.bind(this); // 注册 native 向 JS 发送事件

      window[nativeEventName] = this.dispatchNativeEvent.bind(this);
    }
  }, {
    key: "custom",
    value: function custom(config) {
      var _config$callHandlerNa = config.callHandlerName,
          callHandlerName = _config$callHandlerNa === void 0 ? 'YTKJsBridge' : _config$callHandlerNa,
          _config$sendEventName = config.sendEventName,
          sendEventName = _config$sendEventName === void 0 ? 'sendEvent' : _config$sendEventName,
          _config$makeCallbackN = config.makeCallbackName,
          makeCallbackName = _config$makeCallbackN === void 0 ? 'makeCallback' : _config$makeCallbackN,
          _config$nativeCallbac = config.nativeCallbackName,
          nativeCallbackName = _config$nativeCallbac === void 0 ? 'dispatchCallbackFromNative' : _config$nativeCallbac,
          _config$nativeCallNam = config.nativeCallName,
          nativeCallName = _config$nativeCallNam === void 0 ? 'dispatchNativeCall' : _config$nativeCallNam,
          _config$nativeEventNa = config.nativeEventName,
          nativeEventName = _config$nativeEventNa === void 0 ? 'dispatchNativeEvent' : _config$nativeEventNa;
      this.setSupportProperty(callHandlerName, sendEventName, makeCallbackName);
      this.bindDispatchMethods(nativeCallbackName, nativeCallName, nativeEventName);
    }
  }, {
    key: "call",
    value: function call(methodName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var data = {
        methodName: methodName,
        args: args,
        callId: -1
      };

      if (this.supportHandler) {
        return window[this.callHandlerName](data);
      } else if (this.supportHandlerObject) {
        return window[this.callHandlerName].callNative(JSON.stringify(data));
      } else {
        console.error("Can not find ".concat(this.callHandlerName, " handler."));
      }

      return false;
    }
  }, {
    key: "callAsync",
    value: function callAsync(methodName) {
      var _this = this;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var callId = this.getUUID();
      var data = {
        methodName: methodName,
        args: args,
        callId: callId
      };
      var promise = new Promise(function (resolve, reject) {
        _this.promiseMap[callId] = resolve;

        if (_this.supportHandler) {
          window[_this.callHandlerName](data);
        } else if (_this.supportHandlerObject) {
          window[_this.callHandlerName].callNative(JSON.stringify(data));
        } else {
          console.error("Can not find ".concat(_this.callHandlerName, " handler."));
          reject("Can not find ".concat(_this.callHandlerName, " handler."));
        }
      });
      return promise;
    }
  }, {
    key: "provide",
    value: function provide(methodName, func) {
      // 注册全局监听 call 函数
      window[methodName] = func;
    }
  }, {
    key: "emit",
    value: function emit(eventName) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var data = {
        event: eventName,
        arg: args
      };

      if (this.supportEventHandler) {
        window[this.sendEventName](data);
      } else if (this.supportHandlerObject) {
        window[this.callHandlerName][this.sendEventName](JSON.stringify(data));
      } else {
        console.error("Can not find ".concat(this.sendEventName, " handler."));
      }
    }
  }, {
    key: "listen",
    value: function listen(eventName, listener) {
      this.eventListeners.push({
        eventName: eventName,
        listener: listener
      });
    }
  }, {
    key: "unlisten",
    value: function unlisten(eventName, listener) {
      this.eventListeners = this.eventListeners.filter(function (eventListener) {
        return eventName !== eventListener.eventName || listener !== eventListener.listener;
      });
    }
  }, {
    key: "dispatchCallbackFromNative",
    value: function dispatchCallbackFromNative(res) {
      var callId = res.callId;

      if (+callId !== -1) {
        this.promiseMap[callId](res);
      }
    }
  }, {
    key: "dispatchNativeCall",
    value: function dispatchNativeCall(data) {
      var args = typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
      var ret = window[data.methodName](args);
      var res = {
        ret: ret || null,
        callId: data.callId,
        code: 0
      };

      if (this.supportCallback) {
        window[this.makeCallbackName](res);
      } else if (this.supportHandlerObject) {
        var str = JSON.stringify(res);
        window[this.callHandlerName][this.makeCallbackName](str);
      } else {
        console.error("Can not find ".concat(this.makeCallbackName, " handler."));
      }
    }
  }, {
    key: "dispatchNativeEvent",
    value: function dispatchNativeEvent(data) {
      var event = data.event,
          arg = data.arg;
      var found = false;

      for (var i = 0, len = this.eventListeners.length; i < len; i++) {
        var _this$eventListeners$ = this.eventListeners[i],
            eventName = _this$eventListeners$.eventName,
            listener = _this$eventListeners$.listener;

        if (event === eventName) {
          found = true;
          listener.apply(void 0, toConsumableArray(arg));
        }
      }

      if (!found) {
        console.error("Can not find handler of event ".concat(event));
      }
    }
  }, {
    key: "getUUID",
    value: function getUUID() {
      // 获取唯一标示 callId
      var time = +new Date();
      var id = this.uid++;
      var callId = '' + time + id;
      return +callId;
    }
  }]);

  return WebView;
}();

var JsBridge = new WebView();

window.JsBridge = JsBridge;
