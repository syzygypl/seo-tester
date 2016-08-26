module.exports = ($, errors) => {
  $('a').each((index, element) => {
    const title = element ? $(element).prop('title') : '';
    if (title.length === 0) {
      const href = $(element).prop('href');
      errors.push(`Link has no title, href: ${href}`);
    }
  });
};
