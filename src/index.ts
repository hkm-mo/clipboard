import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import * as path from "path";
import * as env from "dotenv";

env.config();

let mainWindow: Electron.BrowserWindow;
let tray: Tray;

function createWindow() {
    tray = new Tray(path.join(__dirname, "../icon/clipboard-color.ico"));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Config Window',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            }
        },
        { type: "separator" },
        {
            label: "Exit",
            click: () => {
                if (mainWindow) {
                    mainWindow.destroy();
                }
                app.quit();
            }
        }
    ])
    tray.setToolTip("Sync My Clipboard");
    tray.setContextMenu(contextMenu);

    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 300,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
        },
        resizable: false,
        icon: path.join(__dirname, "../icon/clipboard-color.ico"),
        width: 340,
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../index.html"));

    mainWindow.setMenu(null);

    // Open the DevTools.
    if (process.env.DEBUG) {
        mainWindow.webContents.openDevTools({ mode: "undocked" });
    }

    mainWindow.on("close", event => {
        event.preventDefault();
        mainWindow.hide();
    })

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
