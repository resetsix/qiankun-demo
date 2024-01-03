import { Button, Divider, Flex, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import actions from "../qiankun/store";
import { useUserStore } from "../store/useUserStore";

const { Text, Title } = Typography;

export const BasePage = () => {
    const navigate = useNavigate();

    const { user, updateUser } = useUserStore();

    actions.onGlobalStateChange((state) => {
        console.log("主应用检测到状态改变", state);
        updateUser({ ...state });
    });

    return (
        <div className="App">
            <Flex vertical gap={20}>
                <Title level={3}>你好，这里是qiankun Base</Title>
                <Title level={4}>
                    主应用用户名：
                    {user?.token}
                </Title>
                <Text type="secondary">
                    介绍：分割线以上是一个Base父应用，只用于控制子应用的切换
                </Text>
                <Text type="secondary">
                    共有两个子应用，通过 Base
                    项目按钮的点击事件，跳转到路由对应的子应用界面
                </Text>

                <Flex justify="center" gap={10}>
                    <Button
                        type="primary"
                        onClick={() => navigate("/qiankun-demo/subapp/demo01")}
                    >
                        切换到子应用一
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => navigate("/qiankun-demo/subapp/demo02")}
                    >
                        切换到子应用二
                    </Button>
                    <Button
                        type="primary"
                        onClick={() =>
                            actions.setGlobalState({ token: "杰克" })
                        }
                    >
                        修改全局状态
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
