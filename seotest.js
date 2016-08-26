require('dotenv').config({ silent: true });
const Crawler = require('simplecrawler');
const jsdom = require('jsdom');
const colors = require('colors');
const string = require('string');
const jquery = require('jquery');
const fs = require('fs');
const path = require('path');

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
        const errors = [];
        const params = {
          url: queueItem.url,
        };

        const rulePromises = [];
        rules.forEach(rule => {
          const rulePromise = rule.run($, errors, params);
          if (rulePromise instanceof Promise) {
            rulePromises.push(rulePromise);
          }
        });

        Promise.all(rulePromises).then(() => {
          if (errors.length > 0) {
            console.log(colors.dim('Just received %s (%d bytes, type %s)'), queueItem.url,
              responseBuffer.length, response.headers['content-type']);

            while (errors.length > 0) {
              console.log(colors.red(errors.shift()));
            }
          }
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
