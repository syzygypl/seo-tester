module.exports = ($, results) => {
  $('img').each((index, element) => {
    const alt = $(element).prop('alt');
    const cssClass = $(element).prop('class');
    const src = $(element).prop('src');

    const isError = !alt || alt.length === 0;
    results.saveResult({
      isError,
      message: isError ?
        `There is no alt in img tag, class: ${cssClass}, src: ${src}` :
        `There is alt: ${alt}, class: ${cssClass}, src: ${src}`,
      params: {
        cssClass,
        src,
      },
    });
  });
};
