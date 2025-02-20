const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcElectron', {
	send: (channel, data) => {
		ipcRenderer.send(channel, data)
	},
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data)
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args))
	},

	invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)

})
