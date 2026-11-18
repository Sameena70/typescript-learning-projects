import { AngleMode } from './types.js';
import {
  factorial,
  safeSin,
  safeCos,
  safeTan,
  safeAsin,
  safeAcos,
  safeAtan,
  safeLog10,
  safeLn,
  safeSqrt,
  safeCbrt,
  safePower,
  safeModulo
} from './scientific-logic.js';

type TokenType = 'NUMBER' | 'OP' | 'LPAREN' | 'RPAREN' | 'FUNC';

interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i];

    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < s.length && /[0-9.]/.test(s[i])) {
        numStr += s[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^' || ch === '%') {
      if (ch === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'OP' || tokens[tokens.length - 1].type === 'LPAREN')) {
        let numStr = '-';
        i++;
        while (i < s.length && /[0-9.]/.test(s[i])) {
          numStr += s[i];
          i++;
        }
        if (numStr === '-') {
          tokens.push({ type: 'FUNC', value: 'neg' });
        } else {
          tokens.push({ type: 'NUMBER', value: numStr });
        }
        continue;
      }
      tokens.push({ type: 'OP', value: ch });
      i++;
      continue;
    }

    if (/[a-zA-Zπ]/.test(ch)) {
      let ident = '';
      while (i < s.length && /[a-zA-Z0-9π⁻¹]/.test(s[i])) {
        ident += s[i];
        i++;
      }

      if (ident === 'π' || ident === 'pi') {
        tokens.push({ type: 'NUMBER', value: String(Math.PI) });
      } else if (ident === 'e') {
        tokens.push({ type: 'NUMBER', value: String(Math.E) });
      } else {
        tokens.push({ type: 'FUNC', value: ident });
      }
      continue;
    }

    i++;
  }

  return tokens;
}

const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3
};

export function evaluateExpression(expr: string, angleMode: AngleMode = 'DEG'): number {
  const tokens = tokenize(expr);
  if (tokens.length === 0) return 0;

  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'FUNC') {
      operatorStack.push(token);
    } else if (token.type === 'OP') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === 'OP' &&
        PRECEDENCE[operatorStack[operatorStack.length - 1].value] >= PRECEDENCE[token.value]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack.length === 0) {
        throw new Error('Mismatched parentheses');
      }
      operatorStack.pop();
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === 'FUNC') {
        outputQueue.push(operatorStack.pop()!);
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Mismatched parentheses');
    }
    outputQueue.push(top);
  }

  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (token.type === 'NUMBER') {
      const val = parseFloat(token.value);
      if (isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
      evalStack.push(val);
    } else if (token.type === 'OP') {
      if (evalStack.length < 2) throw new Error('Invalid mathematical expression');
      const b = evalStack.pop()!;
      const a = evalStack.pop()!;
      switch (token.value) {
        case '+': evalStack.push(a + b); break;
        case '-': evalStack.push(a - b); break;
        case '*': evalStack.push(a * b); break;
        case '/':
          if (b === 0) throw new Error('Cannot divide by zero');
          evalStack.push(a / b);
          break;
        case '%': evalStack.push(safeModulo(a, b)); break;
        case '^': evalStack.push(safePower(a, b)); break;
        default: throw new Error(`Unsupported operator: ${token.value}`);
      }
    } else if (token.type === 'FUNC') {
      if (evalStack.length < 1) throw new Error(`Function ${token.value} missing argument`);
      const arg = evalStack.pop()!;
      switch (token.value) {
        case 'sin': evalStack.push(safeSin(arg, angleMode)); break;
        case 'cos': evalStack.push(safeCos(arg, angleMode)); break;
        case 'tan': evalStack.push(safeTan(arg, angleMode)); break;
        case 'asin':
        case 'sin⁻¹': evalStack.push(safeAsin(arg, angleMode)); break;
        case 'acos':
        case 'cos⁻¹': evalStack.push(safeAcos(arg, angleMode)); break;
        case 'atan':
        case 'tan⁻¹': evalStack.push(safeAtan(arg, angleMode)); break;
        case 'log': evalStack.push(safeLog10(arg)); break;
        case 'ln': evalStack.push(safeLn(arg)); break;
        case 'sqrt':
        case '√': evalStack.push(safeSqrt(arg)); break;
        case 'cbrt':
        case '∛': evalStack.push(safeCbrt(arg)); break;
        case 'abs': evalStack.push(Math.abs(arg)); break;
        case 'fact': evalStack.push(factorial(arg)); break;
        case 'neg': evalStack.push(-arg); break;
        default: throw new Error(`Unknown function: ${token.value}`);
      }
    }
  }

  if (evalStack.length !== 1) {
    throw new Error('Invalid expression structure');
  }

  const finalVal = evalStack[0];
  if (!Number.isFinite(finalVal) || Number.isNaN(finalVal)) {
    throw new Error('Calculation resulted in undefined value');
  }

  return finalVal;
}
