import { Autowired, Value } from '@malagu/core';
import { HttpError, Context } from '@malagu/web/lib/node';
import { HttpHeaders, HttpStatus } from '@malagu/http';
import { ObjectStorageService, RawCloudService } from '@malagu/cloud';
import { Controller, Get, Query } from '@malagu/mvc/lib/node';
import { contentType } from 'mime-types';

@Controller('files')
export class FileController {

    @Autowired(ObjectStorageService)
    protected readonly objectStorageService: ObjectStorageService<RawCloudService>;

    @Value('app.bucket')
    protected readonly bucket: string;

    @Get()
    async merge(@Query('key') key: string) {
        return this.doMerge(key);
    }

    private async doMerge(key: string) {
        if (!key) {
            throw new HttpError(HttpStatus.BAD_REQUEST, 'Missing request parameter "key".');
        }
        const keys = key.split(',');

        const res = Context.getResponse();
        res.set(HttpHeaders.CONTENT_TYPE, contentType(key) || '');
        res.set(HttpHeaders.CACHE_CONTROL, 'max-age=360000');

        for (const k of keys) {
            const stream = await this.objectStorageService.getStream({ bucket: this.bucket, key: k });
            await new Promise<void>((resolve, reject) => {
                stream.on('error', (err) => {
                    reject(err);
                });
    
                stream.on('end', () => {
                    resolve();
                });
                stream.pipe(res, { end: false });
            });
        }
        
    }
}