import { OnGlobalStateChangeCallback } from "qiankun";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./public-path"; // 正确加载静态资源文件路径
import reportWebVitals from "./reportWebVitals";

// 声明 Window 对象的类型，用于在开发环境下向全局对象window添加一个qiankunLifecycle属性
declare global {
    interface Window {
        qiankunLifecycle?: {
            bootstrap: OnGlobalStateChangeCallback;
            mount: OnGlobalStateChangeCallback;
            unmount: OnGlobalStateChangeCallback;
            update: OnGlobalStateChangeCallback;
        };
        __POWERED_BY_QIANKUN__?: boolean;
    }
}

let root: any = null;

// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
    root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
    root.render(<App />);
}

/* 需要在为项目的 index.tsx 入口导出 qinakun 指定的生命周期函数。bootstrap、mount、unmount、update */
export const bootstrap = async () => {};

export const mount = async (props: any) => {
    const container = props.container
        ? props.container.querySelector("#root")
        : document.getElementById("root");
    if (container) {
        root = ReactDOM.createRoot(container);
        root.render(<App {...props} />);
    }
};

export const unmount = async () => {
    if (root) root.unmount();
};

export const update = async (props: any) => {
    console.log("demo01 update props", props);
};

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
