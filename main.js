
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process"); // Use spawn for better performance

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile("index.html");

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// Function to execute Python code
ipcMain.handle("run-python", async (_, code) => {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, "python_script.py");
        const pythonProcess = spawn("python", [scriptPath]);

        let output = "";
        let errorOutput = "";

        // Capture standard output
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });

        // Capture error output
        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        // Handle process exit
        pythonProcess.on("close", () => {
            if (errorOutput) {
                resolve(`❌ Error: ${errorOutput.trim()}`);
            } else {
                resolve(output.trim());
            }
        });

        // Send Python code to stdin
        pythonProcess.stdin.write(code);
        pythonProcess.stdin.end();
    });
});

// Save Notebook
ipcMain.handle("save-notebook", async (_, content) => {
    const { filePath } = await dialog.showSaveDialog({
        filters: [{ name: "Notebook", extensions: ["json"] }]
    });

    if (!filePath) return;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
});

// Load Notebook
ipcMain.handle("load-notebook", async () => {
    const { filePaths } = await dialog.showOpenDialog({
        filters: [{ name: "Notebook", extensions: ["json"] }]
    });

    if (!filePaths.length) return null;
    return JSON.parse(fs.readFileSync(filePaths[0], "utf-8"));
});
