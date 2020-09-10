
export interface Jwt {
    header: { [key: string]: any };
    payload: { [key: string]: any };
    signature: string;
    token: string;
}

export interface JwtDecoder {
    decode(token: string): Promise<Jwt>;
}

export interface JwtDecoderFactory<T> {
    create(context: T): Promise<JwtDecoder>;
}
