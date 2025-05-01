import { generateUUUID } from '@celljs/core/lib/common/utils/uuid';
import { Session } from './session-protocol';
const crc32 = require('crc/crc32');

export class SessionImpl implements Session {
    readonly id = generateUUUID();
    isNew = true;
    expire: number;
    maxAge: number;
    protected _preHash: string;
    constructor(sessionOptions: any, obj?: any) {
        if (obj) {
            this.isNew = false;
            for (const key of Object.keys(obj)) {
                (this as any)[key] = obj[key];
            }
        } else {
            this.expire = sessionOptions.maxAge + Date.now();
            this.maxAge = sessionOptions.maxAge;
        }
        this._preHash = this.hash();
    }

    protected hash() {
        return crc32(JSON.stringify(this.toJSON()));
    }

    toJSON(): any {
        const obj: any = {};
        for (const key of Object.keys(this)) {
            if (key !== 'isNew' && key[0] !== '_') {
                obj[key] = (this as any)[key];
            }
        }
        return obj;
    }

    get changed() {
        if (this._preHash !== this.hash()) {
            return true;
        }
        return false;
    }

}
