export const View = Symbol('View');

export interface View {
    readonly contentType: string;
    render(model: any, viewName: string): Promise<void>;
    support(viewName: string): Promise<boolean>;
}
