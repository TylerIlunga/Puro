const { generatorPipeline } = require('../../config');
module.exports = {
  generateEmailDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateNameDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateFamilyNameDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateGivenNameDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateLinkDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateLocaleDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generatePictureDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateVerifiedEmailDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
};
