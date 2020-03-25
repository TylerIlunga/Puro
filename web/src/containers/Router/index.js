import React from 'react';
import { connect } from 'react-redux';
import { history } from '../../redux';
import { clearUser } from '../../redux/actions/account';
import { clearModal } from '../../redux/actions/modal';
import { withCookies } from 'react-cookie';
import { ConnectedRouter } from 'connected-react-router';
import { Route, Switch } from 'react-router-dom';

import Landing from '../Landing';

import LogIn from '../Auth/LogIn';
import SignUp from '../Auth/SignUp';
import Confirm from '../Auth/Confirm';
import ForgotPassword from '../Auth/ForgotPassword';
import ResetPassword from '../Auth/ResetPassword';

import Dashboard from '../Dashboard';
import Error from '../Error';

// DEF: Protected Route
// 1) Does session id (p_sid) exist?
// 2) Does user_token exists?

const handleProtectedRoutes = (history, props, Component) => {
  const cookies = props.cookies;
  console.log('handleProtectedRoutes() cookies', cookies);
  // NOTE: Need to handle updating user redux object.
  console.log('handleProtectedRoutes() history', history);
  if (!(cookies && cookies.get('user_token'))) {
    window.localStorage.removeItem('user_token');
    return <Component {...history} />; //change to SignUp
  }
  return <Dashboard {...history} />;
};

const handleCloseModal = props => {
  props.clearModal();
  window.$('#infoModal').modal('hide');
};

const renderInfoModal = props => {
  return (
    <div
      className='modal fade'
      id='infoModal'
      tabIndex='-1'
      role='dialog'
      aria-labelledby='infoModalHeader'
      aria-hidden='true'
    >
      <div className='modal-dialog modal-lg' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title' id='infoModalHeader'>
              {props.modal.title}
            </h5>
            <button
              type='button'
              className='btn btn-danger'
              onClick={() => handleCloseModal(props)}
            >
              Close
            </button>
          </div>
          <div className='modal-body'>
            <h4 className='unique-link-label'>{props.modal.data}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

const Router = props => {
  console.log('Router', props);
  return (
    <ConnectedRouter history={history}>
      <div className='main'>
        <Switch>
          <Route
            path='/'
            component={h => handleProtectedRoutes(h, props, Landing)}
            exact
          />
          <Route
            path='/login'
            component={h => handleProtectedRoutes(h, props, LogIn)}
          />
          <Route
            path='/signup'
            component={h => handleProtectedRoutes(h, props, SignUp)}
          />
          <Route
            path='/confirm'
            component={h => handleProtectedRoutes(h, props, Confirm)}
          />
          <Route
            path='/forgot'
            component={h => handleProtectedRoutes(h, props, ForgotPassword)}
          />
          <Route
            path='/reset'
            component={h => handleProtectedRoutes(h, props, ResetPassword)}
          />
          <Route
            path='/dashboard*'
            component={h => handleProtectedRoutes(h, props, SignUp)}
          />
          <Route component={Error} />
        </Switch>
      </div>
      {renderInfoModal(props)}
    </ConnectedRouter>
  );
};

const mapStateToProps = state => ({
  modal: state.modal,
  user: state.account.user,
});

const mapDispatchToProps = dispatch => ({
  clearUser: () => dispatch(clearUser()),
  clearModal: () => dispatch(clearModal()),
});

export default withCookies(
  connect(mapStateToProps, mapDispatchToProps)(Router),
);
