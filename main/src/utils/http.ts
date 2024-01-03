import { message } from "antd";
import qs from "qs";

// import * as process from "process";
interface ReqConfig extends RequestInit {
    token?: string;
    data?: Record<string, any>;
}

const API_SERVER_URL = 'https://console-mock.apipost.cn/mock/79f0fdcc-e7b9-4b67-bef4-2f7c33220e76?apipost_id=5f9fb9';

// 专门处理 JSON格式文本的内容
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const http = async (endpoint: string, { token, data, ...customConfig }: ReqConfig = {}) => {
    const config = {
        // headers: {
        //     //Authorization: token ? `Bearer ${token}` : "",
        //     "Content-Type": data ? "application/json" : "",
        // },
        ...customConfig,
    };

    const resp = await window.fetch(`${API_SERVER_URL}`, config);
    if (resp.status === 401) {
        message.warning('Unauthorized 401未授权，请检查用户信息是否过期。即将跳转至登录页');
        setTimeout(() => window.location.href = '/login', 3000);
        return Promise.reject('Unauthorized');
    }
    if (resp.status === 403) {
        message.warning('Forbidden 403禁止访问，请检查权限。即将跳转至登录页');
        setTimeout(() => window.location.href = '/login', 3000);
        return Promise.reject('Forbidden');
    }
    const data_1 = await resp.json();
    if (resp.ok) {
        return data_1;
    } else {
        return Promise.reject(data_1);
    }
};

const filterEmptyString = (key: string, value: any) => {
    if (value === "") return undefined // 返回 undefined 将跳过该参数
    return value;
};

export const useHttp = () => {
    //const user = authStore(state => state.user)
    const GET = (...[endpoint, req]: Parameters<typeof http>) => {
        const cfg = {
            ...req,
            method: "GET",
            //token: user?.token
        };
        if (req) {
            endpoint += `?${qs.stringify(req.data, { filter: filterEmptyString })}`;
        }
        return http(endpoint, cfg);
    };

    const POST = (...[endpoint, req]: Parameters<typeof http>) => {
        const cfg = {
            ...req,
            method: "POST",
            //token: user?.token,
            body: req ? JSON.stringify(req.data) : null,
            headers: {
                "Content-Type": "application/json",
            },
        };
        return http(endpoint, cfg);
    };

    const PUT = (...[endpoint, req]: Parameters<typeof http>) => {
        const cfg = {
            ...req,
            method: "PUT",
            //token: user?.token,
            body: req ? JSON.stringify(req.data) : null,
            headers: {
                "Content-Type": "application/json",
            },
        };
        return http(endpoint, cfg);
    };

    const PATCH = (...[endpoint, req]: Parameters<typeof http>) => {
        const cfg = {
            method: "PATCH",
            //token: user?.token,
            body: req ? JSON.stringify(req.data) : null,
            headers: {
                "Content-Type": "application/merge-patch+json",
            },
            ...req,
        };
        return http(endpoint, cfg);
    };

    const DELETE = (...[endpoint, req]: Parameters<typeof http>) => {
        const cfg = {
            ...req,
            method: "DELETE",
            //token: user?.token
            headers: {
                "Content-Type": "application/json",
            },
        };
        if (req) {
            endpoint += `?${qs.stringify(req.data, { filter: filterEmptyString })}`;
        }
        return http(endpoint, cfg);
    };

    return { GET, POST, PUT, PATCH, DELETE };
};