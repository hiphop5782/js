(function(win){
    if(!win || win !== window)
        throw "window가 정의되지 않았습니다";

    win.Hakademy = win.Hakademy || {};
    win.Hakademy.PointManager = win.Hakademy.PointManager || PointManager;
    
    //기본 CSS 룰 추가
    win.document.styleSheets[0].addRule(".star-wrap", "display:inline-block; position:relative; overflow:hidden;");
    win.document.styleSheets[0].addRule(".star-wrap::after", "content:''; display:block; clear:both;");
    win.document.styleSheets[0].addRule(".star-unit", "float:left; background-repeat:no-repeat; background-position:right 0;");
    win.document.styleSheets[0].addRule(".star-unit.on", "background-position:left 0;");

    /**
        PointManager 기본설정
        - defaultOption : 기본옵션 객체
            - limit : 최대 별점
            - point : 설정할 별점
            - areaSize : 별점 영역 크기(unitSize보다 우선함)
            - unitSize : 별 한 개 크기(px)
            - sendName : 전송 이름(폼 전송용)
            - imageUrl : 별 이미지(좌:색칠된 이미지 / 우:비어있는 이미지)
            - readOnly : 읽기 전용 여부
        - managerList : 생성된 별점영역 객체
        - factory : 생성 메소드
    **/
    PointManager.defaultOption = {
        limit:5,
        areaSize:100,
        unitSize:15,
        sendName:"star",
        readOnly:false,
        point:0,
        imageUrl:'./star.png'
    };

    PointManager.seq = Array.from(Array(256).keys());
    PointManager.managerList = {};
    PointManager.factory = function(selector, options){
        var userOptions = options || {};
        var createOptions = Object.assign({}, PointManager.defaultOption, userOptions);

        var tags = document.querySelectorAll(selector);
        if(!tags || !tags.length)
            throw "적용 대상이 없습니다";

        tags.forEach(function(element){
            var manager = new PointManager(element, createOptions).initialize().create();
            PointManager.managerList[manager.getId()] = manager;
        });
    };     
    PointManager.initializeOnLoad = function(){
        //자동 초기화
        win.addEventListener('load', function(){
            var star = PointManager.factory('.star-wrap');
        });
    };

    /**
        PointManager : 별점 전체 영역 객체
    **/
    function PointManager(target, options){
        this.__target = target;
        this.__options = options;
    }

    PointManager.prototype.initialize = function(){
        var tag = this.__target;
        return this.setLimit(tag.getAttribute("data-limit"))
                .setPoint(tag.getAttribute("data-point"))
                .setSendname(tag.getAttribute("data-sendname"))
                .setReadOnly(tag.getAttribute("data-readonly") != null)
                .setAreaSize(tag.getAttribute("data-areasize"))
                .setUnitSize(tag.getAttribute("data-unitsize"))
                .setId(tag.getAttribute("data-id"))
                .setImageUrl(tag.getAttribute("data-image"));
    };
    PointManager.prototype.create = function(){
        for(var i=0; i < this.getLimit(); i++){
            var unit = this.createUnit();
            if(!this.isReadOnly())
                unit.addEventListener('click', this.clickHandler);
            if(i < this.getPoint())
                this.lightOff(unit);
            this.getTarget().appendChild(unit);
        }
        if(this.__sendName){
            var sendTag = document.createElement('input');
            sendTag.setAttribute('type', 'hidden');
            sendTag.setAttribute('name', this.getSendName());
            sendTag.setAttribute('value', this.getPoint());
            this.getTarget().appendChild(sendTag);
        }

        this.changePoint(this.getPoint());

        return this;
    };
    PointManager.prototype.createUnit = function(){
        var div = document.createElement('div');
        div.classList.add('star-unit');
        div.style.width = this.getUnitSize()+'px';
        div.style.height = this.getUnitSize()+'px';
        div.style.backgroundImage = "url('"+this.getImageUrl()+"')";
        div.style.backgroundSize = this.getImageWidth()+'px '+this.getImageHeight()+'px';
        return div;
    };
    PointManager.prototype.getOptions = function(){
        return this.__options;
    };
    PointManager.prototype.getOption = function(key){
        return this.__options[key] || null;
    }
    PointManager.prototype.setLimit = function(limit){
        this.__limit = parseInt(limit) || this.getOption('limit');
        return this;
    };
    PointManager.prototype.setAreaSize = function(areaSize){
        this.__areaSize = areaSize;
        return this;
    };
    PointManager.prototype.setUnitSize = function(unitSize){
        this.__unitSize = parseInt(unitSize) || this.getOption('unitSize');
        return this;
    };
    PointManager.prototype.setPoint = function(point){
        this.__point = parseInt(point) || this.getOption('point');
        return this;
    };
    PointManager.prototype.setSendname = function(sendName){
        this.__sendName = sendName || this.getOption('sendName');
        return this;
    };
    PointManager.prototype.setReadOnly = function(readOnly){
        this.__readOnly = readOnly || this.getOption('readOnly');    
        return this;
    }
    PointManager.prototype.setId = function(id){
        if(!id){
            id = PointManager.seq.shift();
            this.getTarget().setAttribute('data-id', id);
        }
        this.__id = id;
        return this;
    }
    PointManager.prototype.setImageUrl = function(imageUrl){
        this.__imageUrl = imageUrl || this.getOption('imageUrl');
        return this;
    }
    PointManager.prototype.getTarget = function(){
        return this.__target;
    };
    PointManager.prototype.getUnitList = function(){
        return this.getTarget().childNodes;
    };
    PointManager.prototype.getUnit = function(index){
        if(index < 0 || index > this.getUnitList().length)
            throw "범위 초과";
        return this.getUnitList()[index];
    };
    PointManager.prototype.getUnitCount = function(){
        var count = 0;
        for(var i=0; i < this.getUnitList().length; i++){
            if(this.getUnit(i).classList.contains('star-unit'))
                count++;
        }
        return count;
    };
    PointManager.prototype.getImageUrl = function(){
        return this.__imageUrl;
    };
    PointManager.prototype.getLimit = function(){ 
        return this.__limit; 
    }
    PointManager.prototype.getAreaSize = function(){
        return this.__areaSize;
    };
    PointManager.prototype.getUnitSize = function(){ 
        if(!this.getAreaSize())
            return this.__unitSize;
        return this.getAreaSize() / this.getLimit(); 
    }
    PointManager.prototype.getPoint = function(){ 
        return this.__point; 
    }
    PointManager.prototype.getSendName = function(){ 
        return this.__sendName; 
    }
    PointManager.prototype.isReadOnly = function(){ 
        return this.__readOnly; 
    }
    PointManager.prototype.getId = function(){ 
        return this.__id; 
    }
    PointManager.prototype.getImageWidth = function(){
        return this.getUnitSize() * 2;
    };
    PointManager.prototype.getImageHeight = function(){
        return this.getUnitSize();
    };

    PointManager.prototype.clickHandler = function(){
        var tag = this;
        var div = tag.parentElement;
        var id = div.getAttribute('data-id');
        var count = 0;

        var wrap = PointManager.managerList[id];

        for(var i=0; i < wrap.getUnitCount(); i++){
            count++;
            if(this === wrap.getUnit(i))
                break;
        }

        wrap.changePoint(count);
    };

    PointManager.prototype.changePoint = function(point){
        if(point > this.getUnitCount())
            point = this.getUnitCount();

        for(var i=0; i < this.getUnitCount(); i++){
            if(i < point){
                this.lightOn(this.getUnit(i));
            }
            else{
                this.lightOff(this.getUnit(i));
            }
        }

        this.getTarget().setAttribute('data-point', point);
        if(!this.isReadOnly()){
            this.getHiddenInput().value = point;
        }
    }

    PointManager.prototype.getHiddenInput = function(){
        return this.getUnitList()[this.getUnitCount()];
    };
    PointManager.prototype.lightOn = function(tag){
        tag.classList.add("on");
    }
    PointManager.prototype.lightOff = function(tag){
        tag.classList.remove("on");
    }
})(window);   