import { Jexl } from 'jexl';

export class JexlEngineProvider {

    protected jexlEngine: any;

    provide(): any {

        if (!this.jexlEngine) {
            this.jexlEngine = new Jexl();
            this.jexlEngine.addTransform('replace',
                (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
            this.jexlEngine.addTransform('regexp',  (pattern: string, flags?: string) => new RegExp(pattern, flags));

        }
        return this.jexlEngine;
    }

}
