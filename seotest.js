require('dotenv').config({ silent: true });
const Crawler = require('simplecrawler');
const jsdom = require('jsdom');
const colors = require('colors');
const string = require('string');
const jquery = require('jquery');
const fs = require('fs');
const path = require('path');
const parseArgs = require('minimist');

class Results {
  constructor(onlyErrors, params) {
    this.onlyErrors = onlyErrors;
    this.params = params;
    this.results = [];
  }

  saveResult(result) {
    this.results.push(result);
  }

  printResults() {
    const activeResults = this.results.filter(result => (!this.onlyErrors || result.isError));

    if (!this.onlyErrors || activeResults.length > 0) {
      console.log('');
      // eslint-disable-next-line prefer-template
      console.log(`Results for ${this.params.url}`
        + colors.dim(` (${this.params.bufferLength} bytes, type ${this.params.contentType})`));

      activeResults.forEach(result => {
        const printWithColor = result.isError ? colors.red : colors.green;
        console.log(printWithColor(result.message));
      });
    }
  }
}

function downloadSite(initialUrl, rules, verbose) {
  const crawler = new Crawler(initialUrl);

  crawler.interval = 500;
  crawler.maxConcurrency = 3;
  crawler.decodeResponses = true;

  crawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
    process.stdout.write('.');

    if (!string(response.headers['content-type']).startsWith('text/html')) {
      return;
    }

    jsdom.env(
      responseBuffer,
      ['http://code.jquery.com/jquery.js'],
      (err, window) => {
        const $ = jquery(window);
        const params = {
          url: queueItem.url,
          bufferLength: responseBuffer.length,
          contentType: response.headers['content-type'],
        };
        const results = new Results(!verbose, params);

        const rulePromises = [];
        rules.forEach(rule => {
          const rulePromise = rule.run($, results, params);
          if (rulePromise instanceof Promise) {
            rulePromises.push(rulePromise);
          }
        });

        Promise.all(rulePromises).then(() => {
          results.printResults();
        });
      }
    );
  });

  crawler.on('complete', () => {
    console.log('');
    console.log('Done crawling! Async rules may still be in progress.');
  });

  crawler.start();
}

const argv = parseArgs(process.argv.slice(2));

if (argv._.length < 1) {
  console.error('Usage: node seotest.js http://testsite.com [enabled-rules, ...]');
  process.exit(1);
}

const enabledRules = argv._.slice(1).map(rule => (
  string(rule).chompRight('.js').toString()
));

const rulesDir = 'rules';
const normalizedPath = path.join(__dirname, rulesDir);
const loadedRules = [];
fs.readdirSync(normalizedPath).forEach(file => {
  loadedRules.push({
    name: string(file).chompRight('.js').toString(),
    run: require(`./${rulesDir}/${file}`), // eslint-disable-line global-require
  });
});

const rules = [];
console.log(colors.green('Rules'));
loadedRules.forEach(rule => {
  const isEnabled = enabledRules.length === 0 || enabledRules.includes(rule.name);
  console.log(
    `* ${rule.name.toString()} [${isEnabled ? colors.green('enabled') : colors.red('disabled')}]`);
  if (isEnabled) {
    rules.push(rule);
  }
});

downloadSite(argv._[0], rules, argv.verbose || argv.v);
