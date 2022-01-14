import React from "react";
import ReactDOM from "react-dom";
import { IO, next } from "./lib/ReactiveMonad";

const rootElement = document.getElementById("root");
console.log(rootElement);

const count = IO(0);
const decrement = () => count[">"](next(count.lastVal - 1));
const increment = () => count[">"](next(count.lastVal + 1));

const App = () => (
  <div className="App">
    <h1>Hello React FRP Monad</h1>
    <h2>You clicked {count.lastVal} times!</h2>

    <button onClick={decrement}>Decrement</button>
    <button onClick={increment}>Increment</button>
  </div>
);

const reactIO = count[">="](() => ReactDOM.render(<App />, rootElement));
