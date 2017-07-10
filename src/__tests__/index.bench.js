const Benchmark = require('benchmark')
const { extract } = require('../')
const L = require('lodash')

const body = {
  user: { name: 'joe', age: 31, _id: 123 },
  token: 2,
  posts: {
    total: 2,
    meta: { agent: 'superagent' },
    items: [{ _id: 1, title: 'foobar' }, { _id: 2, title: 'goo!' }],
  },
}

//extract
const nestedWithArrayMapping = extract('posts', ['total', { items: ['title'] }])
const singleProp = extract('posts', ['total'])

const suite = new Benchmark.Suite()
suite
  .add('nested w/array mapping', function() {
    nestedWithArrayMapping(body)
  })
  .add('single prop', function() {
    singleProp(body)
  })
  .on('cycle', function(event) {
    console.log('- ' + String(event.target))
  })
  .on('error', function(err) {
    console.log('X error: ' + err.toString())
  })
  .on('complete', function() {
    console.log(`Fastest is [${this.filter('fastest').map('name')}]`)
  })
  .run({ async: false })
