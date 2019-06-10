import React from "react";
import ReactDOM from "react-dom";
import "babel-polyfill";
import App from "./MaterialApp";
//import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from "react-router-dom";
import {MuiThemeProvider} from "@material-ui/core/styles";

import theme from "./theme";

ReactDOM.render(
  <BrowserRouter>
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();
