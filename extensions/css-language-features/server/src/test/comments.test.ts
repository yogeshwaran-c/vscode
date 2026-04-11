/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'mocha';
import * as assert from 'assert';
import { isInsideComment } from '../utils/comments';

suite('isInsideComment', () => {

	function at(text: string): { text: string; offset: number } {
		const offset = text.indexOf('|');
		assert.notStrictEqual(offset, -1, 'test text must contain a | marker');
		return { text: text.slice(0, offset) + text.slice(offset + 1), offset };
	}

	test('plain CSS rule is not in a comment', () => {
		const { text, offset } = at('a { col|or: red; }');
		assert.strictEqual(isInsideComment(text, offset, false), false);
	});

	test('inside a closed block comment', () => {
		const { text, offset } = at('/* hello | world */');
		assert.strictEqual(isInsideComment(text, offset, false), true);
	});

	test('after a closed block comment', () => {
		const { text, offset } = at('/* hello world */ a { co|lor: red }');
		assert.strictEqual(isInsideComment(text, offset, false), false);
	});

	test('inside an unterminated block comment', () => {
		const { text, offset } = at('a { color: red } /* trailing | text');
		assert.strictEqual(isInsideComment(text, offset, false), true);
	});

	test('at a colon inside a multi-line block comment (issue #236215)', () => {
		const { text, offset } = at('/* element:|\n   continued */');
		assert.strictEqual(isInsideComment(text, offset, false), true);
	});

	test('block comment delimiters inside a string literal are ignored', () => {
		const { text, offset } = at('a::before { content: \'/*\'; co|lor: red }');
		assert.strictEqual(isInsideComment(text, offset, false), false);
	});

	test('SCSS line comment is detected when supported', () => {
		const { text, offset } = at('a { color: red } // line co|mment\nb { }');
		assert.strictEqual(isInsideComment(text, offset, true), true);
	});

	test('SCSS line comment is not detected for plain CSS', () => {
		const { text, offset } = at('a { color: red } // line co|mment\nb { }');
		assert.strictEqual(isInsideComment(text, offset, false), false);
	});

	test('after a SCSS line comment is not in a comment', () => {
		const { text, offset } = at('// hello\nb { co|lor: red }');
		assert.strictEqual(isInsideComment(text, offset, true), false);
	});
});
