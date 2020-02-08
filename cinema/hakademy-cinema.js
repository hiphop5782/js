(function(w){
    w.Hakademy = w.Hakademy || {};
    w.Hakademy.util = w.Hakademy.util || {};
    w.Hakademy.util.filterNodesByClassName = function(list, className){
        var rowList = [];
        list.forEach(function(u){
            try{ 
                if(u.classList.contains(className)){
                    rowList.push(u);
                }
            }catch(e){}
        });
        return rowList;
    };
    w.Hakademy.Reservation = function(area){
        var rowsize = area.getAttribute("data-rowsize");
        if(!rowsize)
            throw "cinema-seat-area에 data-rowsize를 정의하십시오";
        this.rowsize = function(){
            return rowsize;
        };
    
        var colsize = area.getAttribute("data-colsize");
        if(!colsize)
            throw "cinema-seat-area에 data-colsize를 정의하십시오";
        this.colsize = function(){
            return colsize;
        };

        var sendName = area.getAttribute("data-name");
        if(!sendName){
            console.warn("data-name이 설정되지 않아 seat으로 설정됩니다");
            sendName = "seat";
        }

        var width = area.offsetWidth;
        this.width = function(){
            return width;
        };

        var size = parseInt(width / colsize);
        this.size = function(){
            return size;
        };

        var rowList = Hakademy.util.filterNodesByClassName(area.childNodes, "cinema-seat-row");

        var line = rowList.shift();
        for(var r=1; r <= rowsize; r++){
            //빈줄 추가
            if(!line || parseInt(line.getAttribute("data-row")) != r){
                var rowDiv = createEmptyRow();
                if(line)
                    area.insertBefore(rowDiv, line);
                else
                    area.appendChild(rowDiv);
                for(var q=1; q <= colsize; q++){
                    rowDiv.appendChild(createEmptySeat(size));
                }
                continue;
            }

            //칸 추가
            var colList = Hakademy.util.filterNodesByClassName(line.childNodes, "cinema-seat");
            
            var cell = colList.shift();
            for(var c=1; c < colsize; c++){
                if(!cell || parseInt(cell.getAttribute("data-column")) != c){
                    var seat = createEmptySeat(size);
                    if(cell)
                        line.insertBefore(seat, cell);
                    else
                        line.appendChild(seat);
                    continue;
                }

                cell.style.width = size+"px";
                cell.style.height = size+"px";

                if(!cell.classList.contains("disabled")){
                    var checkbox = document.createElement("input");
                    checkbox.type = "checkbox"
                    checkbox.name = sendName;
                    checkbox.value = r+"-"+c;
                    checkbox.style.display = "none";
                    checkbox.checked = cell.classList.contains("active");
                    cell.appendChild(checkbox);
                    cell.addEventListener("click", clickListener);
                }
                cell = colList.shift();
            }

            line = rowList.shift();
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

        //좌석 줄 생성
        function createEmptyRow(){
            var row = document.createElement("div");
            row.classList.add("cinema-seat-row");
            return row;
        }

        //빈 좌석 생성
        function createEmptySeat(size){
            var seat = document.createElement("div");
            seat.classList.add("cinema-seat");
            seat.classList.add("empty");
            seat.style.width = size+"px";
            seat.style.height = size+"px";
            return seat;
        }
    };
})(window);