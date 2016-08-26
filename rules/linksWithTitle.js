module.exports = ($, errors) => {
  $('a').each((index, element) => {
    const title = $(element).prop('title');
    if (!title || title.length === 0) {
      const cssClass = $(element).prop('class');
      const href = $(element).prop('href');
      errors.push(`Link has no title, class: ${cssClass}, href: ${href}`);
    }
  });
};
