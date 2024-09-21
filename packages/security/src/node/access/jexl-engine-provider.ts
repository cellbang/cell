import { Component } from '@celljs/core';
import { JexlEngineProvider } from './access-protocol';
import { Jexl } from 'jexl';

@Component(JexlEngineProvider)
export class JexlEngineProviderImpl implements JexlEngineProvider<any> {

    protected jexlEngine: any;

    provide(): any {

        if (!this.jexlEngine) {
            this.jexlEngine = new Jexl();
        }
        return this.jexlEngine;
    }

}
