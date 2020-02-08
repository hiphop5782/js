(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.toast = function(options){
        var defaultOptions = {
            duration : 2,   //메시지 출력 시간
            position:"top",//출력 위치(top, left, right, bottom, mix-position)
            positionStyle:"nonblock",//출력스타일(block/nonblock)
            backgroundColor:"rgba(0,0,0,0.5)",//배경색
            fontColor:"white",//글자색
            fontSize:10,//글자크기
            fontFamily:null,//글꼴
            isBorderRounded:true,//둥근 테두리
            isFade:true,//페이드 인/아웃 적용여부
            gap:10,//메시지 사이의 공백 간격
        };

        this.option = Object.assign({}, defaultOptions, options);

        this.displayQueue = [];

        //메시지 생성
        this.push = function(message){
            var el = this.createMessageElement(message);
            this.addQueue(el);
        };

        //메시지 등록(block|non-block)
        this.addQueue = function(el){
            var app = w.Hakademy.util.toast.instance;
            if(app.option.positionStyle === "nonblock"){
                this.showMessageBox(el);
            }
            //fixed일 경우 blocking 방식 적용
            else{
                if(!app.displayQueue.length){
                    this.showMessageBox(el);
                }
                else{
                    setTimeout(function(){
                        app.addQueue(el);
                    }, 100);
                }
            }
        };

        this.showMessageBox = function(el){
            var app = w.Hakademy.util.toast.instance;
            app.displayQueue.push(el);

            //페이드인,페이드아웃 처리
            if(app.option.isFade){
                el.style.opacity = 0;
                w.document.body.appendChild(el);

                var fadeOut = function(opacity){
                    if(!opacity) opacity = 1;
                    el.style.opacity = opacity;
                    if(el.style.opacity > 0){
                        setTimeout(function(){
                            fadeOut(opacity - 0.05);
                        }, 16);
                    }
                    else{
                        w.document.body.removeChild(el);
                        app.displayQueue.shift();
                    }
                };
                var fadeIn = function(opacity){
                    if(!opacity) opacity = 0;
                    el.style.opacity = opacity;
                    if(el.style.opacity < 1){
                        setTimeout(function(){
                            fadeIn(opacity + 0.05);
                        }, 16);
                    }
                    else{
                        setTimeout(function(){
                            fadeOut(); 
                        }, app.option.duration * 1000);
                    }
                };
                
                fadeIn();
            }
            //일반 처리
            else{
                w.document.body.appendChild(el);
                setTimeout(function(){
                    w.document.body.removeChild(el);
                    app.displayQueue.shift();
                }, app.option.duration * 1000);
            }
        };

        this.set = function(key, value){
            if(typeof key === "object"){
                this.option = Object.assign({}, this.option, key);
                return;
            }

            if(!this.option[key])
                return;
            this.option[key] = value;
        }

    };

    w.Hakademy.util.toast.prototype.createMessageElement = function(message){
        var div = document.createElement("div");
        
        //text
        div.textContent = message;

        //style
        div.style.position = "fixed";
        div.style.padding = "0.8rem";
        div.style.fontSize = this.option.fontSize;
        if(this.option.fontFamily)
            div.style.fontFamily = this.option.fontFamily;
        
        div.style.backgroundColor = this.option.backgroundColor;
        div.style.color = this.option.fontColor;
        
        if(this.option.isBorderRounded){
            div.style.borderRadius = "1rem";
        }                

        setLocation(div, this.option)

        //위치 계산 함수
        function setLocation(el, option){
            if(!option.position || typeof option.position !== 'string')
                position = "bottom";

            //화면 크기 구하기

            var calculate = function(pos){
                var margin = w.Hakademy.util.toast.instance.option.gap;
                var queue = w.Hakademy.util.toast.instance.displayQueue;
                if(pos.indexOf("top") >= 0){
                    var top;
                    if(queue.length){
                        var lastTag = queue[queue.length - 1];
                        var lastTagHeight = lastTag.offsetHeight;
                        var lastTagRect = lastTag.getBoundingClientRect();
                        top = lastTagRect.top + lastTagHeight + margin;
                        if(top >= w.screen.availHeight - 45){
                            top = parseInt(w.screen.availHeight * 0.05);    
                        }
                    }
                    else{
                        top = parseInt(w.screen.availHeight * 0.05);
                    }

                    return top;
                }
                else if(pos.indexOf("bottom") >= 0){
                    var bottom;
                    if(queue.length){
                        var lastTag = queue[queue.length - 1];
                        var lastTagHeight = lastTag.offsetHeight;
                        bottom = parseInt(lastTag.style.bottom) + lastTagHeight + margin;
                        if(bottom >= w.screen.availHeight - 45){
                            bottom = parseInt(w.screen.availHeight * 0.05);    
                        }
                    }
                    else{
                        bottom = parseInt(w.screen.availHeight * 0.05);
                    }
                    return bottom;
                }
            };

            var pos = option.position.toLowerCase();
            if(pos === "bottom"){//하단
                el.style.left = "50%";
                el.style.transform = "translate(-50%, 0)";
                if(option.positionStyle === "nonblock"){
                    el.style.bottom = calculate(pos)+"px";
                }
                else{
                    el.style.bottom = "5%";
                }
            }
            else if(pos === "bottom-left" || pos === "left-bottom"){
                el.style.left = "5%";
                el.style.transform = "translate(0, 0)";
                if(option.positionStyle === "nonblock"){
                    el.style.bottom = calculate(pos)+"px";
                }
                else{
                    el.style.bottom = "5%"; 
                }   
            }
            else if(pos === "bottom-right" || pos === "right-bottom"){
                el.style.right = "5%";
                el.style.transform = "translate(0, 0)";
                if(option.positionStyle === "nonblock"){
                    el.style.bottom = calculate(pos)+"px";
                }
                else{
                    el.style.bottom = "5%";
                }   
            }
            else if(pos === "left"){//좌측 : 포지션스타일 구분 없음
                el.style.left = "5%";
                el.style.top = "50%";
                el.style.transform = "translate(0, -50%)";
            }
            else if(pos === "right"){//우측 : 포지션스타일 구분 없음
                el.style.right = "5%";
                el.style.top = "50%";
                el.style.transform = "translate(0, -50%)";
            }
            else if(pos === "top-right" || pos === "right-top"){
                el.style.right = "5%";
                if(option.positionStyle === "nonblock"){
                    el.style.top = calculate(pos)+"px";
                }
                else{
                    el.style.top = "5%";
                }
            }
            else if(pos === "top-left" || pos === "left-top"){
                el.style.left = "5%";
                if(option.positionStyle === "nonblock"){
                    el.style.top = calculate(pos)+"px";
                }
                else{
                    el.style.top = "5%";
                }
            }
            else {//상단
                el.style.left = "50%";
                el.style.transform  = "translate(-50%, 0)";
                if(option.positionStyle === "nonblock"){
                    el.style.top = calculate(pos)+"px";
                }
                else{//fixed
                    el.style.top = "5%";
                }
            }
            
        };

        return div;
    };

    //동적 생성
    w.Hakademy.util.toast.initialize = function(options){
        if(this.instance){
            throw "이미 메시지 도구가 생성되어 있습니다"
        }
        this.instance = new w.Hakademy.util.toast(options);  
        w.Hakademy.toast = this.instance;
    };

    //문서 로딩 시 생성
    w.Hakademy.util.toast.initializeOnLoad = function(options){
        w.addEventListener("load", function(){
            w.Hakademy.util.toast.initialize(options);
        });
    };
})(window);