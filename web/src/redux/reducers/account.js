import { CLEAR_USER, UPDATE_USER, UPDATE_USER_TFA_STATUS } from '../constants';

export default (state = {}, action) => {
  switch (action.type) {
    case UPDATE_USER:
      return {
        ...state,
        user: {
          id: action.id,
          email: action.email,
          business: action.business,
          subscription: action.subscription,
          two_factor_enabled: action.two_factor_enabled,
        },
      };
    case CLEAR_USER:
      return {};
    case UPDATE_USER_TFA_STATUS:
      return {
        ...state,
        user: {
          ...state.user,
          two_factor_enabled: action.two_factor_enabled,
        },
      };
    default:
      return state;
  }
};
