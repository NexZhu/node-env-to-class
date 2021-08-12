# env-to-class

Load `process.env` into class instance by convention and validate with `class-validator` annotations

## Example classes and corresponding environment variable names that will be loaded

```typescript
class Nested {
   @IsString()
   foo: string // QUX_FOO

   @IsInt()
   barBaz: number // QUX_BAR_BAZ
}

class Cls {
   @ValidateNested
   qux: Nested = new Nested() 

   @IsBoolean()
   quux: boolean // QUUX
}
```

## Install

1. Install this package:

   `npm install -S node-env-to-class`

2. `reflect-metadata` shim is required, install it too:

   `npm install reflect-metadata --save`

   and make sure to import it in a global place, like app.ts:

   ```typescript
   import 'reflect-metadata';
   ```

3. ES6 features are used, if you are using old version of node.js you may need to install es6-shim:

   `npm install -S es6-shim`

   and import it in a global place like app.ts:

   ```typescript
   import 'es6-shim';
   ```

## Usage

Define the classes and annotate with [class-validator](https://github.com/typestack/class-validator) type decorators:

```typescript
import {
   IsBoolean,
   IsInt,
   IsNumber,
   IsString,
   ValidateNested,
} from 'class-validator'

class Nested {
   @IsString()
   str: string = 'str-default'

   @IsInt()
   int: number = 123

   @IsNumber()
   float: number = 0.123

   @IsBoolean()
   bool: boolean = true
}

class Parent {
   @IsString()
   strParent!: string

   @IsInt()
   intParent!: number

   @IsNumber()
   floatParent: number = 0.321

   @IsBoolean()
   boolParent = false

   @ValidateNested()
   nestedParent: Nested = new Nested()
}

class Child extends Parent {
   @IsString()
   strChild: string = 'str-child-default'

   @IsInt()
   intChild: number = 321

   @IsNumber()
   floatChild!: number

   @IsBoolean()
   boolChild!: boolean

   @ValidateNested()
   nestedChild: Nested = new Nested()
}
```

> Note that both the TypeScript type annotations and the `class-validator` decorators are required.

Then use `envToClass` to load `process.env` into a class instance:

```typescript
const [errs, c] = envToClass(Child)
if (errs.length) {
  console.log('Validation error:', errs)
} else {
  console.log('Loaded class:', c)
}
```

Set the `envPrefix` option to load from prefixed environment variable names such as `PREFIX_ENV_NAME`:

```typescript
const [errs, c] = envToClass(Child, undefined, { envPrefix: 'PREFIX' })
```

`classToEnv` will override the existing values in the supplied class instance or the default values in the new class instance by default. To keep the existing values, set the `overrideExistingValues` option to `true`:

```typescript
const [errs, c] = envToClass(Child, undefined, {
   overrideExistingValues: false,
})
if (errs.length) {
  console.log('Validation error:', errs)
} else {
  console.log('Loaded class:', c)
}
```

See [Options](src/impl.ts) for all the options.

## license

MIT © Nex Zhu
