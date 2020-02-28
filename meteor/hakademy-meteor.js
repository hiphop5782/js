(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.meteor = function(el, options){
        this.el = document.querySelectorAll(el);
        if(!this.el.length)
            throw "Meteor : 적용 대상이 없습니다";

        var defaultOptions = {
            staticStarCount:50,
            staticStarStyle:"colorful",//null, colorful
            staticStarColorList:[
                "#f5d300",
                "#09fbd3",
                "#08f7fe",
                "#b4dafc",
            	"#cca4fd",
                "#ffff8f",
                "#aafec6",
            	"#78fdfa",
            	"#34fd50",
            	"#f4f231"
            ],
            starCount:30,//meteor count
            starMinDelay:0,
            starMaxDelay:5,
            starMinDuration:3,
            starMaxDuration:10,
            width:"100%",//area width
            height:"300px",//area height
            htmlMode:false,//text html mode
            starColorList:[
            	"#ff99cc",
            	"#f5d300",
            	"#09fbd3",
            	"#08f7fe",
            	"#b4dafc",
            	"#cca4fd",
            	"#c202d3",
            	"#ffff8f",
            	"#fff603",
            	"#aafec6",
            	"#78fdfa",
            	"#34fd50",
            	"#f4f231"
            ],
            textEffect:null,//null, neon
            backgroundStyle:"blue",//blue, dark, space, sunset
            textPosition:"top",//9 direction (top, left, bottom, right, mixed, center)
        };

        this.options = Object.assign({}, defaultOptions, options);

        this.refresh();
    };

    var classArray = [
        "stars", 
        "top-center", "center-top","top", "top-left", "left-top", "top-right", "right-top",
        "center", "left-center", "center-left", "right-center", "center-right", "left", "right",
        "bottom", "bottom-center", "center-bottom", "left-center", "center-left", "right-center", "center-right",
        "sunset", "space", "neon", "blue", "dark"        
    ];

    w.Hakademy.util.meteor.prototype.set = function(k, v){
        if(typeof k === "object"){
            this.options = Object.assign({}, this.options, k);
        }
        else if(typeof k === "string"){
            if(v === undefined)
                return v;

            this.options[k] = v;
        }

        this.refresh();
    };

    w.Hakademy.util.meteor.prototype.refresh = function(){
        for(var i=0; i < this.el.length; i++){
            this.el[i].innerHTML = "";
            for(var k=0; k < classArray.length; k++){
                this.el[i].classList.remove(classArray[k]);
            }
        }

        if(this.options.text)
            this.setText();

        this.createStar();
    };

    w.Hakademy.util.meteor.prototype.setText = function(){
        for(var k=0; k < this.el.length; k++){
            var span = document.createElement("span");
            
            if(this.options.htmlMode)
                span.innerHTML = this.options.text;
            else
                span.textContent = this.options.text;
            
            if(this.options.textEffect)
                span.classList.add(this.options.textEffect);

            span.classList.add(this.options.textPosition);

            this.el[k].appendChild(span);
        }
    };
    w.Hakademy.util.meteor.prototype.createStar = function(){
        //edge 대응 : forEach 제거
        for(var k=0; k < this.el.length; k++){
            if(!this.el[k].classList.contains("stars"))
                this.el[k].classList.add("stars");
            
            this.el[k].classList.add(this.options.backgroundStyle);
            
            this.el[k].style.width = this.options.width;
            this.el[k].style.height = this.options.height;

            var st = window.getComputedStyle(this.el[k]);
            var w = Math.max(this.el[k].offsetWidth, parseInt(st.width));
            var h = Math.max(this.el[k].offsetHeight, parseInt(st.height));

            //static star
            for(var i=0; i < this.options.staticStarCount; i++){
                var static_star = document.createElement("div");

                var left = Math.floor(Math.random() * w);
                var top = Math.floor(Math.random() * h);
                var delay = Math.floor(Math.random() * 5);
                var duration = Math.floor(Math.random() * 20) + 10;

                static_star.classList.add("static-star");
                static_star.style.top = top + "px";
                static_star.style.left = left + "px";
                static_star.style.animationDelay = delay+"s";
                static_star.style.animationDuration = duration+"s";

                if(this.options.staticStarStyle === "colorful"){
                    var index = Math.floor(Math.random() * this.options.staticStarColorList.length);
                    static_star.style.backgroundColor = this.options.staticStarColorList[index];
                }

                this.el[k].appendChild(static_star);
            }

            //dynamic star
            for(var i=0; i < this.options.starCount; i++){
                var star = document.createElement("div");

                var top = parseInt(Math.random() * h - h * 20 / 100);
                var left = parseInt(Math.random() * w + w * 20 / 100);
                var delay = Math.random() * (this.options.starMaxDelay - this.options.starMinDelay + 1) + this.options.starMinDelay;
                var duration = Math.random() * (this.options.starMaxDuration - this.options.starMinDuration + 1) + this.options.starMinDuration;

                star.classList.add("star");
                star.style.top = top+"px";
                star.style.left = left+"px";
                star.style.animationDelay = delay+"s";
                star.style.animationDuration = duration+"s";

                var index = Math.floor(Math.random() * this.options.starColorList.length);
                star.style.backgroundColor = this.options.starColorList[index];

                this.el[k].appendChild(star);
            }
        }
    };
})(window);  