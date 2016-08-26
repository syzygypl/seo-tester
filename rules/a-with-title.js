module.exports = ($, errors, queueItem) => {
  $('a').each((index, element) => {
    const title = element ? $(element).prop('title') : '';
    if (title.length === 0) {
      errors.push([queueItem.url,'a title',$(element).prop('class'),$(element).prop('href')]);
    }
  });
};
