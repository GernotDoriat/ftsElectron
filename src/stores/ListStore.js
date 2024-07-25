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

        setItem: (fileName, keyWord, keyOffset, keyValue) => {
            console.log(`setItem ${fileName} , ${keyWord} , ${keyOffset} , ${keyValue}`)
            update((store) => {
                let item = store.find((o) => o.fileName == fileName && o.keyWord == keyWord && o.keyOffset == keyOffset)
                //console.log(item)
                if (item)
                    item.keyValue = keyValue
                else
                    store.push({ fileName: fileName, keyWord: keyWord, keyOffset: keyOffset, keyValue: keyValue })
                console.log('STORE', store)
                return store
            })
        },
        getItem: (fileName, keyWord, keyOffset) => {
            console.log(`getItem ${fileName} , ${keyWord} , ${keyOffset}`)
            console.log('storeContent', storeContent)
            return storeContent.find((o) => o.fileName == fileName && o.keyWord == keyWord && o.keyOffset == keyOffset)
        },




        getCsv: () => {
            let csv = 'fileName;keyWord;keyOffset;keyValue\n'
            storeContent.forEach(row => {
                csv += `${row.fileName};${row.keyWord};${row.keyOffset};${row.keyValue}\n`
            })
            return csv

        },
        getFileName: () => {
            if (storeContent.length > 0)
                return storeContent[0].keyWord
            return 'gaga'
        },

    }
}

export const ListStore = createStore()
