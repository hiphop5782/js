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
            mode:"empty",
            size:"50px",
        }, options || {});

        const image = {
            empty:"./image/seat-empty.png",
            active:"./image/seat-active.png",
            disabled:"./image/seat-disable.png"
        };

        return this.each(function(){
            $(this).css("display", "block");
            $(this).css("width", settings.size);
            $(this).css("height", settings.size);
            $(this).css("background-image", "url("+image[settings.mode]+")");
            $(this).css("background-size", "100% 100%");

            this.checkbox = $("<input>").attr("type", "checkbox")
                                                        .attr("name", "seat")
                                                        //.css("display", "none")
                                                        ;
            this.checkbox.on("input", function(){
                
            });                                                        
            $(this).append(this.checkbox);
        });
    };

    $.fn.reservationArea = function(options){
        const settings = merge({

        }, options || {});

        return this.each(function(){

        });
    };
    
})(jQuery);