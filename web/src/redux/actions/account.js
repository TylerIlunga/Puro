import { Auth } from '../../services';
import { CLEAR_USER, UPDATE_USER, UPDATE_USER_TFA_STATUS } from '../constants';

const AuthService = new Auth();

export const updateUser = (user) => {
  return {
    type: UPDATE_USER,
    id: user.id,
    email: user.email,
    business: user.business,
    subscription: user.subscription,
    two_factor_enabled: user.two_factor_enabled,
  };
};

export const clearUser = () => {
  return { type: CLEAR_USER };
};

export const retrieveAccount = (cb) => {
  return (dispatch) => {
    return AuthService.retrieveAccount()
      .then(({ error, user }) => {
        if (error) {
          return cb(error);
        }
        cb(null);
        dispatch(updateUser(user));
      })
      .catch((error) => {
        console.log('error: ', error);
        cb(error);
      });
  };
};

export const updateUserTFAStatus = (two_factor_enabled) => {
  return {
    type: UPDATE_USER_TFA_STATUS,
    two_factor_enabled,
  };
};
