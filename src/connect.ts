import * as path from "path";
import * as http from "http";
import * as https from "https";

export interface HttpRequestOptions extends http.RequestOptions {
    body?: any
}
export type HttpIncomingMessage = http.IncomingMessage;
export type HttpClientRequest = http.ClientRequest;

export class HttpResponse {
    private req: HttpClientRequest;
    private res: HttpIncomingMessage;
    private body: Buffer;

    public get statusCode(): number | undefined {
        return this.res.statusCode;
    }

    constructor(res: HttpIncomingMessage, req: HttpClientRequest, body: Buffer) {
        this.req = req;
        this.res = res;
        this.body = body;
    }

    json(): any;
    json(encoding?:string): any {
        return JSON.parse(this.body.toString(encoding || "utf8"));
    }

    buffer(): Buffer {
        return this.body;
    }

}

export function connect(endpoint: string, channelId: string, requestOptions: HttpRequestOptions): Promise<HttpResponse> {
    let request = (endpoint.startsWith("https:") ? https : http).request as
        (url: string, options: HttpRequestOptions, callback?: (res: HttpIncomingMessage) => void) => HttpClientRequest;

    let body: any = null;
    if (requestOptions && requestOptions.body) {
        if (requestOptions.body instanceof URLSearchParams) {
            body = requestOptions.body.toString();
            if (!requestOptions.headers) {
                requestOptions.headers = {};
            }
            requestOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
    }

    return new Promise((resolve, reject) => {
        let req = request(path.join(endpoint, channelId), {
            timeout: 5,
            ...requestOptions
        }, res => {
            let body: Uint8Array[] = [];
            res.on('data', (chunk) => {
                body.push(chunk);
            });

            res.on('end', () => {
                resolve(new HttpResponse(res, req, Buffer.concat(body)));
            });
        });

        req.on('error', (e) => {
            reject(`problem with request: ${e.message}`);
        });

        if (requestOptions.body) {
            req.write(body || requestOptions.body);
        }
        req.end();

    });
}