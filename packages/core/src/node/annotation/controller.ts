import { METADATA_KEY } from '../constants';
import { Component } from '../../common/annotation';
import { interfaces } from 'inversify';
import { Middleware } from '../middleware';

export const CONTROLLER = Symbol('Controller');

export interface ControllerMetadata {
    path: string;
    middleware: interfaces.ServiceIdentifier<Middleware>[];
    target: any;
}

export function Controller(path: string = '/', ...middleware: interfaces.ServiceIdentifier<Middleware>[]) {
    return function (target: any) {
        Component(CONTROLLER)(target);
        Component()(target);
        const metadata: ControllerMetadata = { path, middleware, target };
        Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
    };
}
