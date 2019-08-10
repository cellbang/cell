import { interfaces } from 'inversify';
import { component } from './component';
export const rpc = (id: interfaces.ServiceIdentifier<any>) => component({ id, rpc: true });
