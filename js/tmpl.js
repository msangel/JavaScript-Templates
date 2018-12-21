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

  var Bus = function (factory) {
    var me = this
    me.factory = factory || function (name) {
      return Promise.reject(new Error('must be implementing'))
    }
    me.ev = {}
    me.cache = {}
    me.subscribe = function (name) {
      console.log('subscribe on: ', name)
      console.log('me.cache[name]: ', me.cache[name])
      if (me.cache[name]) {
        return Promise.resolve(me.cache[name])
      } else {
        var accept
        var f = function (data) {
          me.cache[name] = data
          accept(data)
        }
        if (typeof me.ev[name] === 'undefined') {
          startLoading(name)
        }
        me.ev[name] = me.ev[name] || []
        me.ev[name].push(f)
        return new Promise(function (resolve, reject) {
          accept = resolve
        })
      }
    }
    var publish = function (name, template) {
      me.ev[name] = me.ev[name] || []
      for (let i = 0; i < me.ev[name].length; i++) {
        me.ev[name][i](template)
      }
      me.ev[name] = []
    }

    me.loadingTimeout = 5000
    me.loadingTimeoutHandler = function (accept, reject, name) {
      reject(new Error('loading of ' + name + ' takes too long'))
    }

    var startLoading = function (name) {
      var timeoutHandler
      Promise.race([
        me.factory(name),
        new Promise(function (resolve, reject) {
          timeoutHandler = setTimeout(function () {
            me.loadingTimeoutHandler(resolve, reject, name)
          }, me.loadingTimeout)
        })
      ]).then(function (template) {
        if (timeoutHandler) {
          clearTimeout(timeoutHandler)
        }
        publish(name, template)
      })
    }
  }

  var tmpl = function (template, data) {
    console.log('template', template)
    var localFunction = new Function( // eslint-disable-line no-new-func
      tmpl.arg + ',tmpl',
      'var _e=tmpl.encode' +
        tmpl.helper +
        ",_s='" +
        template.replace(tmpl.regexp, tmpl.func) +
        "'; return _s;"
    )

    if (data) {
      return Promise.resolve(localFunction(data, tmpl))
    } else {
      return function (dat) {
        return Promise.resolve(localFunction(dat, tmpl))
      }
    }
  }

  tmpl.bus = new Bus(function (name) {
    var loadedValue = tmpl.load(name)
    return new Promise(function (resolve, reject) {
      if (typeof loadedValue === 'function') {
        loadedValue().then(resolve).catch(reject)
      } else {
        resolve(loadedValue)
      }
    })
  })

  tmpl.byName = function (name, data) {
    var f = function (data1) {
      return tmpl.bus.subscribe(name).then(function (template) {
        if(typeof template === "undefined"){
          return Promise.reject(new Error("Template is undefined, please make sure your load function du return either string, either function that return promise"))
        } else if (typeof template.then === 'function') {
          // probably a promise
          return Promise.reject(new Error("Load function should not return Promise itself. It should return function that return Promise."));
        }
        return Promise.resolve(tmpl(template, data1))
      })
    }
    if (data) {
      return f(data)
    } else {
      return function (data) {
        return f(data)
      }
    }
  }

  tmpl.load = function (id) {
    console.log('looking id:', id)
    return document.getElementById(id).innerHTML
    /* return function (done, fail) {
      return new Promise(function(){
     setTimeout(function () {
        accept('lold')
      }, 20000)
      })
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
