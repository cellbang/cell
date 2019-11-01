export const View = Symbol('View');

export interface View {
    readonly contentType: string;
    render(model: any): Promise<void>;
    support(viewName: string): Promise<boolean>;
}
