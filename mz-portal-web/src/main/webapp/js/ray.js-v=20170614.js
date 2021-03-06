/*
*	(C)2017 VeryIDE
*	http://www.veryide.com/
*	ray.js 核心框架
*	$Id: ray.js 2017/07/11 Lay $
*/
(function (win, doc) {
    var R = function (selector, context) {
        return new R.init(selector, context)
    };
    R.timestamp = new Date().getTime();
    R.Browser = {msie: false, opera: false, safari: false, chrome: false, firefox: false};
    var nav = navigator;
    var uat = nav.userAgent;
    var reg = "";
    switch (nav.appName) {
        case"Microsoft Internet Explorer":
            R.Browser.name = "ie";
            R.Browser.msie = true;
            reg = /^.+MSIE (\d+\.\d+);.+$/;
            break;
        default:
            if (uat.indexOf("Chrome") != -1) {
                R.Browser.name = "chrome";
                R.Browser.chrome = true;
                reg = /^.+Chrome\/([\d.]+?)([\s].*)$/ig
            } else {
                if (uat.indexOf("Safari") != -1) {
                    R.Browser.name = "safari";
                    R.Browser.safari = true;
                    reg = /^.+Version\/([\d\.]+?) (Mobile.)?Safari.+$/
                } else {
                    if (uat.indexOf("Opera") != -1) {
                        R.Browser.name = "opera";
                        R.Browser.opera = true;
                        reg = /^.{0,}Opera\/(.+?) \(.+$/
                    } else {
                        R.Browser.name = "firefox";
                        R.Browser.firefox = true;
                        reg = /^.+Firefox\/([\d\.]+).{0,}$/
                    }
                }
            }
            break
    }
    R.Browser.version = uat.replace(reg, "$1");
    R.Browser.lang = (!R.Browser.msie ? nav.language : nav.browserLanguage).toLowerCase();
    R.Browser.mobile = /(iPhone|iPad|iPod|Android)/i.test(uat);
    if (typeof HTMLElement !== "undefined" && !("outerHTML" in HTMLElement.prototype)) {
        HTMLElement.prototype.__defineGetter__("outerHTML", function () {
            var a = this.attributes, str = "<" + this.tagName, i = 0;
            for (; i < a.length; i++) {
                if (a[i].specified) {
                    str += " " + a[i].name + '="' + a[i].value + '"'
                }
            }
            if (!this.canHaveChildren) {
                return str + " />"
            }
            return str + ">" + this.innerHTML + "</" + this.tagName + ">"
        });
        HTMLElement.prototype.__defineSetter__("outerHTML", function (s) {
            var r = this.ownerDocument.createRange();
            r.setStartBefore(this);
            var df = r.createContextualFragment(s);
            this.parentNode.replaceChild(df, this);
            return s
        });
        HTMLElement.prototype.__defineGetter__("canHaveChildren", function () {
            return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase())
        })
    }
    if (/rv\:(.*?)\)\s+gecko\//i.test(uat)) {
        HTMLElement.prototype["__defineGetter__"]("innerText", function () {
            return this.textContent
        });
        HTMLElement.prototype["__defineSetter__"]("innerText", function (text) {
            this.textContent = text
        });
        HTMLElement.prototype.insertAdjacentElement = function (pos, ele) {
            if (!pos || !ele) {
                return
            }
            switch (pos) {
                case"beforeEnd":
                    this.appendChild(ele);
                    return;
                case"beforeBegin":
                    this.parentNode.insertBefore(ele, this);
                    return;
                case"afterBegin":
                    !this.firstChild ? this.appendChild(ele) : this.insertBefore(ele, this.firstChild);
                    return;
                case"afterEnd":
                    !this.nextSibling ? this.parentNode.appendChild(ele) : this.parentNode.insertBefore(ele, this.nextSibling);
                    return
            }
        };
        HTMLElement.prototype.insertAdjacentHTML = function (pos, text) {
            if (!pos || !text) {
                return
            }
            this.insertAdjacentElement(pos, document.createRange().createContextualFragment(text))
        }
    }
    if (window.Node) {
        Node.prototype.replaceNode = function (Node) {
            this.parentNode.replaceChild(Node, this)
        };
        Node.prototype.removeNode = function (Children) {
            if (Children) {
                return this.parentNode.removeChild(this)
            } else {
                var range = document.createRange();
                range.selectNodeContents(this);
                return this.parentNode.replaceChild(range.extractContents(), this)
            }
        };
        Node.prototype.swapNode = function (Node) {
            var base = this.parentNode;
            var next = this.nextSibling;
            var replaced = Node.parentNode.replaceChild(this, Node);
            if (replaced == next) {
                base.insertBefore(next, this)
            } else {
                if (next) {
                    base.insertBefore(replaced, next)
                } else {
                    base.appendChild(replaced)
                }
            }
            return this
        }
    }
    R.$ = function (id) {
        return document.getElementById(id)
    };
    R.reader = function (func) {
        R(window).bind("load", function () {
            func(new Date().getTime() - R.time)
        })
    };
    R.resize = function (func) {
        R(window).bind("resize", func)
    };
    R.Cookie = {
        get: function (key) {
            var tmp = document.cookie.match((new RegExp(key + "=[a-zA-Z0-9.()=|%/]+($|;)", "g")));
            if (!tmp || !tmp[0]) {
                return null
            } else {
                return unescape(tmp[0].substring(key.length + 1, tmp[0].length).replace(";", "")) || null
            }
        }, set: function (key, value, ttl, path, domain, secure) {
            var cookie = [key + "=" + escape(value), "path=" + ((!path || path == "") ? "/" : path), "domain=" + ((!domain || domain == "") ? window.location.hostname : domain)];
            if (ttl) {
                cookie.push(R.Cookie.hoursToExpireDate(ttl))
            }
            if (secure) {
                cookie.push("secure")
            }
            return document.cookie = cookie.join("; ")
        }, unset: function (key, path, domain) {
            path = (!path || typeof path != "string") ? "" : path;
            domain = (!domain || typeof domain != "string") ? "" : domain;
            if (R.Cookie.get(key)) {
                R.Cookie.set(key, "", "Thu, 01-Jan-70 00:00:01 GMT", path, domain)
            }
        }, hoursToExpireDate: function (ttl) {
            if (parseInt(ttl) == "NaN") {
                return ""
            } else {
                var now = new Date();
                now.setTime(now.getTime() + (parseInt(ttl) * 60 * 60 * 1000));
                return now.toGMTString()
            }
        }, clear: function () {
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;) {
                    R.Cookie.unset(keys[i])
                }
            }
        }
    };
    R.template = function (tmpl, data) {
        try {
            if (typeof tmpl == "object") {
                var tmpl = tmpl.innerHTML
            }
            var fn = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + tmpl.replace(/[\r\t\n]/g, " ").replace(/'(?=[^%]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "',$1,'").split("<%").join("');").split("%>").join("p.push('") + "');}return p.join('');");
            return fn(data)
        } catch (e) {
            console.log(e.message)
        }
    };
    R.getViewportSize = function () {
        var value = {width: 0, height: 0};
        undefined !== window.innerWidth ? value = {
            width: window.innerWidth,
            height: window.innerHeight
        } : value = {width: document.documentElement.clientWidth, height: document.documentElement.clientHeight};
        return value
    };
    R.getClinetRect = function (f) {
        var d = f.getBoundingClientRect(), e = (e = {
            left: d.left,
            right: d.right,
            top: d.top,
            bottom: d.bottom,
            height: (d.height || (d.bottom - d.top)),
            width: (d.width || (d.right - d.left))
        });
        return e
    };
    R.getScrollPosition = function () {
        var position = {left: 0, top: 0};
        if (window.pageYOffset) {
            position = {left: window.pageXOffset, top: window.pageYOffset}
        } else {
            if (typeof document.documentElement.scrollTop != "undefined" && document.documentElement.scrollTop > 0) {
                position = {left: document.documentElement.scrollLeft, top: document.documentElement.scrollTop}
            } else {
                if (typeof document.body.scrollTop != "undefined") {
                    position = {left: document.body.scrollLeft, top: document.body.scrollTop}
                }
            }
        }
        return position
    };
    R.Array = function (source) {
        var inti = function (source) {
            this.self = source;
            return this
        };
        inti.prototype = {
            slice: ([]).slice, first: function () {
                return this.self[0]
            }, last: function () {
                return this.self[this.self.length - 1]
            }, max: function () {
                return Math.max.apply(null, this.self)
            }, min: function () {
                return Math.min.apply(null, this.self)
            }, sum: function () {
                for (var i = 0, sum = 0; i < this.self.length; sum += isNaN(parseInt(this.self[i])) ? 0 : parseInt(this.self[i]), i++) {
                }
                return sum
            }, indexOf: function (value) {
                var l = this.self.length;
                for (var i = 0; i <= l; i++) {
                    if (this.self[i] == value) {
                        return i
                    }
                }
                return -1
            }
        };
        return new inti(source)
    };
    R.String = function (source) {
        var inti = function (source) {
            this.self = String(source || "");
            return this
        };
        inti.prototype = {
            pad: function (l, s, t) {
                var str = this.self.toString();
                return s || (s = " "), (l -= str.length) > 0 ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, t = !t ? l : t == 1 ? 0 : Math.ceil(l / 2)) + str + s.substr(0, l - t) : str
            }, length: function () {
                return String(this.self).replace(/[^\x00-\xff]/g, "ci").length
            }, trim: function () {
                return this.self.replace(/(^\s*)|(\s*$)/g, "")
            }, leftTrim: function () {
                return this.self.replace(/(^\s*)/g, "")
            }, rightTrim: function () {
                return this.self.replace(/(\s*$)/g, "")
            }, stripScript: function () {
                return this.self.replace(/<script.*?>.*?<\/script>/ig, "")
            }, stripTags: function (allowed) {
                allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");
                var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
                return this.self.replace(commentsAndPhpTags, "").replace(tags, function ($0, $1) {
                    return allowed.indexOf("<" + $1.toLowerCase() + ">") > -1 ? $0 : ""
                })
            }, stripTags: function () {
                return String(this.self).replace(/<[^>]+>/g, "")
            }, unicode: function () {
                var result = "";
                for (var i = 0; i < this.self.length; i++) {
                    result += "&#" + this.self.charCodeAt(i) + ";"
                }
                return result
            }, ascii: function () {
                var code = this.self.match(/&#(\d+);/g);
                if (code != null) {
                    var result = "";
                    for (var i = 0; i < code.length; i++) {
                        result += String.fromCharCode(code[i].replace(/[&#;]/g, ""))
                    }
                    return result
                }
            }, format: function () {
                var param = [];
                for (var i = 0, l = arguments.length; i < l; i++) {
                    param.push(arguments[i])
                }
                return this.self.replace(/\{(\d+)\}/g, function (m, n) {
                    return param[n]
                })
            }, encodeHTML: function () {
                return this.self.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
            }, decodeHTML: function () {
                var b = this.self.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
                return b.replace(/&#([\d]+);/g, function (d, c) {
                    return String.fromCharCode(parseInt(c, 10))
                })
            }, escapeSymbol: function () {
                return String(this.self).replace(/\%/g, "%25").replace(/&/g, "%26").replace(/\+/g, "%2B").replace(/\ /g, "%20").replace(/\//g, "%2F").replace(/\#/g, "%23").replace(/\=/g, "%3D")
            }, toCamelCase: function () {
                var a = this.self;
                if (a.indexOf("-") < 0 && a.indexOf("_") < 0) {
                    return a
                }
                return a.replace(/[-_][^-_]/g, function (b) {
                    return b.charAt(1).toUpperCase()
                })
            }, eval: function () {
                return (new Function("return (" + this.self.replace(/\r/gm, "").replace(/\n/gm, "\\n") + ");"))()
            }, get: function (key) {
                var url = this.self || location.href;
                var v = "";
                var o = url.indexOf(key + "=");
                if (o != -1) {
                    o += key.length + 1;
                    e = url.indexOf("&", o);
                    if (e == -1) {
                        e = url.length
                    }
                    v = url.substring(o, e)
                }
                return v
            }, random: function (length, prefix) {
                return (prefix || "") + Math.random().toString(16).substring(2)
            }
        };
        return new inti(source)
    };
    R.Number = function (source) {
        var inti = function (source) {
            this.self = String(source || "");
            return this
        };
        inti.prototype = {
            comma: function (d) {
                var c = this.self;
                if (!d || d < 1) {
                    d = 3
                }
                c = String(c).split(".");
                c[0] = c[0].replace(new RegExp("(\\d)(?=(\\d{" + d + "})+$)", "ig"), "$1,");
                return c.join(".")
            }, isNumber: function (num) {
                return /^[0-9]{1,20}$/.exec(num)
            }, between: function (min, max) {
                return Math.round(min + (Math.random() * (max - min)))
            }
        };
        return new inti(source)
    };
    R.Datetime = function (date) {
        var inti = function (date) {
            this.self = (R.Validate.Number(date) ? new Date(parseInt(date) * 1000) : date) || new Date();
            return this
        };
        inti.prototype = {
            leapyear: function () {
                var year = this.self.getFullYear();
                return (0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0)))
            }, days: function () {
                return (new Date(this.self.getFullYear(), this.self.getMonth() + 1, 0)).getDate()
            }, time: function () {
                return Math.round(this.self.getTime() / 1000)
            }, format: function (format) {
                var str = format;
                var now = this.self;
                var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate(), h = now.getHours(),
                    i = now.getMinutes(), s = now.getSeconds();
                str = str.replace("yy", y);
                str = str.replace("y", y.toString().substr(y.toString().length - 2));
                str = str.replace("mm", ("0" + m).substr(m.toString().length - 1));
                str = str.replace("m", m);
                str = str.replace("dd", ("0" + d).substr(d.toString().length - 1));
                str = str.replace("d", d);
                str = str.replace("hh", ("0" + h).substr(h.toString().length - 1));
                str = str.replace("h", h);
                str = str.replace("ii", ("0" + i).substr(i.toString().length - 1));
                str = str.replace("i", i);
                str = str.replace("ss", ("0" + s).substr(s.toString().length - 1));
                str = str.replace("s", s);
                return str
            }, diff: function (expire, func) {
                if (typeof func != "function") {
                    var func = function () {
                    }
                }
                if (!expire) {
                    return false
                }
                var expire = Math.round(parseInt(expire) * 1000);
                window.setInterval(function () {
                    if (new Date().getTime() > expire) {
                        func(-1, {"d": 0, "h": 0, "m": 0, "s": 0})
                    } else {
                        var DifferenceHour = -1;
                        var DifferenceMinute = -1;
                        var DifferenceSecond = -1;
                        var daysms = 24 * 60 * 60 * 1000;
                        var hoursms = 60 * 60 * 1000;
                        var Secondms = 60 * 1000;
                        var microsecond = 1000;
                        var time = new Date();
                        var convertHour = DifferenceHour;
                        var convertMinute = DifferenceMinute;
                        var convertSecond = DifferenceSecond;
                        var Result = Diffms = expire - time.getTime();
                        DifferenceHour = Math.floor(Diffms / daysms);
                        Diffms -= DifferenceHour * daysms;
                        DifferenceMinute = Math.floor(Diffms / hoursms);
                        Diffms -= DifferenceMinute * hoursms;
                        DifferenceSecond = Math.floor(Diffms / Secondms);
                        Diffms -= DifferenceSecond * Secondms;
                        var dSecs = Math.floor(Diffms / microsecond);
                        if (convertHour != DifferenceHour) {
                            var a = DifferenceHour
                        }
                        if (convertMinute != DifferenceMinute) {
                            var b = DifferenceMinute
                        }
                        if (convertSecond != DifferenceSecond) {
                            var c = DifferenceSecond;
                            var d = dSecs
                        }
                        func(parseInt(Result / 1000), {"day": a, "hour": b, "minute": c, "second": d})
                    }
                }, 1000)
            }
        };
        return new inti(date)
    };
    R.Event = function (event) {
        var inti = function (event) {
            this.self = event || window.event;
            return this
        };
        inti.prototype = {
            stop: function (type) {
                if (!this.self) {
                    return
                }
                if (R.Browser.msie) {
                    type !== 2 && (window.event.cancelBubble = true);
                    type !== 1 && (window.event.returnValue = false)
                } else {
                    type !== 2 && this.self.stopPropagation();
                    type !== 1 && this.self.preventDefault()
                }
                return this
            }, element: function () {
                if (!this.self) {
                    return
                }
                if (R.Browser.msie) {
                    return window.event.srcElement
                } else {
                    return this.self.currentTarget
                }
            }, target: function () {
                if (!this.self) {
                    return
                }
                if (R.Browser.msie) {
                    return window.event.srcElement
                } else {
                    return this.self.target
                }
            }, mouse: function () {
                if (!this.self) {
                    return
                }
                if (R.Browser.msie) {
                    var x = this.self.x + document.body.scrollLeft;
                    var y = this.self.y + document.body.scrollTop
                } else {
                    var x = this.self.pageX;
                    var y = this.self.pageY
                }
                return {"x": x, "y": y}
            }, keyboard: function (code, func) {
                if (!this.self) {
                    return
                }
                if ((code > -1 && this.self.keyCode == code) || code == -1) {
                    func(this.self, this.self.keyCode)
                }
            }
        };
        return new inti(event)
    };
    R.Validate = {
        is: function (o) {
            return ({}).toString.call(o).slice(8, -1)
        }, Array: function (obj) {
            return Object.prototype.toString.apply(obj) === "[object Array]"
        }, Function: function (obj) {
            return Object.prototype.toString.apply(obj) === "[object Function]"
        }, Object: function (obj) {
            return Object.prototype.toString.apply(obj) === "[object Object]"
        }, Date: function (o) {
            if (typeof o == "string") {
                return o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})(\s{1})(\d{1,2})(\:)(\d{1,2})/) != null || o.match(/^(\d{4})(\-)(\d{1,2})(\-)(\d{1,2})/) != null
            } else {
                return Object.prototype.toString.apply(o) === "[object Date]"
            }
        }, Number: function (o) {
            return !isNaN(parseFloat(o)) && isFinite(o)
        }, String: function (o) {
            return typeof o === "string"
        }, Defined: function (o) {
            return typeof o != "undefined"
        }, Empty: function (o) {
            return typeof o == "undefined" || o == ""
        }, Boolean: function (o) {
            return typeof o === "boolean"
        }, Window: function (o) {
            return /\[object Window\]/.test(o)
        }, Document: function (o) {
            return /\[object HTMLDocument\]/.test(o)
        }, Element: function (o) {
            return o.tagName ? true : false
        }, Chinese: function (str, all) {
            if (all) {
                return (str.length * 2 == str.replace(/[^\x00-\xff]/g, "**").length)
            } else {
                return (str.length != str.replace(/[^\x00-\xff]/g, "**").length)
            }
        }, Safe: function (str) {
            var chkstr;
            var i;
            chkstr = "'*%@#^$`~!^&*()=+{}\\|{}[];:/?<>,.";
            for (i = 0; i < str.length; i++) {
                if (chkstr.indexOf(str.charAt(i)) != -1) {
                    return false
                }
            }
            return true
        }, Email: function (str) {
            return /^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/.test(str)
        }, URL: function (str) {
            return /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\:+!]*([^<>])*$/.test(str)
        }, IP: function (str) {
            return /^[0-9.]{1,20}$/.test(str)
        }, Password: function (str) {
            return /^(\w){6,20}$/.test(str)
        }, Color: function (str) {
            return /^#(\w){6}$/.test(str)
        }, ID: function (str) {
            if (str.length == 18) {
                return R.Validate.Number(str.substring(0, 17))
            } else {
                return false
            }
        }, Phone: function (str) {
            return /(?:^0{0,1}1\d{10}$)|(?:^[+](\d){1,3}1\d{10}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}$)|(?:^\d{7,8}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}[\-#]{1}\d{1,5}$)/.test(str)
        }, Mobile: function (str) {
            return /^[1][0-9]{10}$/.test(str)
        }
    };
    R.Form = function (form, editable, type) {
        var inti = function (form, editable, type) {
            this.self = form;
            editable && R("[contenteditable=true]", form).each(function () {
                var name = this.getAttribute("name");
                if (!form.elements[name]) {
                    R(this).after("textarea", {"name": name, "hidden": "true"})
                }
                form.elements[name].value = type == "html" ? this.innerHTML : this.innerText
            });
            return this
        };
        inti.prototype = {
            Reset: function () {
                this.self.submit()
            }, Submit: function () {
                this.self.submit()
            }, Serialize: function (encode, concat, oldval) {
                var encode = typeof encode == "function" ? encode : encodeURIComponent;
                var concat = typeof oldval != "undefined" ? oldval : concat;
                var data = {};
                var form = this.self;
                var len = form.elements.length;
                for (var i = 0; i < len; i++) {
                    var ele = form.elements[i];
                    var key = ele.name;
                    var val = ele.value;
                    if (!key) {
                        continue
                    }
                    switch (ele.type) {
                        case"select-one":
                            var opt = ele[ele.selectedIndex];
                            var val = encode(opt.attributes && opt.attributes.value && !(opt.attributes.value.specified) ? opt.text : opt.value);
                            data = this.Collect(data, key, val);
                            break;
                        case"select-multiple":
                            for (var x = 0; x < ele.length; x++) {
                                if (ele[x].selected) {
                                    data = this.Collect(data, key, encode(ele[x].value))
                                }
                            }
                            break;
                        case"radio":
                            if (ele.checked) {
                                data = this.Collect(data, key, encode(ele.value))
                            }
                            break;
                        case"checkbox":
                            if (ele.checked) {
                                data = this.Collect(data, key, encode(ele.value))
                            }
                            break;
                        default:
                            data = this.Collect(data, key, encode(val));
                            break
                    }
                }
                if (concat) {
                    var data = this.Combine("", concat, data)
                }
                return data
            }, Collect: function (data, key, val) {
                var arr = /(\[|\]|5B|5D)/g.test(key);
                if (arr) {
                    if (!data[key]) {
                        data[key] = []
                    }
                    data[key].push(val)
                } else {
                    data[key] = val
                }
                return data
            }, Combine: function (str, concat, data) {
                for (var key in data) {
                    var val = data[key];
                    if (typeof val == "object") {
                        var tmp = {};
                        for (var k in val) {
                            tmp[key] = val[k];
                            str = this.Combine(str, concat, tmp)
                        }
                    } else {
                        str += (str ? concat : "") + key + "=" + (val || "")
                    }
                }
                return str
            }, Validate: function (func) {
                var func = func || function (err) {
                    alert(err)
                };
                var form = this.self;
                var size = form.elements.length;
                for (var i = 0; i < size; i++) {
                    var ele = form.elements[i];
                    var name = ele.getAttribute("data-valid-name");
                    var desc = ele.getAttribute("placeholder");
                    if (!name) {
                        continue
                    }
                    if (ele.disabled === true) {
                        continue
                    }
                    if (this.Element(ele, func) === false) {
                        return false
                    }
                }
                return true
            }, Element: function (ele, func) {
                var title = ele.getAttribute("data-valid-name");
                var val = ele.value;
                var type = ele.type;
                var id = ele.id;
                var name = ele.name;
                var err = "";
                if (R.Array(["text", "textarea", "password", "hidden", "file"]).indexOf(type) > -1) {
                    var emp = R.Validate.Empty(R.String(val).trim());
                    var size = R.String(val).length();
                    var chknull = ele.getAttribute("data-valid-empty");
                    if (chknull == "yes" && emp) {
                        err = title + " 不能为空"
                    }
                    if (type == "password") {
                        var chkpwd = ele.getAttribute("data-valid-password");
                        if (chkpwd && R(chkpwd).size() && R(chkpwd).value() != val) {
                            err = title + " 输入有误"
                        }
                        ele.setAttribute("data-valid-empty", "yes")
                    }
                    var chkvalue = ele.getAttribute("data-valid-confirm");
                    if (chkvalue && R(chkvalue).value() != val) {
                        err = title + " 输入有误"
                    }
                    var chkexte = ele.getAttribute("data-valid-accept");
                    var chkexte = chkexte ? chkexte.replace(/[,|，]/ig, " ") : "";
                    if (chknull == "yes" && chkexte && R.Array(chkexte.split(" ")).indexOf(ele.value.replace(/.*\./, "").toLowerCase()) == -1) {
                        err = title + " 不支持此类型文件"
                    }
                    var minsize = ele.getAttribute("data-valid-minsize");
                    if (size < parseInt(minsize)) {
                        err = title + " 未到最小长度：" + minsize
                    }
                    var maxsize = ele.getAttribute("data-valid-maxsize");
                    if (size > parseInt(maxsize)) {
                        err = title + " 超出最大长度：" + maxsize
                    }
                    var chksafe = ele.getAttribute("data-valid-secure");
                    if ((chksafe == "yes" && !R.Validate.Safe(val)) || (chksafe == "no" && !emp && !R.Validate.Safe(val))) {
                        err = title + " 存在非法字符"
                    }
                    var chkemail = ele.getAttribute("data-valid-email");
                    if ((chkemail == "yes" && !R.Validate.Email(val)) || (chkemail == "no" && !emp && !R.Validate.Email(val))) {
                        err = title + " 应为电子邮件地址"
                    }
                    var chkip = ele.getAttribute("data-valid-ip");
                    if ((chkip == "yes" && !R.Validate.IP(val)) || (chkip == "no" && !emp && !R.Validate.IP(val))) {
                        err = title + " 应为IP地址"
                    }
                    var chkurl = ele.getAttribute("data-valid-url");
                    if ((chkurl == "yes" && !R.Validate.URL(val)) || (chkurl == "no" && !emp && !R.Validate.URL(val))) {
                        err = title + " 应为URL地址"
                    }
                    var chknum = ele.getAttribute("data-valid-number");
                    if ((chknum == "yes" && !R.Validate.Number(val)) || (chknum == "no" && !emp && !R.Validate.Number(val))) {
                        err = title + " 应为数字"
                    }
                    var chkid = ele.getAttribute("data-valid-idcard");
                    if ((chkid == "yes" && !R.Validate.ID(val)) || (chkid == "no" && !emp && !R.Validate.ID(val))) {
                        err = title + " 应为身份证号码"
                    }
                    var chkTel = ele.getAttribute("data-valid-phone");
                    if ((chkTel == "yes" && !R.Validate.Phone(val)) || (chkTel == "no" && !emp && !R.Validate.Phone(val))) {
                        err = title + " 应为电话号码"
                    }
                    var chkMobile = ele.getAttribute("data-valid-mobile");
                    if ((chkMobile == "yes" && !R.Validate.Mobile(val)) || (chkMobile == "no" && !emp && !R.Validate.Mobile(val))) {
                        err = title + " 应为手机号码"
                    }
                    var chkDate = ele.getAttribute("data-valid-datetime");
                    if ((chkDate == "yes" && !R.Validate.Date(val)) || (chkDate == "no" && !emp && !R.Validate.Date(val))) {
                        err = title + " 应为日期格式"
                    }
                    var chkRegex = ele.getAttribute("data-valid-regexp");
                    if (chkRegex && val) {
                        var re = new RegExp(chkRegex);
                        if (!re.test(val)) {
                            err = title + " 格式不匹配"
                        }
                    }
                } else {
                    switch (type) {
                        case"select-one":
                            var val = R(ele).value();
                            if (val == "" && ele.getAttribute("data-valid-empty") == "yes") {
                                err = " 请选择 " + title
                            }
                            break;
                        case"radio":
                            var val = R("input[name='" + name + "']").value();
                            if (val == "" && ele.getAttribute("data-valid-empty") == "yes") {
                                err = " 请选择 " + title
                            }
                            break;
                        case"checkbox":
                            var obj = R("input[name='" + name + "']");
                            var x = 0;
                            for (var i = 0; i < obj.size(); i++) {
                                if (obj.item(i).checked) {
                                    x++
                                }
                            }
                            var chknull = ele.getAttribute("data-valid-empty");
                            if (chknull == "yes" && x == 0) {
                                err = title + " 不能为空"
                            }
                            var chkMax = ele.getAttribute("data-valid-maxsize");
                            var chkMin = ele.getAttribute("data-valid-minsize");
                            if (chkMax && chkMax < x) {
                                err = title + " 最多只能选 " + chkMax + " 项"
                            }
                            if (chkMin && chkMin > x) {
                                err = title + " 至少需要选 " + chkMin + " 项"
                            }
                            break
                    }
                }
                if (err) {
                    try {
                        type != "hidden" && ele.focus()
                    } catch (e) {
                    }
                    func(err, ele);
                    return false
                }
                return true
            }
        };
        return new inti(form, editable, type)
    };
    R.toast = function (style, html, time, config, func) {
        var config = config ? config : {};
        var time = config["time"] || 3;
        var unique = config["unique"] || R.String().random(10, "R");
        if (!html) {
            return
        }
        R("#" + unique).remove();
        R(document.body).append("div", {"id": unique, "className": style, "innerHTML": html});
        time && window.setTimeout(function () {
            R("#" + unique).hide();
            func && func(R("#" + unique).item(0))
        }, 1000 * time)
    };
    R.Ajax = function (file) {
        this.xmlhttp = null;
        this.resetData = function () {
            this.method = "GET";
            this.URLString = "";
            this.encodeURL = true;
            this.file = file;
            this.late = true;
            this.failed = false
        };
        this.resetFunctions = function () {
            this.onLoading = function () {
            };
            this.onLoaded = function () {
            };
            this.onInteractive = function () {
            };
            this.onCompletion = function () {
            };
            this.onError = function () {
            };
            this.encode = (encodeURIComponent && this.encodeURL) ? function (s) {
                return encodeURIComponent(s)
            } : function (s) {
                return s
            }
        };
        this.reset = function () {
            this.resetFunctions();
            this.resetData()
        };
        this.createAJAX = function () {
            try {
                this.xmlhttp = new ActiveXObject("Msxml2.XMLHTTP")
            } catch (e1) {
                try {
                    this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP")
                } catch (e2) {
                    this.xmlhttp = null
                }
            }
            if (!this.xmlhttp) {
                if (typeof XMLHttpRequest != "undefined") {
                    this.xmlhttp = new XMLHttpRequest()
                } else {
                    this.failed = true
                }
            }
        };
        this.setVar = function (name, value) {
            if (typeof name == "string" && typeof value == "undefined") {
                this.URLString = name;
                return
            }
            var arr1 = [], arr2 = [];
            if (typeof name == "object" && !value) {
                for (var i in name) {
                    arr1[arr1.length] = i;
                    arr2[arr2.length] = name[i]
                }
            } else {
                arr1[0] = name;
                arr2[0] = value
            }
            var first = (this.URLString.length == 0);
            for (var i = 0; i < arr1.length; i++) {
                this.URLString += (first) ? "" : "&";
                this.URLString += arr1[i] + "=" + this.encode(arr2[i])
            }
        };
        this.setHeader = function (key, value) {
            try {
                this.xmlhttp.setRequestHeader(key, value)
            } catch (e) {
            }
        };
        this.getURL = function () {
            return this.file + "?" + this.URLString
        };
        this.send = function (content) {
            if (!content) {
                content = ""
            }
            if (!this.xmlhttp || this.failed) {
                this.onError();
                return
            }
            var self = this;
            if (this.method == "GET" || this.method == "GET&POST") {
                this.xmlhttp.open(this.method, this.file + "?" + this.URLString, this.late)
            } else {
                if (this.method == "POST") {
                    this.xmlhttp.open(this.method, this.file, this.late);
                    try {
                        this.xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
                    } catch (e) {
                    }
                } else {
                    this.onError()
                }
            }
            this.xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            this.xmlhttp.onreadystatechange = function () {
                switch (self.xmlhttp.readyState) {
                    case 1:
                        self.onLoading();
                        break;
                    case 2:
                        self.onLoaded();
                        break;
                    case 3:
                        self.onInteractive();
                        break;
                    case 4:
                        self.response = self.xmlhttp.responseText;
                        self.responseXML = self.xmlhttp.responseXML;
                        try {
                            var status = self.xmlhttp.status
                        } catch (e) {
                            var status = "Trouble accessing it"
                        }
                        if (self.xmlhttp.readyState == 4 || status == "200") {
                            self.onCompletion()
                        } else {
                            self.onError()
                        }
                        self.URLString = "";
                        break
                }
            };
            if (this.method == "POST") {
                this.xmlhttp.send(this.URLString)
            } else {
                if (this.method == "GET") {
                    this.xmlhttp.send(null)
                } else {
                    if (this.method == "GET&POST") {
                        this.xmlhttp.send(content)
                    }
                }
            }
        };
        this.reset();
        this.createAJAX()
    };
    R.script = function (src, attr, func, target) {
        if (arguments.length == 1) {
            attr = {};
            func = function () {
            }
        }
        if (arguments.length == 2) {
            func = arguments[1] || function () {
            };
            attr = attr || {}
        }
        if (arguments.length == 3) {
            func = arguments[1] || function () {
            };
            target = arguments[2];
            attr = attr || {}
        }
        attr["type"] = "text/javascript";
        attr["src"] = src;
        var target = (target || document.getElementsByTagName("head")[0]);
        var script = R(target).append("script", attr).change();
        script.bind("load", function () {
            if ((!this.readyState || this.readyState == "loaded" || this.readyState == "complete") && !this.executed) {
                this.executed = true;
                func && func(this)
            }
        })
    };
    R.jsonp = function (src, attr, func) {
        if (typeof attr == "function") {
            func = attr;
            attr = {}
        }
        attr = attr || {};
        func = func || function () {
        };
        if (attr.autocall) {
            var c = attr.autocall
        } else {
            var c = "cross" + Math.random().toString(16).substring(2)
        }
        var head = document.getElementsByTagName("head")[0];
        if (attr.autocall != false && src.slice(-1) == "?") {
            src = src.substr(0, src.length - 1) + c
        }
        attr["type"] = "text/javascript";
        attr["src"] = src;
        var script = R(head).append("script", attr).change();
        window[c] = window[c] || function (data) {
            func && func(data);
            window[c] = undefined;
            try {
                delete window[c]
            } catch (e) {
            }
            script.remove()
        }
    };
    R.lazy = function (attr) {
        var attr = attr || "_src";
        var fn = function () {
            var view = R.getViewportSize();
            var imgs = document.querySelectorAll("img[" + attr + "]");
            var size = imgs.length;
            for (var i = 0; i < size; i++) {
                var item = imgs[i];
                var rect = R.getClinetRect(item);
                var visible = (rect.bottom >= 0 && rect.right >= 0 && rect.top <= view.height && rect.left <= view.width);
                if (visible) {
                    item.src = item.getAttribute(attr);
                    item.removeAttribute(attr)
                }
            }
            return size
        };
        fn(), R(window).bind("scroll", fn)
    };
    R.find = function (selector, context) {
        return (context || document).querySelectorAll(selector)
    };
    R.extend = function (func) {
        for (var i in func) {
            R.init.prototype[i] = func[i]
        }
    };
    R.create = function (node, attr) {
        if (typeof node == "string") {
            var node = document.createElement(node)
        }
        var attr = attr || {};
        for (var k in attr) {
            if (/[A-Z]/.test(k)) {
                node[k] = attr[k]
            } else {
                node.setAttribute(k, attr[k])
            }
        }
        return node
    };
    R.init = function (selector, context) {
        this.self = typeof selector == "string" ? R.find(selector, context) : [selector]
    };
    R.init.prototype = {
        last: null, size: function () {
            return this.self.length
        }, item: function (i, self) {
            var size = this.size();
            var ele = null;
            if (i >= 0) {
                ele = i <= size ? this.self[i] : null
            } else {
                ele = Math.abs(i) <= size ? this.self[(size + i)] : null
            }
            if (self) {
                this.self = [ele]
            }
            return self ? this : ele
        }, hide: function (func) {
            this.each(function () {
                this.style.display = "none";
                func && func.call(this)
            });
            return this
        }, show: function (func) {
            this.each(function () {
                this.style.display = "";
                func && func.call(this)
            });
            return this
        }, toggle: function (func) {
            this.each(function () {
                this.style.display = (this.offsetParent === null) ? "" : "none";
                func && func.call(this, this.style.display != "none")
            });
            return this
        }, exist: function (element) {
            var res = false;
            this.each(function () {
                res = this.contains(element)
            });
            return res
        }, value: function (text, add) {
            if (typeof text != "undefined") {
                this.each(function () {
                    var len = this.length;
                    switch (this.type) {
                        case"select-one":
                            for (var i = 0; i < len; i++) {
                                if (this[i].value == text) {
                                    this.selectedIndex = i;
                                    break
                                }
                            }
                            break;
                        case"select-multiple":
                            for (var i = 0; i < len; i++) {
                                if (R.Array(text).indexOf(this[i].value) !== -1) {
                                    this[i].selected = true
                                } else {
                                    this[i].selected = false
                                }
                            }
                            break;
                        case"radio":
                        case"checkbox":
                            if ((R.Validate.Array(text) && R.Array(text).indexOf(this.value) !== -1) || this.value == text) {
                                this.checked = true
                            } else {
                                this.checked = false
                            }
                            break;
                        case"text":
                        case"hidden":
                        case"textarea":
                        case"password":
                            if (add) {
                                this.value += text
                            } else {
                                this.value = text
                            }
                            break
                    }
                });
                return this
            }
            var val = [];
            this.each(function () {
                var len = this.length;
                switch (this.type) {
                    case"select-one":
                        val.push(this.selectedIndex > -1 ? this[this.selectedIndex].value : null);
                        break;
                    case"select-multiple":
                        for (var i = 0; i < len; i++) {
                            this[i].selected && val.push(this[i].value)
                        }
                        break;
                    case"radio":
                    case"checkbox":
                        this.checked && val.push(this.value);
                        break;
                    case"text":
                    case"hidden":
                    case"textarea":
                    case"password":
                        val.push(this.value);
                        break
                }
            });
            return this.size() == 1 ? val[0] : val
        }, text: function (text, replace) {
            if (typeof text != "undefined") {
                this.each(function () {
                    var len = this.length;
                    switch (this.type) {
                        case"select-one":
                            for (var i = 0; i < len; i++) {
                                if (this[i].text == text) {
                                    this.selectedIndex = i;
                                    if (typeof replace != "undefined") {
                                        this[i].text = replace
                                    }
                                    break
                                }
                            }
                            break;
                        case"select-multiple":
                            for (var i = 0; i < len; i++) {
                                if (R.Array(text).indexOf(this[i].text) !== -1) {
                                    this[i].selected = true;
                                    if (typeof replace != "undefined") {
                                        this[i].text = replace
                                    }
                                } else {
                                    this[i].selected = false
                                }
                            }
                            break
                    }
                });
                return this
            }
            var val = [];
            this.each(function () {
                var len = this.length;
                switch (this.type) {
                    case"select-one":
                        if (len) {
                            val = this[this.selectedIndex].text
                        }
                        break;
                    case"select-multiple":
                        for (var i = 0; i < len; i++) {
                            if (this[i].selected) {
                                val.push(this[i].text)
                            }
                        }
                        break
                }
            });
            return val
        }, html: function (html, add) {
            if (typeof html != "undefined") {
                this.each(function () {
                    if (add) {
                        this.innerHTML += html
                    } else {
                        this.innerHTML = html
                    }
                });
                return this
            }
            var ele = this.self[0];
            return ele.innerHTML
        }, attr: function (key, value) {
            if (typeof key == "string" && typeof value == "undefined") {
                if (this.size() == 0) {
                    return null
                }
                if (ele = this.self[0]) {
                    if (ele.hasAttribute(key)) {
                        return ele.getAttribute(key)
                    } else {
                        return ele[key]
                    }
                }
            }
            if (key || value) {
                if (typeof key == "string") {
                    var tmp = {};
                    tmp[key] = value;
                    key = tmp
                }
                this.each(function () {
                    for (var x in key) {
                        this.setAttribute(x, key[x])
                    }
                });
                return this
            }
        }, style: function (key, value) {
            if (typeof key == "string" && typeof value == "undefined") {
                if (this.size() == 0) {
                    return null
                }
                var ele = this.self[0];
                var fn = function () {
                    var f = document.defaultView;
                    return new Function("el", "style", ["style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));", "style=='float' && (style='", f ? "cssFloat" : "styleFloat", "');return el.style[style] || ", f ? "window.getComputedStyle(el, null)[style]" : "el.currentStyle[style]", " || null;"].join(""))
                }();
                return fn(ele, key)
            }
            if (key || value) {
                if (typeof key == "string") {
                    var tmp = {};
                    tmp[key] = value;
                    key = tmp
                }
                this.each(function () {
                    for (var x in key) {
                        this.style[x] = key[x]
                    }
                });
                return this
            }
        }, each: function (func) {
            var size = this.size();
            var ele = this.self;
            for (var i = 0; i < size; i++) {
                if (func.call(ele[i], i) === false) {
                    break
                }
            }
            return this
        }, filter: function (fn) {
            var ls = [];
            this.each(function (index) {
                if (fn.call(this, this, index)) {
                    ls.push(this)
                }
            });
            this.self = ls;
            return this
        }, bind: function (evt, fn) {
            this.each(function (index) {
                var self = this;
                var call = function (e) {
                    return fn.call(self, index, e)
                };
                !this.Listeners && (this.Listeners = []);
                this.Listeners.push({e: evt, fn: call});
                if (this.addEventListener) {
                    this.addEventListener(evt, call, false)
                } else {
                    if (this.attachEvent) {
                        this.attachEvent("on" + evt, call)
                    } else {
                        this["on" + evt] = call
                    }
                }
            });
            return this
        }, live: function (evt, selector, cb) {
            document.addEventListener(evt, function (event) {
                var qs = (typeof selector == "string") ? document.querySelectorAll(selector) : selector;
                if (qs) {
                    var el = event.target, index = -1;
                    while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) {
                        el = el.parentElement
                    }
                    if (index > -1) {
                        cb.call(el, index, event)
                    }
                }
            })
        }, unbind: function (evt) {
            this.each(function (index) {
                if (this.Listeners) {
                    for (var i = 0; i < this.Listeners.length; i++) {
                        if (this.removeEventListener) {
                            this.removeEventListener(this.Listeners[i].e, this.Listeners[i].fn, false)
                        } else {
                            if (this.detachEvent) {
                                this.detachEvent("on" + this.Listeners[i].e, this.Listeners[i].fn)
                            } else {
                                this["on" + evt] = null
                            }
                        }
                    }
                    delete this.Listeners
                }
            });
            return this
        }, event: function (e) {
            this.each(function () {
                try {
                    if (document.createEvent) {
                        var evt = document.createEvent("MouseEvents");
                        evt.initEvent(e, true, true);
                        this.dispatchEvent(evt)
                    } else {
                        if (document.createEventObject) {
                            var evt = document.createEventObject();
                            this.fireEvent("on" + e, evt)
                        } else {
                            this["on" + e]()
                        }
                    }
                } catch (e) {
                }
            });
            return this
        }, focus: function (func, e) {
            this.each(function (index) {
                this.focus();
                if (typeof func == "function") {
                    return func.call(this, index, e)
                }
            });
            return this
        }, blur: function (func, e) {
            this.each(function (index) {
                this.blur();
                if (typeof func == "function") {
                    return func.call(this, index, e)
                }
            });
            return this
        }, submit: function (func, e) {
            this.each(function (index) {
                if ((typeof func == "function" && func.call(this, index, e)) || typeof func == "undefined") {
                    this.submit()
                }
                return false
            });
            return this
        }, reset: function (func, e) {
            this.each(function (index) {
                if ((typeof func == "function" && func.call(this, index, e)) || typeof func == "undefined") {
                    this.reset()
                }
                return false
            });
            return this
        }, disabled: function () {
            this.each(function () {
                this.disabled = true
            });
            return this
        }, enabled: function () {
            this.each(function () {
                this.disabled = false
            });
            return this
        }, checked: function (checked) {
            this.each(function () {
                if (R.Validate.Boolean(checked)) {
                    this.checked = checked
                } else {
                    this.checked = (this.checked ? false : true)
                }
            });
            return this
        }, before: function (node, attr) {
            var refs = [];
            this.each(function () {
                refs.push(node = R.create(node, attr));
                this.parentNode.insertBefore(node, this)
            });
            this.last = refs;
            return this
        }, after: function (node, attr) {
            var refs = [];
            this.each(function () {
                refs.push(node = R.create(node, attr));
                this.parentNode.insertBefore(node, this.nextSibling)
            });
            this.last = refs;
            return this
        }, append: function (node, attr) {
            var refs = [];
            this.each(function () {
                refs.push(node = R.create(node, attr));
                this.appendChild(node)
            });
            this.last = refs;
            return this
        }, replace: function (node, attr) {
            var refs = [];
            this.each(function () {
                refs.push(node = R.create(node, attr));
                this.replaceNode(node)
            });
            this.last = refs;
            return this
        }, swap: function (node, attr) {
            var refs = [];
            this.each(function () {
                refs.push(node = R.create(node, attr));
                this.swapNode(node)
            });
            this.last = refs;
            return this
        }, change: function () {
            this.self = this.last;
            return this
        }, adjacent: function (position, object) {
            this.each(function () {
                if (typeof object == "string") {
                    this.insertAdjacentHTML(position, object)
                } else {
                    this.insertAdjacentElement(position, object)
                }
            });
            return this
        }, remove: function (attr) {
            this.each(function () {
                if (typeof attr == "string") {
                    this.removeAttribute(attr)
                } else {
                    this.parentNode.removeChild(this)
                }
            });
            return this
        }, parent: function (level) {
            var tmp = [];
            var lev = R.Validate.Number(level) ? parseInt(level) : 1;
            this.each(function () {
                var ele = this;
                for (var i = 0; i < lev; i++) {
                    ele = ele.parentNode
                }
                tmp.push(ele)
            });
            this.self = tmp;
            return this
        }, prev: function (node, self) {
            if (this.size() == 0) {
                return null
            }
            var ele = this.self[0];
            var obj = null;
            var obj = node ? ele.previousElementSibling : ele.previousSibling;
            if (self) {
                this.self = [obj];
                return this
            } else {
                return obj
            }
        }, next: function (node, self) {
            if (this.size() == 0) {
                return null
            }
            var ele = this.self[0];
            var obj = node ? ele.nextElementSibling : ele.nextSibling;
            if (self) {
                this.self = [obj];
                return this
            } else {
                return obj
            }
        }, position: function () {
            if (this.size() == 0) {
                return null
            }
            var ele = this.self[0];
            var width = ele.offsetWidth;
            var height = ele.offsetHeight;
            var top = ele.offsetTop;
            var left = ele.offsetLeft;
            while (ele = ele.offsetParent) {
                top += ele.offsetTop;
                left += ele.offsetLeft
            }
            return {"width": width, "height": height, "top": top, "left": left}
        }
    };
    win.R = R
})(window, document, undefined);