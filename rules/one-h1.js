module.exports = ($, errors) => {
  const h1Count = $('h1').length;
  if (h1Count !== 1) {
    errors.push(`Found ${h1Count} h1s`);
  }
};
