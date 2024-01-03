import "./App.css";
import { useUserStore } from "./store/useUserStore";

const App = ({ ...props }) => {
    const { onGlobalStateChange } = props;
    const { token, updatetoken } = useUserStore();

    onGlobalStateChange((state: any) => {
        updatetoken(state.token);
        console.log("demo01更新state", state.token);
    });

    return (
        <div className="App">
            <div>demo01的token: {token}</div>
            <button
                onClick={() => {
                    props.setGlobalState({ token: "eyab" });
                }}
            >
                修改用户名
            </button>
        </div>
    );
};

export default App;
