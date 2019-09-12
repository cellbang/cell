import { MethodArgsResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../../common/annotation';
import { BodyMetadata } from '../../annotation/body';

@Component(MethodArgsResolver)
export class BodyMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 100;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const body: any = Context.getCurrent().request.body;
        const bodyMetadatas = <BodyMetadata[]>metadata.bodyMetadata;
        if (bodyMetadatas && body !== undefined) {
            for (const m of bodyMetadatas) {
                args[m.parameterIndex] = m.name ? body[m.name] : body;
            }
        }
    }
}
