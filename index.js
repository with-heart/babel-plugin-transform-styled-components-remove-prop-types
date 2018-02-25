const fs = require('fs');
const util = require('util');
const { types: t } = require('babel-core');

module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-transform-styled-components-remove-prop-types',
    visitor: {
      Program(path) {
        if (!hasPropTypes(path)) {
          return;
        }

        const { scope } = path;
        const styledImportName = findImportName(path);
        const styledBinding = scope.getBinding(styledImportName);
        const styledReferenceNames = styledBinding.referencePaths
          .map(findStyledReferenceName)
          .filter(Boolean);
        const extendedNames = findExtendedNames(path);

        removePropTypesForReferences(
          path,
          styledReferenceNames.concat(extendedNames)
        );
      },
    },
  };
};

function hasPropTypes(path) {
  let found = false;

  path.traverse({
    ImportDeclaration(path) {
      const { node } = path;
      const importSource = node.source.value;

      if (importSource === 'prop-types') {
        found = true;
        path.stop();
      }
    },
    Identifier(path) {
      const { node } = path;

      if (node.name === 'propTypes' && t.isMemberExpression(path.parent)) {
        found = true;
        path.stop();
      }
    },
  });

  return found;
}

function findImportName(path) {
  let name;

  path.traverse({
    ImportDefaultSpecifier(path) {
      const { node, parent: parentNode } = path;

      if (
        t.isImportDeclaration(parentNode) &&
        parentNode.source.value === 'styled-components'
      ) {
        name = node.local.name;
      }
    },
  });

  return name;
}

function findStyledReferenceName(path) {
  if (!t.isMemberExpression(path.parent) && !t.isCallExpression(path.parent)) {
    return;
  }

  const variable = path.findParent(t.isVariableDeclarator);

  return variable.node.id.name;
}

function findExtendedNames(path) {
  const names = new Set();

  path.traverse({
    Identifier(path) {
      if (path.node.name !== 'extend') {
        return;
      }

      const variable = path.findParent(t.isVariableDeclarator);
      names.add(variable.node.id.name);
    },
  });

  return Array.from(names);
}

function removePropTypesForReferences(path, names) {
  path.traverse({
    Identifier(path) {
      const { node } = path;

      if (node.name !== 'propTypes' || !t.isMemberExpression(path.parent)) {
        return;
      }

      const expressionIdentifier = path.parent.object.name;
      if (!names.includes(expressionIdentifier)) {
        return;
      }

      const assignmentParent = path.findParent(t.isAssignmentExpression);

      if (assignmentParent) {
        assignmentParent.remove();
      }
    },
  });
}
