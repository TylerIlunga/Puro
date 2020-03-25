const generatePoints = dataset => {
  let points = [];
  if (Array.isArray(dataset)) {
    if (dataset.length === 0) {
      return 0;
    }
    dataset.forEach(set => {
      Object.keys(set).forEach(key => {
        points.push({
          x: key,
          y: set[key],
        });
      });
    });
    return points;
  }
  const datasetKeys = Object.keys(dataset);
  if (datasetKeys.length === 0) {
    return 0;
  }
  datasetKeys.forEach(key => {
    points.push({
      x: key,
      y: dataset[key],
    });
  });
  return points;
};

module.exports = {
  generateHistoricalDataDataset(historialData) {
    return historialData;
  },
  generateEntriesDataset(count) {
    return count;
  },
  generateClicksDataset(count) {
    return count;
  },
  generateIPCountDataset(count) {
    return count;
  },
  generateCompaniesDataset(companies) {
    return generatePoints(companies);
  },
  generateEmailsDataset(emails) {
    return generatePoints(emails);
  },
  generateUsernamesDataset(usernames) {
    return generatePoints(usernames);
  },
  generateCountriesDataset(countries) {
    return generatePoints(countries);
  },
  generateCountryCodesDataset(countryCodes) {
    return generatePoints(countryCodes);
  },
  generateSoftwareDataset(software) {
    return generatePoints(software);
  },
  generateSoftwareVersionsDataset(versions) {
    return generatePoints(versions);
  },
  generateOperatingSystemsDataset(operatingSystems) {
    return generatePoints(operatingSystems);
  },
};
