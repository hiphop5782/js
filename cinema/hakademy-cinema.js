(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.filterNodesByClassName = function(list, className){
        var rowList = [];
        for(var i=0; i < list.length; i++){
            try{ 
                if(list[i].classList.contains(className)){
                    rowList.push(list[i]);
                }
            }catch(e){}
        }
        return rowList;
    };
    w.Hakademy.Reservation = function(area){
        var children = area.children;
        var seat_area = Hakademy.util.filterNodesByClassName(children, "cinema-seat-area")[0];
        if(!seat_area){
            throw "cinema-seat-area가 존재하지 않습니다";
        }

        var rowsize = seat_area.getAttribute("data-rowsize");      
        if(!rowsize){
            throw "cinema-seat-area에 data-rowsize를 정의하십시오";
        }
        this.rowsize = function(){ return rowsize; };
        
        var colsize = seat_area.getAttribute("data-colsize");
        if(!colsize){
            throw "cinema-seat-area에 data-colsize를 정의하십시오";
        }
        this.colsize = function(){ return colsize; };

        var sendName = area.getAttribute("data-name");
        if(!sendName){
            console.warn("data-name이 설정되지 않아 seat으로 설정됩니다");
            sendName = "seat";
        }

        var width;
        try{
            width = parseInt(window.getComputedStyle(seat_area, null).width);
        }
        catch(e){
            width = parseInt(seat_area.currentStyle.height);
        }

        this.width = function(){
            return width;
        };

        var size = parseInt(width / colsize);
        this.size = function(){
            return size;
        };

        var seatList = seat_area.children;
        var cloneList = [];
        while(seatList.length > 0){
            var item = seatList[0];
            var cloneNode = item.cloneNode(true);
            cloneList.push(cloneNode);
            seat_area.removeChild(item);
        }

        var seat_unit = cloneList.shift();
        for(var r = 1; r <= rowsize ; r++){
            for(var c = 1; c <= colsize; c++){
                //배치할 좌석이 없으면 전부 빈칸으로 채움
                if(!cloneList.length){
                    appendEmptySeat(seat_area, size);
                    continue;
                }

                var rownum = parseInt(seat_unit.getAttribute("data-row"));
                var colnum = parseInt(seat_unit.getAttribute("data-column"));

                //규격을 벗어날 경우 skip
                if(rownum > rowsize || rownum < 1 || colnum > colsize || colnum < 1) 
                    continue;
                
                //줄칸이 맞지 않으면 빈칸으로 채움
                if(r != rownum || c != colnum){
                    appendEmptySeat(seat_area, size);
                }
                //나머지 좌석
                else{
                    if(seat_unit.classList.contains("disabled")){
                        appendDisabledSeat(seat_area, size);
                    }
                    else if(seat_unit.classList.contains("active")){
                        appendActiveSeat(seat_area, size);
                    }
                    else{
                        appendNormalSeat(seat_area, size);
                    }
                    seat_unit = cloneList.shift();
                }
            }
        }

        //좌석 클릭 이벤트 리스너
        function clickListener(){
            var checkbox = this.childNodes[0];
            checkbox.checked = !checkbox.checked;
            
            if(checkbox.checked){
                this.classList.add("active");
            }
            else{
                this.classList.remove("active");
            }
        }

        function appendDisabledSeat(area, size){
            var seat = createEmptySeat(size);
            seat.classList.add("disabled");
            area.appendChild(seat);
        }

        function appendNormalSeat(area, size){
            var seat = createEmptySeat(size);
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox"
            checkbox.name = sendName;
            checkbox.value = r+"-"+c;
            checkbox.style.display = "none";
            checkbox.checked = false;
            seat.appendChild(checkbox);
            seat.addEventListener("click", clickListener);
            area.appendChild(seat);
        }

        function appendActiveSeat(area, size){
            var seat = createEmptySeat(size);
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox"
            checkbox.name = sendName;
            checkbox.value = r+"-"+c;
            checkbox.style.display = "none";
            checkbox.checked = true;
            seat.classList.add("active");
            seat.appendChild(checkbox);
            seat.addEventListener("click", clickListener);
            area.appendChild(seat);
        }

        function appendEmptySeat(area, size){
            var seat = createEmptySeat(size);
            seat.classList.add("empty");
            area.appendChild(seat);
        }

        //기본 좌석 생성
        function createEmptySeat(size){
            var seat = document.createElement("div");
            seat.classList.add("cinema-seat");
            seat.style.width = size+"px";
            seat.style.height = size+"px";
            return seat;
        }
    };
})(window);