import { interfaces } from 'inversify';
import { ContainerUtil } from '@malagu/core';
import { ErrorConverter, GlobalConverter } from '../converter';
import { RpcUtil } from './rpc-util';

export namespace ConverterUtil {

    export function getErrorConverterIgnoreNoMatching<T>(task: () => T): T | undefined {
        try {
            return task();
        } catch (error) {
            if (!error?.message.startsWith('No matching bindings found for serviceIdentifier: Symbol(ErrorConverter)')) {
                throw error;
            }
        }
    }

    export function getGlobalErrorConverters(container?: interfaces.Container) {
        return getErrorConverterIgnoreNoMatching(() =>
            container ? container.getAllNamed<ErrorConverter>(ErrorConverter, GlobalConverter) :
                ContainerUtil.getAllNamed<ErrorConverter>(ErrorConverter, GlobalConverter)) || [];
    }

    export function getErrorConverters(serviceIdentifier: any, container?: interfaces.Container) {
        const name = RpcUtil.toName(serviceIdentifier);
        return getErrorConverterIgnoreNoMatching(() =>
            container ? container.getNamed<ErrorConverter>(ErrorConverter, name) :
                ContainerUtil.getNamed<ErrorConverter>(ErrorConverter, name));
    }
}
