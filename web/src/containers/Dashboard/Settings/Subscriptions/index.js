import React, { Component } from 'react';
import './styles.css';

class Subscriptions extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getSubscriptionHeaderTitle(displaySubscriptionPlans) {
    if (displaySubscriptionPlans) {
      return <h3 className='subscription-container-title'>Choose a Plan</h3>;
    }
    return <h3 className='subscription-container-title'>Loading...</h3>;
  }

  render() {
    return (
      <div className='subscription-container col-9'>
        {this.getSubscriptionHeaderTitle(this.props.displaySubscriptionPlans)}
        {this.props.renderSubscriptionCard(
          this.props.displaySubscriptionPlans,
          this.props.subscriptionDetails.seed,
        )}
        {this.props.renderSubscriptionCard(
          this.props.displaySubscriptionPlans,
          this.props.subscriptionDetails.standard,
        )}
        {this.props.renderSubscriptionCard(
          this.props.displaySubscriptionPlans,
          this.props.subscriptionDetails.scale,
        )}
        {this.props.renderSuccess()}
        {this.props.renderError()}
      </div>
    );
  }
}

export default Subscriptions;
