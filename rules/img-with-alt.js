module.exports = ($, errors) => {
  $('img').each((index, element) => {
    const alt = element ? $(element).prop('alt') : '';
    if (alt.length === 0) {
      const src = $(element).prop('src');
      errors.push(`There is no alt in img tag, src: ${src}`);
    }
  });
};
