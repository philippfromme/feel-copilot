import {
  unaryTest as evalUnaryTest,
  evaluate as evalExpression,
  parseExpression,
  parseUnaryTests
} from 'feelin';

const parsers = {
  expression: parseExpression,
  unaryTests: parseUnaryTests
};

const interpreters = {
  expression: evalExpression,
  unaryTests: evalUnaryTest
};

export { SyntaxError } from 'feelin';

/**
 * @param { string } type
 * @param { string } expression
 * @param { import('feelin').InterpreterContext } context
 *
 * @return { any }
 */
export function evaluate(type, expression, context) {

  const interpreter = interpreters[type];

  if (!interpreter) {
    throw new Error('unknown type ' + type);
  }

  return interpreter(expression, context);
}

/**
 * @param { string } type
 * @param { string } expression
 * @param { import('feelin').ParseContext } context
 *
 * @return { import('feelin').ParseResult }
 */
export function parse(type, expression, context) {
  const parser = parsers[type];

  if (!parser) {
    throw new Error('unknown type ' + type);
  }

  return parser(expression, context);
}