// Android 与 JS 通信，只能接收 string，返回传入 object
// IOS 与 JS 通信，接收 && 返回都是 object
class JSBridge {
  constructor() {
    this.uid = 1;
    this.inIOS = window.YTKJsBridge && typeof window.YTKJsBridge === 'function';
    // 处理 Android 调用 JS 的回调方法
    window.dispatchCallbackFromNative = this.handleTrigger.bind(this);
    // 处理 Android 调用 JS 提供的服务
    window.dispatchNativeCall = this.handleCall.bind(this);
    // 注册客户端向 JS 发送事件
    window.dispatchNativeEvent = this.handleEventCall.bind(this);
  }

  call(methodName, args, async) {
    if (async) {
      // 异步
      const callId = this.bindTrigger(args);
      const isEmpty = this.isEmptyObject(args);
      const data = {
        methodName,
        args: isEmpty ? null : args,
        callId
      };
      if (this.inIOS) {
        window.YTKJsBridge && window.YTKJsBridge(data);
      } else {
        window.YTKJsBridge.callNative(JSON.stringify(data));
      }
      return false;
    } else {
      // 同步
      const isEmpty = this.isEmptyObject(args);
      const data = {
        methodName,
        args: isEmpty ? null : args,
        callId: -1
      }
      if (this.inIOS) {
        return window.YTKJsBridge(data);
      } else {
        // Android 同步调用的返回值是 string
        const res = window.YTKJsBridge.callNative(JSON.stringify(data));
        return JSON.parse(res);
      }
    }
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
    if (this.inIOS) {
      window.sendEvent && window.sendEvent(data);
    } else {
      window.YTKJsBridge.sendEvent(JSON.stringify(data));
    }
  }

  listen(methodName, callback) {
    if (this[methodName]) {
      this[methodName] = null;
    }
    this[methodName] = callback;
  }

  unlisten(methodName) {
    this[methodName] = null;
  }

  bindTrigger(args) {
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

  handleTrigger(res) {
    // 寻找 trigger 函数进行处理
    const callId = res.callId;
    if (+callId !== -1) {
      window['trigger' + callId](res);
    }
  }

  handleCall(data) {
    // 寻找 call 函数进行处理
    const args = typeof data.args === 'string' ? JSON.parse(data.args) : data.args;
    const ret = window[data.methodName](args);
    const res = {
      ret: ret || null,
      callId: data.callId,
      code: 0
    };
    if (this.inIOS) {
      window.makeCallback && window.makeCallback(res);
    } else {
      const str = JSON.stringify(res);
      window.YTKJsBridge.makeCallback(str);
    }
  }

  handleEventCall(data) {
    const { event, arg } = data;
    if (this[event]) {
      this[event](arg);
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
}

export default new JSBridge();
