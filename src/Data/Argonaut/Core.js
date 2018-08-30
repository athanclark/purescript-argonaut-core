"use strict";

function id(x) {
  return x;
}

exports.fromNull = function () {
  return null;
};

exports.fromBoolean = id;
exports.fromNumber = id;
exports.fromString = id;
exports.fromArray = id;
exports.fromObject = id;

exports.jsonNull = null;

exports.stringify = function (j) {
  return JSON.stringify(j);
};

var objToString = Object.prototype.toString;
var objKeys = Object.keys;

function isArray(a) {
  return objToString.call(a) === "[object Array]";
}

exports._foldJson = function (isNull, isBool, isNum, isStr, isArr, isObj, j) {
  if (j == null) return isNull(null);
  else if (typeof j === "boolean") return isBool(j);
  else if (typeof j === "number") return isNum(j);
  else if (typeof j === "string") return isStr(j);
  else if (objToString.call(j) === "[object Array]")
    return isArr(j);
  else return isObj(j);
};

exports._compare = function _compare (EQ, GT, LT, a, b) {
  if (a == null) {
    if (b == null) return EQ;
    else return LT;
  } else if (typeof a === "boolean") {
    if (typeof b === "boolean") {
      // boolean / boolean
      if (a === b) return EQ;
      else if (a === false) return LT;
      else return GT;
    } else if (b == null) return GT;
    else return LT;
  } else if (typeof a === "number") {
    if (typeof b === "number") {
      if (a === b) return EQ;
      else if (a < b) return LT;
      else return GT;
    } else if (b == null) return GT;
    else if (typeof b === "boolean") return GT;
    else return LT;
  } else if (typeof a === "string") {
    if (typeof b === "string") {
      // console.log("some bs:", a, b, a === b, JSON.stringify(a), JSON.stringify(b), JSON.stringify(a) === JSON.stringify(b));
      var stringEq = function stringEq(x,y) {
        if (Buffer !== undefined) {
          // var c = new Intl.Collator();
          var x_ = Buffer.from(x,'utf8');
          var y_ = Buffer.from(y,'utf8');
          console.log("some bs:", x, y, x === y, x_, y_, x_.equals(y_));
          return x_.equals(y_);
        } else {
          return x === y;
        }
      };
      if (stringEq(a,b)) return EQ;
      else if (a < b) return LT;
      else return GT;
    } else if (b == null) return GT;
    else if (typeof b === "boolean") return GT;
    else if (typeof b === "number") return GT;
    else return LT;
  } else if (isArray(a)) {
    if (isArray(b)) {
      for (var i = 0; i < Math.min(a.length, b.length); i++) {
        var ca = _compare(EQ, GT, LT, a[i], b[i]);
        if (ca !== EQ) return ca;
      }
      if (a.length === b.length) return EQ;
      else if (a.length < b.length) return LT;
      else return GT;
    } else if (b == null) return GT;
    else if (typeof b === "boolean") return GT;
    else if (typeof b === "number") return GT;
    else if (typeof b === "string") return GT;
    else return LT;
  } else {
    if (b == null) return GT;
    else if (typeof b === "boolean") return GT;
    else if (typeof b === "number") return GT;
    else if (typeof b === "string") return GT;
    else if (isArray(b)) return GT;
    else {
      var akeys = objKeys(a);
      var bkeys = objKeys(b);
      if (akeys.length < bkeys.length) return LT;
      else if (akeys.length > bkeys.length) return GT;
      var keys = akeys.concat(bkeys).sort();
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        if (a[k] === undefined) return LT;
        else if (b[k] === undefined) return GT;
        var ck = _compare(EQ, GT, LT, a[k], b[k]);
        if (ck !== EQ) return ck;
      }
      return EQ;
    }
  }
};

exports._jsonParser = function (fail, succ, s) {
    try {
        return succ(JSON.parse(s));
    }
    catch (e) {
        return fail(e.message);
    }
};
