
import * as uuid from "uuid/v4";
import Cryptr from "./Cryptr";
import { connect } from "./connect";
import ObjectExchangeSubscription from "./ObjectExchangeSubscription";

export default class ObjectExchangeServerApi {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    channelExists(channelId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            connect(this.endpoint, channelId, { method: "POST" })
                .then(res => {
                    let data = res.json() as ObjectExchangeServerResponse;
                    resolve(data.status != 404);
                })
                .catch(reason => {
                    reject(reason);
                });
        });
    }

    createChannel(channelId: string, password: string): Promise<ObjectExchangeSubscription> {
        return new Promise<ObjectExchangeSubscription>((resolve, reject) => {
            let answer = uuid();
            let cryptr = new Cryptr(password);
            let form = new URLSearchParams();
            form.append("channelId", channelId);
            form.append("question", cryptr.encrypt(answer, "base64"));
            form.append("answer", answer);

            connect(this.endpoint, "", { method: "POST", body: form })
                .then(res => {
                    let data = res.json() as ObjectExchangeServerResponse;
                    if (data.status == 200 && data.subscriberId) {
                        resolve(new ObjectExchangeSubscription(this.endpoint, channelId, data.subscriberId, cryptr));
                    } else {
                        reject("Unrecognized response.");
                    }
                })
                .catch(reason => {
                    reject(reason);
                });
        });
    }

    subscribe(channelId: string, password: string): Promise<ObjectExchangeSubscription> {
        return new Promise<ObjectExchangeSubscription>((resolve, reject) => {

            connect(this.endpoint, channelId, { method: "POST" })
                .then(res => {
                    let data = res.json() as ObjectExchangeServerResponse;
                    if (data.status == 200 && data.question) {
                        try {
                            let cryptr = new Cryptr(password);
                            let form = new URLSearchParams();
                            form.append("answer", cryptr.decrypt(data.question));

                            connect(this.endpoint, channelId, { method: "POST", body: form })
                                .then(res => {
                                    let data = res.json() as ObjectExchangeServerResponse;
                                    if (data.status == 200 && data.subscriberId) {
                                        resolve(new ObjectExchangeSubscription(this.endpoint, channelId, data.subscriberId, cryptr));
                                    } else {
                                        reject(data);
                                    }
                                })
                                .catch(reason => {
                                    reject(reason);
                                });
                        } catch (err) {
                            if (err instanceof Error) {
                                reject(err.message);
                            } else {
                                reject(err);
                            }
                        }
                    } else {
                        reject("Unrecognized response.");
                    }
                })
                .catch(reason => {
                    reject(reason);
                })
        });
    }
}



interface ObjectExchangeServerResponse {
    status: number,
    subscriberId?: string,
    question?: string
}