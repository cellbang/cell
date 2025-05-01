import { ExpressionCompiler, ExpressionCompilerOptions, JexlEngineProvider } from './expression-protocol';
import { Component, Autowired } from '../annotation';

interface MiddleExpression {
    expression: any;
    nextText?: string;
}

@Component(ExpressionCompiler)
export class ExpressionCompilerImpl implements ExpressionCompiler {

    private ESCAPE_CHAR = '\\';
    private SPECIAL_CHAR = '$';
    private BRACKET_BEGIN = '{';
    private BRACKET_END = '}';

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider<any>;

    protected getSpecialChar(opitons: Required<ExpressionCompilerOptions>): string {
        if (opitons.ignoreSpecialChar) {
            return '';
        }
        return opitons.specialChar;
    }

    protected equalsSpecialChar(opitons: Required<ExpressionCompilerOptions>, char: string): boolean {
        if (opitons.ignoreSpecialChar) {
            return false;
        }
        return char === opitons.specialChar;
    }

    compileSections(text: string, options: ExpressionCompilerOptions): any[] {
        const merged = {
            ...{ escapeChar: this.ESCAPE_CHAR, specialChar: this.SPECIAL_CHAR, bracketBegin: this.BRACKET_BEGIN, bracketEnd: this.BRACKET_END, ...options }
        } as Required<ExpressionCompilerOptions>;
        if (!text || text.indexOf(`${this.getSpecialChar(merged)}${merged.bracketBegin}`) < 0) {
            return [];
        }

        const sections: any[] = [];
        let middleText: string | undefined = text;
        while (middleText) {
            const me: MiddleExpression | undefined = this.middleCompile(middleText, merged);
            if (!me) {
                sections.push(middleText);
                middleText = undefined;
            } else {
                sections.push(me.expression);
                middleText = me.nextText;
            }
        }

        return sections;
    }

    protected middleCompile(text: string, options: Required<ExpressionCompilerOptions>): MiddleExpression | undefined {
        let me: MiddleExpression | undefined;
        const prefix = `${this.getSpecialChar(options)}${options.bracketBegin}`;
        const prefix2 = `${prefix}${options.bracketBegin}`;
        if (text.startsWith(prefix2)) {
            me = this.nextMiddleExpression(text.substring(prefix2.length), 2, options);
        } else if (text.startsWith(prefix)) {
            me = this.nextMiddleExpression(text.substring(prefix.length), undefined, options);
        } else {
            me = this.nextString(text, options);
        }
        return me;
    }

    protected nextMiddleExpression(text: string, bracketBeginCharNum = 1, options: Required<ExpressionCompilerOptions>): MiddleExpression | undefined {
        let stringed = false;
        let escaped = false;
        let bracketBeginCharFound = 0;

        const section: string[] = [];
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (!escaped) {
                if ('\'' === c || '"' === c) {
                    stringed = !stringed;
                    section.push(c);
                    continue;
                } else
                    if (c === options.escapeChar) {
                        escaped = true;
                        continue;
                    }
            }

            if (stringed) {
                section.push(c);
                escaped = false;
            } else if (escaped) {
                if (this.equalsSpecialChar(options, c) || options.bracketBegin === c || options.bracketEnd === c) {
                    section.push(c);
                } else {
                    section.push(options.escapeChar);
                    section.push(c);
                }
                escaped = false;
            } else if (options.bracketBegin === c) {
                bracketBeginCharFound++;
                section.push(c);
            } else if (options.bracketEnd === c) {
                if (bracketBeginCharFound === 0 && bracketBeginCharNum === 1) {
                    const jexlEngine = this.jexlEngineProvider.provide();
                    const expression = jexlEngine.createExpression(section.join(''));
                    let nextText;
                    if (i !== text.length - 1) {
                        nextText = text.substring(i + 1);
                    }
                    return { expression, nextText };
                } else if (bracketBeginCharFound > 0) {
                    bracketBeginCharFound--;
                    section.push(c);
                } else {
                    bracketBeginCharNum--;
                }
            } else {
                section.push(c);
            }
        }
    }

    protected nextString(text: string, options: Required<ExpressionCompilerOptions>): MiddleExpression {
        let escaped = false;
        let specialCharFound = false;

        const section: string[] = [];
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (!escaped) {
                if ('\'' === c || '"' === c) {
                    section.push(c);
                    continue;
                } else
                    if (c === options.escapeChar) {
                        escaped = true;
                        continue;
                    }
            }

            if (escaped) {
                if (this.equalsSpecialChar(options, c) || options.bracketBegin === c || options.bracketEnd === c) {
                    section.push(c);
                } else {
                    section.push(options.escapeChar);
                    section.push(c);
                }
                escaped = false;
            } else
                if (specialCharFound || options.ignoreSpecialChar) {
                    if (options.bracketBegin === c) {
                        const expression = section.join('');
                        const nextText = options.ignoreSpecialChar ? text.substring(i) : text.substring(i - 1);
                        return { expression, nextText };
                    } else {
                        if (!options.ignoreSpecialChar) {
                            specialCharFound = false;
                            section.push(options.specialChar);
                        }
                        section.push(c);
                    }
                } else {
                    if (this.equalsSpecialChar(options, c)) {
                        specialCharFound = true;
                    } else {
                        section.push(c);
                    }
                }
        }

        return { expression: section.join('') };
    }

}
