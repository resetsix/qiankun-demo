import { registerMicroApps, start } from "qiankun";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

registerMicroApps([
	{
		name: "react01", // name 就是微应用的名称，地位等同于 ID，只能唯一
		entry: process.env.REACT_APP_MICRO_APP_FIRST!, // 微应用的入口地址，包含IP和端口号
		container: "#container", // 微应用挂载到基座的哪个 DOM 节点上，因为目前只需要同时展示两个微应用的其中一个，所以两个微应用的挂载的DOM节点相同
		activeRule: "qiankun-demo/react01", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用
	},
	{
		name: "react02",
		entry: process.env.REACT_APP_MICRO_APP_SECOND!,
		container: "#container", // 与上方相同
		activeRule: "qiankun-demo/react02",
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
