import { clipboard, Clipboard, nativeImage } from "electron";
import * as EventEmitter from "events";

export default class ClipboardManager {
    private timer:NodeJS.Timeout;
    private eventEmitter = new EventEmitter();
    private lastClipboardData: ClipboardData;
    

    constructor() {
        this.timer = setInterval(()=>{
            this.pullChange();
        }, 200);
    }

    private pullChange() : void {
        let clipboardData = {
            text: clipboard.readText(),
            html: clipboard.readHTML(),
            image: clipboard.readImage().toDataURL(),
            rtf: clipboard.readRTF(),
            bookmark: clipboard.readBookmark()?.url
        } as ClipboardData;

        if (this.lastClipboardData != null) {
            let isChanged = false;
            for (const key in clipboardData) {
                if (clipboardData[key as keyof ClipboardData] !== this.lastClipboardData[key as keyof ClipboardData]) {
                    isChanged = true;
                    break;
                }
            }
            if (!isChanged) {
                return;
            }

            this.lastClipboardData = clipboardData;
            this.eventEmitter.emit("change", clipboardData);
        } else {
            this.lastClipboardData = clipboardData;

        }
        
    }

    public onChange(func: (data: ClipboardData)=>void) {
        this.eventEmitter.addListener("change", func);
    }

    public set(data: ClipboardData) {
        clipboard.write({
            text: data.text,
            html: data.html,
            rtf: data.rtf,
            image: data.image ? nativeImage.createFromDataURL(data.image) : null,
            bookmark: data.bookmark
        })
    }
}

interface ClipboardData {
    text?: string;
    html?: string;
    image?: string;
    rtf?: string;
    bookmark?: string;
}

interface ClipboardInfo {
    text:string
}
