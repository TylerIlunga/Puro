module.exports = {
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  snakeToCamelCase(text) {
    const result = text
      .replace(/([-_][a-z])/gi, newText => {
        return newText
          .toUpperCase()
          .replace('-', '')
          .replace('_', '');
      })
      .replace(/_/, '');
    return result;
  },
};
