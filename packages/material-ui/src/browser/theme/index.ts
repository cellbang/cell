import { createMuiTheme } from '@material-ui/core';

import palette from './palette';
import typography from './typography';
import * as overrides from './overrides';

const themeOptions = {
    palette,
    typography,
    overrides,
    zIndex: {
        appBar: 1200,
        drawer: 1100
    }
};

export const theme = createMuiTheme(themeOptions as any);

export * from './theme-context';
