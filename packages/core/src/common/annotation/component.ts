import { decorate, injectable, interfaces, METADATA_KEY as inversify_METADATA_KEY } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ConfigUtil } from '../config/config-util';
import { AnnotationUtil } from '../utils';
import { Scope } from '../container/scope';

export type ComponentId<T = any> = interfaces.ServiceIdentifier<T>;

export const COMPONENT_TAG = 'Component';

export interface ComponentOption {
    id?: ComponentId | ComponentId[];
    scope?: Scope;
    name?: string | number | symbol;
    tag?: { tag: string | number | symbol, value: any };
    default?: boolean;
    when?: (request: interfaces.Request) => boolean;
    rebind?: boolean;
    proxy?: boolean;
    sysTags?: string[];
    onActivation?: (context: interfaces.Context, t: any) => any;
}

export interface ComponentMetadata {
    ids:  ComponentId[];
    scope: Scope;
    name?: string | number | symbol;
    tag?: { tag: string | number | symbol, value: any },
    default?: boolean;
    when?: (request: interfaces.Request) => boolean
    rebind: boolean;
    proxy: boolean;
    sysTags: string[]
    onActivation?: (context: interfaces.Context, t: any) => any;
    target: any;
}

export type IdOrComponentOption = ComponentId | ComponentId[] | ComponentOption;

export interface ComponentDecorator {
    (idOrOption?: IdOrComponentOption): ClassDecorator;
    (...ids: ComponentId[]): ClassDecorator;
}

export const Component = <ComponentDecorator>function (...idOrOption: any): ClassDecorator {
    return (t: any) => {
        const option = parseComponentOption(t, idOrOption);
        applyComponentDecorator(option, t);
    };
};

const defaultComponentOption: ComponentOption = {
    scope: Scope.Singleton,
    rebind: false,
    proxy: false,
    ...ConfigUtil.getRaw().cell?.annotation?.Component
};

export function parseComponentOption(target: any, idOrOption: any) {
    if (Array.isArray(idOrOption)) {
        if (idOrOption.length === 1) {
            idOrOption = idOrOption[0];
        } else if (idOrOption.length === 0) {
            idOrOption = undefined;
        }
    }
    const option = AnnotationUtil.getValueOrOption<ComponentOption>(idOrOption);

    const parsed = { ...defaultComponentOption, ...option };
    let ids: ComponentId[];
    if (Array.isArray(parsed.id)) {
        ids = Array.from(new Set<ComponentId>([ target, ...parsed.id ]));
    } else if (parsed.id && parsed.id !== target) {
        ids = [ target, parsed.id ];
    } else {
        ids = [ target ];
    }
    parsed.id = ids;
    parsed.sysTags = [ ...new Set<string>([ COMPONENT_TAG, ...parsed.sysTags || []]) ];
    return parsed;
}

export function applyComponentDecorator(option: ComponentOption, target: any) {

    const isAlreadyDecorated = Reflect.hasOwnMetadata(inversify_METADATA_KEY.PARAM_TYPES, target);

    if (!isAlreadyDecorated) {
        decorate(injectable(), target);
    }

    const metadata: ComponentMetadata = {
        target,
        ids: Array.isArray(option.id) ? option.id : [ option.id || target ],
        sysTags: option.sysTags!,
        rebind: option.rebind!,
        proxy: option.proxy!,
        scope: option.scope!,
        name: option.name,
        tag: option.tag,
        default: option.default,
        when: option.when,
        onActivation: option.onActivation
    };

    let metadatas: ComponentMetadata[] = Reflect.getMetadata(
        METADATA_KEY.component,
        Reflect
    );

    if (!metadatas) {
        metadatas = [];
        Reflect.defineMetadata(
            METADATA_KEY.component,
            metadatas,
            Reflect
        );
    }
    metadatas.push(metadata);
    return metadata;
}
