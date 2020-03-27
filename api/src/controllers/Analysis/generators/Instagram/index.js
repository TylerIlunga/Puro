const { generatorPipeline } = require('../../config');
module.exports = {
  generateFullNameDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateBioDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateMediaDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateFollowsDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateFollowedByDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateIsBusinessDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateProfilePictureDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
  generateWebsiteDataset(dataset) {
    return generatorPipeline(dataset, null);
  },
};
