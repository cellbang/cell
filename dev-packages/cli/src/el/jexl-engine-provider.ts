import { Jexl } from 'jexl';

export class JexlEngineProvider {

    protected jexlEngine: any;

    provide(): any {

        if (!this.jexlEngine) {
            this.jexlEngine = new Jexl();
        }
        return this.jexlEngine;
    }

}
