const request = require('request');

const apiKey = process.env.PAGE_SPEED_API_KEY;
const speedErrorThreshold = process.env.PAGE_SPEED_ERROR_THRESHOLD;

if (!apiKey) {
  console.warn(
    'PageSpeed rule won\'t work without PAGE_SPEED_API_KEY env (check .env-example file)');
}

module.exports = ($, results, params) => (
  new Promise((resolve, reject) => {
    const pageSpeedRequestUrl =
      'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?'
      + `url=${params.url}&strategy=desktop&key=${apiKey}`;

    request({
      url: pageSpeedRequestUrl,
      json: true,
    }, (error, response, body) => {
      const pageSpeedError = error || response.statusCode !== 200;
      let isError = pageSpeedError;

      let speedScore;
      let message;

      if (pageSpeedError) {
        message = 'PageSpeed error';
      } else {
        speedScore = body.ruleGroups.SPEED.score;
        isError = !speedScore || speedScore < speedErrorThreshold;
        message = `Speed score is ${speedScore}`;
      }

      results.saveResult({
        isError,
        message,
        params: {
          speedScore,
        },
      });

      if (isError) {
        reject();
      } else {
        resolve();
      }
    });
  })
);
