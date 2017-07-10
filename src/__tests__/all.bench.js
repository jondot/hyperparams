const Benchmark = require('benchmark')
const { extract } = require('../')
const L = require('lodash')
const Joi = require('joi')
const Ajv = require('ajv')

var data = {
  foo: 0,
  additional1: 1, // will be removed; `additionalProperties` == false
  bar: {
    baz: 'abc',
    additional2: 2, // will NOT be removed; `additionalProperties` != false
  },
}

const body = {
  user: { name: 'joe', age: 31, _id: 123 },
  token: 2,
  posts: {
    total: 2,
    meta: { agent: 'superagent' },
    items: [{ _id: 1, title: 'foobar' }, { _id: 2, title: 'goo!' }],
  },
}

// ajv
const ajv = new Ajv({ removeAdditional: true })
const ajvSingleProp = ajv.compile({
  additionalProperties: false,
  properties: {
    posts: {
      additionalProperties: false,
      properties: {
        total: { type: 'number' },
      },
    },
  },
})
const ajvFlatPick = ajv.compile({
  additionalProperties: false,
  properties: {
    user: { type: 'object' },
    token: { type: 'string' },
  },
})

let bodyClone = L.cloneDeep(body)
console.log(ajvSingleProp(bodyClone)) // true
console.log('ajv', bodyClone)

// joi
const joiSingleProp = Joi.object().keys({
  posts: Joi.object().keys({
    total: Joi.number(),
  }),
})
const joiFlatPick = Joi.object().keys({
  user: Joi.object(),
  token: Joi.string(),
})
const joiOpts = { stripUnknown: true }
console.log('joi', Joi.validate(body, joiSingleProp, joiOpts))

//extract
const nestedWithArrayMapping = extract('posts', ['total', { items: ['title'] }])
const singleProp = extract('posts', ['total'])

const suite = new Benchmark.Suite()
suite
  .add('baseline: joi single prop', function() {
    Joi.validate(body, joiSingleProp, joiOpts)
  })
  .add('baseline: joi flat pick', function() {
    Joi.validate(body, joiFlatPick, joiOpts)
  })
  .add('baseline: ajv single prop', function() {
    ajvSingleProp(L.cloneDeep(body))
  })
  .add('baseline: ajv flat pick', function() {
    ajvFlatPick(L.cloneDeep(body))
  })
  .add('baseline: lodash flat pick', function() {
    L.pick(body, ['user', 'token'])
  })
  .add('baseline: lodash get', function() {
    L.get(body, ['user'])
  })
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
