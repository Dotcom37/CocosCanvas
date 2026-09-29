import {create} from "zustand";

const otherStore  = create((set) =>({
    Rooms : [],
    openSignUp:false,
    setOpenSignUp : () => set((state)=>({openSignUp: !state.openSignUp}))
}))

export default otherStore
