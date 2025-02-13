
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
let currentFilePath = null; // Track the currently opened file

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');

    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        currentFilePath = null;
                        win.webContents.send('new-file');
                    }
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
                        if (filePaths.length > 0) {
                            currentFilePath = filePaths[0];
                            const content = fs.readFileSync(currentFilePath, 'utf-8');
                            win.webContents.send('open-file', content);
                        }
                    }
                },
                {
                    label: 'Save File',
                    accelerator: 'CmdOrCtrl+S',
                    click: async () => {
                        if (currentFilePath) {
                            win.webContents.send('save-file', currentFilePath);
                        } else {
                            const { filePath } = await dialog.showSaveDialog();
                            if (filePath) {
                                currentFilePath = filePath;
                                win.webContents.send('save-file', filePath);
                            }
                        }
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'copy' }, { role: 'paste' }]
        },
        {
            label: 'View',
            submenu: [{ role: 'reload' }, { role: 'toggledevtools' }]
        }
    ]);

    Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC handlers for file operations
ipcMain.on('save-file-content', (event, filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf-8');
});
