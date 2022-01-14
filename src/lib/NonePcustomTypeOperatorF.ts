const customType =
  (type: symbol) =>
  <T>(set: T) =>
    Object.defineProperty(set, type, {
      value: type,
    });

const customOperator =
  (op: string) =>
  (f: Function) =>
  <A>(set: A) =>
    Object.defineProperty(set, op, {
      value: function (R: any) {
        return f(R)(this);
      },
    });

const typeNone = Symbol("None");
const typeP = Symbol("P");

type None = undefined | null | void | typeof None;
const None = Object.defineProperty(Object(typeNone), ">", {
  value: <B>(f: (a: None) => B) => P(f(None)),
}) as typeof typeNone;

const isNone = <A>(x: A | None): x is None =>
  x === undefined || x === null || x === None;

const P = <A>(x: A) =>
  (isNone(x)
    ? None
    : ((X: P<A>) =>
        typeP in X
          ? X
          : customType(typeP)(
              Object.defineProperty(X, ">", {
                value: <B>(f: (a: A) => B) => P(f(x)),
              })
            ))(Object(x))) as A extends P<unknown>
    ? A
    : (A extends None ? None : A) & P<A>;

type map<A> = <B>(
  f: (a: A) => B
) => B extends P<unknown> ? B : (B extends None ? None : B) & P<B>;

type P<A> = { ">": map<A> };

const F = <A, B>(f: (a: A) => B): F<A, B> =>
  "." in f
    ? f
    : (Object.defineProperty(f, ".", {
        value: <C>(g: (b: B) => C) => F((a: A) => g(f(a))), //Function composition
        // P(a)['>'](f)['>'](g))
      }) as any);

type F<A, B> = {
  (a: A): B; //call signatures for js function objects
  ".": <C>(g: (b: B) => C) => F<A, C>;
};

export { None, P, customType, customOperator, F };
