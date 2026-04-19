import { describe, it, expectTypeOf } from 'vitest';
import { DeepReadonly } from '@/shared/types/deep-readonly';

describe('DeepReadonly', () => {
  it('should make properties recursive readonly', () => {
    type Test = {
      a: string;
      b: {
        c: number;
        d: string[];
      };
      e: Map<string, { f: boolean }>;
      g: Set<number>;
    };

    type ReadonlyTest = DeepReadonly<Test>;

    expectTypeOf<ReadonlyTest>().toEqualTypeOf<{
      readonly a: string;
      readonly b: {
        readonly c: number;
        readonly d: ReadonlyArray<string>;
      };
      readonly e: ReadonlyMap<string, { readonly f: boolean }>;
      readonly g: ReadonlySet<number>;
    }>();
  });
});
