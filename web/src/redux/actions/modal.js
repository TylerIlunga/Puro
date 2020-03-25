import { CLEAR_MODAL, UPDATE_MODAL } from '../constants';

export const updateModal = modal => {
  return {
    type: UPDATE_MODAL,
    title: modal.title,
    data: modal.data,
  };
};

export const clearModal = () => {
  return { type: CLEAR_MODAL };
};
