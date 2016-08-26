const Crawler = require('simplecrawler');
const jsdom = require('jsdom');
const colors = require('colors');
const str = require('string');
const jquery = require('jquery');
const sprintf = require('sprintf-js');

function downloadSite(initialUrl) {
  const myCrawler = new Crawler(initialUrl);

  myCrawler.interval = 250;
  myCrawler.maxConcurrency = 5;
  myCrawler.decodeResponses = true;

  myCrawler.on('fetchcomplete', (queueItem, responseBuffer, response) => {
    if (!str(response.headers['content-type']).startsWith('text/html')) {
      return;
    }

    jsdom.env(
      responseBuffer,
      ['http://code.jquery.com/jquery.js'],
      (err, window) => {
        const $ = jquery(window);

        const errors = [];

        const h1 = $('h1');
        const h1Count = h1.length;
        if (h1Count !== 1) {
          errors.push(sprintf.sprintf('Found %d h1s', h1Count));
        }

        const images = $('img');
        images.each((index, element) => {
          const alt = element ? $(element).prop('alt') : '';
          if (alt.length === 0) {
            errors.push(sprintf.sprintf('There is no alt in img tag, src: %s',
              $(element).prop('src')));
          }
        });

        if ($('img.navigation__logo-img').length < 1) {
          console.log(errors.push('No img logo found'));
        }
        const a = $('a');
        a.each((index, element) => {
          const title = element ? $(element).prop('title') : '';
          if (title.length === 0) {
            errors.push(sprintf.sprintf('Link has no title, href: %s', $(element).prop('href')));
          }
        });

        const title = $('title').html();
        if (!title || !str(title).endsWith('| BebiKlub')) {
          errors.push(sprintf.sprintf('Title is BROKEN, title: %s', title));
        }

        if (errors.length > 0) {
          console.log(colors.dim('Just received %s (%d bytes, type %s)'), queueItem.url,
            responseBuffer.length, response.headers['content-type']);

          while (errors.length > 0) {
            console.log(colors.red(errors.shift()));
          }
        }
      }
    );
  });

  myCrawler.on('complete', () => console.log('Done!'));

  myCrawler.start();
}

if (process.argv.length < 3) {
  console.log('Usage: node seotest.js http://testsite.com');
  process.exit(1);
}

downloadSite(process.argv[2]);
