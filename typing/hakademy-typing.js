(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.typing = function(el, options){
        this.el = el;
        if(!this.el)
            throw "Hakademy.util.typo : 대상이 존재하지 않습니다";

        var defaultOptions = {
            text:[
                "타이핑 효과를 내는",
                "Typing Effect",
                "텍스트 여러개를 교체하여 사용할 수 있는",
                "www.sysout.co.kr에서 배포하는",
                "오픈소스로 개발된"
            ],
            appear:{
                startDelay:0,
                processDelay:0.1,
                finishDelay:2,
            },
            exit:{
                startDelay:1,
                processDelay:0.1,
                finishDelay:1,
            },
            cycle:"infinite",
            cursor:{
                display:true,
                flicker:true,
            },
            color:{
                apply:false,
                list:[
                    "#ff4757",
                    "#ff6348",
                    "#ffa502",
                    "#70a1ff",
                    "#1e90ff",
                    "#3742fa",
                    "#2f3542"
                ],
                index:0,
            }
        };

        this.setOption(defaultOptions, options);
        
        this.el.textContent = "";

        this.design();

        this.animateBlocking();
    };

    w.Hakademy.util.typing.prototype.setOption = function(defaultOptions, options){
        options = options || {};

        this.options = {};
        for(var i in defaultOptions){
            if(Array.isArray(defaultOptions[i])){//배열
                if(!options[i]){
                    this.options[i] = defaultOptions[i];
                }
                else{
                    this.options[i] = defaultOptions[i].concat(options[i]);
                }
            }
            else if(typeof defaultOptions[i] === "object"){//객체
                if(!options[i]){
                    this.options[i] = Object.assign({}, defaultOptions[i], {});
                }
                else{
                    this.options[i] = Object.assign({}, defaultOptions[i], options[i]);
                }
            }
            else{//기타
                this.options[i] = options[i] || defaultOptions[i];
            }
        }
        this.options.text = this.options.text || this.el.textContent.split(/\s*\n\s*/g);
    };

    w.Hakademy.util.typing.prototype.design = function(){
        this.el.classList.add("hakademy-typing-component");
        if(this.options.cursor.display){
            this.el.classList.add("hakademy-text-cursor");
        }
    };

    w.Hakademy.util.typing.prototype.animateBlocking = function(){
        var cycle = this.options.cycle;
        this.animateWordBlocking(0, cycle);
    };

    w.Hakademy.util.typing.prototype.animateWordBlocking = function(index, cycle){
        if(typeof cycle === "number" && cycle <= 0)
            return false;

        if(!index) 
            index = 0;
        
        var app = this;
        var isArray = Array.isArray(this.options.text);
        
        if(cycle === "infinite" && isArray)
            index %= this.options.text.length;

        var word = isArray ? this.options.text[index] : this.options.text;
        cycle = typeof cycle === "number" && isArray && index === this.options.text.length - 1 ? cycle - 1 : cycle;
        var loc = 0;             
        
        function ap(){
            if(app.options.cursor.flicker){
                app.el.classList.remove("flicker");
            }

            if(!loc && app.options.color.apply){
                app.el.style.color = app.options.color.list[app.options.color.index++];
                app.options.color.index %= app.options.color.list.length;
            }

            app.appearOnce(word[loc++]);
            if(loc < word.length){
                setTimeout(ap, parseInt(app.options.appear.processDelay * 1000))
            }
            else{
                if(app.options.cursor.flicker){
                    app.el.classList.add("flicker");
                }
                setTimeout(rp, parseInt(app.options.appear.finishDelay + app.options.exit.startDelay) * 1000);
            }
        };
        function rp(){
            if(app.options.cursor.flicker){
                app.el.classList.remove("flicker");
            }
            app.removeOnce();
            if(app.el.textContent){
                setTimeout(rp, parseInt(app.options.exit.processDelay * 1000));
            }
            else{
                if(app.options.cursor.flicker){
                    app.el.classList.add("flicker");
                }
                setTimeout(function(){
                    app.animateWordBlocking(index + 1, cycle);
                }, parseInt(delay * 1000));
            }
        };
        
        var delay = index ? this.options.appear.startDelay + this.options.exit.finishDelay : this.options.appear.startDelay;
        setTimeout(ap, parseInt(delay * 1000));
    };

    w.Hakademy.util.typing.prototype.appearOnce = function(v){
        this.el.textContent += v;
    };
    w.Hakademy.util.typing.prototype.removeOnce = function(){
        this.el.textContent = this.el.textContent.substring(0, this.el.textContent.length - 1);
    };
})(window);