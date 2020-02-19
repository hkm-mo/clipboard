import ObjectExchangeServerApi from "./ObjectExchangeServerApi";
import ObjectExchangeSubscription from "./ObjectExchangeSubscription";
import ClipboardManager from "./ClipboardManager";
import * as env from "dotenv";

env.config();

let oxs = new ObjectExchangeServerApi(process.env.ENDPOINT);

class LoadingMask {
    private maskDom: HTMLElement;
    constructor(maskDom: HTMLElement) {
        this.maskDom = maskDom
    }

    show() {
        this.maskDom.classList.add("ready");
        setTimeout(() => {
            this.maskDom.classList.add("active");
        }, 0);
    }

    hide() {
        this.maskDom.classList.remove("active");
        setTimeout(() => {
            this.maskDom.classList.remove("ready");
        }, 300);
    }
}

function goNextStep(current: HTMLElement, next: HTMLElement) {
    current.classList.add("slideLeft");
    next.classList.add("active", "slideRight");
    setTimeout(()=> {
        next.classList.remove("slideRight");
    }, 0);
    setTimeout(()=> {
        current.classList.remove("slideLeft", "active");
    }, 300);
}

window.addEventListener("DOMContentLoaded", () => {
    let channelId: string;
    let subscription: ObjectExchangeSubscription;
    let loadingMask = new LoadingMask(document.getElementById("loadingMask"));
    let steps = document.querySelectorAll("form.setupStep") as NodeListOf<HTMLFormElement>;
    for (const form of steps) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            switch (this.getAttribute("data-step")) {
                case "channel":
                    loadingMask.show();
                    channelId = this["channelId"].value;
                    oxs.channelExists(channelId).then(isExists => {
                        goNextStep(this, steps[isExists ? 1 : 2]);
                        loadingMask.hide();
                    });
                    break;
                case "password":
                    loadingMask.show();
                    oxs.subscribe(channelId, this["password"].value).then(subscription => {
                        startSync(subscription);
                        goNextStep(this, steps[3]);
                    }).catch(reason => {
                        console.log(reason);
                        alert(reason);
                    }).finally(()=> {
                        loadingMask.hide();
                    });
                    break;
                case "channelCreate":
                    if (this["password"].value == this["retypeCreatePw"].value) {
                        loadingMask.show();
                        oxs.createChannel(channelId, this["password"].value).then(subscription => {
                            startSync(subscription);
                            goNextStep(this, steps[3]);
                        }).catch(reason => {
                            console.log(reason);
                            alert(reason);
                        }).finally(()=> {
                            loadingMask.hide();
                        });
                    } else {
                        alert("Passwords did not match!")
                    }
                    break;
                case "syncStatus":
                    break;
            }
        })
    }
    function startSync(subscription: ObjectExchangeSubscription) {
        let clipboard = new ClipboardManager();
        clipboard.onChange(data => {
            subscription.publish(JSON.stringify(data));
        })
        subscription.onUpdate(data => {
            try{
                var clipData = JSON.parse(data);
                clipboard.set({
                    text: clipData.text || null,
                    html: clipData.html || null,
                    rtf: clipData.rtf || null,
                    image: clipData.image || null
                });
            } catch(e) {
                console.log(e);
            }
        })
    }
});