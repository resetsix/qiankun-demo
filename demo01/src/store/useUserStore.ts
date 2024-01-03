import { create } from 'zustand'

interface useUserStoreProps {
    token: string | null
    updatetoken: (props: any) => void
    deletetoken: (props: any) => void
}

export const useUserStore = create<useUserStoreProps>((set) => ({
    token: null,
    updatetoken: (props) => set(() => ({ token: props })),
    deletetoken: () => set(() => ({ token: null })),
}))
