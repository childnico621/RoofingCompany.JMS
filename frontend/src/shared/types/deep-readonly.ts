import { Primitive } from "./primitives";

export type DeepReadonly<T> =
    T extends (...args: any[]) => any
    ? T
    : T extends Primitive
    ? T

    : T extends readonly (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>

    : T extends Map<infer K, infer V>
    ? ReadonlyMap<K, DeepReadonly<V>>

    : T extends Set<infer V>
    ? ReadonlySet<DeepReadonly<V>>

    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }

    : T; //Type-level pattern matching