/*
    Hakademy.util.clock 모듈
    - 시계, 타이머, 초시계 기능을 제공
*/
(function(w){
w.Hakademy = w.Hakademy || {};
w.Hakademy.util = w.Hakademy.util || {};
w.Hakademy.util.clock = function(selector, options){
    //대상 설정
    this.el = document.querySelector(selector);
    if(!this.el){
        throw "대상이 없습니다";
    }

    //옵션 설정
    var defaultOption = {
        backgroundColor:"rgba(0,0,0,0.5)",
        textColor:"white",
        increment:true,
        fontFamily:null,
        fontSize:50,
        border:null,

        type:"timer",
        hour:0,
        minute:0,
        second:0,
        ms:0,

        hourVisible:true,
        msVisible:false,
        isBorderRounded:true,

        callback:null,

        startButton:null,
        stopButton:null,
        resetButton:null,
    };    
    
    this.options = Object.assign({}, defaultOption, options);

    //버튼 초기화
    if(this.options.startButton){
        var app = this;
        document.querySelectorAll(this.options.startButton).forEach(function(el){
            el.addEventListener("click", function(e){
                e.preventDefault();
                app.start();
            });
        });
        document.querySelectorAll(this.options.stopButton).forEach(function(el){
            el.addEventListener("click", function(e){
                e.preventDefault();
                app.stop();
            });
        });
        document.querySelectorAll(this.options.resetButton).forEach(function(el){
            el.addEventListener("click", function(e){
                e.preventDefault();
                app.reset();
            });
        });
    }

    this.handle = null;
    this.lastTime = 0;

    this.createInside();
    this.createDesign();
    this.initTime();

    if(this.options.type === "clock") this.start();
};

//디자인 생성
w.Hakademy.util.clock.prototype.createDesign = function(){
    var padding = 10;
    this.el.style.position = "relative";
    this.el.style.padding = padding + "px";
    this.el.style.display = "flex";
    this.el.style.flexWrap = "no-wrap";
    this.el.style.boxSizing = "border-box";
    this.el.style.backgroundColor = this.options.backgroundColor;
    this.el.style.color = this.options.textColor;
    this.el.style.fontSize = this.options.fontSize + "px";
    this.el.style.textAlign = "center";
    this.el.style.overflow = "hidden";

    if(this.options.border){
        this.el.style.border = this.options.border;
    }

    if(this.options.isBorderRounded){
        this.el.style.borderRadius = this.el.offsetHeight / 5 + "px";
    }

    if(this.options.fontFamily){
        this.el.style.fontFamily = this.options.fontFamily;
    }

};

//내부 구조 생성
w.Hakademy.util.clock.prototype.createInside = function(){
    if(this.options.type === "clock" || this.options.hourVisible){
        this.hour = new Unit(0, 2);
        this.el.appendChild(this.hour.el);
        this.el.appendChild(new Splitter().el);
    }

    this.minute = new Unit(0, 2);
    this.el.appendChild(this.minute.el);
    this.second = new Unit(0, 2);
    this.el.appendChild(new Splitter().el);
    this.el.appendChild(this.second.el);

    if(this.options.msVisible){
        this.el.appendChild(new Splitter(".").el);
        this.millis = new Unit(0, 2);
        this.el.appendChild(this.millis.el)
    }
};

//값 초기화
w.Hakademy.util.clock.prototype.clearValue = function(){
    this.hour.clear();
    this.minute.clear();
    this.second.clear();
};

w.Hakademy.util.clock.prototype.display = function(h, m, s, ms){
    if(this.options.type === "clock" || this.options.hourVisible){
        this.hour.set(h);
    }
    this.minute.set(m);
    this.second.set(s);
    if(this.options.msVisible){
        this.millis.set(ms);
    }
};

w.Hakademy.util.clock.prototype.start = function(){
    if(this.handle) return false;
    var app = this;
    var delay = this.options.msVisible? 10 : 1000;
    if(this.options.type === "clock"){
        var offset = new Date().getTimezoneOffset() * 60 * 1000;
        app.currentTime(offset);
        this.handle = setInterval(function(){
            app.currentTime(offset);
        }, delay);
    }
    else{
        this.lastTime = Date.now();
        
        this.handle = setInterval(function(){
            app.changeTime();
        }, delay);
    }
    return true;
};
w.Hakademy.util.clock.prototype.stop = function(){
    if(!this.handle || this.options.type === "clock") 
        return false;
    clearInterval(this.handle);
    this.handle = null;
    return true;
};
w.Hakademy.util.clock.prototype.reset = function(){
    if(this.handle) return false;
    this.initTime();
    return true;
};

w.Hakademy.util.clock.prototype.currentTime = function(offset){
    var now = Date.now();
    now -= offset;//offset은 -540(-9시간) 형태로 나타남
    var ms = parseInt(now % 1000 / 10);
    now = parseInt(now / 1000);
    var s = now % 60;
    now = parseInt(now / 60);
    var m = now % 60;
    now = parseInt(now / 60);
    var h = now % 24;
    this.display(h, m, s, ms);
};

w.Hakademy.util.clock.prototype.changeTime = function(){
    var delta = Date.now() - this.lastTime;
    switch(this.options.type){
        case "stopwatch": this.time += delta; break;
        case "timer" : this.time -= delta; break;
    }
    if(!this.options.msVisible){
        this.time = parseInt((this.time + 500) / 1000) * 1000;
    }
    if(this.time <= 0){
        this.setTime(0);
        if(this.options.callback){
            this.options.callback(this);
            this.stop();
        }
    }
    else{
        this.setTime(this.time);
        this.lastTime = Date.now();
    }
};
w.Hakademy.util.clock.prototype.clearTime = function(){
    this.setTime(0);
};
w.Hakademy.util.clock.prototype.setTime = function(time){
    this.time = time;
    var millis = parseInt(time % 1000 / 10);
    time = parseInt(time / 1000);
    var second = time % 60;
    time = parseInt(time / 60);
    var minute = time % 60;
    time = parseInt(time / 60);
    var hour = time;
    this.display(hour, minute, second, millis);
}
w.Hakademy.util.clock.prototype.initTime = function(){
    var time = this.options.hour * 3600000;
    time += this.options.minute * 60000;
    time += this.options.second * 1000;
    if(this.options.msVisible){
        time += this.options.ms;
    }

    this.setTime(time);
};
w.Hakademy.util.clock.prototype.set = function(name, value){
    if(!value && typeof name === "string"){
        return this.options[name];
    }
    else if(typeof name === "object"){
        this.options = Object.assign({}, this.options, name);
        this.createDesign();
    }
    else{
        this.options[name] = value;
        this.createDesign();
    }
}

//시,분,초 표시영역
function Unit(value, size){
    this.value = value;
    this.size = size;

    this.el = document.createElement("span");
    this.el.style.flexGrow = 1;
    this.el.style.verticalAlign = "middle";
    this.el.style.letterSpacing = "0.3rem";
    this.el.textContent = DecimalFormat(this.value, this.size);

    this.clear = function(){
        this.set(0);
    };

    this.set = function(v){
        this.value = v;
        this.el.textContent = DecimalFormat(this.value, this.size);
    };
}

//구분선
function Splitter(value){
    this.el = document.createElement("span");
    this.el.textContent = value || ":";
}

//숫자 포맷 변환기
function DecimalFormat(value, size){
    if(typeof value !== "number"){
        throw "Function decimalFormat : 숫자만 변환 가능합니다";
    }

    var str = "";
    var n = value;
    while(n > 0){
        str = n % 10 + str;
        n = parseInt(n / 10);
    }

    while(str.length < size){
        str = "0"+str;
    }

    return str;
};
})(window);