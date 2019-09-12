import { MethodArgsResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../../common/annotation';
import { QueryMetadata } from '../../annotation/query';

@Component(MethodArgsResolver)
export class QueryMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 400;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const query: any = Context.getCurrent().request.query;
        const queryMetadatas = <QueryMetadata[]>metadata.queryMetadata;
        if (queryMetadatas && query !== undefined) {
            for (const m of queryMetadatas) {
                args[m.parameterIndex] = m.name ? query[m.name] : query;
            }
        }
    }
}
