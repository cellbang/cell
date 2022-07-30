import { Component, Optional, Value } from '@malagu/core';
import { Client, ClientOptions } from '@elastic/elasticsearch';

@Component(ElasticsearchService)
export class ElasticsearchService extends Client {

    constructor(
        @Optional() @Value('malagu.elasticsearch.client') options: ClientOptions
    ) {
        super(options);
    }

}

