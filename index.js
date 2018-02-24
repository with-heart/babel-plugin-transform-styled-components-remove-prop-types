const fs = require('fs');
const util = require('util');
const { types: t } = require('babel-core');

module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-transform-styled-components-remove-prop-types',
    visitor: {
      Program(path) {
        const { scope } = path;

        if (!hasPropTypesImport(path)) {
          return;
        }

        const styledImportName = findStyledComponentsImportName(path);

        if (!styledImportName) {
          return;
        }

        const styledBinding = scope.bindings[styledImportName];
        const styledReferences = styledBinding.referencePaths;
        const referenceNames = styledReferences
          .map(findStyledVariableReferences)
          .filter(Boolean);

        removePropTypesForReferences(path, referenceNames);
      },
    },
  };
};

function hasPropTypesImport(path) {
  let found = false;

  path.traverse({
    ImportDeclaration(path) {
      const { node } = path;
      const importSource = node.source.value;

      if (importSource === 'prop-types') {
        found = true;
      }
    },
  });

  return found;
}

function findStyledComponentsImportName(path) {
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

function findStyledVariableReferences(path) {
  if (!t.isMemberExpression(path.parent)) {
    return;
  }

  const variable = path.findParent(t.isVariableDeclarator);

  return variable.node.id.name;
}

function removePropTypesForReferences(path, names) {
  path.traverse({
    Identifier(path) {
      const { node } = path;

      if (node.name !== 'propTypes') {
        return;
      }

      const expressionIdentifier = path.findParent(t.isMemberExpression).node
        .object.name;
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
