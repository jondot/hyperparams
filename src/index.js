const { flow, map, merge, get } = require('lodash/fp')
const L = require('lodash')

class ExtractException extends Error {}
//info-- [ 'total', { posts: ['title'] } ]
const deepPick = (desc, opts) => data => pickrec(desc, data, opts.getprops)
const pickrec = (desc, data, getprops) => {
  // optimization:
  // 1. empty desc is just data
  // 2. data: { some: 'hash' }    desc: ['only', 'shallow', 'props']
  // -> pick({ some: 'hash' }, ['only', 'shallow', 'props'])
  if (desc.length == 0) {
    return data
  }

  if (!L.isArray(data) && L.filter(desc, L.isString).length === desc.length) {
    return getprops(data, desc)
  }

  // [ 'one', 'two', { four: ['five'] } ]
  if (L.isArray(desc)) {
    const [stringies, objies] = L.partition(desc, L.isString)

    let collected = {}
    if (stringies.length > 0) {
      collected = L.isArray(data)
        ? L.map(data, _ => getprops(_, stringies))
        : getprops(data, stringies)
    }
    // ugly for speed
    for (const arg of objies) {
      Object.assign(collected, pickrec(arg, data, getprops))
    }
    return collected
  } else {
    // { four: ['five'] }

    // ugly for speed
    // nicer but slower:
    // return L.mapValues(desc, (v, k) => pickrec(v, L.get(data, k), getprops))
    const collected = {}
    for (const k of Object.keys(desc)) {
      collected[k] = pickrec(desc[k], data[k], getprops)
    }
    return collected
  }
}

const onMissingRoot = (data, k) => {
  throw new ExtractException(
    `missing required root. given: ${JSON.stringify({
      required: k,
      source: data,
    })}`
  )
}

const onMissingProps = (data, k) => {
  throw new ExtractException(
    `missing required props. given: ${JSON.stringify({
      required: k,
      source: data,
    })}`
  )
}

const getprops = (data, keys) => {
  const selected = L.pick(data, keys)
  const len = Object.keys(selected).length
  return len > 0 && len === keys.length ? selected : onMissingProps(data, keys)
}

const extractWithOpts = () => (root, shape, defaults = {}) => {
  const pick = deepPick(shape, { getprops })
  return data => {
    let extracted = {}
    if (root.length == 0) {
      extracted = data
    } else {
      extracted = L.get(data, root)
    }
    if (!extracted) {
      extracted = onMissingRoot(extracted, root)
    }
    return pick(
      L.isEmpty(defaults) ? extracted : L.merge({}, defaults, extracted)
    )
  }
}

const extract = extractWithOpts({})

module.exports = {
  extract,
}
