export const RequestMatcher = Symbol('RequestMatcher');

export interface RequestMatcher {
    match(pattern: any, method?: string): Promise<any>;
}
