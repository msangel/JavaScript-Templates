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
  var tmpl = function (name, data) {
      let f = function (data1) {
          let loadedValue = tmpl.load(name)
          if (typeof (loadedValue) === 'function') {
              return new Promise(function (acc1, rej1) {
                  loadedValue(function (loadedTmplt) {
                      tmpl.tmplFromTemplate(loadedTmplt, data1).then(acc1);
                  })
              })
          } else {
              return Promise.resolve(tmpl.tmplFromTemplate(loadedValue, data1));
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

    tmpl.tmplFromTemplate = function (template, data) {
      let f = function (data1) {
          return new Promise(function (accept, reject) {
              let localFunction = new Function( // eslint-disable-line no-new-func
                  tmpl.arg + ',tmpl',
                  'var _e=tmpl.encode' +
                  tmpl.helper +
                  ",_s='" +
                  template.replace(tmpl.regexp, tmpl.func) +
                  "'; return _s;")
              accept(localFunction(data1, tmpl));
          })
      }
      return f(data)
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
