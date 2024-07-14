export const RegionProvider = Symbol('RegionProvider');

export interface RegionProvider {
    provide(): Promise<string | undefined>;
}
