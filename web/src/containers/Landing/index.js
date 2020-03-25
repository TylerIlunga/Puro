import React, { Component } from 'react';
import './styles.css';

class Landing extends Component {
  render() {
    return (
      <div className='landing-container'>
        <p className='landing-mock-text'>
          <a href='/login'>Log In</a>
        </p>
      </div>
    );
  }
}

export default Landing;
