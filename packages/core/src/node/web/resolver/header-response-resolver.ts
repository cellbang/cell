import { ResponseResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../../common/annotation';
import { ResponseHeaderMetadata } from '../../annotation/header';

@Component(ResponseResolver)
export class HeaderResponseResolver implements ResponseResolver {
    readonly priority = 500;
    async resolve(metadata: any): Promise<void> {
        const response = Context.getCurrent().response;
        const headerMetadatas = <ResponseHeaderMetadata[]>metadata.responseHeaderMetadata;
        if (headerMetadatas) {
            for (const m of headerMetadatas) {
                response.setHeader(m.name, m.value);
            }
        }
    }
}
