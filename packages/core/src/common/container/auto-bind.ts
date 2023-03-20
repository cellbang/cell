import { interfaces, ContainerModule } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ComponentMetadata, ConstantOption } from '../annotation';
import { ConfigUtil } from '../config/config-util';
import { AopProxyFactory, ClassFilter } from '../aop/aop-protocol';
import { ContainerUtil } from './container-util';
import { Scope } from './scope';

const componentMetadataMap = new Map<string, ComponentMetadata[]>();
const constantMetadataMap = new Map<string, ConstantOption[]>();

export function autoBindTesting(name: string = 'test'): interfaces.ContainerModule {
    return autoBind(() => {}, name);
}

export function autoBind(registry?: interfaces.ContainerModuleCallBack, name?: string): interfaces.ContainerModule {
    return new ContainerModule((bind, unbind, isBound, rebind, ...rest) => {
        let metadatas: ComponentMetadata[] | undefined;
        let constantMetadata: ConstantOption[] | undefined;
        if (name) {
            metadatas = componentMetadataMap.get(name);
            constantMetadata = constantMetadataMap.get(name);
            if (!metadatas) {
                metadatas = Reflect.getMetadata(METADATA_KEY.component, Reflect) || [];
                componentMetadataMap.set(name, metadatas!);
                constantMetadata = Reflect.getMetadata(METADATA_KEY.constantValue, Reflect) || [];
                constantMetadataMap.set(name, constantMetadata!);
            }
        } else {
            metadatas = Reflect.getMetadata(METADATA_KEY.component, Reflect) || [];
            constantMetadata = Reflect.getMetadata(METADATA_KEY.constantValue, Reflect) || [];
        }
        for (let index = metadatas!.length - 1; index >= 0; index--) {
            const metadata = metadatas![index];
            resolve(metadata, bind, rebind);
        }
        Reflect.defineMetadata(METADATA_KEY.component, [], Reflect);
        constantMetadata!.map(metadata => resolveConstant(metadata, bind, rebind));
        Reflect.defineMetadata(METADATA_KEY.constantValue, [], Reflect);

        if (registry) {
            registry(bind, unbind, isBound, rebind, ...rest);
        }
    });
}

function doProxyIfNeed(metadata: ComponentMetadata, target: any) {
    const enabled = ConfigUtil.getRaw().malagu?.aop?.enabled;
    if (enabled && metadata.proxy) {
        const classFilter = ContainerUtil.get<ClassFilter>(ClassFilter);
        if (target.constructor && classFilter.matches(target.constructor, metadata)) {
            const aopProxyFactory = ContainerUtil.get<AopProxyFactory>(AopProxyFactory);
            return aopProxyFactory.create({
                target,
                metadata
            }).getProxy();
        }
    }

    return target;
}

function resolve(metadata: ComponentMetadata, bind: interfaces.Bind, rebind: interfaces.Rebind): void {
    let mid: any;
    const { ids, scope, name, tag, when, proxy, onActivation, target } = metadata;
    const _ids = [...ids];
    const id = _ids.shift()!;
    if (metadata.rebind) {
        const id2 = _ids.shift();
        mid = rebind(id2 || id).to(target);
    } else {
        mid = bind(id).to(target);
    }
    if (scope === Scope.Singleton) {
        mid = mid.inSingletonScope();
    } else if (scope === Scope.Transient) {
        mid = mid.inTransientScope();
    }

    if (name) {
        mid = mid.whenTargetNamed(name);
    } else if (tag) {
        mid = mid.whenTargetTagged(tag.tag, tag.value);
    } else if (metadata.default) {
        mid = mid.whenTargetIsDefault();
    } else if (when) {
        mid = mid.when(when);
    }

    if (onActivation) {
        mid.onActivation(onActivation);
    } else if (proxy) {
        mid.onActivation((context: interfaces.Context, t: any) => doProxyIfNeed(metadata, t));
    }

    for (const item of _ids) {
        bind(item).toService(id);
    }
}

function resolveConstant(metadata: ConstantOption, bind: interfaces.Bind, rebind: interfaces.Rebind): void {
    const ids = Array.isArray(metadata.id) ? [...metadata.id] : [ metadata.id ];
    const id = ids.shift();
    if (metadata.rebind) {
        rebind(id!).toConstantValue(metadata.constantValue);
    } else {
        bind(id!).toConstantValue(metadata.constantValue);
    }

    for (const item of ids) {
        bind(item!).toService(id!);
    }
}
