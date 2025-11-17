import { act } from "react";
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

import '@testing-library/jest-dom/extend-expect';
// JSDOM missing APIs
window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    media: "",
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
};


