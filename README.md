# YTKJsBridge-JS
YTKJSBridge 是配合 [YTKWebView-Android](https://github.com/yuantiku/YTKJsBridge-Android) && [YTKWebView-IOS](https://github.com/yuantiku/YTKJsBridge-iOS) 使用，实现客户端与 JS 双向通信的工具。

## 使用
```Javascript
// es6
import JSBridge from 'ytk-jsbridge'
```

### JS 调用 native 服务
```Javascript
JSBridge.call(method, args, async)
```
method: 方法名<br>
args: 传给客户端的参数，如果有回调请在 args 注入。如：args = { trigger: () => {} }<br>
async: 是否异步调用<br>

### 监听 native 调用 JS 的服务
```Javascript
JSBridge.provide(method, callback)
```
method: 客户端调用的服务名<br>
callback: JS 相应的回调函数<br>
callback 参数示例：[arg0, arg1]<br>

### 发送 JS 事件
```Javascript
JSBridge.emit(method, args)
```
method: 事件名<br>
args: 参数<br>

### 监听客户端事件
```Javascript
JSBridge.listen(method, callback)
```
method: 事件名<br>
callback: 对应处理方法<br>

### 取消监听客户端事件
```Javascript
JSBridge.unlisten(method)
```
method: 事件名<br>
