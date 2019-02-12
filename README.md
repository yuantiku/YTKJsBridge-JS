# YTKJsBridge-JS
YTKJsBridge-JS 是自定义实现用于实现 native(Android or IOS) 与 WebApp 通信及能力调用的库。

## 示例
示例请参考：[示例页面](https://conan-online.fbcontent.cn/conan-math/JSBridge/index.html)

## 使用
```Javascript
// 使用默认配置
import JsBridge from 'ytk-jsbridge'

// 使用自定义配置
JsBridge.custom(options)
```
options 参数说明：<br>
callHandlerName: native 注入到 WebApp 中的对象(接口)名<br>
sendEventName: native 注入到 WebApp 处理事件通信的对象(接口)名<br>
makeCallbackName: native 注入到 WebApp，调用 WebApp 服务后执行的对象(接口)名<br>
nativeCallbackName: native 触发 WebApp 回调执行的对象(接口)名<br>
nativeCallName: native 调用 WebApp 服务执行的对象(接口)名<br>
nativeEventName: native 调用 WebApp 事件时执行的对象(接口)名

## 快速上手
### WebApp 调用 native 服务
```Javascript
JsBridge.call(method, args, async)

// example of call sync
const res = JsBridge.call('getAppVersion')
// res: {
//   ret: result of call method,
//   code: 0 for success, other for fail
// }

// example of call async
const args = {
  ...params,
  trigger: (res) => {
    const { ret, code } = res
    if (code === 0) {
      // correct handler
    } else {
      // wrong handler
    }
  }
}
JsBridge.call('uploadFile', args, true)
```
method: 方法名<br>
args: 传给客户端的参数，如果有异步回调请在 args 注入。如：args = { trigger: () => {} }<br>
async: 是否异步调用<br>

### WebApp 提供服务供 native 调用
```Javascript
JsBridge.provide(method, callback)

// example
JsBridge.provide('eventHandler', args => {
  const eventName = args.length && args[0]
  switch(eventName) {
    case 'stop':
      // stop handler
      break
    default:
      break
  }
})
```
method: 客户端调用的服务名<br>
callback: JS 相应的回调函数<br>
callback 参数示例：[arg0, arg1]<br>

### WebApp 触发 native 事件
```Javascript
JsBridge.emit(method, args)

// example
JsBridge.emit('ready')
```
method: 事件名<br>
args: 参数<br>

### WebApp 监听 native 事件
```Javascript
JsBridge.listen(type, listener)
```
type: 事件名<br>
listener: 对应处理方法<br>

### WebApp 取消监听 native 事件
```Javascript
JsBridge.unlisten(type, listener)
```
type: 事件名<br>
listener: 对应处理方法<br>

## 实现原理
实现 native 与 WebApp 通信的方式可以简单归纳如下：<br>

| 通信方案 | 版本支持 | 丢消息 | 支持同步返回 | 传递对象 | 注入原生对象 | 数据长度限制 |
| ---------- | ----------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| 假跳转 | 全平台全版本 | 会丢失 | 不支持 | 不支持 | 不支持 | 有限制 |
| 弹窗拦截 | UIWebView支持 | 不丢失 | 支持 | 不支持 | 不支持 | 无限制 |
| JSContext 注入 | 只有 UIWebView 支持 | 不丢失 | 支持 | 支持 | 支持 | 无限制 |
| 安卓 interface 注入 | Android 全版本 | 不丢失 | 支持 | 支持 | 支持 | 无限制 |
| MessageHandler 注入 | 只有 WKWebView 支持 | 不丢失 | 不支持 | 不支持 | 不支持 | 无限制 |

出于对前端开发减少侵入性的角度，YTKJsBridge-JS 适配 IOS 采用 JSContext 的方式，适配 Android 采用安卓 interface 注入的方式。

## 推荐
YTKJsBridge 推荐配合 [YTKWebView-Android](https://github.com/yuantiku/YTKJsBridge-Android) && [YTKWebView-IOS](https://github.com/yuantiku/YTKJsBridge-iOS) 使用，可以快速集成实现 native 与 WebApp 的双向通信及能力调用。
