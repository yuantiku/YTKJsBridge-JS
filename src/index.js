// Android 与 JS 通信，只能接收 string，返回传入 object
// IOS 与 JS 通信，接收 && 返回都是 object
class WebView {
  constructor() {
    this.uid = 1;
    this.eventListeners = [];
    this.promiseMap = {};

    this.setSupportProperty();
    this.bindDispatchMethods();
  }

  setSupportProperty(
    callHandlerName = 'YTKJsBridge',
    sendEventName = 'sendEvent',
    makeCallbackName = 'makeCallback'
  ) {
    this.callHandlerName = callHandlerName;
    this.sendEventName = sendEventName;
    this.makeCallbackName = makeCallbackName;

    this.supportHandler = window[callHandlerName] && typeof window[callHandlerName] === 'function';
    this.supportEventHandler = window[sendEventName] && typeof window[sendEventName] === 'function';
    this.supportCallback = window[makeCallbackName] && typeof window[makeCallbackName] === 'function';
    this.supportHandlerObject = window[callHandlerName] && typeof window[callHandlerName] === 'object';
  }

  bindDispatchMethods(
    nativeCallbackName = 'dispatchCallbackFromNative',
    nativeCallName = 'dispatchNativeCall',
    nativeEventName = 'dispatchNativeEvent'
  ) {
    // 处理异步调用时的回调方法
    window[nativeCallbackName] = this.dispatchCallbackFromNative.bind(this);
    // 处理 native 调用 JS 提供的服务
    window[nativeCallName] = this.dispatchNativeCall.bind(this);
    // 注册 native 向 JS 发送事件
    window[nativeEventName] = this.dispatchNativeEvent.bind(this);
  }

  custom(config) {
    const {
      callHandlerName = 'YTKJsBridge',
      sendEventName = 'sendEvent',
      makeCallbackName = 'makeCallback',
      nativeCallbackName = 'dispatchCallbackFromNative',
      nativeCallName = 'dispatchNativeCall',
      nativeEventName = 'dispatchNativeEvent'
    } = config;
    this.setSupportProperty(callHandlerName, sendEventName, makeCallbackName);
    this.bindDispatchMethods(nativeCallbackName, nativeCallName, nativeEventName);
  }

  call(methodName, ...args) {
    const data = {
      methodName,
      args,
      callId: -1
    };
    if (this.supportHandler) {
      return window[this.callHandlerName](data);
    } else if (this.supportHandlerObject) {
      return window[this.callHandlerName].callNative(JSON.stringify(data));
    } else {
      console.error(`Can not find ${this.callHandlerName} handler.`);
    }
    return false;
  }

  callAsync(methodName, ...args) {
    const callId = this.getUUID();
    const data = {
      methodName,
      args,
      callId
    };
    const promise = new Promise((resolve, reject) => {
      this.promiseMap[callId] = resolve;
      if (this.supportHandler) {
        window[this.callHandlerName](data);
      } else if (this.supportHandlerObject) {
        window[this.callHandlerName].callNative(JSON.stringify(data));
      } else {
        console.error(`Can not find ${this.callHandlerName} handler.`);
        reject(`Can not find ${this.callHandlerName} handler.`);
      }
    });
    return promise;
  }

  provide(methodName, func) {
    // 注册全局监听 call 函数
    window[methodName] = func;
  }

  emit(eventName, ...args) {
    const data = {
      event: eventName,
      arg: args
    };
    if (this.supportEventHandler) {
      window[this.sendEventName](data);
    } else if (this.supportHandlerObject) {
      window[this.callHandlerName][this.sendEventName](JSON.stringify(data));
    } else {
      console.error(`Can not find ${this.sendEventName} handler.`);
    }
  }

  listen(eventName, listener) {
    this.eventListeners.push({
      eventName,
      listener
    });
  }

  unlisten(eventName, listener) {
    this.eventListeners = this.eventListeners.filter(eventListener => eventName !== eventListener.eventName || listener !== eventListener.listener);
  }

  dispatchCallbackFromNative(res) {
    const callId = res.callId;
    if (+callId !== -1) {
      this.promiseMap[callId](res);
    }
  }

  dispatchNativeCall(data) {
    const args = typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
    const ret = window[data.methodName](args);
    const res = {
      ret: ret || null,
      callId: data.callId,
      code: 0
    };
    if (this.supportCallback) {
      window[this.makeCallbackName](res);
    } else if (this.supportHandlerObject) {
      const str = JSON.stringify(res);
      window[this.callHandlerName][this.makeCallbackName](str);
    } else {
      console.error(`Can not find ${this.makeCallbackName} handler.`);
    }
  }

  dispatchNativeEvent(data) {
    const { event, arg } = data;
    let found = false;
    for (let i = 0, len = this.eventListeners.length; i < len; i++) {
      const { eventName, listener } = this.eventListeners[i];
      if (event === eventName) {
        found = true;
        listener(...arg);
      }
    }
    if (!found) {
      console.error(`Can not find handler of event ${event}`);
    }
  }

  getUUID() {
    // 获取唯一标示 callId
    const time = +new Date();
    const id = this.uid++;
    const callId = '' + time + id;
    return +callId;
  }
}

export default new WebView();
