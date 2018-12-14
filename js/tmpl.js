/*
 * JavaScript Templates
 * https://github.com/blueimp/JavaScript-Templates
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Inspired by John Resig's JavaScript Micro-Templating:
 * http://ejohn.org/blog/javascript-micro-templating/
 */

/* global define */
/*


tmpl("tmpl-demo", data).then(function (text) {
    document.getElementById("result").innerHTML = text;
})

var f = tmpl("tmpl-demo");

tmpl("tmpl-demo")

f(data).then(function (text) {
    document.getElementById("result").innerHTML = text;
})








*/
;(function ($) {
  'use strict'
  var tmpl = function (str, data) {
    let f = function (data1) {
      let isNormalName = !/[^\w\-.:]/.test(str);
      if(isNormalName){
        let loadedValue = tmpl.load(str)
        if (typeof (loadedValue) === 'function') {

          return new Promise(function (acc1, rej1) {
            loadedValue(function (loadedTmplt) {
              acc1(tmpl(loadedTmplt)(data1));
            })
          })
        } else {
          return Promise.resolve(tmpl(loadedValue)(data1));
        }
      } else {
        return new Promise(function (accept, reject) {
          let localFunction = new Function( // eslint-disable-line no-new-func
              tmpl.arg + ',tmpl',
              'var _e=tmpl.encode' +
              tmpl.helper +
              ",_s='" +
              str.replace(tmpl.regexp, tmpl.func) +
              "'; return _s;")
          accept(localFunction(data1, tmpl));
        })
      }
    }

    if(data){
      return f(data)
    } else {
      return function (data) {
        return f(data);
      }
    }
  }

  var tmplsas = function (str, data) {
    return function () {
      return new Promise(function (resolve, reject) {
        let isNormalName = !/[^\w\-.:]/.test(str)
        let f
        if (isNormalName) {
          let loadedValue = tmpl.load(str)
          if (typeof (loadedValue) === 'function') {
            let calbc = function (readyTemplate) {
              f = tmpl.cache[str] = tmpl.cache[str] || tmpl(readyTemplate)
            }
            loadedValue(calbc)
          } else {
            f = tmpl.cache[str] = tmpl.cache[str] || tmpl(loadedValue) // get templateBody, return function from data
          }
        } else {
          console.log('function created');
          f = function (data1, tmpl1){
            return new Promise(function (res1, rej1) {
              let localFunction = new Function( // eslint-disable-line no-new-func
                  tmpl.arg + ',tmpl',
                  'var _e=tmpl.encode' +
                  tmpl.helper +
                  ",_s='" +
                  str.replace(tmpl.regexp, tmpl.func) +
                  "';return _s;"
              )
              res1(localFunction(data1, tmpl1));
            })
          }

        }

        data ? f(data, tmpl).then(resolve) : function (data) {
          return f(data, tmpl).then(resolve);
        }
      })
    }
  }


  tmpl.cache = {}
  tmpl.load = function (id) {
    console.log('looking id:', id);
    return document.getElementById(id).innerHTML
    /*return function (accept, reject) {
      setTimeout(function () {
        accept('lold')
      }, 20000)
    }
    */
  }
  tmpl.regexp = /([\s'\\])(?!(?:[^{]|\{(?!%))*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g
  tmpl.func = function (s, p1, p2, p3, p4, p5) {
    if (p1) {
      // whitespace, quote and backspace in HTML context
      return (
        {
          '\n': '\\n',
          '\r': '\\r',
          '\t': '\\t',
          ' ': ' '
        }[p1] || '\\' + p1
      )
    }
    if (p2) {
      // interpolation: {%=prop%}, or unescaped: {%#prop%}
      if (p2 === '=') {
        return "'+_e(" + p3 + ")+'"
      }
      return "'+(" + p3 + "==null?'':" + p3 + ")+'"
    }
    if (p4) {
      // evaluation start tag: {%
      return "';"
    }
    if (p5) {
      // evaluation end tag: %}
      return "_s+='"
    }
  }
  tmpl.encReg = /[<>&"'\x00]/g // eslint-disable-line no-control-regex
  tmpl.encMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  }
  tmpl.encode = function (s) {
    return (s == null ? '' : '' + s).replace(tmpl.encReg, function (c) {
      return tmpl.encMap[c] || ''
    })
  }
  tmpl.arg = 'o'
  tmpl.helper =
    ",print=function(s,e){_s+=e?(s==null?'':s):_e(s);}" +
    ',include=function(s,d){_s+=tmpl(s,d);}'
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return tmpl
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = tmpl
  } else {
    $.tmpl = tmpl
  }
})(this)
