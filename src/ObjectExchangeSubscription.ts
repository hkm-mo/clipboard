import Cryptr from "./Cryptr";
import { connect } from "./connect";

function now(): number {
    return (new Date()).getDate();
}

export default class ObjectExchangeSubscription {
    private endpoint: string;
    private channelId: string;
    private subscriberId: string;
    private cryptr: Cryptr;
    private updateEvents: ((data: any) => void)[] = [];
    private lastPoll: number;

    constructor(endpoint: string, channelId: string, subscriberId: string, cryptr: Cryptr) {
        this.endpoint = endpoint;
        this.channelId = channelId;
        this.subscriberId = subscriberId;
        this.cryptr = cryptr;

        this.poll();
    }

    private poll() {
        this.lastPoll = now();
        connect(this.endpoint, this.channelId, {
            timeout: 30,
            headers: {
                "X-SubscriberId": this.subscriberId
            }
        })
            .then(res => {
                if (res.statusCode == 200) {
                    let data = this.cryptr.decrypt(res.buffer());
                    this.updateEvents.forEach(val => val(data));
                }
            })
            .catch(reason => {
                console.log(reason);
            })
            .finally(() => {
                if (now() - this.lastPoll < 200) {
                    setTimeout(() => {
                        this.poll();
                    }, 100);
                } else {
                    console.log("retry poll");
                    this.poll();
                }
            });
    }

    onUpdate(func: (data: string) => void) {
        this.updateEvents.push(func);
    }

    publish(data: string) {
        connect(this.endpoint, this.channelId, {
            method: "PUT",
            headers: {
                "X-SubscriberId": this.subscriberId,
                "Content-Type": "application/x-binary"
            },
            body: this.cryptr.encrypt(data, "buffer")
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
            .catch(reason => {
                console.log(reason);
            })
    }

}