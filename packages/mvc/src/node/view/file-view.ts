import { Autowired, Component, Logger, Value } from '@malagu/core';
import { View } from './view-protocol';
import { HttpHeaders, HttpStatus } from '@malagu/web';
import { Context, Response } from '@malagu/web/lib/node';
import * as isStream from 'is-stream';
import { Stream } from 'stream';
import { FILE_VIEW_NAME } from '../annotation/file';
import { ViewMetadata } from '../annotation/view';
import { createReadStream } from 'fs';
import { join } from 'path';

@Component(View)
export class FileView implements View {

    readonly contentType = 'application/octet-stream';

    readonly priority = 600;

    @Autowired(Logger)
    protected readonly logger: Logger;

    @Value('malagu.mvc.baseFileDir')
    protected readonly baseFileDir: any;

    async render(model: any, { metadata }: ViewMetadata): Promise<void> {
        if (metadata?.file) {
            model = createReadStream(join(__dirname, this.baseFileDir, metadata.file));
        }
        const response = Context.getCurrent().response;
        if (isStream(model)) {
            Context.setSkipAutoEnd(true);
            this.streamDownload(response, model);
        } else {
            if (Buffer.isBuffer(model)) {
                response.setHeader(HttpHeaders.CONTENT_LENGTH, model.byteLength);
            }
            response.body = model;
        }
    }

    protected streamDownload(response: Response, stream: Stream): void {
        stream.on('error', error => {
            this.handleError(response, error);
        });
        response.on('error', error => {
            this.handleError(response, error);
        });
        response.on('close', () => {
            if (typeof (stream as any).destroy === 'function') {
                (stream as any).destroy();
            }
        });
        stream.pipe(response);
    }

    protected async handleError(response: Response, reason: string | Error, status: number = HttpStatus.INTERNAL_SERVER_ERROR): Promise<void> {
        this.logger.error(reason);
        response.status(status).send('Unable to download file.').end();
    }

    support({ viewName }: ViewMetadata): Promise<boolean> {
        return Promise.resolve(viewName === FILE_VIEW_NAME);
    }
}
