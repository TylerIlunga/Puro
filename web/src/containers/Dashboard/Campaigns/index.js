import React, { Component } from 'react';
import './styles.css';

class Campaigns extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.renderLinkSharingInfoCard = this.renderLinkSharingInfoCard.bind(this);
    this.renderCampaignEntries = this.renderCampaignEntries.bind(this);
    this.renderFormQuestions = this.renderFormQuestions.bind(this);
  }

  renderCampaignCreationHeader() {
    return (
      <div className='row'>
        <div className='col-9'>Create</div>
        <div className='col-3'>
          <button
            className='btn btn-info btn-round'
            onClick={this.props.handleCampaignCreation}
          >
            <i className='material-icons'>close</i>
          </button>
        </div>
      </div>
    );
  }

  renderListOfInputTypes(questions, inputTypes, index) {
    console.log('renderListOfInputTypes() questions', questions);
    console.log('renderListOfInputTypes() index', index);
    return (
      <div className='row' key={index}>
        {inputTypes.map((inputType, typeIndex) => {
          let inputId = `${inputType}_box${typeIndex * index + Math.random(3)}`;
          this.props.handleCheckboxState(inputId, false, index);
          return (
            <div className='col-3' key={inputType}>
              <input
                id={inputId}
                type='checkbox'
                className='form-control'
                onChange={evt =>
                  this.props.handleCampaignFormDataUpdate(
                    inputId,
                    `questions.${index}.inputType`,
                    evt,
                  )
                }
              />
              {inputType}
            </div>
          );
        })}
      </div>
    );
  }

  renderFormQuestionThemes(campaignData, themes) {
    return (
      <div className='form-group bmd-form-group'>
        <label className='bmd-label-static'>Choose a Theme</label>
        <div className='row'>
          {themes.map((theme, index) => {
            let inputId = `${theme}_box${index}`;
            this.props.handleCheckboxState(inputId, true, index);
            return (
              <div key={index} className='col-3'>
                <input
                  id={inputId}
                  type='checkbox'
                  className='form-control'
                  onChange={evt =>
                    this.props.handleCampaignFormDataUpdate(
                      inputId,
                      'theme',
                      evt,
                    )
                  }
                />
                {theme}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderFormQuestions(formQuestions) {
    return formQuestions.map((question, index) => {
      return (
        <div key={index} className='form-group bmd-form-group'>
          <label className='bmd-label-static'>{`Question #${index + 1}`}</label>
          <input
            type='text'
            className='form-control'
            placeholder={question.placeholder}
            value={question.subject}
            onChange={evt =>
              this.props.handleCampaignFormDataUpdate(
                evt.target.value,
                `questions.${index}.subject`,
                evt,
              )
            }
          />
          <div className='form-group bmd-form-group'>
            <label className='bmd-label-static'>Choose an Input Type</label>
            {this.renderListOfInputTypes(
              formQuestions,
              this.props.formQuestionInputTypes,
              index,
            )}
          </div>
        </div>
      );
    });
  }

  renderAddQuestionButton() {
    return (
      <button
        type='button'
        className='btn btn-info btn-round'
        onClick={this.props.addQuestionToCampaignData}
      >
        <i className='material-icons'>add</i>
        Add question
      </button>
    );
  }

  renderRemoveQuestionButton(questions) {
    if (questions.length > 1)
      return (
        <button
          type='button'
          className='btn btn-danger btn-round'
          onClick={this.props.removeQuestionFromCampaignData}
        >
          <i className='material-icons'>delete</i>
          Remove question
        </button>
      );
  }

  renderPreviewButton() {
    return (
      <button
        type='button'
        className='btn btn-info btn-round'
        onClick={this.props.previewFormCampaignWebpage}
      >
        <i className='material-icons'>remove_red_eye</i>
        Preview
      </button>
    );
  }

  renderCCFormType() {
    return (
      <form
        className='creation-form card-body'
        onSubmit={this.props.handleCreateCampaign}
      >
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Title</label>
          <input
            type='text'
            className='form-control'
            placeholder='Memorial Day Sale'
            value={this.props.campaignData.title}
            onChange={evt => this.props.handleCampaignDataUpdate('title', evt)}
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Company</label>
          <input
            type='text'
            className='form-control'
            placeholder='Facebook'
            value={this.props.campaignData.company}
            onChange={evt =>
              this.props.handleCampaignDataUpdate('company', evt)
            }
          />
        </div>
        {this.renderFormQuestionThemes(
          this.props.campaignData,
          this.props.formQuestionThemes,
        )}
        {this.renderFormQuestions(this.props.campaignData.questions)}
        {this.renderAddQuestionButton()}
        {this.renderRemoveQuestionButton(this.props.campaignData.questions)}
        <br />
        <br />
        {this.renderPreviewButton()}
        <input
          type='submit'
          value='Create'
          className='btn btn-warning btn-round'
        />
      </form>
    );
  }

  renderCCLinkType() {
    return (
      <form
        className='creation-form card-body'
        onSubmit={this.props.handleCreateCampaign}
      >
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Title</label>
          <input
            type='text'
            className='form-control'
            placeholder='Memorial Day Sale'
            value={this.props.campaignData.title}
            onChange={evt => this.props.handleCampaignDataUpdate('title', evt)}
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Company</label>
          <input
            type='text'
            className='form-control'
            placeholder='Facebook'
            value={this.props.campaignData.company}
            onChange={evt =>
              this.props.handleCampaignDataUpdate('company', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Redirect Uri</label>
          <input
            type='text'
            className='form-control'
            placeholder='https://www.example.com/sale'
            value={this.props.campaignData.redirect_uri}
            onChange={evt =>
              this.props.handleCampaignDataUpdate('redirect_uri', evt)
            }
          />
        </div>
        <input
          type='submit'
          value='Create'
          className='btn btn-warning btn-round'
        />
      </form>
    );
  }

  renderCampaignCreationForm(type) {
    switch (type) {
      case 'form':
        return this.renderCCFormType();
      case 'link':
        return this.renderCCLinkType();
    }
  }

  handleActiveCreationOption(isActive) {
    console.log('handleActiveCreationOption', isActive);
    return isActive ? 'active' : 'inactive';
  }

  renderCampaignCreationToggleOptions() {
    return (
      <ul className='nav nav-pills nav-pills-info d-flex align-items-center'>
        <li className='nav-item'>
          <a
            className={`nav-link ${this.handleActiveCreationOption(
              this.props.ccLinkOptionIsActive,
            )}`}
            href='#link'
            onClick={() =>
              this.props.handleCampaignDataUpdate('type', {
                target: { value: 'link' },
              })
            }
          >
            Link
          </a>
        </li>
        <li className='nav-item'>
          <a
            className={`nav-link ${this.handleActiveCreationOption(
              this.props.ccFormOptionIsActive,
            )}`}
            href='#Form'
            onClick={() =>
              this.props.handleCampaignDataUpdate('type', {
                target: { value: 'form' },
              })
            }
          >
            Form
          </a>
        </li>
      </ul>
    );
  }

  renderCampaignCreationCard() {
    return (
      <div className='card'>
        <div className='card-body'>
          <div className='creation-form-title text-center'>
            <h3>Fill out the form below:</h3>
            {this.renderCampaignCreationToggleOptions()}
          </div>
          {this.renderCampaignCreationForm(this.props.campaignData.type)}
          {this.props.renderError()}
        </div>
      </div>
    );
  }

  renderLinkSharingInfoHeader() {
    return <div>Link Sharing Info</div>;
  }

  getCampaignActivityLink(cid) {
    return (
      <a
        href='#'
        onClick={() =>
          this.props.handleActiveContainerState('campaignsIsActive')
        }
      >
        here!
      </a>
    );
  }

  renderLinkSharingInfoCard() {
    return (
      <div className='card bg-dark text-white'>
        <img
          className='card-img'
          src={this.props.congratsImage}
          alt='Card image'
        />
        <div className='card-img-overlay'>
          <h4 className='card-title'>{"Congrats! Here's your unique link"}</h4>
          <h3 className='card-text'>{this.props.campaignData.link}</h3>
          <span className='card-text'>
            Share your link so you can campaign activity{' '}
            {this.getCampaignActivityLink(this.props.campaignData.link)}
          </span>
        </div>
      </div>
    );
  }

  // NOTE: abstract buttons into one function that takes in data for the button
  // like: text, backgroundColor, icon, onClickFunction, etc...
  renderEditButton() {
    return (
      <div className='col-2 d-flex align-items-center'>
        <div className='row d-flex justify-content-center'>
          <button
            type='button'
            className='btn btn-info btn-round'
            onClick={this.props.activateEditCampaignMode}
          >
            Edit
            <i className='material-icons'>link</i>
          </button>
        </div>
      </div>
    );
  }

  renderLinkButton() {
    return (
      <div className='col-2 d-flex align-items-center'>
        <div className='row d-flex justify-content-center'>
          <button
            type='button'
            className='btn btn-info btn-round'
            onClick={() => {
              this.props.displayModal({
                title: 'Your Unique Link',
                data: this.props.uniqueLink
                  ? this.props.uniqueLink
                  : "Couldn't find link. Contact Support.",
              });
            }}
          >
            Link
            <i className='material-icons'>link</i>
          </button>
        </div>
      </div>
    );
  }

  checkUserSubscriptionStatus(feature) {
    switch (feature) {
      case 'analysis':
        return this.props.handleViewEntryAnalytics(
          this.props.activeCampaign.company,
          this.props.activeCampaign.id,
        );
      case 'export':
        return this.props.handleActivateExportMode();
      default:
        console.log(
          'checkUserSubscriptionStatus() action switch default case:',
        );
    }
  }

  renderAnalysisButton() {
    return (
      <div className='col-2 d-flex align-items-center'>
        <div className='row d-flex justify-content-center'>
          <button
            type='button'
            className='btn btn-warning btn-round'
            onClick={() => this.checkUserSubscriptionStatus('analysis')}
          >
            Analysis
            <i className='material-icons'>bubble_chart</i>
          </button>
        </div>
      </div>
    );
  }

  renderExportButton() {
    // NOTE: check subscription plan and handle this.props.user === undefined
    return (
      <div className='col-2 d-flex align-items-center'>
        <div className='row d-flex justify-content-center'>
          <button
            type='button'
            className='btn btn-info btn-round'
            onClick={() => this.checkUserSubscriptionStatus('export')}
          >
            Export
            <i className='material-icons'>bubble_chart</i>
          </button>
        </div>
      </div>
    );
  }

  renderDeleteButton() {
    return (
      <div className='col-2 d-flex align-items-center'>
        <div className='row d-flex justify-content-center'>
          <button
            type='button'
            className='btn btn-danger btn-round'
            onClick={() =>
              this.props.handleDeleteCampaign(this.props.activeCampaign.id)
            }
          >
            Delete
            <i className='material-icons'>warning</i>
          </button>
        </div>
      </div>
    );
  }

  renderEntryTableHeader() {
    return (
      <div className='row'>
        <div className='col-4 d-flex align-items-start'>
          <h4 className='header-label'>
            {this.props.activeCampaign.title} entries
          </h4>
        </div>
        {this.renderEditButton()}
        {this.renderLinkButton()}
        {this.renderAnalysisButton()}
        {this.renderExportButton()}
        {this.renderDeleteButton()}
      </div>
    );
  }

  getCorrectDateFormat(dateNowNumber) {
    return new Date(Number(dateNowNumber)).toDateString();
  }

  renderCampaignEntries() {
    // NOTE: let user set limit?
    return this.props.campaignEntries.map((entry, index) => {
      return (
        <tr key={index}>
          <th scope='row'>{index}</th>
          <td>{entry.username}</td>
          <td>{entry.email}</td>
          <td>{entry.clicks}</td>
          <td>{this.getCorrectDateFormat(entry.created_at)}</td>
        </tr>
      );
    });
  }

  renderEntryTable() {
    return (
      <table className='table'>
        <thead>
          <tr>
            <th scope='col'>#</th>
            <th scope='col'>Name</th>
            <th scope='col'>Email</th>
            <th scope='col'>Clicks</th>
            <th scope='col'>Created At</th>
          </tr>
        </thead>
        <tbody>{this.renderCampaignEntries()}</tbody>
      </table>
    );
  }

  renderLoadMoreEntriesButton() {
    return (
      <button
        type='button'
        className='btn btn-info btn-round btn-lg'
        onClick={() => this.props.fetchEntries(this.props.entryListLimit + 25)}
      >
        Load More
      </button>
    );
  }

  renderCampaignHeader() {
    return (
      <div className='row campaigns-container-header d-flex align-items-center'>
        <div className='col-10'>
          <h4 className='header-label'>Campaigns</h4>
        </div>
        <div className='col-2'>
          <button
            className='btn btn-info btn-round'
            onClick={this.props.handleCampaignCreation}
          >
            Create
            <i className='material-icons'>add</i>
          </button>
        </div>
      </div>
    );
  }

  renderCampaignCards() {
    const campaigns = this.props.campaigns ? this.props.campaigns : [];
    return campaigns.map((campaign, i) => {
      return (
        <a
          key={i}
          className='card bg-warning campaign-card'
          href={`#${campaign.title}`}
          onClick={() => this.props.handleDisplayCampaignCard(campaign)}
        >
          <div className='card-body'>
            <h5 className='card-category card-category-social'>
              <i className={`fa fa-${campaign.company}`} />
            </h5>
            <h4 className='card-title'>{campaign.title}</h4>
          </div>
        </a>
      );
    });
  }

  renderLoadMoreCampaignsButtons() {
    return (
      <button
        type='button'
        className='btn btn-warning btn-round btn-lg'
        onClick={() =>
          this.props.fetchCampaigns(this.props.campaignListLimit + 25)
        }
      >
        Load More
      </button>
    );
  }

  renderCampaignCreation() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderCampaignCreationHeader()}
        {this.renderCampaignCreationCard()}
      </div>
    );
  }

  renderLinkSharing() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderLinkSharingInfoHeader()}
        {this.renderLinkSharingInfoCard()}
      </div>
    );
  }

  renderActiveCampaign() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderEntryTableHeader()}
        {this.renderEntryTable()}
        {this.renderLoadMoreEntriesButton()}
      </div>
    );
  }

  renderEditCampaignHeader() {
    return (
      <div className='row'>
        <div className='col-9'>Edit</div>
        <div className='col-3'>
          <button
            className='btn btn-info btn-round'
            onClick={this.props.clearEditCampaignModeChanges}
          >
            <i className='material-icons'>close</i>
          </button>
        </div>
      </div>
    );
  }

  renderEditCampaignCard() {
    return (
      <div className='card'>
        <div className='card-body'>
          <div className='creation-form-title text-center'>
            <h3>Edit the form below:</h3>
          </div>
          <form
            className='creation-form card-body'
            onSubmit={this.props.saveEditCampaignModeChanges}
          >
            <div className='form-group bmd-form-group'>
              <label className='bmd-label-static'>Title</label>
              <input
                type='text'
                className='form-control'
                placeholder={this.props.activeCampaign.title}
                value={this.props.activeCampaign.title}
                onChange={evt =>
                  this.props.updateActiveCampaignMode('title', evt)
                }
              />
            </div>
            <div className='form-group bmd-form-group'>
              <label className='bmd-label-static'>Redirect Uri</label>
              <input
                type='text'
                className='form-control'
                placeholder={this.props.activeCampaign.redirect_uri}
                value={this.props.activeCampaign.redirect_uri}
                onChange={evt =>
                  this.props.updateActiveCampaignMode('redirect_uri', evt)
                }
              />
            </div>
            <input
              type='submit'
              value='Save'
              className='btn btn-warning btn-round'
            />
          </form>
          {this.props.renderError()}
        </div>
      </div>
    );
  }

  editCampaign() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderEditCampaignHeader()}
        {this.renderEditCampaignCard()}
      </div>
    );
  }

  renderExportCampaignHeader() {
    return (
      <div className='row'>
        <div className='col-9'>Export</div>
        <div className='col-3'>
          <button
            className='btn btn-info btn-round'
            onClick={this.props.exitCampaignExport}
          >
            <i className='material-icons'>close</i>
          </button>
        </div>
      </div>
    );
  }

  exportingDetails() {
    return (
      <div className='card'>
        <div className='card-body'>
          <div className='creation-form-title text-center'>
            <h2>Status:</h2>
            <br />
            <h3>{this.props.exportingData.status}</h3>
          </div>
          {this.props.renderError()}
        </div>
      </div>
    );
  }

  exportOptions() {
    return (
      <div className='card'>
        <div className='card-body'>
          <div className='creation-form-title text-center'>
            <h2>Choose a destination:</h2>
            <br />
            <div className='row'>
              <div
                className='export-option-computer col-6'
                onClick={() => this.props.handleExport('computer')}
              >
                <img src='/assets/imgs/computer-icon' />
                <h3 className='export-option-title'>Computer</h3>
              </div>
              <div
                className='export-option-computer col-6'
                onClick={() => this.props.handleExport('google')}
              >
                <img src='/assets/imgs/google-icon' />
                <h3 className='export-option-title'>Google Sheets</h3>
              </div>
            </div>
          </div>
          {this.props.renderError()}
        </div>
      </div>
    );
  }

  renderExportCampaignCard() {
    if (this.props.exporting) {
      return this.exportingDetails();
    }
    return this.exportOptions();
  }

  exportingDetailsCard() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderExportCampaignHeader()}
        {this.renderExportCampaignCard()}
      </div>
    );
  }

  renderCampaigns() {
    return (
      <div className='campaigns-container col-9'>
        {this.renderCampaignHeader()}
        {this.renderCampaignCards()}
        {this.renderLoadMoreCampaignsButtons()}
        {this.props.renderSuccess()}
        {this.props.renderError()}
      </div>
    );
  }

  handleCampaignActivity() {
    if (this.props.displayCampaignCreation) {
      return this.renderCampaignCreation();
    }
    if (this.props.displayLinkSharingCard) {
      return this.renderLinkSharing();
    }
    if (this.props.displayCampaignCard) {
      return this.renderActiveCampaign();
    }
    if (this.props.editCampaignMode) {
      return this.editCampaign();
    }
    if (this.props.displayExportDetailsCard) {
      return this.exportingDetailsCard();
    }
    return this.renderCampaigns();
  }

  render() {
    return this.handleCampaignActivity();
  }
}

export default Campaigns;
