import { Context } from '../context';
import { Component, Value } from '../../common';
import * as _Cookies from 'cookies';
import { Cookies } from './cookies-protocol';

@Component()
export class CookiesFactory {

    @Value('cookies.keys')
    protected keys?: string[];

    @Value('cookies.secure')
    protected secure?: boolean;

    async create(): Promise<Cookies> {
        const cookies = new _Cookies(Context.getRequest() as any, Context.getResponse() as any, {
            keys: this.keys,
            secure: this.secure
        });
        return <Cookies>cookies;
    }
}
