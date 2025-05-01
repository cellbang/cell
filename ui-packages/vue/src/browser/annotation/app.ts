import { App as VueApp } from 'vue';
import { Constant } from '@celljs/core';

export const APP = Symbol('APP');

export const App =
    function (app: VueApp, rebind = false): ClassDecorator {
        return (t: any) => {
            Constant(APP, app, rebind)(t);
        };
    };
