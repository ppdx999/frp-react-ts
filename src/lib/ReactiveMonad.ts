import {
  None,
  P,
  customType,
  customOperator,
  F,
} from "./NonePcustomTypeOperatorF";

const obj = (() => {
  const identity = <A>(a: A) => a;
  const right =
    <A>(a: A) =>
    <B>(b: B) =>
      b;

  const log = <A>(a: A) => right(console.log(a))(a);

  const isNone = <A>(x: A | None): x is None => x === None;

  const optionMap =
    <A, B>(f: (a: A) => B) =>
    (a: A) =>
      isNone(a) ? None : f(a);

  const typeIO = Symbol("IO");

  type IO<A> = {
    lastF: (a: A) => A; // identity Type in outer shape
    lastVal: A;
  } & P<any> & { ">": <B>(f: (a: A) => B) => P<B> } & {
      //circular reference
      ">>": <B>(f: (a: any) => B) => IO<B>;
    } & { ">=": <B>(f: (a: any) => IO<B> | B) => IO<B> };

  const IO = <A>(a: A) =>
    P({
      lastF: identity, //mutable
      lastVal: a, //mutable
    })
      [">"](customType(typeIO))
      [">"](customOperator(">>")(reactive))
      [">"](customOperator(">=")(flatReactive)) as IO<A>;

  const reactive =
    <A, B>(f: (a: A) => B) =>
    (A: IO<A>) =>
      IO(None) // new IO created
        [">"](
          (
            B: IO<B> //new B
          ) =>
            right(
              (A.lastF = F(A.lastF)["."](
                //mutable
                //function composition
                (
                  a: A //a is the future reactive value
                ) =>
                  right(
                    //type check of A done with optionMap
                    B[">"](change(optionMap(f)(a)))
                  )(a) //a applied to all reactive functions
              ))
            )(B[">"](change(optionMap(f)(A.lastVal)))) // instant
        );

  const flatReactive =
    <A, B>(f: (a: A) => B) =>
    (A: IO<A>) =>
      IO(None) // new IO created
        [">"](
          (
            B: IO<B> //new B
          ) =>
            right(
              (A.lastF = F(A.lastF)["."](
                //mutable
                //function composition
                (
                  a: A //a is the future reactive value
                ) =>
                  right(
                    //type check of A done with optionMap
                    B[">"](flatChange(optionMap(f)(a)))
                  )(a) //a applied to all reactive functions
              ))
            )(B[">"](flatChange(optionMap(f)(A.lastVal)))) // instant
        );

  const change =
    <A>(a: A) =>
    (A: IO<A>) =>
      right(
        right((A.lastVal = a))(
          //mutable
          optionMap(A.lastF)(a)
        )
      )(A);

  const flatChange =
    <A>(a: A) =>
    (A: IO<A>) =>
      typeIO in Object(a)
        ? A[">"](change((Object(a) as IO<A>).lastVal))
        : //flat TTX=TX
          A[">"](change(a));

  const next = flatChange;

  return { IO, next, typeIO };
})();

type IO<A> = {
  lastF: (a: A) => A; // identity Type as outer frame
  lastVal: A;
} & P<any> & { ">": <B>(f: (a: A) => B) => P<B> } & {
    //circular reference
    ">>": <B>(f: (a: any) => B) => IO<B>;
  } & { ">=": <B>(f: (a: any) => IO<B> | B) => IO<B> };

const IO = obj.IO;
const next = obj.next;
const typeIO = obj.typeIO;

export { IO, next, typeIO };
