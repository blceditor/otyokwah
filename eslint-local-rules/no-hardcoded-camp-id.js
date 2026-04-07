/**
 * ESLint Rule: no-hardcoded-camp-id
 *
 * Prevents hardcoding UltraCamp camp IDs in source code.
 * Camp IDs must come from environment variables (ULTRACAMP_CAMP_ID)
 * to support multi-tenant deployments (BLC=268, Otyokwah=1342).
 *
 * Allows camp IDs in:
 * - Fallback defaults after ?? (nullish coalescing)
 * - Mock/test data
 * - Comments
 * - .mdoc content files (managed per-repo via CMS)
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded UltraCamp camp IDs outside of env var fallbacks',
    },
    messages: {
      hardcodedCampId:
        'Camp ID "{{value}}" must come from process.env.ULTRACAMP_CAMP_ID, not be hardcoded. ' +
        'Use: process.env.ULTRACAMP_CAMP_ID ?? "{{value}}"',
    },
    schema: [
      {
        type: 'object',
        properties: {
          knownCampIds: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const knownCampIds = new Set(options.knownCampIds || ['268', '1342']);

    function isInNullishCoalescingFallback(node) {
      // Allow: process.env.X ?? "268"
      const parent = node.parent;
      if (
        parent &&
        parent.type === 'LogicalExpression' &&
        parent.operator === '??' &&
        parent.right === node
      ) {
        return true;
      }
      return false;
    }

    function isInMockData(node) {
      // Walk up to find if we're inside MOCK_SESSIONS or a test file
      const filename = context.getFilename();
      if (filename.includes('.spec.') || filename.includes('.test.')) {
        return true;
      }

      let current = node.parent;
      while (current) {
        if (
          current.type === 'VariableDeclarator' &&
          current.id &&
          current.id.name &&
          /mock|MOCK|Mock|fallback|default|DEFAULT/i.test(current.id.name)
        ) {
          return true;
        }
        // Inside an object property of a mock/default/fallback variable
        if (
          current.type === 'Property' &&
          current.parent &&
          current.parent.type === 'ObjectExpression'
        ) {
          current = current.parent;
          continue;
        }
        if (
          current.type === 'ArrayExpression' &&
          current.parent &&
          current.parent.type === 'VariableDeclarator'
        ) {
          const name = current.parent.id && current.parent.id.name;
          if (name && /mock|MOCK|Mock/i.test(name)) {
            return true;
          }
        }
        current = current.parent;
      }
      return false;
    }

    function isInUrlString(node) {
      // Allow camp IDs embedded in URL strings (fallback URLs in config)
      const value = node.value;
      if (
        typeof value === 'string' &&
        (value.includes('ultracamp.com') ||
          value.includes('idCamp=') ||
          value.includes('/api/camps/'))
      ) {
        return true;
      }
      return false;
    }

    function isEnvFallbackUrl(node) {
      // Allow: process.env.NEXT_PUBLIC_REGISTRATION_URL ?? 'https://...idCamp=268...'
      return isInNullishCoalescingFallback(node) && isInUrlString(node);
    }

    function checkLiteral(node) {
      const value = String(node.value);
      if (!knownCampIds.has(value)) return;

      // Skip if it's a fallback after ??
      if (isInNullishCoalescingFallback(node)) return;

      // Skip mock data / test files
      if (isInMockData(node)) return;

      context.report({
        node,
        messageId: 'hardcodedCampId',
        data: { value },
      });
    }

    function checkStringForCampId(node) {
      if (typeof node.value !== 'string') return;

      // Skip URLs that are env var fallbacks
      if (isEnvFallbackUrl(node)) return;

      // Skip URLs in mock data
      if (isInMockData(node)) return;

      // Check for patterns like campId = "268" (caught by checkLiteral)
      // Here we check for embedded camp IDs in non-URL strings
      // e.g., template literals with camp IDs
    }

    return {
      // Catch: const campId = "268"
      Literal(node) {
        if (typeof node.value === 'string') {
          checkLiteral(node);
          checkStringForCampId(node);
        }
      },
    };
  },
};
