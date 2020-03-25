/* @flow */

import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import accountReducer from './account';
import modalReducer from './modal';

export default history =>
  combineReducers({
    router: connectRouter(history),
    account: accountReducer,
    modal: modalReducer,
  });
