(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.DynamicBorder = function(selector, options){
        var defaultOptions = {
            type:"spin-single",
            duration:8,
            borderColor:"black",
            borderThickness:1,
            when:"always",
        };
        this.el = document.querySelector(selector);
        this.options = Object.assign(defaultOptions, options);

        this.createStructure();
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructure = function(){
        this.el.classList.add("dynamic-border");
        this.el.classList.add(this.options.type);
        switch(this.options.type){
            case "spin-single": this.createStructureForSingleSpin();
            case "spin-dotted": this.createStructureForDottedSpin();
        }
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructureForSingleSpin = function(){
        this.el.style.padding = this.options.borderThickness + "px";

        var top = document.createElement("span");
        var left = document.createElement("span");
        var right = document.createElement("span");
        var bottom = document.createElement("span");

        top.classList.add("inner-top");
        right.classList.add("inner-right");
        bottom.classList.add("inner-bottom");
        left.classList.add("inner-left");

        var duration = this.options.duration / 4;

        top.style.backgroundImage = "linear-gradient(to right, transparent, "+this.options.borderColor+")";
        top.style.height = this.options.borderThickness + "px";
        
        right.style.backgroundImage = "linear-gradient(to bottom, transparent, "+this.options.borderColor+")";
        right.style.width = this.options.borderThickness + "px";
        
        bottom.style.backgroundImage = "linear-gradient(to left, transparent, "+this.options.borderColor+")";
        bottom.style.height = this.options.borderThickness + "px";
        
        left.style.backgroundImage = "linear-gradient(to top, transparent, "+this.options.borderColor+")";
        left.style.width = this.options.borderThickness + "px";

        //when에 따라 다르게 처리
        if(this.options.when === "always"){
            top.style.animation = this.options.type+"-top " + duration + "s linear infinite";
            right.style.animation = this.options.type+"-right " + duration + "s linear infinite";
            right.style.animationDelay = duration / 2 + "s";
            bottom.style.animation = this.options.type+"-bottom " + duration + "s linear infinite";
            left.style.animation = this.options.type+"-left " + duration + "s linear infinite";
            left.style.animationDelay = duration / 2 + "s";
        }
        else if(this.options.when === "hover"){
            var el = this.el;
            var options = this.options;
            this.el.addEventListener("mouseenter", function(){
                top.style.animation = options.type+"-top " + duration + "s linear infinite";
                right.style.animation = options.type+"-right " + duration + "s linear infinite";
                right.style.animationDelay = duration / 2 + "s";
                bottom.style.animation = options.type+"-bottom " + duration + "s linear infinite";
                left.style.animation = options.type+"-left " + duration + "s linear infinite";
                left.style.animationDelay = duration / 2 + "s";
            });
            this.el.addEventListener("mouseout", function(){
                top.style.animation = "";
                right.style.animation = "";
                right.style.animationDelay = "";
                bottom.style.animation = "";
                left.style.animation = "";
                left.style.animationDelay = "";
            });
        }
        
        this.el.appendChild(top);
        this.el.appendChild(left);
        this.el.appendChild(right);
        this.el.appendChild(bottom);
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructureForDottedSpin = function(){
        
    };
})(window);