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
        clear: () => {
            storeContent = []
            update(store => {
                store = storeContent
                return store
            })
        },
        init: (list) => {
            storeContent = [...list]
            update(store => {
                store = storeContent
                return store
            })
        },

        setItem: (fileName, key, keyOffset, keyValue) => {
            console.log(`setItem ${fileName} , ${key} , ${keyOffset} , ${keyValue}`)
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
        getItem: (fileName, key, keyOffset) => {
            console.log(`getItem ${fileName} , ${key} , ${keyOffset}`)
            console.log('storeContent', storeContent)
            return storeContent.find((o) => o.fileName == fileName && o.key == key && o.keyOffset == keyOffset)
        },




        getCsv: () => {
            let csv = 'fileName;key;keyOffset;keyValue\n'
            storeContent.forEach(row => {
                csv += `${row.fileName};${row.key};${row.keyOffset};${row.keyValue}\n`
            })
            return csv

        },
        getFileName: () => {
            if (storeContent.length > 0)
                return storeContent[0].key
            return 'gaga'
        },

    }
}

export const ListStore = createStore()
