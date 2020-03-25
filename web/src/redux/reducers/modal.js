import { CLEAR_MODAL, UPDATE_MODAL } from '../constants';

export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_MODAL:
      console.log('modalReducer() UPDATE_MODAL');
      return {
        ...state,
        title: action.title,
        data: action.data,
      };
    case CLEAR_MODAL:
      return {};
    default:
      return state;
  }
};
