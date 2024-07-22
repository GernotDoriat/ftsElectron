import { writable } from "svelte/store"



function createStore() {
    const { subscribe, set, update } = writable([], start)

    function start() {
        //logI('START playerStore');
        return stop
    }
    function stop() {
        //logI('STOP playerStore');
        return
    }

    return {
        subscribe,
        set,
        reset: () => {
            update(store => {
                store = { ...initialData }
                return store
            })
        },

        add: (fileName, key, keyOffset, keyValue) => {
            update((store) => {
                let item = store.find((o) => o.fileName == fileName && o.key == key && o.keyOffset == keyOffset)
                //console.log(item)
                if (item)
                    item.keyValue = keyValue
                else
                    store.push({ fileName: fileName, key: key, keyOffset: keyOffset, keyValue: keyValue })
                console.log('STORE', store)
                return store
            })
        },



    }
}

export const ListStore = createStore()
