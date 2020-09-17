(function(w){
    w.Hacademy = w.Hacademy || {};
    w.Hacademy.util = w.Hacademy.util || {};
    
    //좌석 선택 이벤트 핸들러
    function SeatLeftClickHandler(){
        var checkbox = this.querySelector("input[type=checkbox]");
        if(checkbox.checked){
            checkbox.checked = false;
            this.classList.remove("active");
        }
        else{
            checkbox.checked = true;
            this.classList.add("active");
        }
    }
    function SeatRightClickHandler(e){
        e.preventDefault();
        switch(e.target.dataset.direction){
            case 'up': e.target.dataset.direction = 'right'; break;
            case 'right': e.target.dataset.direction = 'down'; break;
            case 'down': e.target.dataset.direction = 'left'; break;
            case 'left': e.target.dataset.direction = 'up'; break;
        }
    }

    w.Hacademy.Reservation = function(area, callback){
        if(!area) 
            throw "영역이 정의되지 않았습니다";

        if(typeof area === 'string')
            area = document.querySelector(area);

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

        //좌석 배치 방법은 2가지
        //data-mode="auto" : 자동으로 빈좌석을 채움(기본값)
        //data-mode="manual" : 수동으로 좌석을 채움
        var mode = seatArea.dataset.mode || 'auto';

        //전송 이름(없으면 seat으로 설정)
        var sendName = area.dataset.name || 'seat';
        
        //배치방향(없으면 up으로 설정)
        var direction = area.dataset.direction || 'up';

        this.options = {
            area:area,
            seatArea:seatArea,
            rowsize:rowsize,
            colsize:colsize,
            seatAreaWidth:seatAreaWidth,
            unitSize:unitSize,
            mode:mode,
            sendName:sendName,
            direction:direction
        };

        if(mode === 'auto'){
            this.automaticFillProcess();
        }
        else{
            this.manualFillProcess();
        }

        var app = this;
        w.addEventListener("resize", function(){
            app.resize();
        });

        app.resize();
    };

    w.Hacademy.Reservation.prototype.automaticFillProcess = function(){
        for(var i=0; i < this.options.rowsize; i++){
            for(var j=0; j < this.options.colsize; j++){
                var value = i + "-" + j + "-" + this.options.direction;
                var seat = this.createUnit("normal");
                seat.dataset.direction = this.options.direction;
                seat.setValue(value);
                this.options.seatArea.appendChild(seat);
            }
        }
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
                    var value = i + "-" + j;
                    var state = findElement.dataset.state || "normal";
                    var seat = this.createUnit(state);
                    if(seat.setValue){
                        seat.setValue(value);
                    }
                    seatArea.appendChild(seat);
                }
                else {
                    var seat = this.createUnit("empty");
                    seatArea.appendChild(seat);
                }
            }
        }
    };
    w.Hacademy.Reservation.prototype.createUnit = function(v){
        if(v === 'empty'){
            var seat = this.createUnit();
            seat.classList.add("empty");
            return seat;
        }
        else if(v === 'active'){
            var seat = this.createUnit();
            var checkbox = this.createCheckbox(true);
            seat.appendChild(checkbox);
            seat.classList.add("active");
            seat.addEventListener("click", SeatLeftClickHandler);
            seat.addEventListener("contextmenu", SeatRightClickHandler);
            seat.setValue = function(value){
                var checkbox = this.querySelector("input[type=checkbox]");
                checkbox.value = value;
            };
            return seat;
        }
        else if(v === 'normal'){
            var seat = this.createUnit();
            var checkbox = this.createCheckbox();
            seat.appendChild(checkbox);
            seat.addEventListener("click", SeatLeftClickHandler);
            seat.addEventListener("contextmenu", SeatRightClickHandler);
            seat.setValue = function(value){
                var checkbox = this.querySelector("input[type=checkbox]");
                checkbox.value = value;
            };
            return seat;
        }
        else if(v === 'disabled'){
            var seat = this.createUnit();
            seat.classList.add("disabled");
            return seat;
        }
        else{
            var seat = document.createElement("div");
            seat.classList.add("cinema-seat");
            seat.style.width = this.options.unitSize+"px";
            seat.style.height = this.options.unitSize+"px";
            return seat;
        }
    };

    w.Hacademy.Reservation.prototype.createCheckbox = function(check){
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", this.options.sendName);
        checkbox.style.display = "none";
        checkbox.checked = !!check;
        return checkbox;
    };

    //크기 재조정
    w.Hacademy.Reservation.prototype.resize = function(){
        this.options.seatAreaWidth = calculateInnerWidth(this.options.seatArea);
        this.options.unitSize = parseInt(this.options.seatAreaWidth / this.options.colsize);
        
        var seatList = this.options.seatArea.querySelectorAll(".cinema-seat");
        for(var i=0; i < seatList.length; i++){
            seatList[i].style.width = this.options.unitSize + "px";
            seatList[i].style.height = this.options.unitSize + "px";
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