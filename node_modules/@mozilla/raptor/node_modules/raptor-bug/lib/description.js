'use strict';

let R = require('ramda');

let pluckMetadata = R.omit(['value', 'metric', 'revisionId', 'time', 'context']);

let createDetailString = (acc, pair) => acc + `[ ${R.head(pair)} ] ${R.last(pair)}\n`;

let createDetails = R.pipe(
  R.toPairs,
  R.reduce(createDetailString, '')
);

module.exports = (item, url) => {
  let source = item.source;
  let previous = item.previous;

  return `Raptor has detected a possible Firefox OS performance regression:

[ Context ] ${source.context}
[ Metric ] ${source.metric}
[ Old Value ] ${previous.value.toFixed(3)}
[ New Value ] ${source.value.toFixed(3)}
[ Regression ] ${(source.value - previous.value).toFixed(3)}

[ Time ] ${new Date(source.time)}
[ Dashboard URL ] ${url}

--- Regressor ---

${createDetails(pluckMetadata(source))}

--- Previous ---

${createDetails(pluckMetadata(previous))}`;
};
