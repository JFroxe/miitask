import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    min-height: 100%;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f4f4f4;
    color: #333;
    overflow-y: auto;
  }

  #root {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Scroll personalizado global */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #aaa;
    border-radius: 6px;
    border: 2px solid #f1f1f1;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #888;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button, input, textarea, select {
    font: inherit;
    border: none;
    outline: none;
  }
`;

export default GlobalStyle;
