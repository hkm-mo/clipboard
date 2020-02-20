import { App, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import * as path from "path";


export default class MainUi {
    private app: App;
    private mainWindow: Electron.BrowserWindow;
    private tray: Tray;

    constructor(app:App) {
        this.app = app;

        
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => {
            this.createTray();
            this.createWindow();
        });

        app.on("activate", () => {
            // On OS X it"s common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });

        app.on('second-instance', () => {
            if (this.mainWindow !== null) {
                this.mainWindow.show();
                this.mainWindow.focus();
            }
        });

        
    }

    private createTray() {
        this.tray = new Tray(path.join(__dirname, "../icon/clipboard-color.ico"));
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show Config Window',
                click: () => {
                    this.mainWindow.show();
                    this.mainWindow.focus();
                }
            },
            { type: "separator" },
            {
                label: "Exit",
                click: () => {
                    if (this.mainWindow) {
                        this.mainWindow.destroy();
                    }
                    this.app.quit();
                }
            }
        ])
        this.tray.setToolTip("Sync My Clipboard");
        this.tray.setContextMenu(contextMenu);
    }

    private createWindow() {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
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
        this.mainWindow.loadFile(path.join(__dirname, "../index.html"));
    
        this.mainWindow.setMenu(null);
    
        // Open the DevTools.
        if (process.env.DEBUG) {
            this.mainWindow.webContents.openDevTools({ mode: "undocked" });
        }
    
        this.mainWindow.on("close", event => {
            event.preventDefault();
            this.mainWindow.hide();
        })
    
        // Emitted when the window is closed.
        this.mainWindow.on("closed", () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.mainWindow = null;
        });
    }
    
}