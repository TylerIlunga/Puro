const { generatorPipeline } = require('../../config');

module.exports = {
  generateEmailsDataset(emails) {
    console.log('generateEmailsDataset()', emails);
    return generatorPipeline(emails);
  },
  generateClicksDataset(clicks) {
    console.log('generateClicksDataset()', clicks);
    return generatorPipeline(clicks);
  },
  generateCountryCodeDataset(codes) {
    console.log('generateCountryCodeDataset()', codes);
    return generatorPipeline(codes);
  },
  generateSoftwareNameDataset(names) {
    console.log('generateSoftwareNameDataset()', names);
    return generatorPipeline(names);
  },
  generateSoftwareVersionDataset(versions) {
    console.log('generateSoftwareVersionDataset()', versions);
    return generatorPipeline(emaiversionsls);
  },
  generateOperatingSystemDataset(os) {
    console.log('generateOperatingSystemDataset()', os);
    return generatorPipeline(os);
  },
  generateLinkDataset(links) {
    console.log('generateLinkDataset()', links);
    return generatorPipeline(links);
  },
  generateIpDataset(ips) {
    console.log('generateIpDataset()', ips);
    return generatorPipeline(ips);
  },
};
