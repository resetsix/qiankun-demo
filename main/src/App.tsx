import { BasePage } from "./pages/BasePage";
import { Navigate, useRoutes } from "react-router-dom";
import "./App.css";

const routes = [
	{
		path: "/", // 路由
		element: <Navigate to="/qiankun-demo/main" />, // 路由对应页面组件
	},
	{
		path: "/qiankun-demo/*", // 路由
		element: <BasePage />, // 路由对应页面组件
	},
];

const App = () => useRoutes(routes);

export default App;
