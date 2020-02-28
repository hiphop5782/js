(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.meteor = function(el, options){
        this.el = document.querySelectorAll(el);
        if(!this.el.length)
            throw "Meteor : 적용 대상이 없습니다";

        var defaultOptions = {
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
            for(var i=0; i < this.options.starCount; i++){
                var top = parseInt(Math.random() * h - h * 20 / 100);
                var left = parseInt(Math.random() * w + w * 20 / 100);
                var delay = Math.random() * (this.options.starMaxDelay - this.options.starMinDelay + 1) + this.options.starMinDelay;
                var duration = Math.random() * (this.options.starMaxDuration - this.options.starMinDuration + 1) + this.options.starMinDuration;
                var star = document.createElement("div");
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