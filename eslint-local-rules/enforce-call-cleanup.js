module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce calling cleanup function within a function scope",
    },
    schema: [], // No options
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      NewExpression: function (node) {
        const parentNode = node.parent;
        if (
          parentNode.type !== "AssignmentExpression" &&
          parentNode.type !== "VariableDeclarator"
        ) {
          // anonymous instance
          context.report({
            node: node,
            message:
              "Anonymous instance is discouraged as it is hard to cleanup",
          });

          return;
        }

        const instanceName = (() => {
          // it is a local variable
          // eg: const myObject = new Object();
          if (parentNode.type === "VariableDeclarator") {
            return parentNode.id.name;
          }

          const leftOfAssignment = parentNode.left;
          if (leftOfAssignment.type !== "MemberExpression") {
            throw "error: assignment need to be a member expression";
          }
          return leftOfAssignment.property.name;
        })();

        // step - 1: check if cleanup code exist in function
        const parentFunctionNode = findParentFunctionNode(node);
        const hasCleanupCodeInFunction = findCleanupNodeRecursive(
          parentFunctionNode,
          instanceName
        );

        // early return, cleanup is called within the function
        if (hasCleanupCodeInFunction) return;

        const parentClassNode = findParentClass(node);

        // When function is not contained within class, that's means the user haven't invoked cleanup
        if (!parentClassNode) {
          context.report({
            node: node,
            message: `${instanceName}.cleanup() is not invoked within it's closure, which may lead to unwanted side effects.`,
          });
          return;
        }

        // step - 2:  check if cleanup code exist in class
        const hasCleanupCodeInClass = findCleanupInClass(
          parentClassNode,
          instanceName
        );
        if (hasCleanupCodeInClass) return;
        context.report({
          node: node,
          message: `${instanceName}.cleanup() is not invoked within the scope of "${parentClassNode.id.name}" class, which may lead to unwanted side effects.`,
        });
      },
    };
  },
};

function findParentClass(node) {
  let parent = node.parent;

  while (parent) {
    if (
      parent.type === "ClassDeclaration" ||
      parent.type === "ClassExpression"
    ) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
}

function findParentFunctionNode(node) {
  let parent = node.parent;

  while (parent) {
    if (
      parent.type === "FunctionExpression" ||
      parent.type === "ArrowFunctionExpression"
    ) {
      return parent;
    }
    parent = parent.parent;
  }

  return null;
}

function findCleanupInClass(classNode, instanceName = "") {
  const classBody = classNode.body.body;

  return classBody.some((node) => {
    if (node.type !== "MethodDefinition") return false;
    return findCleanupNodeRecursive(node.value.body, instanceName);
  });
}

function findCleanupNodeRecursive(node, instanceName) {
  if (node.type === "CallExpression") {
    // THIS IS THE EXIT CONDITION, WE FOUND THE "CALL", but we are not sure which
    // the node is now called
    const isCleanupFunctionCalled =
      node.callee.property.type === "Identifier" &&
      node.callee.property.name === "cleanup";

    const isCleanupCalledFromThisExpression =
      node.callee.type === "MemberExpression" &&
      node.callee.object.property &&
      node.callee.object.property.name === instanceName;

    const isCleanupCalledFromVar = node.callee.object.name === instanceName;

    return (
      isCleanupFunctionCalled &&
      (isCleanupCalledFromThisExpression || isCleanupCalledFromVar)
    );
  }

  if (node.type === "ReturnStatement") {
    return findCleanupNodeRecursive(node.argument, instanceName);
  }

  if (node.type === "ExpressionStatement") {
    return findCleanupNodeRecursive(node.expression, instanceName);
  }

  // FOR REGULAR BODY STATEMENTS, node that has "body" field
  if (!node.body) {
    // console.log("no body, exit early");
    return false;
  }

  // traverse laterally if the "body" contain a list of children
  if (node.body instanceof Array) {
    // console.log("go deeper");
    const hasCleanupExpression = node.body.some((childNode) => {
      return findCleanupNodeRecursive(childNode, instanceName);
    });
    return hasCleanupExpression;
  }

  // else go deeper into the body
  return findCleanupNodeRecursive(node.body, instanceName);
}
