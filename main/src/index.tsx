import { registerMicroApps, setDefaultMountApp, start } from "qiankun";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import apps from "./core/apps";
import actions from "./core/store";
import "./index.css";
import { http } from "./utils/http";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

registerMicroApps(apps, {
    beforeLoad: async () => {
        const res = await http("", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ name: "dd" }),
        });
        actions?.setGlobalState({ ...res.data });
        window.localStorage.setItem("token", JSON.stringify(res.data.token));
    },
});

// 设置默认进入的子应用
setDefaultMountApp("/console");

start();
