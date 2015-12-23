'use strict';

const TIMEOUT = 30 * 1000;

let bug = require('./lib');
let R = require('ramda');

module.exports = (cli) => {
  return cli
    .command('bug')
    .description('Pipe in a tracked regression result to automatically file bugs')
    .option('--url <url>', 'Bugzilla API URL where bug will be filed', 'https://bugzilla.mozilla.org/rest/')
    .option('--username <username>', 'Bugzilla API username authorized to create bugs')
    .option('--password <password>', 'Bugzilla API password for username')
    .option('--timeout <milliseconds>', 'Bugzilla API timeout threshold', TIMEOUT)
    .option('--token <token>', 'Access token for URL shortening service')
    .action(function() {
      return Promise
        .all([
          cli.getOptions(this),
          cli.stdin()
        ])
        .then(R.apply(bug))
        .then(cli.JSON)
        .catch(cli.exits);
    });
};