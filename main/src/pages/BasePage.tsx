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
