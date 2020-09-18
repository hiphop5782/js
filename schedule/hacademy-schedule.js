(function(window){
    if(!window) throw "Window not defined";

    var defaultOptions = {
        rowHeight:50,
        merge:"column",
        border:{
            rowHeader:false,
            columnHeader:false,
            task:true,
        },
        outline:null,
    };

    window.Hacademy = window.Hacademy || {};
    window.Hacademy.Scheduler = function(el, options){
        if(typeof el === "string"){
            el = document.querySelector(el);
        }

        if(!el) throw "Target area not defined";

        this.options = Object.assign({}, defaultOptions, options);

        var rowHeader = el.dataset.rowHeader;
        if(!rowHeader)
            throw "data-row-header를 찾을 수 없습니다";
        this.options.rowHeaders = rowHeader.split(",");
        
        var columnHeader = el.dataset.columnHeader;
        if(!columnHeader)
        throw "data-column-header를 찾을 수 없습니다";
        this.options.columnHeaders = columnHeader.split(",");


        this.ui = {
            el : el,
        };

        this.initializeData();
        this.initializeUI();
        window.addEventListener("resize", ()=>{
            this.resizeUI();
        });
    };

    var Scheduler = window.Hacademy.Scheduler;

    Scheduler.prototype.initializeData = function(){
        //task 추가
        var taskList = this.ui.el.querySelectorAll(".scheduler-task");

        if(!this.options.tasks){
            this.options.tasks = new Array(this.options.rowHeaders.length);
            for(var i=0; i < this.options.tasks.length; i++){
                this.options.tasks[i] = new Array(this.options.columnHeaders.length).fill(null);
            }
        }
        
        for(var i=0; i < taskList.length; i++){
            var row = taskList[i].dataset.row;
            var column = taskList[i].dataset.column;
            var color = taskList[i].dataset.color || "black";
            var backgroundColor = taskList[i].dataset.backgroundColor || "transparent";
            var text = taskList[i].textContent.trim();
            this.ui.el.removeChild(taskList[i]);

            if(!row || !column) continue;

            row = row.split(",");
            column = column.split(",");

            //this.createTaskElement(row, column, text);
            //데이터 먼저 배치(this.options.tasks - 2차원 배열)
            for(var r=0; r < row.length; r++){
                for(var c=0; c < column.length; c++){
                    var rowText = row[r].trim();
                    var columnText = column[c].trim();
                    var rowIdx = this.options.rowHeaders.indexOf(rowText);
                    var columnIdx = this.options.columnHeaders.indexOf(columnText);

                    this.options.tasks[rowIdx][columnIdx] = {
                        text:text,
                        color:color,
                        backgroundColor:backgroundColor,
                    };
                }
            }
        }
    };

    Scheduler.prototype.initializeUI = function(){
        var rowCount = this.options.rowHeaders.length;
        var columnCount = this.options.columnHeaders.length;
        //메인 영역 크기 계산
        //폭 : 100%
        //높이 : (rowHeader 개수 + 1) * rowHeight
        this.ui.el.classList.add("hacademy-scheduler");
        this.ui.el.style.height = (rowCount + 1) * this.options.rowHeight + "px";
        if(this.options.outline){
            this.ui.el.style.border = this.options.outline;
        }

        //row Header 추가
        this.ui.rowHeaders = [];

        var realWidth = parseInt(window.getComputedStyle(this.ui.el).width);
        var columnWidth = realWidth / (columnCount + 1);

        this.options.realWidth = realWidth;
        this.options.columnWidth = columnWidth;

        for(var i=0; i < rowCount; i++){
            var rowHeader = createElement("div", "scheduler-row-header");
            if(this.options.border.rowHeader){
                rowHeader.classList.add("border");
            }
            rowHeader.style.height = this.options.rowHeight + "px";
            rowHeader.style.top = (i + 1) * this.options.rowHeight + "px";
            rowHeader.style.left = 0;
            rowHeader.style.width = columnWidth + "px";
            var span = createElement("span");
            span.textContent = this.options.rowHeaders[i];
            rowHeader.appendChild(span);
            this.ui.el.appendChild(rowHeader);
            this.ui.rowHeaders.push(rowHeader);
        }

        //column header 추가
        this.ui.columnHeaders = [];
        for(var i=0; i < columnCount; i++){
            var columnHeader = createElement("div", "scheduler-column-header");
            if(this.options.border.columnHeader){
                columnHeader.classList.add("border");
            }
            columnHeader.style.width = columnWidth + "px";
            columnHeader.style.top = 0;
            columnHeader.style.left = (i + 1) * columnWidth + "px";
            columnHeader.style.height = this.options.rowHeight + "px";
            var span = createElement("span");
            span.textContent = this.options.columnHeaders[i].trim();
            columnHeader.appendChild(span);
            this.ui.el.appendChild(columnHeader);
            this.ui.columnHeaders.push(columnHeader);
        }

        this.createTaskElement();
        this.mergeTaskElement();
    };

    Scheduler.prototype.resizeUI = function(){
        var rowCount = this.options.rowHeaders.length;
        var columnCount = this.options.columnHeaders.length;

        var realWidth = parseInt(window.getComputedStyle(this.ui.el).width);
        var columnWidth = realWidth / (columnCount + 1);

        this.options.realWidth = realWidth;
        this.options.columnWidth = columnWidth;

        for(var i=0; i < rowCount; i++){
            var rowHeader = this.ui.rowHeaders[i];
            rowHeader.style.top = (i + 1) * this.options.rowHeight + "px";
            rowHeader.style.left = 0;
            rowHeader.style.width = columnWidth + "px";
        }

        for(var i=0; i < columnCount; i++){
            var columnHeader = this.ui.columnHeaders[i];
            columnHeader.style.width = columnWidth + "px";
            columnHeader.style.top = 0;
            columnHeader.style.left = (i + 1) * columnWidth + "px";
        }

        var taskArray = this.ui.taskElements;

        for(var i=0; i < taskArray.length; i++){
            for(var j=0; j < taskArray[i].length; j++){
                if(!taskArray[i][j]) continue;

                var taskElement = taskArray[i][j];
                if(this.options.merge == "column"){
                    taskElement.style.width = this.options.columnWidth + "px";
                    taskElement.style.height = parseInt(taskElement.getAttribute("data-merge") || 1) * this.options.rowHeight + "px";
                }
                else if(this.options.merge == "row"){
                    taskElement.style.width = parseInt(taskElement.getAttribute("data-merge") || 1) * this.options.columnWidth + "px";
                    taskElement.style.height = this.options.rowHeight + "px";
                }
                else{
                    taskElement.style.width = this.options.columnWidth + "px";
                    taskElement.style.height = this.options.rowHeight + "px";
                }
                taskElement.style.top = (i + 1) * this.options.rowHeight + "px";
                taskElement.style.left = (j + 1) * this.options.columnWidth + "px";
            }
        }
    };

    Scheduler.prototype.createTaskElement = function(){
        if(!this.ui.taskElements){
            this.ui.taskElements = new Array(this.options.rowHeaders.length);
            for(var i=0; i < this.options.tasks.length; i++){
                this.ui.taskElements[i] = new Array(this.options.columnHeaders.length).fill(null);
            }
        }

        var taskArray = this.options.tasks;
        
        for(var i=0; i < taskArray.length; i++){
            for(var j=0; j < taskArray[i].length; j++){
                if(!taskArray[i][j]) continue;

                var taskElement = createElement("div", "scheduler-task");
                if(this.options.border.task){
                    taskElement.classList.add("border");
                }
                taskElement.style.width = this.options.columnWidth + "px";
                taskElement.style.height = this.options.rowHeight + "px";
                taskElement.style.top = (i + 1) * this.options.rowHeight + "px";
                taskElement.style.left = (j + 1) * this.options.columnWidth + "px";
                taskElement.style.color = this.options.tasks[i][j].color;
                taskElement.style.backgroundColor = this.options.tasks[i][j].backgroundColor;

                var span = createElement("span");
                span.textContent = this.options.tasks[i][j].text;
                taskElement.appendChild(span);
                
                this.ui.el.appendChild(taskElement);
                this.ui.taskElements[i][j] = taskElement;
            }
        }
    };

    Scheduler.prototype.mergeTaskElement = function(){
        if(!this.options.merge || this.options.merge === "none") return;

        if(this.options.merge === "column"){
            var rowCount = this.options.rowHeaders.length;
            var columnCount = this.options.columnHeaders.length;
            for(var k=0; k<columnCount; k++){
                for(var i=rowCount-1; i>0; i--){
                    var up = this.options.tasks[i-1][k];
                    var down = this.options.tasks[i][k];
                    if(up && down && up.text && down.text && up.text == down.text){
                        var upTask = this.ui.taskElements[i-1][k];
                        var downTask = this.ui.taskElements[i][k];
                        var merge = parseInt(downTask.getAttribute("data-merge") || 1);
                        upTask.setAttribute("data-merge", merge + 1);
                        this.ui.el.removeChild(downTask);
                    }
                }
            }
        }
        else if(this.options.merge === "row"){
            var rowCount = this.options.rowHeaders.length;
            var columnCount = this.options.columnHeaders.length;

            for(var k=0; k<rowCount; k++){
                for(var i=columnCount-1; i>0; i--){
                    var left = this.options.tasks[k][i-1];
                    var right = this.options.tasks[k][i];
                    if(left && right && left.text && right.text && left.text == right.text){
                        var leftTask = this.ui.taskElements[k][i-1];
                        var rightTask = this.ui.taskElements[k][i];
                        var merge = parseInt(rightTask.getAttribute("data-merge") || 1);
                        leftTask.setAttribute("data-merge", merge + 1);
                        this.ui.el.removeChild(rightTask);
                    }
                }
            }
        }

        this.resizeUI();
    };

    function createElement(type, className) {
        var tag = document.createElement(type);
        if(className){
            tag.classList.add(className);
        }
        return tag;
    }
})(window);