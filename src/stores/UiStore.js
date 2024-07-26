
import { writable } from "svelte/store"


function createUiStore() {


    let storeContent = { busy: false, busyText: '', clockTimer: 0 }

    const { subscribe, update } = writable(storeContent, start)

    function start() {
        console.log("START UiStore")
        return stop
    }
    function stop() {
        console.log("STOP UiStore")
        return
    }

    return {
        subscribe,

        setBusy: () => {
            update((store) => {
                store.busy = true
                startClock()
                return store
            })
        },
        clearBusy: () => {
            stopClock()
            update((store) => {
                store.busyText = ''
                store.busy = false
                return store
            })
        },


    }



    function startClock(params) {
        let msecs = 0
        storeContent.clockTimer = setInterval(() => {
            msecs += 100
            update((store) => {
                store.busyText = `${(msecs / 1000).toFixed(2)}`
                return store
            })
        }, 100)
    }

    function stopClock() {
        console.warn('STOP CLOCK')
        clearInterval(storeContent.clockTimer)
    }

}

export const UiStore = createUiStore()
