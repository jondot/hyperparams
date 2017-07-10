# Hyperparams

<img src="https://travis-ci.org/jondot/hyperparams.svg?branch=master">

A [strong params](http://edgeguides.rubyonrails.org/action_controller_overview.html#strong-parameters) inspired library for [Express](http://expressjs.com/) and plain Javascript that's fast and functional.

## Quickstart

Observe the following:

```javascript
const { extract } = require('hyperparams')
const userParams = extract('user', ['email', 'password', { address: ['zip']}])
app.post('/users', (req, res)=>{
  try{
    await User.save(userParams(req.body))
    res.json({all: 'good'})
  } catch(err) {
    res.json({all: 'bad'})
  }
})
```

We made a `userParams` a strong-params extractor. This means we didn't do any left-hand-right-hand coding,
any brittle deep and-and drilldowns to extract a property.

More importantly, we didn't accept everything that's on `body` as is, such as an `_id` property (internal ID on MongoDB, for example),
or a malliciously added `admin` flag, potentially elevating a user's permissions.

Note that when a missing root or property is encountered, we *throw an exception* and this is by-design. If you'd like an error object,
make wrapper and return an `{error: ..., value: ...}` struct. That's just one suggestion though.

## What's next

You can give defaults to `hyperparams` if you like (these are deep defaults):

```javascript
// let's say body is: { user: { email: 'admin@foo.org' } }
extract('user', ['email', { foobar: ['foobaz']}], { foobar: { foobaz: 42 } })(body)
// -> { user: { email: 'admin@foo.org', foobar: { foobaz: 42 } } }
```

And you can couple it with any validation library like `ajv` or `joi`.

## Strong params vs validation

This is not a validation library. Hence, it will not check types, formats or
any of that. If you need to do that, then you can use vanilla object schema
validation libraries like `ajv` or `joi`; they have features to remove excess properties
for varying degrees of support.

More importantly, you can decide that validation as a concerns sits in your model library in any case, and/or
even (probably) database constraints.

But note that if you don't need involved type validation at the request layer,
and you still a validation library, you'll pay with performance and developer
experience.

Here are some numbers to get an idea about speed:

```
- baseline: joi single prop x 26,949 ops/sec ±1.12% (83 runs sampled)
- baseline: joi flat pick x 13,439 ops/sec ±1.56% (82 runs sampled)
- baseline: ajv single prop x 54,967 ops/sec ±1.98% (78 runs sampled)
- baseline: ajv flat pick x 59,308 ops/sec ±2.08% (84 runs sampled)
- baseline: lodash flat pick x 511,284 ops/sec ±1.43% (83 runs sampled)
- baseline: lodash get x 15,648,434 ops/sec ±1.51% (80 runs sampled)
- hyperparams: nested w/array mapping x 103,790 ops/sec ±1.70% (84 runs sampled)
- hyperparams: single prop x 490,952 ops/sec ±1.61% (83 runs sampled)
```

# Contributing

Fork, implement, add tests, pull request, get my everlasting thanks and a respectable place here :).


### Thanks:

To all [Contributors](https://github.com/jondot/hyperparams/graphs/contributors) - you make this happen, thanks!


# Copyright

Copyright (c) 2017 [Dotan Nahum](http://gplus.to/dotan) [@jondot](http://twitter.com/jondot). See [LICENSE](LICENSE) for further details.
