const obj = (() => {
  const identity = (a) => a;
  const right = (a) => (b) => b;
  const log = (a) => right(console.log(a))(a);
  const customOperator = (op) => (f) => (set) =>
    Object.defineProperty(set, op, {
      value: function (R) {
        return f(R)(this);
      },
    });
  const customType = (type) => (set) =>
    Object.defineProperty(set, type, {
      value: type,
    });
  const typeNone = Symbol("None");
  const typeP = Symbol("P");
  const None = Object.defineProperty(Object(typeNone), ">", {
    value: (f) => P(f(None)),
  });
  const isNone = (x) => x === undefined || x === null || x === None;
  const P = (x) =>
    isNone(x)
      ? None
      : ((X) =>
          !(typeP in X) && ">" in X
            ? (() => {
                throw "'>' is used in the target Object property";
              })()
            : typeP in X
            ? X
            : customType(typeP)(
                Object.defineProperty(X, ">", {
                  value: (f) => P(f(x)),
                })
              ))(Object(x));
  //----------------------------------------
  const F = (f) =>
    "." in f
      ? f
      : Object.defineProperty(f, ".", {
          value: (g) => F((a) => g(f(a))),
          // P(a)['>'](f)['>'](g))
        });
  /* call signatures for js function objects
    ((a: A) => B)
    { (a: A): B }
    */
  //https://www.typescriptlang.org/docs/handbook/2/functions.html#call-signatures
  return {
    None,
    P,
    customType,
    customOperator,
    F,
  };
})();
const None = obj.None;
const P = obj.P;
const customType = obj.customType;
const customOperator = obj.customOperator;
const F = obj.F;
export { None, P, customType, customOperator, F };
