import { MethodArgsResolver } from './resolver-protocol';
import { Context } from '../context';
import { PATH_PARMAS_ATTR } from '../handler-adapter';
import { ParamMetadata } from '../../annotation/param';
import { Component } from '../../../common/annotation';

@Component(MethodArgsResolver)
export class ParamMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 300;

    async resolve(metadata: any, args: any[]): Promise<void> {
        const params: any = Context.getAttr(PATH_PARMAS_ATTR);
        const paramMetadatas = <ParamMetadata[]>metadata.paramMetadata;
        if (paramMetadatas) {
            for (const m of paramMetadatas) {
                args[m.parameterIndex] = m.name ? params[m.name] : params;
            }
        }
    }
}
