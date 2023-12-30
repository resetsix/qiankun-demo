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
