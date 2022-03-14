import { Jexl } from 'jexl';

export class JexlEngineProvider {

    protected jexlEngine: any;

    provide(): any {

        if (!this.jexlEngine) {
            this.jexlEngine = new Jexl();
            this.jexlEngine.addTransform('replace',
                (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
            this.jexlEngine.addTransform('regexp',  (pattern: string, flags?: string) => new RegExp(pattern, flags));
            this.jexlEngine.addTransform('toObjects', (arr: any[]) => arr?.map(item => ({ item })));
            this.jexlEngine.addTransform('suffix', (val: string | any[], suffix: string) => {
                let realVal = val;
                if (Array.isArray(val)) {
                    realVal = val.shift()?.item;
                }
                return realVal ? `${realVal}${suffix}` : '';
            });
            this.jexlEngine.addTransform('prefix', (val: string | any[], prefix: string) => {
                let realVal = val;
                if (Array.isArray(val)) {
                    realVal = val.shift()?.item;
                }
                return realVal ? `${prefix}${realVal}` : '';
            });
        }
        return this.jexlEngine;
    }

}
