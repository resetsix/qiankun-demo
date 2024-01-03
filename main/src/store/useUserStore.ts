import { MicroAppStateActions, initGlobalState } from 'qiankun'
import { create } from 'zustand'

interface useUserStoreProps {
    user: any
    updateUser: (props: any) => void
    deleteUser: (props: any) => void
    actions: MicroAppStateActions
}

export const useUserStore = create<useUserStoreProps>(set => {
    const actions = initGlobalState({ user: null })

    return {
        user: null,
        updateUser: (props) =>
            set((state) => {
                window.localStorage.setItem('token', JSON.stringify(props.token));
                return ({ user: { ...state.user, ...props } });
            })
        ,
        deleteUser: () => set(() => ({ user: null })),
        actions
    };
})
