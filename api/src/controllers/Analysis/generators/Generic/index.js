const { generatePieChartData } = require('../../config');

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
    return generatePieChartData(companies);
  },
  generateEmailsDataset(emails) {
    return generatePieChartData(emails);
  },
  generateUsernamesDataset(usernames) {
    return generatePieChartData(usernames);
  },
  generateCountriesDataset(countries) {
    return generatePieChartData(countries);
  },
  generateCountryCodesDataset(countryCodes) {
    return generatePieChartData(countryCodes);
  },
  generateSoftwareDataset(software) {
    return generatePieChartData(software);
  },
  generateSoftwareVersionsDataset(versions) {
    return generatePieChartData(versions);
  },
  generateOperatingSystemsDataset(operatingSystems) {
    return generatePieChartData(operatingSystems);
  },
};
