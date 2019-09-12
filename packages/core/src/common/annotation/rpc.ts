import { interfaces } from 'inversify';
import { Component } from './component';
export const Rpc = (id: interfaces.ServiceIdentifier<any>) => Component({ id, rpc: true });
