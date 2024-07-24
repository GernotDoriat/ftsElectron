const windowStateManager = require('electron-window-state')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const contextMenu = require('electron-context-menu')
const serve = require('electron-serve')
const path = require('path')
const fs = require('fs').promises

const Papa = require('papaparse')





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

ipcMain.handle('selectFolder', async (event) => {
	try {
		let path = await dialog.showOpenDialog({ properties: ['openDirectory'] })
		console.log('path', path)
		let files = await getFiles(path.filePaths[0])
		console.log('files', files)
		return { success: true, files: files }

	} catch (error) {
		console.error('Error:', error)
		return { success: false, error: error.message }
	}
})

ipcMain.handle('selectFile', async (event) => {
	try {
		let path = await dialog.showOpenDialog()
		console.log('path', path)
		return { success: true, file: path.filePaths[0] }
	} catch (error) {
		console.error('Error:', error)
		return { success: false, error: error.message }
	}
})

ipcMain.handle('selectCsv', async (event) => {
	try {
		let path = await dialog.showOpenDialog({ filters: [{ name: 'CSV', extensions: ['csv'] },] })
		let csvText = await fs.readFile(path.filePaths[0], 'utf8')
		let parsed = doParse(csvText)
		return { success: true, json: parsed }
	} catch (error) {
		console.error('Error:', error)
		return { success: false, error: error.message }
	}
})


function doParse(csvText) {
	// Parse local CSV file
	let result = []
	Papa.parse(csvText, {
		complete: function (parsed) {
			if (Array.isArray(parsed.data) && parsed.data.length > 0) {
				let rows = parsed.data
				for (let r = 1; r < rows.length; r++) {
					let row = rows[r]
					if (row.length == rows[0].length) {
						resultItem = {}
						for (let k = 0; k < rows[0].length; k++)
							resultItem[rows[0][k]] = row[k]
						result.push(resultItem)
					}
				}
			}
		}
	})
	return result
}


async function getFiles(dir, files_) {
	files_ = files_ || []
	var fileNames = await fs.readdir(dir)
	fileNames = fileNames.filter((o) => !o.startsWith('.'))
	//console.log(fileNames)
	for (var fileName of fileNames) {
		let filePath = dir + '/' + fileName
		//console.log("FP " + filePath)
		let stat = await fs.stat(filePath)
		//console.log(stat)
		if (stat.isFile()) {
			//console.log("FILE " + filePath)
			files_.push(filePath)
		} else {
			//console.warn("DIR " + filePath)
			await getFiles(filePath, files_)
		}
	}
	return files_
}


