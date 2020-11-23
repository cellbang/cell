import { METADATA_KEY } from '../constants';
import { AnnotationUtil, Component, ComponentId, ComponentOption, parseComponentOption } from '@malagu/core';
import { AOP_POINTCUT } from '@malagu/web';

export const CONTROLLER = Symbol('Controller');

export const CONTROLLER_TAG = 'Controller';

export interface ControllerOption extends ComponentOption {
    path?: string;
}

export interface ControllerMetadata {
    path: string;
    target: any;
}

export type PathOrControllerOption = string | ControllerOption;

export function Controller(pathOrOption?: PathOrControllerOption): ClassDecorator {
    return function (target) {
        const option = parseControllerOption(target, pathOrOption);
        applyControllerDecorator(option, target);
    };
}

export function parseControllerOption(target: any, pathOrOption?: PathOrControllerOption) {
    const option = AnnotationUtil.getValueOrOption<ControllerOption>(pathOrOption, 'path');
    const parsed = <ControllerOption>parseComponentOption(target, option);
    if (option.proxy === undefined) {
        parsed.proxy = true;
    }
    parsed.sysTags!.push(AOP_POINTCUT, CONTROLLER_TAG);
    parsed.path = parsed.path || '';
    (parsed.id as Array<ComponentId>).push(CONTROLLER);
    return parsed;
}

export function applyControllerDecorator(option: ControllerOption, target: any) {
    const metadata: ControllerMetadata = { path: option.path!, target };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
    Component(option)(target);
    return metadata;
}
