import decamelize from 'decamelize'
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToClass,
} from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'

/**
 * envToClass options.
 */
export type Options = {
  /*
   * Prefix for environment variable names.
   * @example
   * With envPrefix === 'NEX', `obj.envName` or `obj.env.name` will be loaded from environt variable named `PREFIX_ENV_NAME`.
   */
  envPrefix?: string

  /*
   * Override the existing values in the supplied class instance or the default values in the new class instance.
   * @defaultValue `true`
   */
  overrideExistingValues?: boolean

  /*
   * Options that will be passed to `class-transformer`'s `plainToClass` function for converting object to class instance.
   * @remarks
   * `enableImplicitConversion` will always be set to `true`.
   */
  classTransformer?: ClassTransformOptions
}

/**
 * Load process.env into class instance and convert string values according to field types.
 *
 * @param cls - Class constructor
 * @param instance - Optional class instance (with default values) to load `process.env` into,
 * if not specified, a new class instance will be created.
 * @param options - See {@link Options}
 *
 * @returns errs - validation errors returned by `class-validator`'s `validateSync` function
 * @returns c - The `instance` parameter or a newly created `cls` instance loaded with `process.env`
 */
export function envToClass<T>(
  cls: ClassConstructor<T>,
  instance = new cls(),
  options?: Options,
): [errs: ValidationError[], c: T] {
  envToObject(
    instance as Record<string, unknown>,
    options?.envPrefix,
    options?.overrideExistingValues,
  )
  const c = plainToClass(cls, instance, {
    ...options?.classTransformer,
    enableImplicitConversion: true,
  })
  const errs = validateSync(cls, c)
  return [errs, c]
}

/**
 * Load process.env into class instance.
 * @internal
 *
 * @privateRemarks
 * Because `class-transformer` converts 'false' to true (Boolean('false') === true),
 * to mitigate that, envToObject will first convert string 'true'/'false' to boolean true/false,
 * so that `class-transformer` can converts boolean true/false back to string 'true'/'false' for string fields.
 *
 * @param instance - The class instance to load `process.env` into
 * @param envPrefix - See {@link Options.envPrefix}
 * @param overrideExistingValues - See {@link Options.overrideExistingValues}
 */
export function envToObject(
  // eslint-disable-next-line @typescript-eslint/ban-types
  instance: object,
  envPrefix = '',
  overrideExistingValues = true,
): void {
  const record = instance as Record<string, unknown>
  envPrefix = envPrefix.trim()
  Object.keys(instance).forEach((k) => {
    const envKey =
      (envPrefix === '' ? '' : envPrefix + '_') +
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      decamelize(k).toUpperCase()
    if (record[k] instanceof Object) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      envToObject(record[k] as object, envKey, overrideExistingValues)
    } else if (overrideExistingValues || record[k] === undefined) {
      const val = process.env[envKey]
      if (val) {
        record[k] = val === 'true' ? true : val === 'false' ? false : val
      }
    }
  })
}
