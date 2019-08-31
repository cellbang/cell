import { ApplicationPackage } from '../package';
import { Context as BuildContext } from '../webpack/config/context';
import webpack = require('webpack');
import * as https from 'https';
import * as http from 'http';

export interface Context {
    pkg: ApplicationPackage;
    buildContext: BuildContext;
    configurations: webpack.Configuration[];
}

export interface ServeContext extends Context {
    server: http.Server | https.Server;
    app: Express.Application;
    compiler: webpack.Compiler;
    entryContextProvider: () => any;
}
