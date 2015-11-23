var LIKABLE = {
    Template: function (templateObj) {
        return {
            render: function (targetObj) {  //使用对象的值替换掉模板中的值
                var str = templateObj,
                    templateAttr = "";

                for (var attrName in targetObj) {
                    templateAttr = "{" + attrName + "}";
                    str = str.replace(templateAttr, targetObj[attrName]);
                }
                return str;
            }
        }
    },
    merge: function (targets, options) { //合并两个对象，返回新的对象
        var name, copy;
        for (name in options) {
            copy = options[name];
            if (copy !== undefined) {
                targets[name] = copy;
            }
        }
        return targets;
    }
};

var CountDownManager = function () {
    var counterArray = [],  //使用的倒计时数组
        defaultTemplate = '<span class="day">{days}</span>天<span class="hour">{hours24}</span>小时<span class="min">{mins}</span>分<span>{secs}</span>秒';    // 默认显示时间的模板
    var CountDown = function (params) {
        var defaults = {
            timeEnd: 0,         // 结束时间
            timeCurrent: 0,     // 当前时间
            timeLeft: 0,        // 剩余时间
            containerId: "",    // 计时器的容器,传入id值
            callback: null,     // 回调函数
            template: null      // 计时器显示的默认格式
        }; //默认值
        this.config = LIKABLE.merge(defaults, params); //给属性赋值
        this._leftTime = 0;         // 剩余的时间，秒为单位
        this._timeHandler = null;   // setInterval容器
        this._rate = 1000;          // 倒计时的频率
        this._container = null;
        this._template = null;
        this._init();   //开始执行
    };

    CountDown.prototype = {
        _init: function () { //初始化倒计时器
            if (!this._valider()) {
                return;
            }
            var n = this._divider();
            this._display(n);

            this._counter(); //开始倒计时
        },
        _valider: function () { //验证数据
            this._container = document.getElementById(this.config.containerId);
            if (!this._container) {
                return;
            }
            if (!this.config.timeLeft && !this.config.timeEnd) {
                return;
            }
            if (!this.config.timeCurrent) {
                var date = new Date();
                this.config.timeCurrent = date.getTime();
            }
            if (!this.config.template) {
                this._template = defaultTemplate;
            }
            this._leftTime = this.config.timeLeft || this.config.timeEnd - this.config.timeCurrent;
            this._leftTime = parseInt(this._leftTime / this._rate);
            if (this._leftTime <= 0) {
                this._leftTime = 0;
                var n = this._divider();
                this._display(n);
                this.onOver();
                return;
            }
            return true;
        },
        _counter: function () {
            var obj = this;
            this._timeHandler = setInterval(function () {
                obj._leftTime--;    // 剩余时间减1
                if (obj._leftTime < 0) {  // 当前时间小于0
                    obj.onOver();
                    return;              //此次即使结束
                }
                var timerDivider = obj._divider();
                obj._display(timerDivider);
            }, this._rate);
        },
        _divider: function () { //
            var hour, min, sec, day, hours24;
            hour = Math.floor(this._leftTime / 3600);       // 剩余小时时间（如：1天2小时=26小时）
            min = Math.floor(this._leftTime / 60 % 60);     // 剩余分，除年、月、天的余数分
            sec = this._leftTime % 60;                      // 剩余秒，同分，因肯定为整数所以不使用Math.floor方法
            day = Math.floor(hour % 24);                    // 剩余天
            hours24 = hour % 24;                            // 剩余小时的小数位（如：1天2小时，则为2小时）
            return {
                hours: hour,
                mins: min,
                secs: sec,
                days: day,
                hours24: hours24
            };
        },
        _display: function (timerDivider) { //将倒计时的内容展示出来
            var temp = LIKABLE.Template(this._template).render(timerDivider);
            this._container.innerHTML = temp;
        },
        onOver: function () {
            try {
                clearInterval(this._timeHandler);
            } catch (e) {

            }
            var callback = this.config.callback;   //看是否有回调函数
            if (callback && this._leftTime <= 0) {
                callback && callback.call(this, this._container);
            } else {
                this._leftTime = 0; //设置剩余时间为0
            }
        }
    };
    return {
        create: function (params) {
            var countDown = new CountDown(params);  //传入参数，初始化timeEnd/timeCurrent等参数
            counterArray.push(countDown);
            return countDown;
        }
    };
};

//使用方法，将各参数整理成数组，传入方法参数中即可。timeEnd:
var countDownManager = new CountDownManager();
countDownManager.create({ timeEnd: 414000, timeCurrent: 400000, style: "1", containerId: "countainer", callback: function () { document.writeln("完毕") } });
countDownManager.create({ timeEnd: 5520000, timeCurrent: 400000, style: "1", containerId: "countainer2" });
