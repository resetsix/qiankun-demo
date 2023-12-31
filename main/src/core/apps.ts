const microApps = [
  {
    name: "console", // name 就是微应用的名称，地位等同于 ID，只能唯一
    entry: process.env.REACT_APP_MICRO_APP_CONSOLE!, // 微应用的入口地址，包含IP和端口号
    activeRule: "/console", // 微应用匹配的路由：微应用的激活规则，当基座的路由发生变化时，会去匹配这里的路由，匹配成功则加载对应的微应用\
  },
  {
    name: "studio",
    entry: process.env.REACT_APP_MICRO_APP_STUDIO!,
    activeRule: "/studio",
  },
]

const apps = microApps.map(item => {
  return {
    ...item,
    container: '#container', // 子应用挂载的div
    props: {
      routerBase: item.activeRule, // 下发基础路由
    }
  }
})

export default apps
