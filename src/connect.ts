import * as url from "url";
import * as request from "request";

export interface HttpRequestOptions extends request.CoreOptions {
}

export class HttpResponse {
    private req: request.Request;
    private res: request.Response;
    private body: Buffer;

    public get statusCode(): number | undefined {
        return this.res.statusCode;
    }

    constructor(res: request.Response, req: request.Request, body: Buffer) {
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
    if (requestOptions) {
        if (requestOptions.body) {
            if (requestOptions.body instanceof URLSearchParams) {
                requestOptions.body = requestOptions.body.toString();
                if (!requestOptions.headers) {
                    requestOptions.headers = {};
                }
                requestOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
        }
        if (requestOptions.timeout) {
            requestOptions.timeout *= 1000;
        }
    }

    return new Promise((resolve, reject) => {
        let req = request({
            url: url.resolve(endpoint, channelId),
            timeout: 5000,
            encoding: null,
            ...requestOptions
        }, (error, response, body) =>{
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(new HttpResponse(response, req, body))
        });

    });
}