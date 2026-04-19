import { Primitive } from "./primitives";

export type PathKeys<T> =
    T extends Primitive | ((...args: any[]) => any)
    ? never
    : T extends readonly (infer U)[]
    ? PathKeys<U>
    : T extends object
    ? {
        [K in keyof T & string]:
        T[K] extends Primitive | ((...args: any[]) => any)
        ? K
        : `${K}.${PathKeys<T[K]>}` // Template Literal Type Composition
    }[keyof T & string]
    : never;