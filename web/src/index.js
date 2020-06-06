import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import { store } from './redux';
import * as serviceWorker from './serviceWorker';
import './index.css';

const renderApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

ReactDOM.render(renderApp(), document.getElementById('root'));

// serviceWorker.unregister();
