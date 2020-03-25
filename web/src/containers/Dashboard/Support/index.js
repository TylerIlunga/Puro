import React, { Component } from 'react';
import uuid from 'uuid/v4';
import './styles.css';

class Account extends Component {
  constructor(props) {
    super(props);

    this.generateUUID = this.generateUUID.bind(this);
    this.renderSupportForm = this.renderSupportForm.bind(this);
  }

  componentDidMount() {
    this.generateUUID();
  }

  generateUUID() {
    this.props.handleSupportFormDataUpdate('ticketId', {
      target: { value: uuid() },
    });
  }

  renderSupportHeader() {
    return (
      <div className='support-header'>
        <h3 className='header-label'>Support</h3>
      </div>
    );
  }

  renderTicketId(ticketId) {
    return ticketId ? `Ticket ID: ${ticketId}` : 'Generating Ticket ID...';
  }

  renderSupportForm() {
    return (
      <div className='support-form-container'>
        <form className='support-form'>
          <label className='bmd-label-static'>
            {this.renderTicketId(this.props.supportFormData.ticketId)}
          </label>
          <br />
          <br />
          <label className='form-title'>Subject</label>
          <input
            type='text'
            className='form-control'
            placeholder={'...'}
            value={this.props.supportFormData.subject}
            onChange={evt => {
              this.props.handleSupportFormDataUpdate('subject', evt);
            }}
          />
          <br />
          <label className='form-title'>Issue:</label>
          <br />
          <textarea
            className='issue-textarea'
            placeholder={'....'}
            value={this.props.supportFormData.issue}
            onChange={evt => {
              this.props.handleSupportFormDataUpdate('issue', evt);
            }}
          />
          <br />
          <button
            type='button'
            className='btn btn-info'
            onClick={this.props.submitSupportForm}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  render() {
    return (
      <div className='support-container col-9'>
        {this.renderSupportHeader()}
        {this.renderSupportForm()}
      </div>
    );
  }
}

export default Account;
