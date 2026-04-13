export const selectSelectedCupboard = (state) =>
  state.cupboards.find((cupboard) => cupboard.id === state.selectedCupboardId) ?? null;
