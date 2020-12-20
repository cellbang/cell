const { scf } = require('tencentcloud-sdk-nodejs');
const crypto = require('crypto');
const request = require('request');

const ScfClient = scf.v20180416.Client;

class HttpConnection {
    static doRequest(method: string, url: string, data: any, callback: any, opt = {}) {
        const req: any = {
            method: method,
            url: url
        };
        Object.assign(req, opt);
        request(req, function (error: Error, response: any, body: any) {
            callback(error, response, body);
        });
    }
}

export class ScfClientExt extends ScfClient {

    constructor(credential: any, region: string) {
        super(credential, region);
    }

    doRequest(action: string, req: any) {
        let params = req; // this.mergeData(req);
        const optional = {
            timeout: this.profile.httpProfile.reqTimeout * 1000
        };
        params = this.formatRequestData(action, params, optional);
        return new Promise(
            (resolve, reject) => {
                HttpConnection.doRequest(this.profile.httpProfile.reqMethod,
                    this.profile.httpProfile.protocol + this.getEndpoint() + this.path,
                    params, (error: Error, response: any, data: any) => {
                        if (error) {
                            reject(error);
                        } else if (response.statusCode !== 200) {
                            reject(new Error(response.statusMessage));
                        } else {
                            data = JSON.parse(data);
                            if (data.Response.Error) {
                                reject(new Error(data.Response.Error.Message));
                            } else {
                                resolve(data.Response);
                            }
                        }
                    },  // callback
                    optional) // doRequest
                    ;
            });
    }

    formatRequestData(action: string, params: any, optional: any) {
        const contentType = 'application/json';
        const service = 'scf';
        const newDate = new Date();
        const timestamp = Math.ceil(newDate.getTime() / 1000);
        const date = newDate.toISOString().replace(/\T.+/, '');
        optional.headers = {
            'Content-Type': contentType,
            'Host': this.endpoint,
            'X-TC-Action': action,
            'X-TC-RequestClient': this.sdkVersion,
            'X-TC-Timestamp': timestamp,
            'X-TC-Version': this.apiVersion,
            'X-TC-Region': this.region,
            'X-TC-Language': this.profile.language
        };

        const signature = this.getSignature(params, optional, date, service);

        const auth = `TC3-HMAC-SHA256 Credential=${this.credential.secretId}/${date}/${service}/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`;

        optional.headers['Authorization'] = auth;

        return params;
    }

    getSignature(params: any, optional: any, date: string, service: string) {
        // eslint-disable-next-line no-null/no-null
        optional.body = JSON.stringify(params, (k, v) => v === null ? undefined : v);
        const canonical_uri = '/';
        const canonical_querystring = '';
        const payload = optional.body;
        const payloadHash = crypto.createHash('sha256').update(payload, 'utf8').digest();
        const canonical_headers = `content-type:${optional.headers['Content-Type']}\nhost:${optional.headers['Host']}\n`;
        const signedHeaders = 'content-type;host';
        const canonicalRequest = `POST\n${canonical_uri}\n${canonical_querystring}\n${canonical_headers}\n${signedHeaders}\n${payloadHash.toString('hex')}`;
        const algorithm = 'TC3-HMAC-SHA256';
        const credentialScope = `${date}/${service}/tc3_request`;
        const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest();
        const stringToSign = `${algorithm}\n${optional.headers['X-TC-Timestamp']}\n${credentialScope}\n${canonicalRequestHash.toString('hex')}`;
        const secretDate = this.sign(`TC3${this.credential.secretKey}`, date, false);
        const secretService = this.sign(Buffer.from(secretDate.digest('hex'), 'hex'), service, false);
        const secretSigning = this.sign(Buffer.from(secretService.digest('hex'), 'hex'), 'tc3_request', false);
        const signature = this.sign(Buffer.from(secretSigning.digest('hex'), 'hex'), stringToSign, true);
        return signature;
    }

    sign(key: string | Buffer, msg: string, hex: boolean) {
        if (hex) {
            return crypto
                .createHmac('sha256', key)
                .update(msg, 'utf8')
                .digest('hex');
        }
        return crypto.createHmac('sha256', key).update(msg, 'utf8');
    }
}
