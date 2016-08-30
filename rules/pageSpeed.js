const request = require('request');

const apiKey = process.env.PAGE_SPEED_API_KEY;
const speedErrorThreshold = process.env.PAGE_SPEED_ERROR_THRESHOLD;

function onResponse(results, resolve, reject, error, response, body, type) {
  const pageSpeedError = error || response.statusCode !== 200;
  let isError = pageSpeedError;

  let speedScore;
  let message;

  if (pageSpeedError) {
    message = `PageSpeed error, status code: ${response.statusCode},`
      + `message: ${response.body.error.message}`;
  } else {
    speedScore = body.ruleGroups.SPEED.score;
    isError = !speedScore || speedScore < speedErrorThreshold;
    message = `${type === 'desktop' ? 'Desktop' : 'Mobile'} speed score is ${speedScore}`;
  }

  results.saveResult({
    isError,
    message,
    params: {
      speedScore,
    },
  });

  if (pageSpeedError) {
    reject();
  } else {
    resolve();
  }
}

if (!apiKey) {
  console.warn(
    'PageSpeed rule won\'t work without PAGE_SPEED_API_KEY env (check .env-example file)');
}

module.exports = ($, results, params) => (
  new Promise((resolve, reject) => {
    const pageSpeedDesktopRequestUrl =
      'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?'
      + `url=${params.url}&strategy=desktop&key=${apiKey}`;

    const pageSpeedMobileRequestUrl =
      'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?'
      + `url=${params.url}&strategy=mobile&key=${apiKey}`;

    const desktopRequestPromise = new Promise((resolveDesktop, rejectDesktop) => {
      request({
        url: pageSpeedDesktopRequestUrl,
        json: true,
      }, (error, response, body) => {
        onResponse(results, resolveDesktop, rejectDesktop, error, response, body, 'desktop');
      });
    });

    const mobileRequestPromise = new Promise((resolveMobile, rejectMobile) => {
      request({
        url: pageSpeedMobileRequestUrl,
        json: true,
      }, (error, response, body) => {
        onResponse(results, resolveMobile, rejectMobile, error, response, body, 'mobile');
      });
    });

    Promise.all([desktopRequestPromise, mobileRequestPromise]).then(() => {
      resolve();
    }, () => {
      reject();
    });
  })
);
