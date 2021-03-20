import { pagesConstants } from "../constants";

const initialState = {
  pagesTitle: "Lucky Cat bot",
};

export function pages(state = initialState, action) {
  switch (action.type) {
    case pagesConstants.CHANGE_PAGE_TITLE:
      return {
        ...state,
        pagesTitle: action.payload,
      };
    default:
      return state;
  }
}
