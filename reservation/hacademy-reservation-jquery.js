(function($){
    //External source - https://gist.github.com/ahtcx/0cd94e62691f539160b32ecda18af3d6
    const merge = (target, source) => {
        // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
        for (let key of Object.keys(source)) {
            if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
        }

        // Join `target` and modified `source`
        Object.assign(target || {}, source)
        return target;
    }

    $.fn.reservationUnit = function(options){
        const settings = merge({
            size:"50px"
        }, options || {});

        const image = {
            empty:"./image/seat-empty.png",
            active:"./image/seat-active.png",
            disabled:"./image/seat-disabled.png"
        };

        return this.each(function(){
            var root = this;
            
            const inputEventListener = function(){
                if(!state.enable) return;

                if($(this).prop("checked")){
                    state.mode = "active";
                }
                else {
                    state.mode = "empty";
                }
            };

            
            $(this).css("display", "block");
            $(this).css("width", settings.size);
            $(this).css("height", settings.size);
            $(this).css("background-size", "100% 100%");
            
            const checkbox = $("<input>").attr("type", "checkbox").attr("name", "seat")//.hide();
            checkbox.on("input", inputEventListener);
            $(this).append(checkbox);
            
            const state = {
                get mode(){
                    return this._mode;
                },
                set mode(value){
                    this._mode = value;
                    $(root).css("background-image", "url("+image[this._mode]+")");
                    switch(this._mode){
                        case "empty":
                        case "active":
                            checkbox.prop("disabled", false);
                            break;
                        case "disabled":
                            checkbox.prop("disabled", true);
                            break;
                    }
                },
                get enable(){
                    switch(this._mode){
                        case "empty": return true;
                        case "active": return true;
                        case "disabled": return false;
                    }
                },
                set direction(value){
                    this._direction = value;
                    switch(this._direction) {
                        case "up":
                            $(root).css("transform", "rotate(0deg)"); break;
                        case "left":
                            $(root).css("transform", "rotate(270deg)"); break;
                        case "right":
                            $(root).css("transform", "rotate(90deg)"); break;
                        case "down":
                            $(root).css("transform", "rotate(180deg)"); break;
                    }
                }
            };

            state.mode = $(this).data("mode") || "empty";
            state.direction = $(this).data("direction") || "up";
            $(this).removeData("mode");
            $(this).removeData("direction");
        });
    };

    $.fn.reservationArea = function(options){
        const settings = merge({

        }, options || {});

        return this.each(function(){

        });
    };
    
})(jQuery);