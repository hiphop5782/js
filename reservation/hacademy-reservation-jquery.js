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
            let root = this;

            const inputEventListener = function(){
                if(!state.enable) return;

                if($(this).prop("checked")){
                    state.mode = "active";
                }
                else {
                    state.mode = "empty";
                }
            };
            const contextListenerDisabled = function(e){
                e.preventDefault();
            };
            const contextListenerActive = function(e){
                e.preventDefault();
                this.state.rotate();
            };
            
            $(this).css("display", "inline-flex");
            $(this).css("justify-content", "center");
            $(this).css("align-items", "center");
            $(this).css("width", settings.size);
            $(this).css("height", settings.size);
            $(this).css("background-size", "100% 100%");
            
            const checkbox = $("<input>").attr("type", "checkbox").hide();
            checkbox.on("input", inputEventListener);
            $(this).append(checkbox);

            const span = $("<span>").css("font-size", "75%");
            $(this).append(span);
            
            const state = {
                get mode(){
                    return this._mode;
                },
                set mode(value){
                    this._mode = value || "empty";
                    $(root).css("background-image", "url("+image[this._mode]+")");
                    switch(this._mode){
                        case "blank":
                            break;
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
                    this._direction = value || "up";
                    switch(this._direction) {
                        case "up":
                            $(root).css("transform", "rotate(0deg)"); 
                            span.css("transform", "rotate(0deg)");
                            break;
                        case "left":
                            $(root).css("transform", "rotate(270deg)"); 
                            span.css("transform", "rotate(-270deg)");
                            break;
                        case "right":
                            $(root).css("transform", "rotate(90deg)"); 
                            span.css("transform", "rotate(-90deg)");
                            break;
                        case "down":
                            $(root).css("transform", "rotate(180deg)"); 
                            span.css("transform", "rotate(-180deg)");
                            break;
                    }
                },
                rotate(){
                    const angle = ["up", "right", "down", "left"];
                    const nextIndex = (angle.indexOf(this._direction) + 1) % angle.length;
                    this.direction = angle[nextIndex];
                },
                set editable(value){
                    this._editable = value !== undefined;
                    //console.log(root, value, this._editable);
                    if(this._editable){
                        root.oncontextmenu = contextListenerActive;
                    }
                    else {
                        root.oncontextmenu = contextListenerDisabled;
                    }
                },
                set name(value){
                    this._seatName = value || "seat";
                    checkbox.attr("name", value);
                },
                set row(value){
                    if(!value) return;
                    this._row = value;

                    span.text(this.position);
                },
                set column(value){
                    if(!value) return;
                    this._column = value;

                    span.text(this.position);
                },
                get position(){
                    if(!this._row || !this._column) return '';
                    return this._row + "-" + this._column;
                },
            };

            state.mode = $(this).data("mode");
            state.direction = $(this).data("direction");
            state.editable = $(this).data("editable");
            state.name = $(this).data("name");
            state.row = $(this).data("row");
            state.column = $(this).data("column");

            $(this).removeData("mode");
            $(this).removeData("direction");
            $(this).removeData("editable");
            $(this).removeData("name");
            $(this).removeData("row");
            $(this).removeData("column");

            this.state = state;
        });
    };

    $.fn.reservationArea = function(options){
        const settings = merge({

        }, options || {});

        return this.each(function(){
            
        });
    };
    
})(jQuery);