import { pagesConstants } from "../constants";

export const changePagesTitle = (pagesTitle) => ({
  type: pagesConstants.CHANGE_PAGE_TITLE,
  payload: pagesTitle,
});
