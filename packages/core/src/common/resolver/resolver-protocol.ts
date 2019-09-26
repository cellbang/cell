export const PathResolver = Symbol('PathResolver');

export interface PathResolver {
    resolve(...parts: string[]): Promise<string>;
}
