// Safe math evaluator for calculator expressions
export const evaluateExpression = (expr: string): number => {
  if (!expr || expr.trim() === '') return 0;

  // Clean expression: replace unicode multipliers and divisions
  let sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/%/g, '*0.01');

  // Strip unwanted characters, allowing only numbers, decimal, and basic operators
  sanitized = sanitized.replace(/[^0-9+\-*/.]/g, '');

  if (!sanitized) return 0;

  // Remove trailing operators
  while (/[+\-*/.]$/.test(sanitized)) {
    sanitized = sanitized.slice(0, -1);
  }

  if (!sanitized) return 0;

  try {
    // Tokenize into numbers and operators
    const tokens = sanitized.match(/(\d+(\.\d+)?|[+\-*/])/g);
    if (!tokens || tokens.length === 0) return 0;

    // Handle operator precedence (* and / first, then + and -)
    const values: number[] = [];
    const ops: string[] = [];

    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token === '+' || token === '-' || token === '*' || token === '/') {
        ops.push(token);
        i++;
      } else {
        let val = parseFloat(token);
        if (isNaN(val)) val = 0;

        // If the preceding operator is * or /, compute immediately
        if (ops.length > 0 && (ops[ops.length - 1] === '*' || ops[ops.length - 1] === '/')) {
          const op = ops.pop()!;
          const prevVal = values.pop() || 0;
          if (op === '*') {
            val = prevVal * val;
          } else if (op === '/') {
            val = val !== 0 ? prevVal / val : 0;
          }
        }
        values.push(val);
        i++;
      }
    }

    // Now evaluate + and -
    let result = values[0] || 0;
    for (let j = 0; j < ops.length; j++) {
      const op = ops[j];
      const nextVal = values[j + 1] !== undefined ? values[j + 1] : 0;
      if (op === '+') {
        result += nextVal;
      } else if (op === '-') {
        result -= nextVal;
      }
    }

    // Round to avoid floating point precision quirks (e.g. 0.1 + 0.2 = 0.30000000000000004)
    return Math.round(result * 10000) / 10000;
  } catch (e) {
    console.error('Calculator eval error', e);
    return 0;
  }
};
