// @flow weak
const gd = global.gd;

const enumerateExtensionExpressions = (
  expressions,
  objectMetadata,
  behaviorMetadata
) => {
  const allExpressions = [];

  //Get the map containing the metadata of the expression provided by the extension...
  var expressionsTypes = expressions.keys();

  //... and add each instruction
  for (var j = 0; j < expressionsTypes.size(); ++j) {
    var exprMetadata = expressions.get(expressionsTypes.get(j));
    if (!exprMetadata.isShown()) {
      //Skip hidden expressions
      continue;
    }

    var parameters = [];
    for (var i = 0; i < exprMetadata.getParametersCount(); i++) {
      if (objectMetadata && i == 0) continue;
      if (behaviorMetadata && i <= 1) continue; //Skip object and behavior parameters
      if (exprMetadata.getParameter(i).isCodeOnly()) continue;

      parameters.push(exprMetadata.getParameter(i));
    }

    allExpressions.push({
      name: expressionsTypes.get(j),
      metadata: exprMetadata,
      parameters: parameters,
      objectMetadata: objectMetadata,
      behaviorMetadata: behaviorMetadata,
    });
  }

  return allExpressions;
};

export const enumerateExpressions = (type = 'number') => {
  const freeExpressions = [];
  const objectsExpressions = [];
  const behaviorsExpressions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (var i = 0; i < allExtensions.size(); ++i) {
    var extension = allExtensions.get(i);
    var allObjectsTypes = extension.getExtensionObjectsTypes();
    var allBehaviorsTypes = extension.getBehaviorsTypes();

    //Check which type of expression we want to autocomplete.
    var allFreeExpressionsGetter = extension.getAllExpressions;
    var allObjectExpressionsGetter = extension.getAllExpressionsForObject;
    var allBehaviorExpressionsGetter = extension.getAllExpressionsForBehavior;
    if (type === 'string') {
      allFreeExpressionsGetter = extension.getAllStrExpressions;
      allObjectExpressionsGetter = extension.getAllStrExpressionsForObject;
      allBehaviorExpressionsGetter = extension.getAllStrExpressionsForBehavior;
    }

    //Free expressions
    freeExpressions.push.apply(
      freeExpressions,
      enumerateExtensionExpressions(allFreeExpressionsGetter.call(extension))
    );

    //Objects expressions:
    for (var j = 0; j < allObjectsTypes.size(); ++j) {
      var objMetadata = extension.getObjectMetadata(allObjectsTypes.get(j));
      objectsExpressions.push.apply(
        objectsExpressions,
        enumerateExtensionExpressions(
          allObjectExpressionsGetter.call(extension, allObjectsTypes.get(j)),
          objMetadata
        )
      );
    }

    //Behaviors expressions:
    for (var j = 0; j < allBehaviorsTypes.size(); ++j) {
      var autoMetadata = extension.getBehaviorMetadata(
        allBehaviorsTypes.get(j)
      );
      behaviorsExpressions.push.apply(
        behaviorsExpressions,
        enumerateExtensionExpressions(
          allBehaviorExpressionsGetter.call(
            extension,
            allBehaviorsTypes.get(j)
          ),
          undefined,
          autoMetadata
        )
      );
    }
  }

  return {
    allExpressions: [
      ...freeExpressions,
      ...objectsExpressions,
      ...behaviorsExpressions,
    ],
    freeExpressions,
    objectsExpressions,
    behaviorsExpressions,
  };
};

export const filterExpressions = (list, searchText) => {
    if (!searchText) return list;
    const lowercaseSearchText = searchText.toLowerCase();

    return list.filter(enumeratedExpression => {
      return (
        enumeratedExpression.name
          .toLowerCase()
          .indexOf(lowercaseSearchText) !== -1
      );
    });
}
