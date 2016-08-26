module.exports = ($, errors, queueItem) => {
  $('img').each((index, element) => {
    const alt = element ? $(element).prop('alt') : '';
    if (alt.length === 0) {
      errors.push([queueItem.url,'img alt',$(element).prop('class'),$(element).prop('src')]);
    }
  });
};
