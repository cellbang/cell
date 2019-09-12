import { MethodArgsResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../../common/annotation';
import { RequestHeaderMetadata } from '../../annotation/header';

@Component(MethodArgsResolver)
export class HeaderMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 200;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const headers: any = Context.getCurrent().request.headers;
        const headerMetadatas = <RequestHeaderMetadata[]>metadata.requestHeaderMetadata;
        if (headerMetadatas && headers !== undefined) {
            for (const m of headerMetadatas) {
                args[m.parameterIndex] = m.name ? headers[m.name] : headers;
            }
        }
    }
}
