import { initGlobalState } from 'qiankun'

// 父应用的初始state
const initialState: { [key: string]: any } = {}

const actions = initGlobalState(initialState)

// actions.onGlobalStateChange((newState, prev) => {
//   // state: 变更后的状态; prev 变更前的状态
//   console.log('main =>>>', JSON.stringify(newState), JSON.stringify(prev))

//   for (const key in newState) {
//     initialState[key] = newState[key]
//   }
// })

export default actions