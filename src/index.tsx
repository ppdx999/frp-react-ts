import React from "react";
import ReactDOM from "react-dom";
import { IO, next } from "./lib/ReactiveMonad";
import { allNoResetIO } from "./lib/AllNoResetIO";

const rootElement = document.getElementById("root");

const countIO = IO(0);
const decrement = () => countIO[">"](next(countIO.lastVal - 1));
const increment = () => countIO[">"](next(countIO.lastVal + 1));

const Counter = () => (
  <div>
    <h2>You clicked {countIO.lastVal} times!</h2>
    <button onClick={decrement}>Decrement</button>
    <button onClick={increment}>Increment</button>
  </div>
);

const start = Date.now();
const getSecond = () => Math.floor((Date.now() - start) / 1000);
const timerIO = IO(0);
const f = () => timerIO[">"](next(getSecond()));
setInterval(f, 1000);

const Timer = () => <h2>{timerIO.lastVal}</h2>;

const App = () => (
  <div className="App">
    <h1>React + FRP (Multi Components)</h1>
    <Counter />
    <Timer />
  </div>
);

const allIO = allNoResetIO([countIO, timerIO]);

const reactIO = allIO[">="](() => ReactDOM.render(<App />, rootElement));
