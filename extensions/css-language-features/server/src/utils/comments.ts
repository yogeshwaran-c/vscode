/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const enum CharCode {
	Slash = 0x2F,
	Asterisk = 0x2A,
	Backslash = 0x5C,
	DoubleQuote = 0x22,
	SingleQuote = 0x27,
}

/**
 * Returns whether the given offset falls within a CSS, SCSS or LESS comment.
 *
 * Performs a single forward scan from the start of the text, tracking string
 * and comment state so that occurrences of comment delimiters inside string
 * literals are not mistaken for real comments.
 *
 * Block comments are recognised for all three languages. Line comments are
 * only recognised when `supportsLineComments` is `true` (SCSS and LESS).
 */
export function isInsideComment(text: string, offset: number, supportsLineComments: boolean): boolean {
	let i = 0;
	while (i < offset) {
		const ch = text.charCodeAt(i);
		// Block comment start
		if (ch === CharCode.Slash && text.charCodeAt(i + 1) === CharCode.Asterisk) {
			const end = text.indexOf('*/', i + 2);
			if (end === -1 || end >= offset) {
				return true;
			}
			i = end + 2;
			continue;
		}
		// Line comment start (SCSS/LESS only)
		if (supportsLineComments && ch === CharCode.Slash && text.charCodeAt(i + 1) === CharCode.Slash) {
			const nl = text.indexOf('\n', i + 2);
			if (nl === -1 || nl >= offset) {
				return true;
			}
			i = nl + 1;
			continue;
		}
		// String literal: skip to matching quote, honouring backslash escapes
		if (ch === CharCode.DoubleQuote || ch === CharCode.SingleQuote) {
			const quote = ch;
			i++;
			while (i < offset) {
				const c = text.charCodeAt(i);
				if (c === CharCode.Backslash) {
					i += 2;
					continue;
				}
				if (c === quote) {
					i++;
					break;
				}
				i++;
			}
			continue;
		}
		i++;
	}
	return false;
}
