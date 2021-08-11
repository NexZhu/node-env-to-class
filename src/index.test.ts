import 'reflect-metadata'
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { envToClass, envToObject } from './impl'

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

const PREFIX = 'NEX'

const PROCESS_ENV = {
  STR_PARENT: 'false',
  INT_PARENT: '4',
  FLOAT_PARENT: '0.4',
  BOOL_PARENT: 'true',
  NESTED_PARENT_STR: 'true',
  NESTED_PARENT_INT: '13',
  NESTED_PARENT_FLOAT: '1.3',
  NESTED_PARENT_BOOL: 'false',
  STR_CHILD: 'true',
  INT_CHILD: '17',
  FLOAT_CHILD: '1.7',
  BOOL_CHILD: 'false',
  NESTED_CHILD_STR: 'false',
  NESTED_CHILD_INT: '52',
  NESTED_CHILD_FLOAT: '5.2',
  NESTED_CHILD_BOOL: 'true',
}

const PROCESS_ENV_PREFIXED = Object.entries(PROCESS_ENV).reduce(
  (obj, [k, v]) => ({ ...obj, [`${PREFIX}_${k}`]: v }),
  {},
)

const OBJ = {
  strParent: false,
  intParent: '4',
  floatParent: '0.4',
  boolParent: true,
  nestedParent: {
    str: true,
    int: '13',
    float: '1.3',
    bool: false,
  },
  strChild: true,
  intChild: '17',
  floatChild: '1.7',
  boolChild: false,
  nestedChild: {
    str: false,
    int: '52',
    float: '5.2',
    bool: true,
  },
}

const OBJ_WITH_DEFAULT_VALUES = {
  strParent: false,
  intParent: '4',
  floatParent: 0.321,
  boolParent: false,
  nestedParent: {
    str: 'str-default',
    int: 123,
    float: 0.123,
    bool: true,
  },
  strChild: 'str-child-default',
  intChild: 321,
  floatChild: '1.7',
  boolChild: false,
  nestedChild: {
    str: 'str-default',
    int: 123,
    float: 0.123,
    bool: true,
  },
}

const CLASS: Child = {
  strParent: 'false',
  intParent: 4,
  floatParent: 0.4,
  boolParent: true,
  nestedParent: {
    str: 'true',
    int: 13,
    float: 1.3,
    bool: false,
  },
  strChild: 'true',
  intChild: 17,
  floatChild: 1.7,
  boolChild: false,
  nestedChild: {
    str: 'false',
    int: 52,
    float: 5.2,
    bool: true,
  },
}

const CLASS_WITH_DEFAULT_VALUES: Child = {
  strParent: 'false',
  intParent: 4,
  floatParent: 0.321,
  boolParent: false,
  nestedParent: {
    str: 'str-default',
    int: 123,
    float: 0.123,
    bool: true,
  },
  strChild: 'str-child-default',
  intChild: 321,
  floatChild: 1.7,
  boolChild: false,
  nestedChild: {
    str: 'str-default',
    int: 123,
    float: 0.123,
    bool: true,
  },
}

test('envToObject', () => {
  process.env = PROCESS_ENV
  const obj = new Child()
  envToObject(obj)
  expect(obj).toEqual(OBJ)
})

test('envToObject with envPrefix', () => {
  process.env = PROCESS_ENV_PREFIXED
  const obj = new Child()
  envToObject(obj, PREFIX)
  expect(obj).toEqual(OBJ)
})

test('envToObject keep pre-existing values', () => {
  process.env = PROCESS_ENV
  const obj = new Child()
  envToObject(obj, '', false)
  expect(obj).toEqual(OBJ_WITH_DEFAULT_VALUES)
})

test('envToClass', () => {
  process.env = PROCESS_ENV
  const [errs, c] = envToClass(Child)
  expect(errs).toEqual([])
  expect(c).toEqual(CLASS)
})

test('envToClass with envPrefix', () => {
  process.env = PROCESS_ENV_PREFIXED
  const [errs, c] = envToClass(Child, undefined, { envPrefix: PREFIX })
  expect(errs).toEqual([])
  expect(c).toEqual(CLASS)
})

test('envToClass keep pre-existing values', () => {
  process.env = PROCESS_ENV
  const [errs, c] = envToClass(Child, undefined, {
    overrideExistingValues: false,
  })
  expect(errs).toEqual([])
  expect(c).toEqual(CLASS_WITH_DEFAULT_VALUES)
})
