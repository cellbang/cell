import { ViewMetadata } from '../annotation/view';

export const View = Symbol('View');
export const JsonViewTemplateRenderer = Symbol('JsonViewTemplateRenderer');

export interface View {
    readonly contentType: string;
    render(model: any, metadata: ViewMetadata): Promise<void>;
    support(metadata: ViewMetadata): Promise<boolean>;
}

export interface JsonViewTemplateRenderer {
    render(model?: any, error?: Error): Promise<string>;
}
