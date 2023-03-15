import { PROVIDER, ID_KEY } from '../annotation/autowired-provider';
import { ComponentId } from '../annotation/component';
import { ContainerUtil } from '../container';
import { Provider } from './provider-protocol';

export namespace ProviderUtil {
    export function get<T extends Object>(componentId: ComponentId<T>): Provider<T> {
        return ContainerUtil.getTagged(PROVIDER, ID_KEY, componentId);
    }
}
