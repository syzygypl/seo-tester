const Crawler = require('simplecrawler');
const jsdom = require('jsdom');
const colors = require('colors');
const string = require('string');
const jquery = require('jquery');
const fs = require('fs');
const path = require('path');
const writeCsv = require('csv-write-stream');

const writer = writeCsv({headers: ['url','type of error','class/message','href/src/h1 message']});



const rulesDir = 'rules';
const normalizedPath = path.join(__dirname, rulesDir);
const rules = [];
fs.readdirSync(normalizedPath).forEach(file => {
  // eslint-disable-next-line global-require
  rules.push(require(`./${rulesDir}/${file}`));
});


function downloadSite(initialUrl) {
  const myCrawler = new Crawler(initialUrl);

  myCrawler.interval = 250;
  myCrawler.maxConcurrency = 5;
  myCrawler.decodeResponses = true;

  writer.pipe(fs.createWriteStream('results.csv'))

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

        rules.forEach(rule => {
          rule($, errors, queueItem);
        });

        if (errors.length > 0) {
          console.log(colors.dim('Just received %s (%d bytes, type %s)'), queueItem.url,
            responseBuffer.length, response.headers['content-type']);

          while (errors.length > 0) {
            writer.write(errors.shift());
          }
        }
      }
    );
  });

  myCrawler.on('complete', () => {
    writer.end()
    console.log('Done!')
  });

  myCrawler.start();
}

if (process.argv.length < 3) {
  console.error('Usage: node seotest.js http://testsite.com');
  process.exit(1);
}

downloadSite(process.argv[2]);
