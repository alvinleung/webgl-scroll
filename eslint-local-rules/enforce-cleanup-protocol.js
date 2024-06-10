const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce implementation of CleanupProtocol interface",
      category: "TypeScript",
      recommended: true,
    },
    fixable: "code", // Indicate that this rule can provide an automatic fix
    schema: [], // No options to configure
  },

  create: function (context) {
    return {
      ClassDeclaration(node) {
        const existingInterfaces = node.implements
          ? node.implements.map((imp) => context.getSourceCode().getText(imp))
          : [];
        const hasCleanupProtocol = existingInterfaces.includes(
          "CleanupProtocol"
        );
        if (!hasCleanupProtocol) {
          const classDeclarationEndPos = node.body.range[0];
          const insertPos = classDeclarationEndPos - 1; // Insert before the closing curly brace

          context.report({
            node,
            message: "Classes must implement CleanupProtocol interface",
            fix: function (fixer) {
              const fixText = existingInterfaces.length
                ? `, CleanupProtocol`
                : ` implements CleanupProtocol`;
              return fixer.insertTextAfterRange(
                [insertPos, insertPos],
                fixText
              );
            },
          });
        }
      },
    };
  },
};

module.exports = rule;
