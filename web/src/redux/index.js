import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import multi from 'redux-multi';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { enableBatching, batchDispatchMiddleware } from 'redux-batched-actions';
import createRootReducer from './reducers';

export const history = createBrowserHistory();

const initialState = {};
const loggerMiddleware = createLogger();
export const store = createStore(
  enableBatching(createRootReducer(history)),
  initialState,
  compose(
    applyMiddleware(
      routerMiddleware(history),
      multi,
      thunk,
      loggerMiddleware,
      batchDispatchMiddleware,
    ),
  ),
);
