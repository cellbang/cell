import { Component, Optional, Value } from '@celljs/core';
import { Client, ClientOptions } from '@elastic/elasticsearch';

@Component(ElasticsearchService)
export class ElasticsearchService extends Client {

    constructor(
        @Optional() @Value('cell.elasticsearch.client') options: ClientOptions
    ) {
        super(options);
    }

}

