function Player(sourceID) {
    this.source = document.getElementById(sourceID);
    this.controlButtons = document.getElementsByClassName("custom-player__btn");
    this.playBtn = document.getElementById("player_play");
    this.stopBtn = document.getElementById("player_stop");
    this.player_title = document.getElementById("player_title");
    this.title_inner = document.getElementById("title_inner");
    this.player_progress = document.getElementById("player_progress");
    this.progress_buffer = document.getElementById("progress_buffer");
    this.progress_inner = document.getElementById("progress_inner");
    this.player_timeTotal = document.getElementById("player_timeTotal");
    this.player_timeNow = document.getElementById("player_timeNow");
    this.totalCalculated = false;
    this.snapToBufferLoaded = true;
    this.init();

    //TODO: add snapping option
    //TODO: add volume option
}

Player.prototype.update = function() {
    if (this.playBack !== false) {
        this.updateTime(this.player_timeTotal, this.source.duration);
        this.updateTime(this.player_timeNow, this.source.currentTime);
        this.updateProgress();
        setTimeout(this.update.bind(this), 1000);
    }
}

Player.prototype.setBuffering = function(parameter=true){
    this.buffering = parameter;
}

Player.prototype.updateProgress = function() {
    if (this.source.duration) {
        this.progress = Math.floor((this.source.currentTime / this.source.duration) * 100);
        this.progress_inner.style.width = this.progress + '%';
    } else {
        this.progress_inner.style.width = 0 + '%';
    }
    this.playBack = (this.progress == 100) ? false : this.playBack;
}

Player.prototype.init = function() {
    this.setBuffering(true);
    this.player_timeTotal.innerHTML = "00:00";
    this.progress = 0;
    this.playBack = false;
    this.initControls();
    if (this.buffering) {
        this.source.preload = "auto";
        this.updateBuffer();
    } else {
        this.source.preload = "none";
    }
    this.updateProgress();
}
Player.prototype.updateBuffer = function() {
    var bufferProgress = this.calculateBuffer();
    if (bufferProgress < 100 || bufferProgress == undefined) {
        setTimeout(this.updateBuffer.bind(this), 1000);
    }

    this.updateTime(this.player_timeTotal, this.source.duration);
    this.updateTime(this.player_timeNow, this.source.currentTime);
}

Player.prototype.calculateBuffer = function() {
    this.progress_buffer.style.width = 0 + '%';
    if (this.source.buffered.length != 0) {
        var buffer = this.source.buffered.end(this.source.buffered.length - 1) - this.source.buffered.start(0);
        var bufferProgress = Math.floor((buffer / this.source.duration) * 100);
        this.progress_buffer.style.width = bufferProgress + '%';
    }
    return bufferProgress;
}
Player.prototype.mouseMove = function(event) {
    var widthTotal = getComputedStyle(this.player_progress).width.slice(0, -2);
    var rect = event.target.getBoundingClientRect();
    var x = event.clientX - rect.left;
    this.selectedProgress = Math.floor((x / widthTotal) * 100);
    if (this.selectedProgress > this.calculateBuffer()) {
        this.selectedProgress = this.calculateBuffer();
    }
    this.source.currentTime = this.source.duration * (this.selectedProgress / 100);
    this.updateTime(this.player_timeNow, this.source.currentTime);
    this.updateProgress();
}

Player.prototype.clearActiveState = function() {
    for (var i = 0; i < this.controlButtons.length; i++) {
        if (this.controlButtons[i].classList !== undefined)
            this.controlButtons[i].classList.remove("custom-player__btn_active");
    }
}

Player.prototype.updateTime = function(output, time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.ceil(time - minutes * 60);
    var minutesOutput = (minutes < 10) ? (0 + minutes.toString()) : minutes.toString();
    var secondsOutput = (seconds < 10) ? (0 + seconds.toString()) : seconds.toString();
    output.innerHTML = minutesOutput + ":" + secondsOutput;
}

Player.prototype.initControls = function() {
    this.player_progress.addEventListener("click", this.mouseMove.bind(this));
    for (var i = 0; i < this.controlButtons.length; i++) {
        this.controlButtons[i].addEventListener("click", this.togglePlay.bind(this));
    }
}

Player.prototype.startPlay = function(btn) {
    this.source.play();
    btn.innerHTML = "pause"
    var beforePlay = this.playBack;
    this.playBack = !this.playBack;
    if (beforePlay == true) {
        this.playBack = false;
        this.source.pause();
        btn.innerHTML = "play"
        this.clearActiveState();
    }
}

Player.prototype.stopPlay = function(btn) {
    this.source.pause();
    this.playBack = false;
    this.source.currentTime = 0;
    this.updateTime(this.player_timeNow, this.source.currentTime);
    this.updateProgress();
}
Player.prototype.togglePlay = function(event) {
    this.clearActiveState();
    if (event.target.classList !== undefined)
        event.target.classList.add("custom-player__btn_active");

    switch (event.target) {
        case this.playBtn:
            this.startPlay(event.target);
            break;
        case this.stopBtn:
            this.stopPlay();
            break;
    }
    this.update();
}