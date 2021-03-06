export const mapFor = (start, end, func) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(func(i));
  }
  return result;
};

export const mapReverseFor = (start, end, func) => {
  const result = [];
  for (let i = end - 1; i >= start; i--) {
    result.push(func(i));
  }
  return result;
};
