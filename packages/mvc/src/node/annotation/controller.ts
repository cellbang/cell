import { METADATA_KEY } from '../constants';
import { Component } from '@malagu/core';

export const CONTROLLER = Symbol('Controller');

export interface ControllerMetadata {
    path: string;
    target: any;
}

export function Controller(path: string = '') {
    return function (target: any) {
        const metadata: ControllerMetadata = { path, target };
        Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
        Component({ id: CONTROLLER, proxy: true })(target);
    };
}
