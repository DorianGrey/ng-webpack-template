# Migration of `jasmine` to `jest`
This release has removed the previous unit testing approach using `karma` as test runner and `jasmine` as testing framework in favor of `jest` for both.
Most of the required migration stuff - including a tool for automatic migration - is listed in the official migration guide:
https://facebook.github.io/jest/docs/en/migration-guide.html
It is strongly recommended to use this tool the automatically migrate your existing unit tests.

Most code is similar or equivalent to `jasmine`. In case the automatic tool does not or only partially works, you will find a (non-exhaustive) list of statements to replace below.

| jasmine | jest | Notes |
| ------- | ---- | ----- |
| `jasmine.addMatchers` | `expect.extend` | |
| `jasmine.createSpy` | `jest.fn` | Spies cannot be named in `jest`. |
| `jasmine.createSpyObj` | ./. | There is no counterpart for this in `jest`. You will have to create your own helper function. |
| `jasmine.any` | `expect.any` | 
| `jasmine.objectContaining` | `expect.objectContaining` |

Helper function as replacement suggestion for `jasmine.createSpyObj`:
```typescript
export default function createSpyObj<T>(...names: string[]): T {
  const result = {};
  names.forEach(n => (result[n] = jest.fn()));

  return (result as any) as T;
}
```
Note that it does not take a name for the spy object as its first parameter, since spies cannot be named.

As general rules:
- The test structure itself does not differ from the `jasmine` version.
- Most helper functions included in the `jasmine.*` namespace before are now contained in `extend.*`.
- Spies and every utility linked to them are included in the `jest.*` namespace.

In case you are facing any errors or problems - especially with DOM-heavy libraries in use - see the - [troubleshooting guide](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/troubleshooting.md).