import { LOGOUT, SET_LANGUAGE, SET_POOLS, SET_USER } from "./types";

export const AppReducer = (state, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };

    case SET_USER:
      return {
        ...state,
        isAuthenticated: !!Object.keys(action.payload).length,
        user: action.payload,
      };

    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: {},
      };

    case SET_POOLS:
      return {
        ...state,
        pools: [...action.payload],
      };

    default:
      return state;
  }
};
