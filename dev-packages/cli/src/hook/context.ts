import { ApplicationPackage } from '../package';
import { Context as BuildContext } from '../webpack/config/context';
import webpack = require('webpack');

export interface Context {
    pkg: ApplicationPackage,
    buildContext: BuildContext,
    configurations: webpack.Configuration[]
}