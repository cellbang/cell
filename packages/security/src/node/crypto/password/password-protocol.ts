export const PasswordEncoder = Symbol('PasswordEncoder');

export interface PasswordEncoder {
    encode(rawPassword: string): Promise<string>;
    matches(rawPassword: string, encodedPassword: string): Promise<boolean>;
}
