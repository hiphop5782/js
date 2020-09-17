(function(window){
	if(!window) throw "Window not defined";
	
	window.Hacademy = window.Hacademy || {};
	if(window.Hacademy.Messenger) return false;
	
	function generateRandomUserId(){
		var id = "tester" + Math.floor(Math.random() * 10000) + 1;
		return id; 
	}
	
	window.Hacademy.Messenger = function(el, options, record){
		this.el = typeof el === 'string' ? document.querySelector(el) : el;
		var defaultOptions = {
				uri:null,
				autoConnect:true,
				sender:generateRandomUserId(),
				subscribes:[
					"/topic/in", "/topic/public", "/topic/out"
				],
				height:"500px",
				debug:true,
				entry:"/app",
		};
		if(options && options.sender === '') delete options.sender;
		this.options = Object.assign({}, defaultOptions, options);
		this.record = !record ? [] : JSON.parse(record);
		this.initializeUI();
		
		this.socket = null;
		this.client = null;
		if(this.options.autoConnect){
			this.connect();
		}		
	};
	var Messenger = window.Hacademy.Messenger;
	Messenger.prototype.initializeUI = function(){
		this.el.classList.add("hacademy-messenger-wrap");
		this.el.style.height = this.options.height;
	};
	Messenger.prototype.addAlert = function(text){
		var div = document.createElement("div");
		div.classList.add("alert");
		div.textContent = text;
		this.el.appendChild(div);
		this.scrollToBottom();
	};
	Messenger.prototype.addMessage = function(message){
		var wrapper = document.createElement("div");
		var profileWrapper = document.createElement("div");
		var contentWrapper = document.createElement("div");
		var profile = document.createElement("div");
		var title = document.createElement("div");
		var content = document.createElement("pre");
		var time = document.createElement("div");
		var img = document.createElement("img");
		
		wrapper.classList.add("message");
        wrapper.setAttribute("id", "m"+this.record.length);
		if(message.mine || message.sender === this.options.sender)
			wrapper.classList.add("my-message");
		profileWrapper.classList.add("message-profile");
		contentWrapper.classList.add("message-content");
		profile.classList.add("profile-image");
		title.classList.add("content-sender");
		content.classList.add("content-text");
		time.classList.add("content-time");
		
		wrapper.appendChild(profileWrapper);
		wrapper.appendChild(contentWrapper);
		profileWrapper.appendChild(profile);
		profile.appendChild(img);
		contentWrapper.appendChild(title);
		contentWrapper.appendChild(content);
		contentWrapper.appendChild(time);
		
		title.textContent = message.sender;
		content.textContent = message.content;
		time.textContent = message.time;
		img.src = message.profile;
		
		//시간 처리
		if(this.record.length){
			var idx = this.record.length - 1;
			var prevMessage = this.record[idx];
            if(prevMessage.sender === message.sender 
                    && prevMessage.mine == message.mine
					&& prevMessage.time === message.time){
				var messageElement = document.querySelector("#m"+(idx));
				messageElement.querySelector(".content-time").textContent = "";
				
				profile.removeChild(img);
				profile.style.height = "auto";
                contentWrapper.removeChild(title);
                profileWrapper.textContent = "";
			}
		}
		this.record.push(message);
		
		this.el.appendChild(wrapper);
		
		this.scrollToBottom();
	};
	Messenger.prototype.scrollToBottom = function(){
		this.el.scrollTo(0, this.el.scrollHeight);
	};
	Messenger.prototype.connect = function(){
        if(!this.options.uri){
            throw "연결 주소가 설정되지 않았습니다";
        }
		this.socket = new SockJS(this.options.uri);
		this.client = Stomp.over(this.socket);
		if(!this.options.debug){
			this.client.debug = ()=>{};
		}
		
		this.client.connect({}, (frame)=>{
			//connection alert
			this.addAlert("서버에 접속하였습니다");
			
			//subscribe channel
			this.client.subscribe("/topic/public", (response)=>{
				this.addMessage(JSON.parse(response.body));
			})
			this.client.subscribe("/topic/in", (response)=>{
				var id = JSON.parse(response.body).sender;
				var text = id+" 님이 들어왔습니다.";
				messenger.addAlert(text);
			});
			this.client.subscribe("/topic/out", (response)=>{
				var id = JSON.parse(response.body).sender;
				var text = id+" 님이 나갔습니다.";
				messenger.addAlert(text);
			});
		});
	};
	Messenger.prototype.disconnect = function(){
		this.socket.close();
		this.socket = null;
	};
	Messenger.prototype.send = function(text){
		if(!text) return;
		
		this.client.send(this.options.entry+"/send", {}, JSON.stringify({
			sender:this.options.sender,
			content:text
		}));
	};
	Messenger.prototype.getSender = function(){
		return this.options.sender;
	};
})(window);