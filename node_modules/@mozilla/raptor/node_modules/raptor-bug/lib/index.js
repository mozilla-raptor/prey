'use strict';

let url = require('url');
let Bitly = require('bitly');
let R = require('ramda');
let bugzilla = require('./bugzilla');
let config = require('../package.json').config;
let createDescription = require('./description');

const ONE_DAY = 1000 * 60 * 60 * 24;
const PATH_NAME = 'dashboard/script';

let createBugData = (pair) => {
  let item = R.head(pair);
  let url = R.last(pair);

  return {
    summary: `Performance regression in ${item.source.context}`,
    description: createDescription(item, url),
    product: config.bugzilla.product,
    component: config.bugzilla.contexts[item.source.context].component,
    keywords: config.bugzilla.keywords,
    op_sys: config.bugzilla.operatingSystem,
    platform: config.bugzilla.platform,
    severity: config.bugzilla.severity,
    version: config.bugzilla.version,
    cc: config.bugzilla.cc
  };
};

let getTemplateParams = R.pipe(
  R.pick(['device', 'memory', 'branch', 'test', 'metric']),
  R.toPairs,
  R.map(R.converge(R.pair, [
    R.pipe(R.head, R.concat('var-')),
    R.last
  ])),
  R.fromPairs,
  R.merge({ 'var-aggregate': '95% Bound' })
);

let getPathName = R.cond([
  [R.equals('measure'), R.always('measures')],
  [R.T, R.identity]
]);

let getShortUrl = (shorten, item) => {
  let queryParams = R.mergeAll([
    getTemplateParams(item.source),
    R.objOf('from', R.subtract(new Date(item.source.time).getTime(), ONE_DAY)),
    R.objOf('to', R.add(new Date(item.source.time).getTime(), ONE_DAY))
  ]);
  let dashboardUrl = url.format(R.merge(config.raptor.url, {
    pathname: `${PATH_NAME}/${getPathName(item.source.name)}`,
    query: queryParams
  }));

  return shorten(dashboardUrl)
    .then(response => response.data.url);
};

let createBug = (client, data) => {
  return new Promise((resolve, reject) => {
    client.createBug(data, (err, number) => err ? reject(err) : resolve(number));
  });
};

let createBugs = (client, bugs) => Promise.all(R.map(bug => createBug(client, bug), bugs));

module.exports = (options, data) => {
  let client = bugzilla(options);
  let bitly = new Bitly(options.token);
  let shorten = R.bind(bitly.shorten, bitly);

  return Promise
    .all(R.map(R.partial(getShortUrl, [shorten]), data))
    .then(R.zip(data))
    .then(R.map(createBugData))
    .then(bugs => createBugs(client, bugs));
};
