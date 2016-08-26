const request = require('request');

const apiKey = process.env.PAGE_SPEED_API_KEY;
const speedErrorThreshold = process.env.PAGE_SPEED_ERROR_THRESHOLD;

if (!apiKey) {
  console.warn(
    'PageSpeed rule won\'t work without PAGE_SPEED_API_KEY env (check .env-example file)');
}

module.exports = ($, errors, params) => (
  new Promise((resolve, reject) => {
    const pageSpeedRequestUrl =
      'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?'
      + `url=${params.url}&strategy=desktop&key=${apiKey}`;

    request({
      url: pageSpeedRequestUrl,
      json: true,
    }, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        errors.push('PageSpeed error', body);

        reject();
      } else {
        const speedScore = body.ruleGroups.SPEED.score;
        if (!speedScore || speedScore < speedErrorThreshold) {
          errors.push(`Speed score is ${speedScore}`);
        }

        resolve();
      }
    });
  })
);
