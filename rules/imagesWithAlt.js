module.exports = ($, errors) => {
  $('img').each((index, element) => {
    const alt = $(element).prop('alt');
    if (!alt || alt.length === 0) {
      const cssClass = $(element).prop('class');
      const src = $(element).prop('src');
      errors.push(`There is no alt in img tag, class: ${cssClass}, src: ${src}`);
    }
  });
};
