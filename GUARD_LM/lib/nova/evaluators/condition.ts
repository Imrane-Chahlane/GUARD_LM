import jsep from 'jsep';

// Add custom operators if needed (like 'any of')
// For now, we'll stick to standard boolean logic: and, or, not
// jsep supports &&, ||, ! by default.
// We can pre-process the condition to map 'and' -> '&&', 'or' -> '||', 'not' -> '!'

export function evaluateCondition(
  condition: string,
  results: Record<string, boolean>
): boolean {
  if (!condition) return false;

  // Pre-process standard logic words to JS operators
  const processed = condition
    .replace(/\band\b/gi, '&&')
    .replace(/\bor\b/gi, '||')
    .replace(/\bnot\b/gi, '!');

  try {
    const parseTree = jsep(processed);

    const evaluate = (node: jsep.Expression): boolean => {
      switch (node.type) {
        case 'Identifier':
          // Section prefixes like keywords.$var
          return !!results[node.name];
        
        case 'MemberExpression': {
          // Handles keywords.$var where keywords is the object and $var is the property
          const object = node.object.name; // keywords
          const property = node.property.name; // $var
          const fullName = `${object}.${property}`;
          return !!results[fullName] || !!results[property];
        }

        case 'UnaryExpression':
          if (node.operator === '!') return !evaluate(node.argument);
          throw new Error(`Unsupported unary operator: ${node.operator}`);

        case 'BinaryExpression':
          if (node.operator === '&&') return evaluate(node.left) && evaluate(node.right);
          if (node.operator === '||') return evaluate(node.left) || evaluate(node.right);
          throw new Error(`Unsupported binary operator: ${node.operator}`);

        case 'LogicalExpression':
          if (node.operator === '&&') return evaluate(node.left) && evaluate(node.right);
          if (node.operator === '||') return evaluate(node.left) || evaluate(node.right);
          throw new Error(`Unsupported logical operator: ${node.operator}`);

        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
    };

    return !!evaluate(parseTree);
  } catch (error) {
    console.error('Condition evaluation error:', error);
    return false;
  }
}
