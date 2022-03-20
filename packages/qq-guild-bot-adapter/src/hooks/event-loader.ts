import { LoaderDefinition } from 'webpack';

export interface EventLoaderOptions {
    event: string;
}

const eventLoader: LoaderDefinition<EventLoaderOptions> = function (source, sourceMap) {
    const { event } = this.getOptions();
    const newSource = `global.ws.on('${event}', async data => {
        ${source}
    });`;
    this.callback(undefined, newSource, sourceMap);
};

export default eventLoader;
