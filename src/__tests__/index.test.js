const { extract } = require('../../src/index')

const body = {
  user: { name: 'joe', age: 31, _id: 123 },
  token: 2,
  posts: {
    total: 2,
    meta: { agent: 'superagent' },
    items: [{ _id: 1, title: 'foobar' }, { _id: 2, title: 'goo!' }],
  },
}

it('flat props', () =>
  expect(extract('user', ['name', 'age'])(body)).toMatchSnapshot())
it('nested w/array', () =>
  expect(
    extract('posts', ['total', { items: ['title'] }])(body)
  ).toMatchSnapshot())
it('nested w/object', () =>
  expect(
    extract('posts', [{ meta: ['agent'] }, 'total'])(body)
  ).toMatchSnapshot())
it('flat w/object', () =>
  expect(extract('posts', ['total', 'meta'])(body)).toMatchSnapshot())
it('object but w/missing props', () =>
  expect(() => extract('posts', ['total', 'meta', 'foobar'])(body)).toThrow())
it('missing all throws', () =>
  expect(() =>
    extract('posts', ['foo', 'bar', { baz: ['poop'] }])(body)
  ).toThrow())
it('missing but merged', () =>
  expect(
    extract('posts', ['foo', 'bar', { baz: ['poop'] }], {
      foo: 1,
      bar: 2,
      baz: { poop: 3 },
    })(body)
  ).toMatchSnapshot())
it('missing root throws', () =>
  expect(() => extract('foobar', ['baz'])(body)).toThrow())
it('no props given means everything', () =>
  expect(extract('posts', [])(body)).toMatchSnapshot())
it('no props for nested array means verbatim array items', () =>
  expect(extract('posts', [{ items: [] }])(body)).toMatchSnapshot())
it('empty string root means shallow root object', () =>
  expect(extract('', ['token'])(body)).toMatchSnapshot())
/* 
 *
 *  user_params = body => from(body).extract('user').permit('name', {defaults}).value
 *  user_params = extract('user').permit('name', {defaults})
 *
 *
 */
