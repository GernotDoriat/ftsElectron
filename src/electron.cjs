const windowStateManager = require('electron-window-state')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const contextMenu = require('electron-context-menu')
const serve = require('electron-serve')
const path = require('path')
const fs = require('fs').promises





try {
	require('electron-reloader')(module)
} catch (e) {
	console.error(e)
}

const serveURL = serve({ directory: '.' })
const port = process.env.PORT || 5173
const dev = !app.isPackaged
let mainWindow

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 800,
		defaultHeight: 600,
	})

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'default',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32,
		},
		minHeight: 450,
		minWidth: 500,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.cjs'),
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
	})

	windowState.manage(mainWindow)

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
		mainWindow.focus()
	})

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow)
	})

	return mainWindow
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻',
		},
	],
})

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e)
		setTimeout(() => {
			loadVite(port)
		}, 200)
	})
}

function createMainWindow() {
	mainWindow = createWindow()
	mainWindow.once('close', () => {
		mainWindow = null
	})

	if (dev) loadVite(port)
	else serveURL(mainWindow)
}

app.once('ready', createMainWindow)
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow()
	}
})
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`)
})



ipcMain.handle('extract-text', async (event, filePath) => {
	try {
		//console.log('Received file path:', filePath)
		const { getTextExtractor } = await import('office-text-extractor')
		const fileBuffer = await fs.readFile(filePath)
		//console.log('File buffer:', fileBuffer)

		// Testen Sie die Struktur des Extraktors
		const extractor = getTextExtractor(fileBuffer)
		//console.log('Extractor:', extractor)

		if (typeof extractor.extractText !== 'function') {
			throw new Error('extractText is not a function')
		}

		const text = await extractor.extractText({ input: fileBuffer, type: 'buffer' })
		//console.log('Extracted text:', text)
		return { success: true, text }
	} catch (error) {
		console.error('Error extracting text:', error)
		return { success: false, error: error.message }
	}
})


ipcMain.handle('write-csv', (event, content) => {
	try {
		const options = { defaultPath: app.getPath('downloads') + '/electron.csv' }
		dialog.showSaveDialog(null, options).then(({ filePath }) => {
			fs.writeFile(filePath, content)
		})
	} catch (error) {
		console.error('Error:', error)
		return { success: false, error: error.message }
	}
})

