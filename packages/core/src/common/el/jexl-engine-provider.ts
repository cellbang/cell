import { Component } from '../annotation';
import { JexlEngineProvider } from './expression-protocol';
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
