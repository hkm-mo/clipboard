import ClipboardManager from "./ClipboardManager";

export default class ClipboardSyncService {
    private clipboardManager:ClipboardManager;
    constructor() {
        // this.clipboardManager = new ClipboardManager();
        // this.clipboardManager.onChange((data)=> {
        //     console.log(data);
        // });
    }

    async subscribe(){
        let response = await fetch("/subscribe");
    }

    async channelExists() {
        
    }
}