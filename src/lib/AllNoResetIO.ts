import {
  None,
  P, //Pipe
} from "./NonePcustomTypeOperatorF";

import { IO, next } from "./ReactiveMonad";

const identity = <A>(a: A) => a;
const right =
  <A>(a: A) =>
  <B>(b: B) =>
    b;

type flag = [IO<unknown>, IO<number>];

const allNoResetIO = (As: IO<any>[]): IO<unknown> =>
  IO(None)[">"]((result: IO<unknown>) =>
    right(
      P(As.map((A: IO<unknown>) => [A, IO(0)] as flag))[">"]((flags: flag[]) =>
        flags.map((flag: flag) =>
          flag[0][">="](
            //reactive A
            () => right(flag[1][">"](next(1)))(checkFlags(As)(result)(flags))
          )
        )
      )
    )(result)
  );

const checkFlags =
  (As: IO<unknown>[]) =>
  (result: IO<unknown>) =>
  (flags: flag[]): any =>
    flags.map((flag: flag) => flag[1].lastVal).reduce((a, b) => a * b) === 1 && //all flags are 1 // None is not accepted to fill the result
    !As.map((A: IO<unknown>) => A.lastVal).includes(None)
      ? result[">"](
          next(
            // return As lastVals
            As.map((A: IO<unknown>) => A.lastVal)
          )
        )
      : None;
export { allNoResetIO };
