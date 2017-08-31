function partition(src, predicate) {
  let res1 = [],
    res2 = [];

  for (let e of src) {
    if (predicate(e)) {
      res1.push(e);
    } else {
      res2.push(e);
    }
  }

  return [res1, res2];
}

module.exports = partition;
