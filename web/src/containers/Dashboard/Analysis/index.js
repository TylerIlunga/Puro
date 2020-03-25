import React, { Component } from 'react';
import config from '../../../config';
import tools from '../../../tools';
import './styles.css';

class Analysis extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: [],
      chartType: 'pie',
    };
    this.Chart = window.Chart;
    this.generateChart = this.generateChart.bind(this);
    this.renderAnalyticCards = this.renderAnalyticCards.bind(this);
    this.renderCharts = this.renderCharts.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log('componentDidUpdate() prev', prevProps, prevState, snapshot);
    // console.log('componentDidUpdate() this', this.props);
    // console.log('this.props.fetchingAnalytics', this.props.fetchingAnalytics);
    // console.log('prevProps.fetchingAnalytics', prevProps.fetchingAnalytics);
    const analyticalData = this.props.analyticalData;
    const adKeys = Object.keys(analyticalData);
    console.log('componentDidUpdate() adKeys', adKeys);

    if (adKeys.length === 0 && !this.props.displayNoAnalyticsMessage) {
      this.props.handleNoAnalyticsMessage(true);
      return this.props.isFetchingAnalysis(false);
    }

    if (adKeys.length > 0 && this.props.fetchingAnalytics) {
      adKeys.forEach((key, index) => {
        const currentDataset = analyticalData[key];
        if (typeof currentDataset !== 'number') {
          this.generateChart(index, key, currentDataset);
        }
        console.log('typeof currentDataset', typeof currentDataset);
      });
    }
    return true;
  }

  getObjectKeys(obj) {
    return Object.keys(obj);
  }

  gatherChartDataAndOptions(index, title, currentDataset) {
    let chartType;
    let chartData;
    let chartOptions;
    chartType = this.handleGraphChartTypes(index, title, currentDataset);
    chartData = this.handleGraphChartData(index, title, currentDataset);
    chartOptions = this.generateChartOptions(index);
    return { chartType, chartData, chartOptions };
  }

  handleGraphChartTypes(index, title, currentDataset) {
    // NOTE: change for new chart types needed dynamically.
    // via "type" prop in "currentDataset"
    if (index == 0) {
      return 'line';
    }
    return 'pie';
  }

  handleGraphChartData(index, title, currentDataset) {
    if (index == 0) {
      return {
        datasets: this.handleGraphDatasets(index, title, currentDataset),
      };
    }
    return {
      labels: this.handleGraphLabels(index, title, currentDataset),
      datasets: this.handleGraphDatasets(index, title, currentDataset),
    };
  }

  handleGraphLabels(index, key, dataset) {
    if (index === 0) {
      let labels = [];
      const sKeys = this.getObjectKeys(dataset[0]);
      // console.log('handleGraphLabels() sKeys:', sKeys);
      sKeys.forEach((key, index) => {
        if (index !== sKeys.length - 1) {
          labels.push(key.toUpperCase());
        }
      });
      return labels;
    }
    // console.log('handleGraphLabels() typeof dataset', typeof dataset, dataset);
    // "number" case && "string" case
    if (typeof dataset === 'number' || typeof dataset === 'string') {
      return dataset;
    }
    // "object" cases (isArray && !isArray) via Array.isArray(obj)
    if (typeof dataset === 'object' && Array.isArray(dataset)) {
      let labels = [];
      dataset.forEach(set => {
        labels.push(set.x);
      });
      // console.log('handleGraphLabels() line 105 labels:', labels);
      return labels;
    }
    // NOTE: Below Shouldn't happen.
    // if (typeof dataset === 'object' && !Array.isArray(dataset)) {
    //   return dataset
    // };
    return [0, 10, 20, 30];
  }

  handleGraphDatasets(index, key, dataset) {
    if (index === 0) {
      let organizedDataset = {};
      let datasets = [];
      dataset.forEach(set => {
        const sKeys = this.getObjectKeys(set);
        sKeys.forEach((key, i) => {
          if (i !== sKeys.length - 1) {
            if (!organizedDataset[key]) {
              organizedDataset[key] = [];
            }
            organizedDataset[key].push({
              x: new Date(Number(set.created_at)),
              y: set[key],
            });
          }
        });
      });
      Object.keys(organizedDataset).forEach((label, odIndex) => {
        datasets.push({
          label,
          data: organizedDataset[label],
          borderColor: tools.shuffleArray(config.testGraphColors)[
            config.testGraphColors.length - 1 - odIndex
          ],
          backgroundColor: 'transparent',
        });
      });
      console.log('handleGraphDatasets() line 143 datasets:', datasets);
      return datasets;
    }

    if (typeof dataset === 'object' && Array.isArray(dataset)) {
      let values = [];
      dataset.forEach(set => {
        values.push(set.y);
      });
      console.log('handleGraphDatasets() line 152 values:', values);
      return [
        {
          data: values,
          backgroundColor: tools.shuffleArray(config.testGraphColors),
        },
      ];
    }
    return [{ data: [] }];
  }

  generateChartOptions(index) {
    /** Timeseries chart first */
    if (index == 0) {
      return {
        scales: {
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              time: {
                displayFormats: {
                  day: 'MMM D',
                },
              },
            },
          ],
        },
      };
    }
    return {};
  }

  generateChart(index, title, currentDataset) {
    console.log('myChart_${index}', `myChart_${index}`);
    let ctx = document.getElementById(`myChart_${index}`);
    // console.log('ctx', ctx);
    const {
      chartType,
      chartData,
      chartOptions,
    } = this.gatherChartDataAndOptions(index, title, currentDataset);
    console.log('generateChart chartType:', chartType);
    console.log('generateChart chartData:', chartData);
    console.log('generateChart chartOptions:', chartOptions);
    let myChart = new this.Chart(ctx, {
      type: chartType,
      data: chartData,
      options: chartOptions,
    });
    return this.props.isFetchingAnalysis(false);
  }

  renderCardTitle(label) {
    const title = this.props.fetchingAnalytics ? 'Loading...' : label;
    return <h3 className='analytics-card-header'>{title}</h3>;
  }

  renderCharts(index, dataset) {
    if (typeof dataset === 'number') {
      return <h4 id={`card_value_${index}`}>{dataset}</h4>;
    }
    console.log('renderCharts() myChart_${index}', `myChart_${index}`);
    return <canvas id={`myChart_${index}`} width='500' height='500' />;
  }

  populateCards(adKeys, analyticalData) {
    //** { HD: [...], TE: {} } */
    //** adKeys: [HD, TE] */
    /** key: HD, TE */
    /** currentDataset: [...], {} */
    console.log('populateCards() adKeys', adKeys);
    let cards = [];
    let index = 0;
    while (index < adKeys.length) {
      const key = adKeys[index];
      let currentDataset = analyticalData[key];
      const cardColumnValue = index !== 0 ? 'col-6' : 'col-12';
      if (currentDataset !== null) {
        if (index == 0) {
          cards.push(
            <div key={index} className='row'>
              <div className={`card ${cardColumnValue}`}>
                <div className='card-body info-card'>
                  {this.renderCardTitle(key)}
                  {this.renderCharts(index, currentDataset)}
                </div>
              </div>
            </div>,
          );
          index++;
          continue;
        }
        if (index + 1 > adKeys.length - 1) {
          cards.push(
            <div key={index} className='row'>
              <div className={`card ${cardColumnValue}`}>
                <div className='card-body info-card'>
                  {this.renderCardTitle(key)}
                  {this.renderCharts(index, currentDataset)}
                </div>
              </div>
            </div>,
          );
          break;
        }
        cards.push(
          <div key={index} className='row'>
            <div className={`card ${cardColumnValue}`}>
              <div className='card-body info-card'>
                {this.renderCardTitle(key)}
                {this.renderCharts(index, currentDataset)}
              </div>
            </div>
            <div className={`card ${cardColumnValue}`}>
              <div className='card-body info-card'>
                {this.renderCardTitle(adKeys[index + 1])}
                {this.renderCharts(
                  index + 1,
                  analyticalData[adKeys[index + 1]],
                )}
              </div>
            </div>
          </div>,
        );
      }
      index += index !== 0 ? 2 : 1;
    }
    return cards;
  }

  renderAnalyticCards() {
    const analyticalData = this.props.analyticalData;
    const adKeys = Object.keys(analyticalData);
    console.log('renderAnalyticCards() adKeys', adKeys);
    if (adKeys.length > 0) {
      let cards = [];
      adKeys.forEach(key => {
        if (analyticalData[key]) {
          //** analyticalData: { HD: [...], TE: {} } */
          //** adKeys: [HD, TE] */
          /** key: HD, TE */
          /** analyticalData[key]: [...], {} */
          cards = this.populateCards(adKeys, analyticalData);
        }
      });
      console.log('cards', cards);
      if (cards.length === 0 && !this.props.displayNoAnalyticsMessage) {
        this.props.handleNoAnalyticsMessage(true);
      }
      return cards.map(card => {
        return card;
      });
    }
  }

  renderHeaderMenu() {
    return (
      <div className='col-3 header-menu'>
        <li className='nav-item dropdown'>
          <a
            id='profile-dropdown'
            className='nav-link dropdown-toggle'
            data-toggle='dropdown'
            href='#0'
            role='button'
            aria-haspopup='true'
            aria-expanded='false'
          >
            Profile
          </a>
          <div className='dropdown-menu'>
            <a className='dropdown-item' href='#0'>
              Action
            </a>
            <div className='dropdown-divider' />
            <a
              className='dropdown-item'
              href='#logout'
              onClick={this.handleLogOut}
            >
              Log Out
            </a>
          </div>
        </li>
      </div>
    );
  }

  renderAnalysisTitle() {
    return (
      <h3 className='header-label col-9'>
        {this.props.fetchingAnalytics ? 'Loading' : 'Analysis'}
      </h3>
    );
  }

  renderAnalysisHeader() {
    return (
      <div className='analysis-header row'>
        {this.renderAnalysisTitle()}
        {this.renderHeaderMenu()}
      </div>
    );
  }

  renderNoDataMessage() {
    if (this.props.displayNoAnalyticsMessage) {
      return <div> No Data!</div>;
    }
  }

  render() {
    return (
      <div className='analysis-container col-9'>
        {this.renderAnalysisHeader()}
        {this.renderNoDataMessage()}
        {this.renderAnalyticCards()}
      </div>
    );
  }
}

export default Analysis;
