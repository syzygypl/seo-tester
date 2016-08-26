module.exports = ($, results) => {
  const h1Count = $('h1').length;

  const isError = h1Count !== 1;
  results.saveResult({
    isError,
    message: `Found ${h1Count} h1s`,
    params: {
      h1Count,
    },
  });
};
