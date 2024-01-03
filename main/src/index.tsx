import { registerMicroApps, start } from "qiankun";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import apps from "./qiankun/apps";
import actions from "./qiankun/store";
import { http } from "./utils/http";

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

start();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
