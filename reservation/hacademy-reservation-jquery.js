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
            size:"50px",
            image:{
                empty:"./image/seat-empty.png",
                active:"./image/seat-active.png",
                disabled:"./image/seat-disabled.png",
                blank:"./image/seat-blank.png",
            },
        }, options || {});

        return this.each(function(){
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

            const fontSize = $(this).width() * 0.2 + "px";
            const span = $("<span>").css("font-size", fontSize);
            $(this).append(span);
            
            const state = {
                set root(tag){
                    this._root = tag;
                },
                get root(){
                    return this._root;
                },
                set checkbox(tag){
                    this._checkbox = tag;
                },
                get checkbox(){
                    return this._checkbox;
                },
                set span(tag){
                    this._span = tag;
                },
                get span(){
                    return this._span;
                },
                get mode(){
                    return this._mode;
                },
                set mode(value){
                    this._mode = value || "empty";
                    $(this.root).css("background-image", "url("+settings.image[this._mode]+")");
                    switch(this._mode){
                        case "empty":
                        case "active":
                            checkbox.prop("disabled", false);
                            break;
                        case "blank":
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
                set manage(value){
                    this._manage = value !== undefined;
                    console.log(value, this._manage);
                    if(this._manage){
                        this.root.oncontextmenu = contextListenerActive;
                    }
                    else {
                        this.root.oncontextmenu = contextListenerDisabled;
                    }
                },
                get manage(){
                    return this._manage;
                },
                set direction(value){
                    this._direction = value || "up";
                    switch(this._direction) {
                        case "up":
                            $(this.root).css("transform", "rotate(0deg)"); 
                            span.css("transform", "rotate(0deg)");
                            break;
                        case "left":
                            $(this.root).css("transform", "rotate(270deg)"); 
                            span.css("transform", "rotate(-270deg)");
                            break;
                        case "right":
                            $(this.root).css("transform", "rotate(90deg)"); 
                            span.css("transform", "rotate(-90deg)");
                            break;
                        case "down":
                            $(this.root).css("transform", "rotate(180deg)"); 
                            span.css("transform", "rotate(-180deg)");
                            break;
                    }
                },
                get direction(){
                    return this._direction;
                },
                rotate(){
                    const angle = ["up", "right", "down", "left"];
                    const nextIndex = (angle.indexOf(this._direction) + 1) % angle.length;
                    this.direction = angle[nextIndex];
                },
                set name(value){
                    this._seatName = value || "seat";
                    this.checkbox.attr("name", this._seatName);
                },
                set row(value){
                    if(!value) return;
                    this._row = value;
                    this.checkbox.val(this.parameter);
                    span.text(this.position);
                },
                get row(){
                    return this._row;
                },
                set column(value){
                    if(!value) return;
                    this._column = value;
                    checkbox.val(this.parameter);
                    span.text(this.position);
                },
                get column(){
                    return this._column;
                },
                get position(){
                    if(!this.row || !this.column) return '';
                    return this.row + "-" + this.column;
                },
                get parameter(){
                    if(this.manage){
                        return this.position + "-" + this.mode + "-" + this.direction;
                    }
                    else {
                        return this.position;
                    }
                },
            };

            state.root = this;
            state.checkbox = checkbox;
            state.span = span;
            state.mode = $(this).data("mode");
            state.direction = $(this).data("direction");
            state.editable = $(this).data("editable");
            state.name = $(this).data("name");
            state.manage = $(this).data("manage");
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
            unit : ".reservation-unit"
        }, options || {});

        return this.each(function(){
            const state = {
                set root(tag){
                    this._root = tag;
                },
                get root(){
                    return this._root;
                },
                set row(value){
                    this._row = value || 5;
                },
                get row(){
                    return this._row;
                },
                set column(value){
                    this._column = value || 5;
                },
                get column(){
                    return this._column;
                },
                set manage(value){
                    this._manage = value !== undefined;
                },
                get manage(){
                    return this._manage;
                },
                initialize(){
                    if(this.manage){
                        this.initializeAuto();
                    }
                    else {
                        this.initializeManual();
                    }
                },
                initializeAuto(){
                    const unitSize = $(this.root).width() / state.column;

                    for(let i=1; i <= state.row; i++){
                        for(let j=1; j <= state.column; j++){
                            var label = $("<label>").addClass("reservation-unit")
                                                    .attr("data-mode", "empty")
                                                    .attr("data-direction", "up")
                                                    .attr("data-manage", "")
                                                    .attr("data-row", i)
                                                    .attr("data-column", j)
                                                    .appendTo(this.root);
                            label.reservationUnit({
                                size : unitSize+"px",
                            });
                        }
                    }
                },
                initializeManual(){
                    const unitSize = $(this.root).width() / state.column;
                    $(this.root).find(settings.unit).each(function(index, element){
                        $(element).reservationUnit({
                            size : unitSize+"px",
                        });
                    });
                },
            };

            state.root = this;
            state.row = $(this).data("row")
            state.column = $(this).data("column")
            state.manage = $(this).data("manage");

            $(this).removeData("row");
            $(this).removeData("column");
            $(this).removeData("manage");

            $(this).css({
                "display":"flex",
                "flex-wrap":"wrap",
                "width":"100%",
                "box-sizing":"border-box",
            });
            
            state.initialize();
        });
    };
    
})(jQuery);