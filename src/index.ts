import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import MainUi from "./MainUi";
import * as path from "path";
import * as env from "dotenv";

env.config();

const instanceLock = app.requestSingleInstanceLock();

if (instanceLock) {
    new MainUi(app);
} else {
    app.quit();
}
