import { writable } from "svelte/store"

let storeContent = []

function createStore() {
    const { subscribe, set, update } = writable(storeContent, start)

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
                store = []
                return store
            })
        },
        init: (list) => {
            update(store => {
                store = [...list]
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

        getCsv: () => {
            let csv = 'fileName;key;keyOffset;keyValue\n'
            storeContent.forEach(row => {
                csv += `${row.fileName};${row.key};${row.keyOffset};${row.keyValue}\n`
            })
            return csv

        },

    }
}

export const ListStore = createStore()
