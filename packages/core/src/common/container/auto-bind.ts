import { interfaces, ContainerModule } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ComponentMetadata, ConstantOption } from '../annotation';
import { ConfigUtil } from '../config/config-util';
import { AopProxyFactory, ClassFilter } from '../aop/aop-protocol';
import { ContainerUtil } from './container-util';
import { Scope } from './scope';

export function autoBind(registry?: interfaces.ContainerModuleCallBack): interfaces.ContainerModule {
    return new ContainerModule((bind, unbind, isBound, rebind) => {
        const metadatas: ComponentMetadata[] = Reflect.getMetadata(METADATA_KEY.component, Reflect) || [];
        for (let index = metadatas.length - 1; index >= 0; index--) {
            const metadata = metadatas[index];
            resolve(metadata, bind, rebind);
        }
        Reflect.defineMetadata(METADATA_KEY.component, [], Reflect);
        const constantMetadata: ConstantOption[] = Reflect.getMetadata(METADATA_KEY.constantValue, Reflect) || [];
        constantMetadata.map(metadata => resolveConstant(metadata, bind, rebind));
        Reflect.defineMetadata(METADATA_KEY.constantValue, [], Reflect);

        if (registry) {
            registry(bind, unbind, isBound, rebind);
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
            }).getPorxy();
        }
    }

    return target;
}

function resolve(metadata: ComponentMetadata, bind: interfaces.Bind, rebind: interfaces.Rebind): void {
    let mid: any;
    const { ids, scope, name, tag, when, proxy, onActivation, target } = metadata;
    const id = ids.shift()!;
    mid = metadata.rebind ? rebind(id).to(target) : bind(id).to(target);

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

    for (const item of ids) {
        bind(item).toService(id);
    }
}

function resolveConstant(metadata: ConstantOption, bind: interfaces.Bind, rebind: interfaces.Rebind): void {
    const ids = Array.isArray(metadata.id) ? metadata.id : [ metadata.id ];
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
