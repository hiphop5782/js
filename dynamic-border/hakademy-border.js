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
            case "spin-single": this.createStructureForSingleSpin(); break;
            case "spread-single": this.createStructureForSingleSpread(); break;
        }
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructureInnerSpan = function(){
        try{
            this.el.style.paddingLeft = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("padding-left")) + this.options.borderThickness + "px";
            this.el.style.paddingRight = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("padding-right")) + this.options.borderThickness + "px";
            this.el.style.paddingTop = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("padding-top")) + this.options.borderThickness + "px";
            this.el.style.paddingBottom = parseInt(window.getComputedStyle(this.el, null).getPropertyValue("padding-bottom")) + this.options.borderThickness + "px";
        }
        catch(e){
            this.el.style.padding = this.options.borderThickness + "px";
        }

        this.top = document.createElement("span");
        this.left = document.createElement("span");
        this.right = document.createElement("span");
        this.bottom = document.createElement("span");

        this.top.classList.add("inner-top");
        this.right.classList.add("inner-right");
        this.bottom.classList.add("inner-bottom");
        this.left.classList.add("inner-left");

        this.top.style.height = this.options.borderThickness + "px";
        this.right.style.width = this.options.borderThickness + "px";
        this.bottom.style.height = this.options.borderThickness + "px";
        this.left.style.width = this.options.borderThickness + "px";

        this.el.appendChild(this.top);
        this.el.appendChild(this.left);
        this.el.appendChild(this.right);
        this.el.appendChild(this.bottom);
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructureForSingleSpin = function(){
        this.createStructureInnerSpan();

        var duration = this.options.duration / 4;

        this.top.style.backgroundImage = "linear-gradient(to right, transparent, "+this.options.borderColor+")";
        this.right.style.backgroundImage = "linear-gradient(to bottom, transparent, "+this.options.borderColor+")";
        this.bottom.style.backgroundImage = "linear-gradient(to left, transparent, "+this.options.borderColor+")";
        this.left.style.backgroundImage = "linear-gradient(to top, transparent, "+this.options.borderColor+")";

        //when에 따라 다르게 처리
        if(this.options.when === "always"){
            this.top.style.animation = this.options.type+"-top " + duration + "s linear infinite";
            this.right.style.animation = this.options.type+"-right " + duration + "s linear infinite";
            this.right.style.animationDelay = duration / 2 + "s";
            this.bottom.style.animation = this.options.type+"-bottom " + duration + "s linear infinite";
            this.left.style.animation = this.options.type+"-left " + duration + "s linear infinite";
            this.left.style.animationDelay = duration / 2 + "s";
        }
        else if(this.options.when === "hover"){
            var app = this;
            this.el.addEventListener("mouseenter", function(){
                app.top.style.animation = app.options.type+"-top " + duration + "s linear infinite";
                app.right.style.animation = app.options.type+"-right " + duration + "s linear infinite";
                app.right.style.animationDelay = duration / 2 + "s";
                app.bottom.style.animation = app.options.type+"-bottom " + duration + "s linear infinite";
                app.left.style.animation = app.options.type+"-left " + duration + "s linear infinite";
                app.left.style.animationDelay = duration / 2 + "s";
            });
            this.el.addEventListener("mouseout", function(){
                app.top.style.animation = "";
                app.right.style.animation = "";
                app.right.style.animationDelay = "";
                app.bottom.style.animation = "";
                app.left.style.animation = "";
                app.left.style.animationDelay = "";
            });
        }
        
    };
    w.Hakademy.util.DynamicBorder.prototype.createStructureForSingleSpread = function(){
        this.createStructureInnerSpan();

        var duration = this.options.duration / 2;

        if(this.options.borderColor === "rainbow"){
            this.top.style.backgroundImage = "linear-gradient(to right, red, yellow)";    
            this.right.style.backgroundImage = "linear-gradient(to bottom, yellow, blue)";
            this.bottom.style.backgroundImage = "linear-gradient(to left, blue, purple)";
            this.left.style.backgroundImage = "linear-gradient(to top, purple, red)";
        }
        else{
            this.top.style.backgroundColor = this.options.borderColor;
            this.right.style.backgroundColor = this.options.borderColor;
            this.bottom.style.backgroundColor = this.options.borderColor;
            this.left.style.backgroundColor = this.options.borderColor;
        }

        //when에 따라 다르게 처리
        if(this.options.when === "always"){
            this.top.style.animation = this.options.type+"-top " + duration + "s linear infinite";
            this.right.style.animation = this.options.type+"-right " + duration + "s linear infinite";
            this.bottom.style.animation = this.options.type+"-bottom " + duration + "s linear infinite";
            this.left.style.animation = this.options.type+"-left " + duration + "s linear infinite";
        }
        else if(this.options.when === "hover"){
            var app = this;
            this.el.addEventListener("mouseenter", function(){
                app.top.style.animation = app.options.type+"-top " + duration + "s linear infinite";
                app.right.style.animation = app.options.type+"-right " + duration + "s linear infinite";
                app.bottom.style.animation = app.options.type+"-bottom " + duration + "s linear infinite";
                app.left.style.animation = app.options.type+"-left " + duration + "s linear infinite";
            });
            this.el.addEventListener("mouseout", function(){
                app.top.style.animation = "";
                app.right.style.animation = "";
                app.right.style.animationDelay = "";
                app.bottom.style.animation = "";
                app.left.style.animation = "";
                app.left.style.animationDelay = "";
            });
        }
    };
})(window);