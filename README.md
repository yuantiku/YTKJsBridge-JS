# YTKJsBridge-JS
YTKJSBridge 是配合 [YTKWebView-Android](https://github.com/yuantiku/YTKJsBridge-Android) && [YTKWebView-IOS](https://github.com/yuantiku/YTKJsBridge-iOS) 使用，实现客户端与 JS 双向通信的工具。

## 使用
全局注入了一个叫 JSBridge 的对象。
```Javascript
<!-- html -->
<script type="text/javascript" src="https://conan-online.fbcontent.cn/conan-math/webview.js"></script>
```

### JS 调用 native 服务
```Javascript
JSBridge.call(method, args, async)
```
method: 方法名
args: 传给客户端的参数，如果有回调请在 args 注入。如：args = { trigger: () => {} }
async: 是否异步调用

### 监听 native 调用 JS 的服务
```Javascript
JSBridge.bindCall(method, callback)
```
method: 客户端调用的服务名
callback: JS 相应的回调函数
callback 参数示例：[arg0, arg1]

### 发送 JS 事件
```Javascript
JSBridge.emit(method, args)
```
method: 事件名
args: 参数

### 监听客户端事件
```Javascript
JSBridge.listen(method, callback)
```
method: 事件名
callback: 对应处理方法
