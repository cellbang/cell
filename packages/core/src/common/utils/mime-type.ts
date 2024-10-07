import { Assert } from './assert';
import { MimeTypeUtils } from './mime-type-util';

export class MimeType {
    private static readonly WILDCARD_TYPE = '*';
    private static readonly PARAM_CHARSET = 'charset';
    private static TOKEN: Set<number> = new Set();

    private readonly type: string;
    private readonly subtype: string;
    private readonly parameters: Map<string, string>;

    private charset?: string;

    static {
        const ctl = new Set<number>();
        for (let i = 0; i <= 31; i++) {
            ctl.add(i);
        }
        ctl.add(127);

        const separators = new Set<number>();
        separators.add('('.charCodeAt(0));
        separators.add(')'.charCodeAt(0));
        separators.add('<'.charCodeAt(0));
        separators.add('>'.charCodeAt(0));
        separators.add('@'.charCodeAt(0));
        separators.add(','.charCodeAt(0));
        separators.add(';'.charCodeAt(0));
        separators.add(':'.charCodeAt(0));
        separators.add('\\'.charCodeAt(0));
        separators.add('"'.charCodeAt(0));
        separators.add('/'.charCodeAt(0));
        separators.add('['.charCodeAt(0));
        separators.add(']'.charCodeAt(0));
        separators.add('?'.charCodeAt(0));
        separators.add('='.charCodeAt(0));
        separators.add('{'.charCodeAt(0));
        separators.add('}'.charCodeAt(0));
        separators.add(' '.charCodeAt(0));
        separators.add('\t'.charCodeAt(0));

        for (let i = 0; i < 128; i++) {
            if (!ctl.has(i) && !separators.has(i)) {
                this.TOKEN.add(i);
            }
        }
    }

    constructor(type: string, subtype: string = MimeType.WILDCARD_TYPE, parameters?: Map<string, string>) {
        Assert.hasLength(type, '"type" must not be empty');
        Assert.hasLength(subtype, '"subtype" must not be empty');
        this.checkToken(type);
        this.checkToken(subtype);
        this.type = type.toLowerCase();
        this.subtype = subtype.toLowerCase();
        if (parameters) {
            const map: Map<string, string> = new Map();
            for (const [key, value] of Object.entries(parameters)) {
                this.checkParameters(key, value);
                map.set(key.toLowerCase(), value);
            }
            this.parameters = map;
        } else {
            this.parameters = new Map();
        }
    }

    private checkToken(token: string) {
        for (let i = 0; i < token.length; i++) {
            const ch = token.charCodeAt(i);
            if (!MimeType.TOKEN.has(ch)) {
                throw new Error(`Invalid token character "${String.fromCharCode(ch)}" in token "${token}"`);
            }
        }
    }

    protected checkParameters(parameter: string, value: string) {
        Assert.hasLength(parameter, '"parameter" must not be empty');
        Assert.hasLength(value, '"value" must not be empty');
        this.checkToken(parameter);
        if (MimeType.PARAM_CHARSET === parameter) {
            if (!this.charset) {
                this.charset = this.unquote(value);
            }
        } else if (!this.isQuotedString(value)) {
            this.checkToken(value);
        }
    }

    private isQuotedString(s: string): boolean {
        if (s.length < 2) {
            return false;
        } else {
            return ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('\'') && s.endsWith('\'')));
        }
    }

    protected unquote(s: string): string {
        return (this.isQuotedString(s) ? s.substring(1, s.length - 1) : s);
    }

    isWildcardType(): boolean {
        return MimeType.WILDCARD_TYPE === this.getType();
    }

    isWildcardSubtype(): boolean {
        const subtype = this.getSubtype();
        return (MimeType.WILDCARD_TYPE === subtype || subtype.startsWith('*+'));
    }

    isConcrete(): boolean {
        return !this.isWildcardType() && !this.isWildcardSubtype();
    }

    getType(): string {
        return this.type;
    }

    getSubtype(): string {
        return this.subtype;
    }

    getSubtypeSuffix(): string | undefined {
        const suffixIndex = this.subtype.lastIndexOf('+');
        if (suffixIndex !== -1 && this.subtype.length > suffixIndex) {
            return this.subtype.substring(suffixIndex + 1);
        }
        return undefined;
    }

    getCharset(): string | undefined {
        return this.charset;
    }

    getParameter(name: string): string | undefined  {
        return this.parameters.get(name);
    }

    getParameters(): Map<string, string> {
        return this.parameters;
    }

    includes(other?: MimeType): boolean {
        if (other === undefined) {
            return false;
        }
        if (this.isWildcardType()) {
            return true;
        } else if (this.getType() === other.getType()) {
            if (this.getSubtype() === other.getSubtype()) {
                return true;
            }
            if (this.isWildcardSubtype()) {
                const thisPlusIdx = this.getSubtype().lastIndexOf('+');
                if (thisPlusIdx === -1) {
                    return true;
                } else {
                    const otherPlusIdx = other.getSubtype().lastIndexOf('+');
                    if (otherPlusIdx !== -1) {
                        const thisSubtypeNoSuffix = this.getSubtype().substring(0, thisPlusIdx);
                        const thisSubtypeSuffix = this.getSubtype().substring(thisPlusIdx + 1);
                        const otherSubtypeSuffix = other.getSubtype().substring(otherPlusIdx + 1);
                        if (thisSubtypeSuffix === otherSubtypeSuffix && MimeType.WILDCARD_TYPE === thisSubtypeNoSuffix) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    isCompatibleWith(other?: MimeType): boolean {
        if (other === undefined) {
            return false;
        }
        if (this.isWildcardType() || other.isWildcardType()) {
            return true;
        } else if (this.getType() === other.getType()) {
            if (this.getSubtype() === other.getSubtype()) {
                return true;
            }
            if (this.isWildcardSubtype() || other.isWildcardSubtype()) {
                const thisSuffix = this.getSubtypeSuffix();
                const otherSuffix = other.getSubtypeSuffix();
                if (this.getSubtype() === MimeType.WILDCARD_TYPE || other.getSubtype() === MimeType.WILDCARD_TYPE) {
                    return true;
                } else if (this.isWildcardSubtype() && thisSuffix !== undefined) {
                    return (thisSuffix === other.getSubtype() || thisSuffix === otherSuffix);
                } else if (other.isWildcardSubtype() && otherSuffix !== undefined) {
                    return (this.getSubtype() === otherSuffix || otherSuffix === thisSuffix);
                }
            }
        }
        return false;
    }

    equalsTypeAndSubtype(other?: MimeType): boolean {
        if (other === undefined) {
            return false;
        }
        return this.type.toLowerCase() === other.type.toLowerCase() && this.subtype.toLowerCase() === other.subtype.toLowerCase();
    }

    isPresentIn(mimeTypes: MimeType[]): boolean {
        for (const mimeType of mimeTypes) {
            if (mimeType.equalsTypeAndSubtype(this)) {
                return true;
            }
        }
        return false;
    }

    equals(other: unknown): boolean {
        return (this === other || (other instanceof MimeType &&
            this.type.toLowerCase() === other.type.toLowerCase() &&
            this.subtype.toLowerCase() === other.subtype.toLowerCase() &&
            this.parametersAreEqual(other)));
    }

    private parametersAreEqual(other: MimeType): boolean {
        if (this.parameters.size !== other.parameters.size) {
            return false;
        }

        for (const [key, value] of this.parameters) {
            if (!other.parameters.has(key)) {
                return false;
            }
            if (MimeType.PARAM_CHARSET === key) {
                if (this.getCharset() !== other.getCharset()) {
                    return false;
                }
            } else if (value !== other.parameters.get(key)) {
                return false;
            }
        }

        return true;
    }

    isMoreSpecific(other: MimeType): boolean {
        Assert.notNull(other, 'Other must not be null');
        const thisWildcard = this.isWildcardType();
        const otherWildcard = other.isWildcardType();
        if (thisWildcard && !otherWildcard) {
            return false;
        } else if (!thisWildcard && otherWildcard) {
            return true;
        } else {
            const thisWildcardSubtype = this.isWildcardSubtype();
            const otherWildcardSubtype = other.isWildcardSubtype();
            if (thisWildcardSubtype && !otherWildcardSubtype) {
                return false;
            } else if (!thisWildcardSubtype && otherWildcardSubtype) {
                return true;
            } else if (this.getType() === other.getType() && this.getSubtype() === other.getSubtype()) {
                const paramsSize1 = this.getParameters().size;
                const paramsSize2 = other.getParameters().size;
                return paramsSize1 > paramsSize2;
            } else {
                return false;
            }
        }
    }

    isLessSpecific(other: MimeType): boolean {
        Assert.notNull(other, 'Other must not be null');
        return other.isMoreSpecific(this);
    }

    static valueOf(value: string): MimeType {
        return MimeTypeUtils.parseMimeType(value);
    }
}
