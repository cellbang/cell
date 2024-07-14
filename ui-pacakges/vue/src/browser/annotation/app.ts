import { App as VueApp } from 'vue';
import { Constant } from '@malagu/core';

export const APP = Symbol('APP');

export const App =
    function (app: VueApp, rebind: boolean = false): ClassDecorator {
        return (t: any) => {
            Constant(APP, app, rebind)(t);
        };
    };
