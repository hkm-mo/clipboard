import * as crypto from "crypto";

const algorithm = "aes-256-gcm";

// Refer: https://github.com/MauriceButler/cryptr/blob/master/index.js
export default class Cryptr {
    private password: string;
    private ivLength = 16;
    private saltLength = 64;
    private tagLength = 16;
    private tagPosition = this.saltLength + this.ivLength;
    private encryptedPosition = this.tagPosition + this.tagLength;
    private encoding: crypto.Utf8AsciiBinaryEncoding = "utf8";

    constructor(key: string)
    constructor(key: string, encoding?: crypto.Utf8AsciiBinaryEncoding) {
        this.password = key;
        if (encoding) {
            this.encoding = encoding;
        }
    }

    private getKey(salt: Buffer) {
        return crypto.pbkdf2Sync(this.password, salt, 100000, 32, "sha512");
    }

    encrypt(value: string, outputFormat: "base64"): string;
    encrypt(value: string, outputFormat: "buffer"): Buffer;
    encrypt(value: string, outputFormat: "base64" | "buffer") {
        if (value == null) {
            throw new Error("value must not be null or undefined");
        }

        let iv = crypto.randomBytes(this.ivLength);
        let salt = crypto.randomBytes(this.saltLength);

        let key = this.getKey(salt);

        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = Buffer.concat([cipher.update(String(value), this.encoding), cipher.final()]);

        const tag = cipher.getAuthTag();

        if (outputFormat == "buffer") {
            return Buffer.concat([salt, iv, tag, encrypted]);
        } else {
            return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
        }
    };


    decrypt(value: ArrayBuffer): string;
    decrypt(value: Buffer): string;
    decrypt(value: string): string;
    decrypt(value: string | Buffer | ArrayBuffer): string {
        if (value == null) {
            throw new Error("value must not be null or undefined");
        }

        let buffer: Buffer;
        if (value instanceof Buffer) {
            buffer = value;
        } else if (value instanceof ArrayBuffer){
            buffer = Buffer.from(value);
        } else {
            buffer = Buffer.from(value, "base64");
        }

        let salt = buffer.slice(0, this.saltLength);
        let iv = buffer.slice(this.saltLength, this.tagPosition);
        let tag = buffer.slice(this.tagPosition, this.encryptedPosition);
        let encrypted = buffer.slice(this.encryptedPosition);

        let key = this.getKey(salt);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);

        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final(this.encoding);
    };
}