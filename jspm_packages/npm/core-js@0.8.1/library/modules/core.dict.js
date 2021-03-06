/* */ 
var $ = require("./$"),
    ctx = require("./$.ctx"),
    $def = require("./$.def"),
    assign = require("./$.assign"),
    keyOf = require("./$.keyof"),
    ITER = require("./$.uid").safe('iter'),
    assert = require("./$.assert"),
    $iter = require("./$.iter"),
    step = $iter.step,
    getKeys = $.getKeys,
    toObject = $.toObject,
    has = $.has;
function Dict(iterable) {
  var dict = $.create(null);
  if (iterable != undefined) {
    if ($iter.is(iterable)) {
      $iter.forOf(iterable, true, function(key, value) {
        dict[key] = value;
      });
    } else
      assign(dict, iterable);
  }
  return dict;
}
Dict.prototype = null;
function DictIterator(iterated, kind) {
  $.set(this, ITER, {
    o: toObject(iterated),
    a: getKeys(iterated),
    i: 0,
    k: kind
  });
}
$iter.create(DictIterator, 'Dict', function() {
  var iter = this[ITER],
      O = iter.o,
      keys = iter.a,
      kind = iter.k,
      key;
  do {
    if (iter.i >= keys.length) {
      iter.o = undefined;
      return step(1);
    }
  } while (!has(O, key = keys[iter.i++]));
  if (kind == 'key')
    return step(0, key);
  if (kind == 'value')
    return step(0, O[key]);
  return step(0, [key, O[key]]);
});
function createDictIter(kind) {
  return function(it) {
    return new DictIterator(it, kind);
  };
}
function generic(A, B) {
  return typeof A == 'function' ? A : B;
}
function createDictMethod(TYPE) {
  var IS_MAP = TYPE == 1,
      IS_EVERY = TYPE == 4;
  return function(object, callbackfn, that) {
    var f = ctx(callbackfn, that, 3),
        O = toObject(object),
        result = IS_MAP || TYPE == 7 || TYPE == 2 ? new (generic(this, Dict)) : undefined,
        key,
        val,
        res;
    for (key in O)
      if (has(O, key)) {
        val = O[key];
        res = f(val, key, object);
        if (TYPE) {
          if (IS_MAP)
            result[key] = res;
          else if (res)
            switch (TYPE) {
              case 2:
                result[key] = val;
                break;
              case 3:
                return true;
              case 5:
                return val;
              case 6:
                return key;
              case 7:
                result[res[0]] = res[1];
            }
          else if (IS_EVERY)
            return false;
        }
      }
    return TYPE == 3 || IS_EVERY ? IS_EVERY : result;
  };
}
function createDictReduce(IS_TURN) {
  return function(object, mapfn, init) {
    assert.fn(mapfn);
    var O = toObject(object),
        keys = getKeys(O),
        length = keys.length,
        i = 0,
        memo,
        key,
        result;
    if (IS_TURN) {
      memo = init == undefined ? new (generic(this, Dict)) : Object(init);
    } else if (arguments.length < 3) {
      assert(length, 'Reduce of empty object with no initial value');
      memo = O[keys[i++]];
    } else
      memo = Object(init);
    while (length > i)
      if (has(O, key = keys[i++])) {
        result = mapfn(memo, O[key], key, object);
        if (IS_TURN) {
          if (result === false)
            break;
        } else
          memo = result;
      }
    return memo;
  };
}
var findKey = createDictMethod(6);
$def($def.G + $def.F, {Dict: $.mix(Dict, {
    keys: createDictIter('key'),
    values: createDictIter('value'),
    entries: createDictIter('key+value'),
    forEach: createDictMethod(0),
    map: createDictMethod(1),
    filter: createDictMethod(2),
    some: createDictMethod(3),
    every: createDictMethod(4),
    find: createDictMethod(5),
    findKey: findKey,
    mapPairs: createDictMethod(7),
    reduce: createDictReduce(false),
    turn: createDictReduce(true),
    keyOf: keyOf,
    includes: function(object, el) {
      return (el == el ? keyOf(object, el) : findKey(object, function(it) {
        return it != it;
      })) !== undefined;
    },
    has: has,
    get: function(object, key) {
      if (has(object, key))
        return object[key];
    },
    set: $.def,
    isDict: function(it) {
      return $.isObject(it) && $.getProto(it) === Dict.prototype;
    }
  })});
