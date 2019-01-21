// Android 与 JS 通信，只能接收 string，返回传入 object
// IOS 与 JS 通信，接收 && 返回都是 object
var WebView = {
  uid: 1,
  inIOS: window.YTKJsBridge && typeof window.YTKJsBridge === 'function',
  call: function (method, args, async) {
    if (async) {
      // 异步情形
      var callId = this.bindTrigger(args);
      var isEmpty = this.isEmptyObject(args);
      var data = {
        methodName: method,
        args: isEmpty ? null : args,
        callId: callId
      };
      if (this.inIOS) {
        window.YTKJsBridge(data);
      } else {
        window.YTKJsBridge.callNative(JSON.stringify(data));
      }
      return false;
    } else {
      // 同步情形
      var isEmptySync = this.isEmptyObject(args);
      var dataSync = {
        methodName: method,
        args: isEmptySync ? null : args,
        callId: -1
      }
      if (this.inIOS) {
        return window.YTKJsBridge(dataSync);
      } else {
        // Android 同步调用的返回值是 string
        var res = window.YTKJsBridge.callNative(JSON.stringify(dataSync));
        return JSON.parse(res);
      }
    }
  },
  emit: function (method, args) {
    var data = {
      event: method,
      arg: args
    };
    if (this.inIOS) {
      window.sendEvent && window.sendEvent(data);
    } else {
      window.YTKJsBridge.sendEvent(JSON.stringify(data));
    }
  },
  listen: function (method, callback) {
    if (this[method]) {
      this[method] = null;
    }
    this[method] = callback;
  },
  bindTrigger: function (args) {
    // 注册全局 trigger 函数
    var callback = args && args.trigger;
    if (typeof callback === 'function') {
      var callId = this.getUUID();
      var name = 'trigger' + callId;
      window[name] = callback;
      delete args.trigger;
      return callId;
    }
    return -1;
  },
  bindCall: function (methodName, callback) {
    // 注册全局监听 call 函数
    window[methodName] = callback;
  },
  handleTrigger: function (res) {
    // 寻找 trigger 函数进行处理
    var callId = res.callId;
    if (+callId !== -1) {
      window['trigger' + callId](res);
    }
  },
  handleCall: function (data) {
    // 寻找 call 函数进行处理
    var args = typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
    var ret = window[data.methodName](args);
    var res = {
      ret: ret || null,
      callId: data.callId,
      code: 0
    };
    if (this.inIOS) {
      window.makeCallback(res);
    } else {
      var str = JSON.stringify(res);
      window.YTKJsBridge.makeCallback(str);
    }
  },
  handleEventCall: function (data) {
    var eventName = data.event;
    if (this[eventName]) {
      this[eventName](data.arg);
    }
  },
  getUUID: function () {
    // 获取唯一标示 callId
    var time = +new Date();
    var id = this.uid++;
    var callId = '' + time + id;
    return +callId;
  },
  isEmptyObject: function (obj) {
    // 因为客户端限制，需要判断对象是否拥有属性
    return !obj || JSON.stringify(obj) === '{}';
  }
};

(function () {
  // 注册调用客户端方法的回调
  window.dispatchCallbackFromNative = WebView.handleTrigger;
  // 注册客户端调用 JS 能力
  window.dispatchNativeCall = WebView.handleCall.bind(WebView);
  // 注册客户端向 JS 发送事件
  window.dispatchNativeEvent = WebView.handleEventCall.bind(WebView);
  window.JSBridge = WebView;
})();
