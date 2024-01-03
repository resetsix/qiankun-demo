import "./App.css";
import { useUserStore } from "./store/useUserStore";

const App = ({ ...props }) => {
    const { onGlobalStateChange } = props;
    const { token, updatetoken } = useUserStore();

    onGlobalStateChange((state: any) => {
        updatetoken(state.token);
        console.log("demo02更新state", state.token);
    });

    return (
        <div className="App">
            <div>demo02的token: {token}</div>
            <button
                onClick={() => {
                    props.setGlobalState({ token: "jack" });
                }}
            >
                修改用户名为jack
            </button>
        </div>
    );
};

export default App;
