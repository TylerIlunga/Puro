const generatePieChartData = dataset => {
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

const generateLineChartData = (dataset, label) => {
  if (!dataset.createdAt) {
    return { x: label, y: dataset };
  }
  let lineChartPoint = {
    created_at: dataset.createdAt,
  };
  lineChartPoint[label] = dataset;
  return lineChartPoint;
};

const organizeDataset = (dataset, key) => {
  switch (typeof dataset) {
    case 'string':
      return { x: dataset, y: 1 };
    case 'number':
      return generateLineChartData(dataset, key);
    case 'object':
      return generatePieChartData(dataset, key);
    default:
      return null;
  }
};

module.exports = {
  generatorPipeline(dataset, key) {
    if (dataset === null) return dataset;
    return organizeDataset(dataset, key);
  },
};
