import { JexlEngineProvider } from './jexl-engine-provider';

interface MiddleExpression {
	expression: any;
	nextText?: string;
}

export class ExpressionCompiler {

	private ESCAPE_CHAR = '\\';
	private SPECIAL_CHAR = '$';
	private BRACKET_BEGIN = '{';
	private BRACKET_END = '}';

	protected readonly jexlEngineProvider: JexlEngineProvider = new JexlEngineProvider();

	compileSections(text: string): any[] {
		if (!text || text.indexOf(this.SPECIAL_CHAR) < 0) {
			return [];
		}

		const sections: any[] = [];
		let middleText: string | undefined = text;
		while (middleText) {
			const me: MiddleExpression | undefined = this.middleCompile(middleText);
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

	protected middleCompile(text: string): MiddleExpression | undefined {
		let me: MiddleExpression | undefined;
		if (text.startsWith('${')) {
			me = this.nextMiddleExpression(text.substring(2));
		} else {
			me = this.nextString(text);
		}
		return me;
	}

	protected nextMiddleExpression(text: string): MiddleExpression | undefined {
		let stringed = false;
		let escaped = false;
		let bracketBeginCharFound = 0;

		const section: string[] = [];
		for (let i = 0; i < text.length; i++) {
			const c = text[i];
			if (!escaped) {
				if ('\'' === c || '\"' === c) {
					stringed = !stringed;
					section.push(c);
					continue;
				} else
					if (c === this.ESCAPE_CHAR) {
						escaped = true;
						continue;
					}
			}

			if (stringed) {
				section.push(c);
				escaped = false;
			} else if (escaped) {
				if (this.SPECIAL_CHAR === c || this.BRACKET_BEGIN === c || this.BRACKET_END === c) {
					section.push(c);
				} else {
					section.push(this.ESCAPE_CHAR);
					section.push(c);
				}
				escaped = false;
			} else if (this.BRACKET_BEGIN === c) {
				bracketBeginCharFound++;
				section.push(c);
			} else if (this.BRACKET_END === c) {
				if (bracketBeginCharFound === 0) {
					const jexlEngine = this.jexlEngineProvider.provide();
					const expression = jexlEngine.createExpression(section.join(''));
					let nextText;
					if (i !== text.length - 1) {
						nextText = text.substring(i + 1);
					}
					return { expression, nextText };
				} else {
					bracketBeginCharFound--;
					section.push(c);
				}
			} else {
				section.push(c);
			}
		}
	}

	protected nextString(text: string): MiddleExpression {
		let escaped = false;
		let specialCharFound = false;

		const section: string[] = [];
		for (let i = 0; i < text.length; i++) {
			const c = text[i];
			if (!escaped) {
				if ('\'' === c || '\"' === c) {
					section.push(c);
					continue;
				} else
					if (c === this.ESCAPE_CHAR) {
						escaped = true;
						continue;
					}
			}

			if (escaped) {
				if (this.SPECIAL_CHAR === c || this.BRACKET_BEGIN === c || this.BRACKET_END === c) {
					section.push(c);
				} else {
					section.push(this.ESCAPE_CHAR);
					section.push(c);
				}
				escaped = false;
			} else
				if (specialCharFound) {
					if (this.BRACKET_BEGIN === c) {
						const expression = section.join('');
						const nextText = text.substring(i - 1);
						return { expression, nextText };
					} else {
						specialCharFound = false;
						section.push(this.SPECIAL_CHAR);
						section.push(c);
					}
				} else {
					if (this.SPECIAL_CHAR === c) {
						specialCharFound = true;
					} else {
						section.push(c);
					}
				}
		}

		return { expression: section.join('') };
	}

}
