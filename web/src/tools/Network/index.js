export const handleError = (state, message) => {
  state.setState(
    {
      error: message,
    },
    () => {
      setTimeout(() => {
        state.setState({ error: null });
      }, 4000);
    },
  );
};

export const handleSuccess = (state, message) => {
  state.setState(
    {
      success: message,
    },
    () => {
      setTimeout(() => {
        state.setState({ success: null });
      }, 4000);
    },
  );
};
