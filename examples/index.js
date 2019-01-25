'use strict';

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
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    classCallCheck(this, WebView);

    this.uid = 1;
    this.eventListeners = [];
    var _options$callHandlerN = options.callHandlerName,
        callHandlerName = _options$callHandlerN === void 0 ? 'YTKJsBridge' : _options$callHandlerN,
        _options$sendEventNam = options.sendEventName,
        sendEventName = _options$sendEventNam === void 0 ? 'sendEvent' : _options$sendEventNam,
        _options$makeCallback = options.makeCallbackName,
        makeCallbackName = _options$makeCallback === void 0 ? 'makeCallback' : _options$makeCallback,
        _options$nativeCallba = options.nativeCallbackName,
        nativeCallbackName = _options$nativeCallba === void 0 ? 'dispatchCallbackFromNative' : _options$nativeCallba,
        _options$nativeCallNa = options.nativeCallName,
        nativeCallName = _options$nativeCallNa === void 0 ? 'dispatchNativeCall' : _options$nativeCallNa,
        _options$nativeEventN = options.nativeEventName,
        nativeEventName = _options$nativeEventN === void 0 ? 'dispatchNativeEvent' : _options$nativeEventN;
    this.callHandlerName = callHandlerName;
    this.sendEventName = sendEventName;
    this.makeCallbackName = makeCallbackName;
    this.supportHandler = window[callHandlerName] && typeof window[callHandlerName] === 'function';
    this.supportEventHandler = window[sendEventName] && typeof window[sendEventName] === 'function';
    this.supportCallback = window[makeCallbackName] && typeof window[makeCallbackName] === 'function';
    this.supportHandlerObject = window[callHandlerName] && _typeof_1(window[callHandlerName]) === 'object'; // 处理异步调用时的回调方法

    window[nativeCallbackName] = this.dispatchCallbackFromNative.bind(this); // 处理 native 调用 JS 提供的服务

    window[nativeCallName] = this.dispatchNativeCall.bind(this); // 注册 native 向 JS 发送事件

    window[nativeEventName] = this.dispatchNativeEvent.bind(this);
  }

  createClass(WebView, [{
    key: "call",
    value: function call(methodName, args, async) {
      var callId = async ? this.getCallId(args) : -1;
      var empty = this.isEmptyObject(args);
      var data = {
        methodName: methodName,
        args: empty ? null : args,
        callId: callId
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
    key: "provide",
    value: function provide(methodName, callback) {
      // 注册全局监听 call 函数
      window[methodName] = callback;
    }
  }, {
    key: "emit",
    value: function emit(methodName, args) {
      var data = {
        event: methodName,
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
    value: function listen(type, listener) {
      this.eventListeners.push({
        type: type,
        listener: listener
      });
    }
  }, {
    key: "unlisten",
    value: function unlisten(type, listener) {
      this.eventListeners = this.eventListeners.filter(function (eventListener) {
        return type !== eventListener.type || listener !== eventListener.listener;
      });
    }
  }, {
    key: "getCallId",
    value: function getCallId(args) {
      var callback = args && args.trigger;

      if (typeof callback === 'function') {
        var callId = this.getUUID();
        var name = 'trigger' + callId;
        window[name] = callback;
        delete args.trigger;
        return callId;
      }

      return -1;
    }
  }, {
    key: "dispatchCallbackFromNative",
    value: function dispatchCallbackFromNative(res) {
      var callId = res.callId;

      if (+callId !== -1) {
        window['trigger' + callId](res);
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
            type = _this$eventListeners$.type,
            listener = _this$eventListeners$.listener;

        if (event === type) {
          found = true;
          listener(arg);
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
  }, {
    key: "isEmptyObject",
    value: function isEmptyObject(obj) {
      // 因为客户端限制，需要判断对象是否拥有属性
      return !obj || JSON.stringify(obj) === '{}';
    }
  }, {
    key: "parse",
    value: function parse(str) {
      try {
        return typeof str === 'string' ? JSON.parse(str) : str;
      } catch (e) {
        console.error(e);
      }
    }
  }, {
    key: "stringify",
    value: function stringify(obj) {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        console.error(e);
      }
    }
  }]);

  return WebView;
}();
var JSBridge = new WebView();

window.JSBridge = JSBridge;
