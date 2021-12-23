(function(w){
    w.Hacademy = w.Hacademy || {};
    w.Hacademy.util = w.Hacademy.util || {};
    
    w.Hacademy.Reservation = function(area, callback){
        if(!area) 
            throw "영역이 정의되지 않았습니다";

        if(typeof area === 'string')
            area = document.querySelector(area);
    
        //영역 우클릭 방지
        area.addEventListener("contextmenu", function(e){
            e.preventDefault();
        });

        var seatArea = area.querySelector(".cinema-seat-area");
        if(!seatArea){
            throw "좌석 영역이 지정되지 않았습니다(class='cinema-seat-area')";
        }

        var rowsize = seatArea.dataset.rowsize;
        if(!rowsize){
            throw "줄의 크기를 올바르게 설정하십시오";
        }
        var colsize = seatArea.dataset.colsize;
        if(!colsize){
            throw "칸의 크기를 올바르게 설정하십시오";
        }

        //좌석 영역 폭 계산
        var seatAreaWidth = calculateInnerWidth(seatArea);

        //좌석 크기 계산(좌석은 무조건 정사각형)
        var unitSize = parseInt(seatAreaWidth / colsize);

        //좌석 관리 모드
        //data-mode="manager" : 관리자 모드(좌석 선택 후 좌석 삭제 및 공간 병합 가능)
        //data-mode="client" : 사용자 모드(좌석 선택만 가능) - 기본값
        var mode = seatArea.dataset.mode || "client";

        //좌석 배치 방법은 2가지
        //data-fill="auto" : 자동으로 빈좌석을 채움(기본값)
        //data-fill="manual" : 수동으로 좌석을 채움
        var fill = seatArea.dataset.fill || 'auto';

        //좌석 선택 방법은 2가지
        //data-choice="single" : 좌석을 하나만 선택할 수 있음
        //data-choice="multiple" : 좌석을 여러 개 선택할 수 있음(기본값)
        var choice = seatArea.dataset.choice || 'multiple';

        //전송 이름(없으면 seat으로 설정)
        var sendName = area.dataset.name || 'seat';
        
        //배치방향(없으면 up으로 설정)
        var direction = area.dataset.direction || 'up';

        //좌석 표시 여부(없으면 hidden)
        var seatNoVisible = seatArea.dataset.seatno || "hidden";
        
        this.options = {
            area:area,
            seatArea:seatArea,
            rowsize:rowsize,
            colsize:colsize,
            seatAreaWidth:seatAreaWidth,
            unitSize:unitSize,
            mode:mode,
            choice:choice,
            fill:fill,
            sendName:sendName,
            seatNoVisible:seatNoVisible
        };

        if(fill === 'auto'){
            this.automaticFillProcess();
        }
        else{
            this.manualFillProcess();
        }
        
        if(mode === "manager"){
            this.addManagerEventListener();
        }

        var app = this;

        w.addEventListener("resize", function(){
            app.resize();
        });

        app.resize();

        if(callback)
            callback();
    };

    w.Hacademy.Reservation.prototype.addManagerEventListener = function(){
        var app = this;
        var area = this.options.area;
        area.setAttribute("tabindex", "0");
        area.addEventListener("mouseenter", function(e){
            e.target.focus();
        });
        area.addEventListener("keydown", function(e){
            e.preventDefault();
            switch(e.key.toLowerCase()){
                case "f2": app.mergeSpace(); break;
                case "f3": app.setDisable(); break;
                case "delete": app.deleteSpace(); break;
            }
        });
        var seatArea = this.options.seatArea;
        var seatList = seatArea.querySelectorAll(".cinema-seat");
        var rotateMode = seatArea.dataset.rotate === undefined ? false : true;
        for(var i=0; rotateMode && i < seatList.length; i++){
            seatList[i].addEventListener("contextmenu", function(e){
                e.preventDefault();
                app.changeUnit(this, "direction");
            });
        }
    };

    w.Hacademy.Reservation.prototype.addChangeListener = function(listener){
        if(typeof listener !== "function") return;
        this.changeListener = listener;
    };

    w.Hacademy.Reservation.prototype.getQueryString = function(){
        var checkedList;
        if(this.options.mode === "manager")
            checkedList = this.options.seatArea.querySelectorAll(".cinema-seat:not(.empty),.cinema-space");
        else if(this.options.mode === "client")
            checkedList = this.options.seatArea.querySelectorAll(".cinema-seat.active");
        if(!checkedList || checkedList.length == 0){
            return;
        }

        var params = new URLSearchParams();
        for(var i=0; i<checkedList.length; i++){
            var unit = checkedList[i].querySelector("input[type=checkbox]");
            params.append(unit.name, unit.value);
        }
        return params.toString();
    };

    w.Hacademy.Reservation.prototype.setDisable = function(){
        var activeSeatList = this.options.seatArea.querySelectorAll(".cinema-seat.active");
        for(var i=0; i<activeSeatList.length; i++){
            this.changeUnit(activeSeatList[i], "disabled");
        }
    };

    w.Hacademy.Reservation.prototype.automaticFillProcess = function(){
        for(var i=1; i <= this.options.rowsize; i++){
            for(var j=1; j <= this.options.colsize; j++){
                var seat = this.createUnit("normal");
                seat.dataset.direction = "up";
                seat.dataset.row = i;
                seat.dataset.col = j;
                if(seat.setSeatNumber){
                    seat.setSeatNumber(i+"-"+j);
                }
                this.options.seatArea.appendChild(seat);
            }
        }

        this.refreshValue();
    };

    w.Hacademy.Reservation.prototype.manualFillProcess = function(){
        var rowsize = this.options.rowsize;
        var colsize = this.options.colsize;
        var seatArea = this.options.seatArea;
        var cloneSeatArea = seatArea.cloneNode(true);
        this.options.seatArea.innerHTML = "";
        for(var i=1; i <= rowsize; i++){
            for(var j=1; j <= colsize; j++){
                var findElement = cloneSeatArea.querySelector(".cinema-seat[data-row='"+i+"'][data-col='"+j+"']");
                if(findElement){
                    var state = findElement.dataset.state || "normal";
                    var seat = this.createUnit(state);
                    seat.dataset.row = i;
                    seat.dataset.col = j;
                    seat.dataset.direction = findElement.dataset.direction || "up";
                    seatArea.appendChild(seat);
                    if(seat.setSeatNumber){
                        seat.setSeatNumber(i+"-"+j);
                    }
                }
                else {
                    var seat = this.createUnit("empty");
                    seatArea.appendChild(seat);
                }
            }
        }
        this.refreshSpace();
    };

    w.Hacademy.Reservation.prototype.createUnit = function(v){
        var app = this;
        if(v === 'empty'){
            var seat = this.createUnit();
            seat.classList.add("empty");
            return seat;
        }
        else if(v === 'active'){
            var seat = this.createUnit();
            seat.classList.add("active");
            seat.addEventListener("click", function(e){
                var isActive = this.classList.contains("active");
                app.changeUnit(this, isActive?"normal":"active");
                this.querySelector("input[type=checkbox]").checked = !isActive;
            });
            return seat;
        }
        else if(v === 'normal'){
            var seat = this.createUnit();
            seat.addEventListener("click", function(e){
                var isActive = this.classList.contains("active");
                this.querySelector("input[type=checkbox]").checked = !isActive;
                app.changeUnit(this, isActive?"normal":"active");
            });
            return seat;
        }
        else if(v === 'disabled'){
            var seat = this.createUnit();
            seat.classList.add("disabled");
            return seat;
        }
        else if(v === "space"){
            var seat = document.createElement("div");
            seat.classList.add("cinema-space");
            seat.style.width = this.options.unitSize+"px";
            seat.style.height = this.options.unitSize+"px";
            return seat;
        }
        else{
            var seat = document.createElement("div");
            seat.appendChild(this.createHiddenInput());
            seat.classList.add("cinema-seat");
            seat.style.width = this.options.unitSize+"px";
            seat.style.height = this.options.unitSize+"px";
            if(this.options.seatNoVisible === "visible"){
                var span = document.createElement("span");
                seat.setSeatNumber = function(v){
                    span.textContent = v;
                }
                span.addEventListener("contextmenu", function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    seat.dispatchEvent(new Event("contextmenu"));
                });
                seat.appendChild(span);
            }
            return seat;
        }
    };

    w.Hacademy.Reservation.prototype.createHiddenInput = function(){
        var hidden = document.createElement("input");
        hidden.setAttribute("type", "checkbox");
        hidden.setAttribute("name", this.options.sendName);
        hidden.style.display="none";
        return hidden;
    };

    //영역 삭제 메소드
    w.Hacademy.Reservation.prototype.deleteSpace = function(){
        var checkspace = this.options.seatArea.querySelectorAll(".cinema-seat.active");
        for(var i = 0; i < checkspace.length; i++){
            this.changeUnit(checkspace[i], "empty");
        }
    };

    //영역 병합 메소드
    w.Hacademy.Reservation.prototype.mergeSpace = function(){
        var checkspace = this.options.seatArea.querySelectorAll(".cinema-seat.active");
        for(var i = 0; i < checkspace.length; i++){
            this.changeUnit(checkspace[i], "space");
        }

        //좌석 변환 후 space 재정비
        this.refreshSpace();
    };

    w.Hacademy.Reservation.prototype.refreshSpace = function(){
        var checkspace = this.options.seatArea.querySelectorAll(".cinema-space");

        for(var i = 0; i < checkspace.length; i++){
            this.calculateMergeSpace(checkspace[i]);    
        }
    };

    //상하좌우 확인하여 space 정리
    w.Hacademy.Reservation.prototype.calculateMergeSpace = function(unit){
        var row = parseInt(unit.dataset.row);
        var col = parseInt(unit.dataset.col);

        //top
        if(row > 0){
            var tag = this.options.seatArea.querySelector(".cinema-space[data-row='"+(row-1)+"'][data-col='"+(col)+"']");
            if(tag){
                unit.classList.add("top");
                if(!tag.classList.contains("bottom"))
                    tag.classList.add("bottom");
            }
        }

        //bottom
        if(row < this.options.rowsize){
            var tag = this.options.seatArea.querySelector(".cinema-space[data-row='"+(row+1)+"'][data-col='"+(col)+"']");
            if(tag){
                unit.classList.add("bottom");
                if(!tag.classList.contains("top"))
                    tag.classList.add("top");
            }
        }

        //left
        if(col > 0){
            var tag = this.options.seatArea.querySelector(".cinema-space[data-row='"+(row)+"'][data-col='"+(col-1)+"']");
            if(tag){
                unit.classList.add("left");
                if(!tag.classList.contains("right"))
                    tag.classList.add("right");
            }
        }

        //right
        if(col < this.options.colsize){
            var tag = this.options.seatArea.querySelector(".cinema-space[data-row='"+(row)+"'][data-col='"+(col+1)+"']");
            if(tag){
                unit.classList.add("right");
                if(!tag.classList.contains("left"))
                    tag.classList.add("left");
            }
        }
    }

    //의자와 영역을 교체하는 메소드
    w.Hacademy.Reservation.prototype.changeUnit = function(unit, mode){
        var app = this;

        if(mode === "space"){
            unit.classList.remove("active", "empty", "disabled", "cinema-seat", "cinema-space");
            unit.removeChild(unit.querySelector("span"));
            unit.classList.add("cinema-space");
            unit.removeAttribute("data-direction");
            unit.dataset.state = mode;
            var newUnit = unit.cloneNode(true);
            unit.parentNode.replaceChild(newUnit, unit);
        }
        else if(mode === "empty"){
            unit.classList.remove("active", "empty", "disabled", "cinema-seat", "cinema-space");
            unit.textContent = "";
            unit.classList.add("cinema-seat", "empty");
            unit.removeAttribute("data-direction");
            unit.dataset.state = mode;
            var newUnit = unit.cloneNode(true);
            unit.parentNode.replaceChild(newUnit, unit);
        }
        else if(mode === "disabled"){
            unit.classList.remove("active", "empty", "disabled", "cinema-seat", "cinema-space");
            //unit = unit.cloneNode(true);
            unit.classList.add("cinema-seat", "disabled");
            unit.dataset.state = mode;
            var newUnit = unit.cloneNode(true);
            newUnit.addEventListener("contextmenu", function(e){
                e.preventDefault();
                app.changeUnit(this, "direction");
            });
            unit.parentNode.replaceChild(newUnit, unit);
        }
        else if(mode === "active"){
            //single 모드이면 모든 선택을 초기화
            if(app.options.choice === "single"){
                var list = app.options.seatArea.querySelectorAll(".cinema-seat.active");
                for(var i=0; i < list.length; i++){
                    app.changeUnit(list[i], "normal");
                }
            }
            unit.classList.remove("active", "empty", "disabled", "cinema-seat", "cinema-space");
            unit.classList.add("cinema-seat", "active");
            unit.dataset.state = mode;
        }
        else if(mode === "normal"){
            unit.classList.remove("active", "empty", "disabled", "cinema-seat", "cinema-space");
            unit.classList.add("cinema-seat");
            unit.dataset.state = mode;
        }
        else if(mode === "direction"){
            switch(unit.dataset.direction){
                case 'up': unit.dataset.direction = 'right'; break;
                case 'right': unit.dataset.direction = 'down'; break;
                case 'down': unit.dataset.direction = 'left'; break;
                case 'left': unit.dataset.direction = 'up'; break;
            }
        }

        //값 변경에 따른 갱신
        app.refreshValue();

        if(app.changeListener){
            app.changeListener.call(app, unit);
        }
    }

    w.Hacademy.Reservation.prototype.refreshValue = function(){
        var list;
        if(this.options.mode === "manager") 
            list = this.options.seatArea.querySelectorAll(".cinema-seat, .cinema-space");
        else if(this.options.mode === "client"){
            list = this.options.seatArea.querySelectorAll(".cinema-seat");
        }

        if(!list) return;

        for(var i=0; i < list.length; i++){
            this.setValue(list[i]);
        }
    };
    w.Hacademy.Reservation.prototype.setValue = function(unit){
        if(unit.classList.contains("empty")) return;

        var seperator = "-";

        var value = "";
        value += unit.dataset.row;
        value += seperator;
        value += unit.dataset.col;
        if(this.options.mode === "manager"){
            value += seperator;
            value += unit.dataset.state || "normal";
            value += seperator;
            value += unit.dataset.direction || "up";
        }
        unit.querySelector("input").value = value;
    }

    //크기 재조정
    w.Hacademy.Reservation.prototype.resize = function(){
        this.options.seatAreaWidth = calculateInnerWidth(this.options.seatArea);
        this.options.unitSize = parseInt(this.options.seatAreaWidth / this.options.colsize);
        
        var seatList = this.options.seatArea.querySelectorAll(".cinema-seat");
        for(var i=0; i < seatList.length; i++){
            seatList[i].style.width = this.options.unitSize + "px";
            seatList[i].style.height = this.options.unitSize + "px";
        }            

        var spaceList = this.options.seatArea.querySelectorAll(".cinema-space");
        for(var i=0; i < spaceList.length; i++){
            spaceList[i].style.width = this.options.unitSize + "px";
            spaceList[i].style.height = this.options.unitSize + "px";
        }
    };

    function calculateInnerWidth(tag){
        var style = window.getComputedStyle(tag, null);
        var fix = 0;//17px만큼 오차가 발생하는 원인을 아직 파악하지 못함
        if(style.boxSizing === 'border-box'){
            return parseFloat(style.width) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth) - fix;
        }
        else{
            return parseFloat(style.width) - fix;
        }
    }
})(window);
