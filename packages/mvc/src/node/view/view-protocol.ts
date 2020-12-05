import { ViewMetadata } from '../annotation/view';

export const View = Symbol('View');

export interface View {
    readonly contentType: string;
    render(model: any, metadata: ViewMetadata): Promise<void>;
    support(metadata: ViewMetadata): Promise<boolean>;
}
