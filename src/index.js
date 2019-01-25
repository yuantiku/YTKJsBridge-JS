// Android 与 JS 通信，只能接收 string，返回传入 object
// IOS 与 JS 通信，接收 && 返回都是 object
export class WebView {
  constructor(options = {}) {
    this.uid = 1;
    this.eventListeners = [];
    const {
      callHandlerName = 'YTKJsBridge',
      sendEventName = 'sendEvent',
      makeCallbackName = 'makeCallback',
      nativeCallbackName = 'dispatchCallbackFromNative',
      nativeCallName = 'dispatchNativeCall',
      nativeEventName = 'dispatchNativeEvent'
    } = options;

    this.callHandlerName = callHandlerName;
    this.sendEventName = sendEventName;
    this.makeCallbackName = makeCallbackName;

    this.supportHandler = window[callHandlerName] && typeof window[callHandlerName] === 'function';
    this.supportEventHandler = window[sendEventName] && typeof window[sendEventName] === 'function';
    this.supportCallback = window[makeCallbackName] && typeof window[makeCallbackName] === 'function';
    this.supportHandlerObject = window[callHandlerName] && typeof window[callHandlerName] === 'object';

    // 处理异步调用时的回调方法
    window[nativeCallbackName] = this.dispatchCallbackFromNative.bind(this);
    // 处理 native 调用 JS 提供的服务
    window[nativeCallName] = this.dispatchNativeCall.bind(this);
    // 注册 native 向 JS 发送事件
    window[nativeEventName] = this.dispatchNativeEvent.bind(this);
  }

  call(methodName, args, async) {
    const callId = async ? this.getCallId(args) : -1;
    const empty = this.isEmptyObject(args);
    const data = {
      methodName,
      args: empty ? null : args,
      callId
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

  provide(methodName, callback) {
    // 注册全局监听 call 函数
    window[methodName] = callback;
  }

  emit(methodName, args) {
    const data = {
      event: methodName,
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

  listen(type, listener) {
    this.eventListeners.push({
      type,
      listener
    });
  }

  unlisten(type, listener) {
    this.eventListeners = this.eventListeners.filter(eventListener => type !== eventListener.type || listener !== eventListener.listener);
  }

  getCallId(args) {
    const callback = args && args.trigger;
    if (typeof callback === 'function') {
      const callId = this.getUUID();
      const name = 'trigger' + callId;
      window[name] = callback;
      delete args.trigger;
      return callId;
    }
    return -1;
  }

  dispatchCallbackFromNative(res) {
    const callId = res.callId;
    if (+callId !== -1) {
      window['trigger' + callId](res);
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
      const { type, listener } = this.eventListeners[i];
      if (event === type) {
        found = true;
        listener(arg);
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

  isEmptyObject(obj) {
    // 因为客户端限制，需要判断对象是否拥有属性
    return !obj || JSON.stringify(obj) === '{}';
  }

  parse(str) {
    try {
      return typeof str === 'string' ? JSON.parse(str) : str;
    } catch(e) {
      console.error(e);
    }
  }

  stringify(obj) {
    try {
      return JSON.stringify(obj);
    } catch(e) {
      console.error(e);
    }
  }
}

export const JSBridge = new WebView();
