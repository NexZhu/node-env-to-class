import { hello } from './index'

test("hello('Nex') to equal 'Hello Nex!'", () => {
  expect(hello('Nex')).toBe(`Hello Nex!`)
})
