const fs = require('fs');
const util = require('util');
const { types: t } = require('babel-core');

module.exports = function({ types: t }) {
  return {
    name: 'babel-plugin-transform-styled-components-remove-prop-types',
    visitor: {
      Program(path) {
        if (!hasPropTypesImport(path)) {
          return;
        }

        handleStyledComponents(path);
        handleExtendedComponents(path);
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

function handleStyledComponents(path) {
  const { scope } = path;
  const styledImportName = findStyledComponentsImportName(path);

  if (!styledImportName) {
    return;
  }

  const binding = scope.getBinding(styledImportName);
  const referenceNames = binding.referencePaths
    .map(findStyledVariableReferences)
    .filter(Boolean);

  removePropTypesForReferences(path, referenceNames);
}

function handleExtendedComponents(path) {
  const { scope } = path;

  const names = findExtendedNames(path);

  removePropTypesForReferences(path, names);
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
