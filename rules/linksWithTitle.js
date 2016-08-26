module.exports = ($, results) => {
  $('a').each((index, element) => {
    const title = $(element).prop('title');
    const cssClass = $(element).prop('class');
    const href = $(element).prop('href');

    const isError = !title || title.length === 0;
    results.saveResult({
      isError,
      message: isError ?
        `Link has no title, class: ${cssClass}, href: ${href}` :
        `Link has title: ${title}, class: ${cssClass}, href: ${href}`,
      params: {
        cssClass,
        href,
      },
    });
  });
};
