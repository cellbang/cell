import { ReactComponent } from '@malagu/react/lib/browser';
import { Main } from './main';
import { Minimal } from './minimal';

export const MainLayout = Symbol('MainLayout');
export const MinimalLayout = Symbol('MinimalLayout');

@ReactComponent(MainLayout, Main)
@ReactComponent(MinimalLayout, Minimal)
export class LayoutProvider {

}
