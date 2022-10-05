import * as https from 'https';
import * as ProgressBar from 'progress';
const tar = require('tar-fs');
import { existsSync } from 'fs-extra';
import { resolve } from 'path';
import { createUnzip } from 'zlib';

const nodeRuntime = process.env.NODE_RUNTIME ?? 'node-v16.14.2-linux-x64.tar.gz';
const urlPrefix = process.env.NODE_RUNTIME_URL ?? 'https://nodejs.org/dist/v16.14.2';
const url = `${urlPrefix}/${nodeRuntime}`;

function doDownload(url: string) {

    let progressBar: ProgressBar | null = null;
    let lastDownloadedBytes = 0;
    function onProgress(downloadedBytes: number, totalBytes: number) {
        if (!progressBar) {
            progressBar = new ProgressBar(
                `Downloading ${nodeRuntime} [:bar] :percent :etas `,
                {
                    complete: '=',
                    incomplete: ' ',
                    width: 20,
                    total: totalBytes,
                }
            );
        }
        const delta = downloadedBytes - lastDownloadedBytes;
        lastDownloadedBytes = downloadedBytes;
        progressBar.tick(delta);
    }

    let fulfill: () => void;
    let reject: (error?: any) => void;
    let downloadedBytes = 0;
    let totalBytes = 0;

    const promise = new Promise<void>((x, y) => {
        fulfill = x;
        reject = y;
    });

    const request = https.request(url, {
        method: 'GET',
        headers: {
            Connection: 'keep-alive',
        }
    }, res => {
        if (res.statusCode !== 200) {
            const error = new Error(
                `Download failed: server returned code ${res.statusCode}. URL: ${url}`
            );
            // consume response data to free up memory
            res.resume();
            reject(error);
            return;
        }

        const tarStream = tar.extract(__dirname);

        tarStream.on('finish', () => fulfill());
        tarStream.on('error', (error: any) => reject(error));
        res.pipe(createUnzip()).pipe(tarStream);

        totalBytes = parseInt(res.headers['content-length'] as string, 10);
        res.on('data', chunk => {
            downloadedBytes += chunk.length;
            onProgress(downloadedBytes, totalBytes);
        });
    });
    request.on('error', error => reject(error));
    request.end();
    return promise;
}

async function download() {
    try {
        if (!process.env.NODE_RUNTIME_SKIP_DOWNLOAD && !existsSync(resolve(__dirname, nodeRuntime.replace('.tar.xz', '')))) {
            await doDownload(url);
        }
    } catch (error) {
        console.error(
            `ERROR: Failed to set up ${nodeRuntime}! Set "NODE_RUNTIME_SKIP_DOWNLOAD" env variable to skip download.`
        );
        console.error(error);
        process.exit(1);
    }
};



download();
