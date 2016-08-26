require('dotenv').config({ silent: true });
const Crawler = require('simplecrawler');
const jsdom = require('jsdom');
const colors = require('colors');
const string = require('string');
const jquery = require('jquery');
const fs = require('fs');
const path = require('path');

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
    const results = this.results.filter(result => (!this.onlyErrors || result.isError));

    if (!this.onlyErrors || results.length > 0) {
      // eslint-disable-next-line prefer-template
      console.log(`Results for ${this.params.url}`
        + colors.dim(` (${this.params.bufferLength} bytes, type ${this.params.contentType})`));

      this.results.forEach(result => {
        const printWithColor = result.isError ? colors.red : colors.green;
        console.log(printWithColor(result.message));
      });
    }
  }
}

function downloadSite(initialUrl, rules) {
  const myCrawler = new Crawler(initialUrl);

  myCrawler.interval = 500;
  myCrawler.maxConcurrency = 3;
  myCrawler.decodeResponses = true;

  myCrawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
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
        const results = new Results(true, params);

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

  myCrawler.on('complete', () => console.log('Done!'));

  myCrawler.start();
}

if (process.argv.length < 3) {
  console.error('Usage: node seotest.js http://testsite.com [enabled-rules, ...]');
  process.exit(1);
}

const enabledRules = process.argv.splice(3).map(rule => (
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

downloadSite(process.argv[2], rules);
