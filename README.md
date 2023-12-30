## 微前端框架实践指南
本文档的内容是记录入手微前端框架 qiankun 的过程以及问题解决过程。
由于本人使用的技术栈只跟 react 和 webpack 相关，所以本项目是一个 Base qiankun 基座和两个 react（CRA）微项目。

## 目前遇到的前端项目痛点
- 项目庞大，业务复杂
- 工程模块分散
- 技术栈不统一

为解决多工程部署问题，于是引入 qiankun 作为众工程的支架整合起来。

## 创建项目

- 一个 Base 基座。（下面统一戏称为大哥）
- 两个常规 CRA 项目。（下面统一戏称为一号小弟和二号小弟）
```bash
# 基座 （大哥）
create-react-app base --template typescript

# 微项目一 （一号小弟）
create-react-app demo01 --template typescript

# 微项目二 （二号小弟）
create-react-app demo02 --template typescript
```
## 安装依赖
### 三者都需要安装的依赖
```bash
yarn add qiankun 

# 或者
npm i qiankun -S
```
### 大哥需要额外安装的依赖
```bash
# 路由
yarn add reactrouter-dom

# antd 组件库可酌情安装
yarn add antd
```
## 创建 .env 环境变量
### 大哥新增的内容
```yaml
# 启动端口 
PORT=4000

# 一号小弟的主机地址
REACT_APP_MICRO_APP_FIRST=//localhost:4001 

# 二号小弟的主机地址
REACT_APP_MICRO_APP_SECOND=//localhost:4002
```
### 一号小弟新增的内容
```yaml
# 启动端口
PORT=4001
```
### 二号小弟新增的内容
## 在 src 目录下新增 public-path.js 文件
### 两个小弟添加即可
```tsx
// src/public-path.js
// 该文件作用：设置或修改 webpack 打包的公共路径（public path）
// 在 qiankun 中，子应用的静态资源（例如 JS 和 CSS 文件）在打包时的相对路径或者 CDN 路径可能和最终部署在主应用中的路径不一致。
// 因此，需要在运行时动态设置这些静态资源的加载路径，也就是 webpack 的公共路径。
// 要记得导入到小弟的index.tsx入口文件中，如import "./public-path";

if (window.__POWERED_BY_QIANKUN__) {
	// eslint-disable-next-line no-undef
	__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```
## 覆盖 CRA 默认 Webpack 配置
### 安装 [craco](https://github.com/dilanx/craco)
> [Craco (Create React App Configuration Override)](https://github.com/dilanx/craco) 是一个对 Create React App 进行配置覆盖的工具。在不 eject 脚手架的情况下可以自定义对基础 webpack, Babel等配置的修改。  
> 相比于其他的工具如 [react-app-rewired](https://github.com/timarney/react-app-rewired) 或者 [rescripts](https://github.com/harrysolovay/rescripts)，craco 提供了更加强大的以及更加稳定的功能。例如，react-app-rewired 不再建议在create-react-app 2.0+ 版本中使用，因为react-app-rewired在某些情况下可能失效，没有提供长期支持。而 Craco 是专为create-react-app建立，并提供更复杂的配置覆盖功能。  

```bash
yarn add @craco/craco

# 或者
npm i -D @craco/craco
```
### 两个小弟在根目录创建 craco.config.js 文件
新增文件
```diff
  my-app
  ├── node_modules
+ ├── craco.config.js
  └── package.json
```
新增内容
```tsx
const { name } = require("./package");

module.exports = {
	webpack: (config) => {
		//将微应用打包成 umd 模块时，设置输出的全局变量名。
		config.output.library = `${name}-[name]`;
		//设置打包输出的模块格式为 umd。
		config.output.libraryTarget = "umd";
		// webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
		// config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
		// 指定在浏览器环境中使用全局对象
		config.output.globalObject = "window";

		return config;
	},

	devServer: (_) => {
		const config = _;
		//为开发服务器的响应头添加 Access-Control-Allow-Origin，允许跨域请求（注意仅适用于开发环境）。
		config.headers = {
			"Access-Control-Allow-Origin": "*",
		};
		// 当路由请求404时，返回根目录index.html，常用于单页应用的路由配置。
		config.historyApiFallback = true;
		//禁用热模块替换(HMR)，即禁止在开发服务器中热更新模块。
		config.hot = false;
		/* watchContentBase 已遗弃 */
		//禁用开发服务器的内容监视功能，这样开发服务器不会监听文件的变化。
		// config.watchContentBase = false;
		//禁用开发服务器的实时重新加载功能。
		config.liveReload = false;

		return config;
	},
};
```
### 修改 package.json 文件
```diff
"scripts": {
-  "start": "react-scripts start"
+  "start": "craco start"
-  "build": "react-scripts build"
+  "build": "craco build"
-  "test": "react-scripts test"
+  "test": "craco test"
}
```
## 修改 index.tsx
### 大哥修改的内容
```tsx
// 新增的 qiankun 代码如下
registerMicroApps([
  {
    name: "react01", // name 就是微应用的名称，地位等同于 ID，只能唯一
    entry: process.env.REACT_APP_MICRO_APP_FIRST!, // 微应用的入口地址，包含IP和端口号
    container: "#container", // 微应用挂载到基座的哪个 DOM 节点上，因为目前只需要同时展示两个微应用的其中一个，所以两个微应用的挂载的DOM节点相同
    activeRule: "/react01", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用
  },
  {
    name: "react02",
    entry: process.env.REACT_APP_MICRO_APP_SECOND!,
    container: "#container", // 与上方相同
    activeRule: "/react02",
  },
]);

start();
```
```tsx
// 大哥完整的index.tsx
import { registerMicroApps, start } from "qiankun";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

registerMicroApps([
	{
		name: "react01", // name 就是微应用的名称，地位等同于 ID，只能唯一
		entry: process.env.REACT_APP_MICRO_APP_FIRST!, // 微应用的入口地址，包含IP和端口号。!的作用是规避TS类型undefined、null检查
		container: "#container", // 微应用挂载到基座的哪个 DOM 节点上，因为目前只需要同时展示两个微应用的其中一个，所以两个微应用的挂载的DOM节点相同
		activeRule: "/react01", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用
	},
	{
		name: "react02",
		entry: process.env.REACT_APP_MICRO_APP_SECOND!,
		container: "#container", // 因为本项目在展示微项目时只展示两个中的其中一个，所以挂载的DOM节点与上方相同就行
		activeRule: "/react02",
	},
]);

start();

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	// <React.StrictMode>
	<BrowserRouter>
		<App />
	</BrowserRouter>
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```
### 两个小弟要修改的内容（相同）
```tsx
// 完整的index.tsx 直接CV好吧。ありがとう
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./public-path"; // 导入上一步配置的文件，用于正确加载静态资源文件
import reportWebVitals from "./reportWebVitals";

// 声明 Window 对象的类型，用于在开发环境下向全局对象window添加一个qiankunLifecycle属性
declare global {
	interface Window {
		qiankunLifecycle?: {
			bootstrap: Function;
			mount: Function;
			unmount: Function;
			update: Function;
		};
	}
}

let root: any = null;

/* 需要在微项目的 index.tsx 入口导出 qinakun 指定的生命周期函数。bootstrap、mount、unmount、update */

export async function bootstrap() {
	console.log("react app bootstraped");
}

export async function mount(props: any) {
	const container = props.container
		? props.container.querySelector("#root")
		: document.getElementById("root");
	if (container) {
		root = ReactDOM.createRoot(container);
		root.render(<App />);
	}
}

export async function unmount() {
	if (root) {
		root.unmount();
	}
}

export async function update(props: any) {
	console.log("update props", props);
}

// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
	root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
	root.render(<App />);
}

/* 
但在生产环境下，微应用是被qiankun加载和管理的，因此不需要添加这个额外的步骤，
生命周期钩子函数会由qiankun基座应用自动调用。
所以我们要在这行代码前加上if (process.env.NODE_ENV === "development")判断，只有在开发环境下才执行此操作。
*/

// @ts-ignore
if (process.env.NODE_ENV === "development") {
	/* 这段代码是用来在开发环境下向全局对象window添加一个qiankunLifecycle属性.
	 包含qiankun微前端所需要的生命周期函数，如bootstrap、mount、unmount和update。
	 这么做的原因是在开发环境下，我们可能需要单独运行和调试微应用。
	 这种情况下，微应用需要独立的生命周期函数，以便能够正常地启动、运行和卸载。
	 当微应用在独立运行时，它无法从qiankun中获得这些生命周期函数;
	 因此我们需要手动在window对象上提供它们，以确保微应用能够正常运行。 */
	window.qiankunLifecycle = {
		bootstrap,
		mount,
		unmount,
		update,
	};
}

reportWebVitals();
```
## 修改 App.tsx
### 大哥修改的内容
```tsx
import { BasePage } from "./pages/BasePage";
import { useRoutes } from "react-router-dom";
import "./App.css";

const routes = [
	{
		path: "/*", // 路由
		element: <BasePage />, // 路由对应页面组件
	},
];

const App = () => useRoutes(routes);

export default App;
```
同时在 src 下新建 pages 目录，创建 BasePage.tsx 文件。
```tsx
// src/pages/BasePage.tsx
import { Button, Divider, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

export const BasePage = () => {
	const navigate = useNavigate();

	return (
		<div className="App">
			<Flex vertical gap={20}>
				<Title level={3}>你好，这里是qiankun Base</Title>
				<Text type="secondary">
					介绍：这是一个基座项目，用于控制微项目的切换
				</Text>
				<Text type="secondary">
					共有两个微项目，通过 Base
					项目按钮的点击事件，跳转到路由对应的微项目界面
				</Text>

				<Flex justify="center" gap={10}>
					<Button type="primary" onClick={() => navigate("react02")}>
						切换到子项目二
					</Button>
					<Button type="primary" onClick={() => navigate("react01")}>
						切换到子项目一
					</Button>
				</Flex>

				<Divider />
				{/* 只展示两个微项目中的其中一个 */}
				<div id="container" />

				{/* 最初的写法，同时展示存在的两个微项目 */}
				{/* <div id="container01"></div>
				<div id="container02"></div> */}
			</Flex>
		</div>
	);
};

```
### 小弟的 App.tsx 自行修改吧
## 排查的问题
### webpack 5.x 中已移除配置属性watchContentBase
> webpack 有一个配置选项叫做 watchContentBase，布尔类型的配置项，它位于 webpack 的 devServer 配置内部。设置 watchContentBase 为 true，webpack 会监视 contentBase 下的所有文件。一旦这些文件发生改变，就会触发一次完整的页面重载。contentBase 通常用于定义服务器应该服务哪些静态文件的目录。

> 在更高版本的 webpack 中（特别是在 webpack-dev-server v4.x 版本中），已经移除了 watchContentBase 配置选项。

![图片.png](https://cdn.nlark.com/yuque/0/2023/png/25907639/1703919881719-ebe77c3d-19c3-4e3a-9aeb-3069c0ff12c8.png#averageHue=%2390b453&clientId=ueef490fb-cfbf-4&from=paste&height=865&id=u6aaf3f93&originHeight=1081&originWidth=1283&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=145268&status=done&style=none&taskId=u72e8ee44-a0c8-4337-b010-e1107b9f02a&title=&width=1026.4)

- **解决方法：我把它给注释了（滑稽）。**
### chunkLoadingGlobal 属性
> 作用：在微前端架构的实践中，尤其是 qiankun 框架中，当我们注册多个子应用时，为了防止不同子应用之间资源加载时的命名冲突，我们需要为每个子应用设置独特的 chunkLoadingGlobal 属性。这样，多个子应用就可以同时独立加载其异步模块，而不会相互影响和干扰。  

我当时在微项目中都使用`config.output.chunkLoadingGlobal = `webpackJsonp_${name}``配置，相同的`webpackJsonp_${name}`就没有唯一性了，后来逐步把每个配置都注释掉才排查到。CV 一时爽，报错火葬场。
```tsx
// webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
// config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
```

- **解决方法**：各个微项目中的`chunkLoadingGlobal`值要设置成不同的值。
   - 比如第一个微项目设置了``webpackJsonp_${name}``，第二个就可以设置成``${name}_webpackJsonp``。
### 路由匹配不到页面
```tsx
import { BasePage } from "./pages/BasePage";
import { useRoutes } from "react-router-dom";
import "./App.css";

const routes = [
	{
		path: "/*", // 路由。要设置为 /* 模糊匹配
		element: <BasePage />, // 路由对应页面组件
	},
];

const App = () => useRoutes(routes);

export default App;

```

- 最开始还没加入路由，微项目的切换靠手动改变 url 地址。
- 当我在 Base 中加入路由后，如果把 path 的路径设置为`/`访问`http://localhost:4000` 页面正常，但是当访问`http://localhost:4000/react01` 或`http://localhost:4000/react02` （也就是 qinakun 匹配到微项目路由，要渲染微项目时）就报错了。
   - 错误信息：`application 'react01' died in status LOADING_SOURCE_CODE: [qiankun]: Target container with #container not existed while react01 loading!`
- **解决方法**：这个报错好像跟 qiankun 无关，是 react-router 路由精准匹配问题。`/`和`/*`的区别是前者为精准匹配，后者为模糊匹配。具体来说，模糊匹配在访问 http://localhost:4000 和http://localhost:4000/react01 路径都能成功渲染 <BasePage />组件，但是精准匹配只有访问http://localhost:4000 路径才能成功渲染<BasePage />组件，而我们的微项目是挂载到<BasePage />组件内部的<div id="container" />。所以大哥都被关起来，小弟又怎么出得来呢？


> 话不多说，直接创建项目。

## 创建项目

- 一个 Base 基座。（下面统一戏称为大哥）
- 两个常规 CRA 项目。（下面统一戏称为一号小弟和二号小弟）
```bash
# 基座 （大哥）
create-react-app base --template typescript

# 微项目一 （一号小弟）
create-react-app demo01 --template typescript

# 微项目二 （二号小弟）
create-react-app demo02 --template typescript
```
## 安装依赖
### 三者都需要安装的依赖
```bash
yarn add qiankun 

# 或者
npm i qiankun -S
```
### 大哥需要额外安装的依赖
```bash
# 路由
yarn add reactrouter-dom

# antd 组件库可酌情安装
yarn add antd
```
## 创建 .env 环境变量
### 大哥新增的内容
```yaml
# 启动端口 
PORT=4000

# 一号小弟的主机地址
REACT_APP_MICRO_APP_FIRST=//localhost:4001 

# 二号小弟的主机地址
REACT_APP_MICRO_APP_SECOND=//localhost:4002
```
### 一号小弟新增的内容
```yaml
# 启动端口
PORT=4001
```
### 二号小弟新增的内容
## 在 src 目录下新增 public-path.js 文件
### 两个小弟添加即可
```tsx
// src/public-path.js
// 该文件作用：设置或修改 webpack 打包的公共路径（public path）
// 在 qiankun 中，子应用的静态资源（例如 JS 和 CSS 文件）在打包时的相对路径或者 CDN 路径可能和最终部署在主应用中的路径不一致。
// 因此，需要在运行时动态设置这些静态资源的加载路径，也就是 webpack 的公共路径。
// 要记得导入到小弟的index.tsx入口文件中，如import "./public-path";

if (window.__POWERED_BY_QIANKUN__) {
	// eslint-disable-next-line no-undef
	__webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```
## 覆盖 CRA 默认 Webpack 配置
### 安装 [craco](https://github.com/dilanx/craco)
> [Craco (Create React App Configuration Override)](https://github.com/dilanx/craco) 是一个对 Create React App 进行配置覆盖的工具。在不 eject 脚手架的情况下可以自定义对基础 webpack, Babel等配置的修改。  
> 相比于其他的工具如 [react-app-rewired](https://github.com/timarney/react-app-rewired) 或者 [rescripts](https://github.com/harrysolovay/rescripts)，craco 提供了更加强大的以及更加稳定的功能。例如，react-app-rewired 不再建议在create-react-app 2.0+ 版本中使用，因为react-app-rewired在某些情况下可能失效，没有提供长期支持。而 Craco 是专为create-react-app建立，并提供更复杂的配置覆盖功能。  

```bash
yarn add @craco/craco

# 或者
npm i -D @craco/craco
```
### 两个小弟在根目录创建 craco.config.js 文件
```tsx
const { name } = require("./package");

module.exports = {
	webpack: (config) => {
		//将微应用打包成 umd 模块时，设置输出的全局变量名。
		config.output.library = `${name}-[name]`;
		//设置打包输出的模块格式为 umd。
		config.output.libraryTarget = "umd";
		// webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
		// config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
		// 指定在浏览器环境中使用全局对象
		config.output.globalObject = "window";

		return config;
	},

	devServer: (_) => {
		const config = _;
		//为开发服务器的响应头添加 Access-Control-Allow-Origin，允许跨域请求（注意仅适用于开发环境）。
		config.headers = {
			"Access-Control-Allow-Origin": "*",
		};
		// 当路由请求404时，返回根目录index.html，常用于单页应用的路由配置。
		config.historyApiFallback = true;
		//禁用热模块替换(HMR)，即禁止在开发服务器中热更新模块。
		config.hot = false;
		/* watchContentBase 已遗弃 */
		//禁用开发服务器的内容监视功能，这样开发服务器不会监听文件的变化。
		// config.watchContentBase = false;
		//禁用开发服务器的实时重新加载功能。
		config.liveReload = false;

		return config;
	},
};
```
## 修改 index.tsx
### 大哥修改的内容
```tsx
// 新增的 qiankun 代码如下
registerMicroApps([
  {
    name: "react01", // name 就是微应用的名称，地位等同于 ID，只能唯一
    entry: process.env.REACT_APP_MICRO_APP_FIRST!, // 微应用的入口地址，包含IP和端口号
    container: "#container", // 微应用挂载到基座的哪个 DOM 节点上，因为目前只需要同时展示两个微应用的其中一个，所以两个微应用的挂载的DOM节点相同
    activeRule: "/react01", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用
  },
  {
    name: "react02",
    entry: process.env.REACT_APP_MICRO_APP_SECOND!,
    container: "#container", // 与上方相同
    activeRule: "/react02",
  },
]);

start();
```
```tsx
// 大哥完整的index.tsx
import { registerMicroApps, start } from "qiankun";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

registerMicroApps([
	{
		name: "react01", // name 就是微应用的名称，地位等同于 ID，只能唯一
		entry: process.env.REACT_APP_MICRO_APP_FIRST!, // 微应用的入口地址，包含IP和端口号。!的作用是规避TS类型undefined、null检查
		container: "#container", // 微应用挂载到基座的哪个 DOM 节点上，因为目前只需要同时展示两个微应用的其中一个，所以两个微应用的挂载的DOM节点相同
		activeRule: "/react01", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用
	},
	{
		name: "react02",
		entry: process.env.REACT_APP_MICRO_APP_SECOND!,
		container: "#container", // 因为本项目在展示微项目时只展示两个中的其中一个，所以挂载的DOM节点与上方相同就行
		activeRule: "/react02",
	},
]);

start();

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	// <React.StrictMode>
	<BrowserRouter>
		<App />
	</BrowserRouter>
	// </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```
### 两个小弟要修改的内容（相同）
```tsx
// 完整的index.tsx 直接CV好吧。ありがとう
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./public-path"; // 导入上一步配置的文件，用于正确加载静态资源文件
import reportWebVitals from "./reportWebVitals";

// 声明 Window 对象的类型，用于在开发环境下向全局对象window添加一个qiankunLifecycle属性
declare global {
	interface Window {
		qiankunLifecycle?: {
			bootstrap: Function;
			mount: Function;
			unmount: Function;
			update: Function;
		};
	}
}

let root: any = null;

/* 需要在微项目的 index.tsx 入口导出 qinakun 指定的生命周期函数。bootstrap、mount、unmount、update */

export async function bootstrap() {
	console.log("react app bootstraped");
}

export async function mount(props: any) {
	const container = props.container
		? props.container.querySelector("#root")
		: document.getElementById("root");
	if (container) {
		root = ReactDOM.createRoot(container);
		root.render(<App />);
	}
}

export async function unmount() {
	if (root) {
		root.unmount();
	}
}

export async function update(props: any) {
	console.log("update props", props);
}

// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
	root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
	root.render(<App />);
}

/* 
但在生产环境下，微应用是被qiankun加载和管理的，因此不需要添加这个额外的步骤，
生命周期钩子函数会由qiankun基座应用自动调用。
所以我们要在这行代码前加上if (process.env.NODE_ENV === "development")判断，只有在开发环境下才执行此操作。
*/

// @ts-ignore
if (process.env.NODE_ENV === "development") {
	/* 这段代码是用来在开发环境下向全局对象window添加一个qiankunLifecycle属性.
	 包含qiankun微前端所需要的生命周期函数，如bootstrap、mount、unmount和update。
	 这么做的原因是在开发环境下，我们可能需要单独运行和调试微应用。
	 这种情况下，微应用需要独立的生命周期函数，以便能够正常地启动、运行和卸载。
	 当微应用在独立运行时，它无法从qiankun中获得这些生命周期函数;
	 因此我们需要手动在window对象上提供它们，以确保微应用能够正常运行。 */
	window.qiankunLifecycle = {
		bootstrap,
		mount,
		unmount,
		update,
	};
}

reportWebVitals();
```
## 修改 App.tsx
### 大哥修改的内容
```tsx
import { BasePage } from "./pages/BasePage";
import { useRoutes } from "react-router-dom";
import "./App.css";

const routes = [
	{
		path: "/*", // 路由
		element: <BasePage />, // 路由对应页面组件
	},
];

const App = () => useRoutes(routes);

export default App;
```
同时在 src 下新建 pages 目录，创建 BasePage.tsx 文件。
```tsx
// src/pages/BasePage.tsx
import { Button, Divider, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

export const BasePage = () => {
	const navigate = useNavigate();

	return (
		<div className="App">
			<Flex vertical gap={20}>
				<Title level={3}>你好，这里是qiankun Base</Title>
				<Text type="secondary">
					介绍：这是一个基座项目，用于控制微项目的切换
				</Text>
				<Text type="secondary">
					共有两个微项目，通过 Base
					项目按钮的点击事件，跳转到路由对应的微项目界面
				</Text>

				<Flex justify="center" gap={10}>
					<Button type="primary" onClick={() => navigate("react02")}>
						切换到子项目二
					</Button>
					<Button type="primary" onClick={() => navigate("react01")}>
						切换到子项目一
					</Button>
				</Flex>

				<Divider />
				{/* 只展示两个微项目中的其中一个 */}
				<div id="container" />

				{/* 最初的写法，同时展示存在的两个微项目 */}
				{/* <div id="container01"></div>
				<div id="container02"></div> */}
			</Flex>
		</div>
	);
};

```
### 小弟的 App.tsx 自行修改吧
## 排查的问题
### webpack 5.x 中已移除配置属性watchContentBase
> webpack 有一个配置选项叫做 watchContentBase，布尔类型的配置项，它位于 webpack 的 devServer 配置内部。设置 watchContentBase 为 true，webpack 会监视 contentBase 下的所有文件。一旦这些文件发生改变，就会触发一次完整的页面重载。contentBase 通常用于定义服务器应该服务哪些静态文件的目录。

> 在更高版本的 webpack 中（特别是在 webpack-dev-server v4.x 版本中），已经移除了 watchContentBase 配置选项。

![图片.png](https://cdn.nlark.com/yuque/0/2023/png/25907639/1703919881719-ebe77c3d-19c3-4e3a-9aeb-3069c0ff12c8.png#averageHue=%2390b453&clientId=ueef490fb-cfbf-4&from=paste&height=865&id=u6aaf3f93&originHeight=1081&originWidth=1283&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=145268&status=done&style=none&taskId=u72e8ee44-a0c8-4337-b010-e1107b9f02a&title=&width=1026.4)

- **解决方法：我把它给注释了（滑稽）。**
### chunkLoadingGlobal 属性
> 作用：在微前端架构的实践中，尤其是 qiankun 框架中，当我们注册多个子应用时，为了防止不同子应用之间资源加载时的命名冲突，我们需要为每个子应用设置独特的 chunkLoadingGlobal 属性。这样，多个子应用就可以同时独立加载其异步模块，而不会相互影响和干扰。  

我当时在微项目中都使用`config.output.chunkLoadingGlobal = `webpackJsonp_${name}``配置，相同的`webpackJsonp_${name}`就没有唯一性了，后来逐步把每个配置都注释掉才排查到。CV 一时爽，报错火葬场。
```tsx
// webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
```

- **解决方法**：各个微项目中的`chunkLoadingGlobal`值要设置成不同的值。
   - 比如第一个微项目设置了``webpackJsonp_${name}``，第二个就可以设置成``${name}_webpackJsonp``。
### 路由匹配不到页面
```tsx
import { BasePage } from "./pages/BasePage";
import { useRoutes } from "react-router-dom";
import "./App.css";

const routes = [
	{
		path: "/*", // 路由。要设置为 /* 模糊匹配
		element: <BasePage />, // 路由对应页面组件
	},
];

const App = () => useRoutes(routes);

export default App;
```

- 最开始还没加入路由，微项目的切换靠手动改变 url 地址。
- 当我在 Base 中加入路由后，如果把 path 的路径设置为`/`访问`http://localhost:4000` 页面正常，但是当访问`http://localhost:4000/react01` 或`http://localhost:4000/react02` （也就是 qinakun 匹配到微项目路由，要渲染微项目时）就报错了。
   - 错误信息：`application 'react01' died in status LOADING_SOURCE_CODE: [qiankun]: Target container with #container not existed while react01 loading!`
- **解决方法**：这个报错好像跟 qiankun 无关，是 react-router 路由精准匹配问题。`/`和`/*`的区别是前者为精准匹配，后者为模糊匹配。具体来说，模糊匹配在访问 http://localhost:4000 和http://localhost:4000/react01 路径都能成功渲染 <BasePage />组件，但是精准匹配只有访问http://localhost:4000 路径才能成功渲染<BasePage />组件，而我们的微项目是挂载到<BasePage />组件内部的<div id="container" />。所以大哥都被关起来，小弟又怎么出得来呢？
