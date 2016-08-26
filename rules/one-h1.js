module.exports = ($, errors, queueItem) => {
  const h1 = $('h1');
  const h1Count = h1.length;
  if (h1Count > 1) {
    errors.push([queueItem.url,'h1','H1s on page',h1Count]);
  } else if (isNaN(h1Count)) {
    erors.push([queueItem.url,'h1','H1s on page','No H1 on page'])
  }
};
