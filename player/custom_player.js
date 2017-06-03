"use strict";

//TODO: need some code refactoring later.
//TODO: some code rewrite for coverImg & static path.

function Player(options) {
  // cSpell:ignoreRegExp /[а-я]/i
  //определяем настройки по умолчанию

  var mountOptions = {
    //required
    mountPoint: "cPlayMountPoint",
    //optional   
    main: "cPlay",
    cover: "cPlayCover",
    coverImg: "cover.jpg",
    content: "cPlayContent",
    title: "cPlayContent__title",
    titleInner: "cPlayTitleInner",
    titleText: "cPlay title",
    progressBox: "cPlayContentProgress",
    bar: "cPlayProgressBar",
    buffer: "cPlayProgressBar__buffer",
    progress: "cPlayProgressBar__inner",
    time: "cPlayContentProgress__time",
    timeNow: "cPlayContentProgress__time_now",
    timeTotal: "cPlayContentProgress__time_total",
    controls: "cPlayControls",
    controlBtn: "cPlayControls__btn",
    controlBtnActive: "cPlayControls__btn_active",
    controlBtnToggle: "cPlayControls__btn_toggle",
    playBtn: "cPlayControls__btn_play",
    pauseBtn: "cPlayControls__btn_pause",
    stopBtn: "cPlayControls__btn_stop",
    volume: 'cPlayVolume',
    volumePicker: 'cPlayVolume__picker',
    //utils
    buffering: true,
    snapToBuffer: true,
    source: false,
  }

  this.mountOptions = mountOptions;
  //если добавлены опции - проверяем их и перезаписываем опции по умолчанию
  if (options !== undefined) {
    this.resetOptions(options);
  }

  this.generateTemplate();
  this.init();
}

Player.prototype.generateTemplate = function() {
  var mountOptions = this.mountOptions;

  //undefined variables
  var
    cPlay, mount, mountPoint, content,
    cover, title, title_inner, bar, buffer,
    progress, timeNow, timeTotal, controls,
    playBtn, pauseBtn, stopBtn, volume,
    volumePicker;

  mount = document.getElementById(mountOptions.mountPoint);
  if (!mount) mount = document.getElementsByClassName(mountOptions.mountPoint)[0];
  if (mount) {
    mount.src = mountOptions.source;
    this.staticPath = getStaticPath(mount.src);

    cPlay = this.mountNode(mount, mountOptions.main);
    mountPoint = cPlay;
    cover = (mountOptions.cover) ? this.addCover(mountPoint) : undefined;

    content = this.mountNode(mountPoint, mountOptions.content);
    mountPoint = content;

    if (mountOptions.title) {
      title = this.mountNode(mountPoint, mountOptions.title);
      title_inner = title.appendChild(this.addElem([mountOptions.titleInner]))
      title_inner.innerHTML = mountOptions.titleText;
    }

    bar = this.mountNode(mountPoint, mountOptions.bar);
    buffer = bar.appendChild(this.addElem([mountOptions.buffer]));
    progress = bar.appendChild(this.addElem([mountOptions.progress]));

    timeNow = mountPoint.appendChild(this.addElem([mountOptions.time, mountOptions.timeNow]));
    timeTotal = mountPoint.appendChild(this.addElem([mountOptions.time, mountOptions.timeTotal]));
    timeNow.innerHTML = '00:00';
    timeTotal.innerHTML = '00:00';

    controls = this.mountNode(mountPoint, mountOptions.controls);
    playBtn = controls.appendChild(this.addElem([mountOptions.controlBtn, mountOptions.playBtn, mountOptions.controlBtnToggle]));
    pauseBtn = controls.appendChild(this.addElem([mountOptions.controlBtn, mountOptions.pauseBtn]));
    stopBtn = (mountOptions.stopBtn !== false) ?
      controls.appendChild(this.addElem([mountOptions.controlBtn, mountOptions.stopBtn])) : undefined;

    volume = (mountOptions.volume) ? this.mountNode(controls, mountOptions.volume) : undefined;
    volumePicker = (volume) ? volume.appendChild(this.addElem(mountOptions.volumePicker)) : undefined;
  } else {
    console.error('error: mountPoint not found');
    console.log('object: ', mount);
    console.log('"id" attribute is required!');
    console.log('"mountOptions.source" is required!');
  }

  this.src = mount.src;
  this.title = title;
  this.title_inner = title_inner;
  this.progress_bar = bar;
  this.progress_buffer = buffer;
  this.progress_current = progress;
  this.player_timeTotal = timeTotal;
  this.player_timeNow = timeNow;
  this.playBtn = playBtn;
  this.pauseBtn = pauseBtn;
  this.stopBtn = stopBtn;
  this.controlButtons = document.getElementsByClassName(mountOptions.controlBtn);
  this.volume_bar = volume;
  this.volume_pick = volumePicker;
  this.volume_pick.active = false;

  function getStaticPath(src) {
    var del = /([\w\.\ \-\_]+)\.\w+/;
    return src.replace(del, '');
  }
}

Player.prototype.init = function() {
  if (this.src) {
    this.source = new Audio();
    this.setUpVolume(0.5);
    this.source.src = this.src;
    this.setBuffering(true);
    this.player_timeTotal.innerHTML = "00:00";
    this.progress = 0;
    this.playBack = false;
    this.initTitleSlide(this.title);
    this.initControls();
    if (this.buffering) {
      this.source.preload = "auto";
      this.updateBuffer();
    } else {
      this.source.preload = "none";
    }
    this.updateProgress();
  }

}

Player.prototype.resetOptions = function(options) {
  var setOptions = this.mountOptions;
  for (var property in options) {
    if (this.mountOptions.hasOwnProperty(property)) {
      setOptions[property] = options[property];
    }
  }
  return setOptions;
}

Player.prototype.initTitleSlide = function(title) {
  (title.clientWidth < title.scrollWidth) ? init(true): init(false);

  function init(startSlide) {
    if (startSlide) {
      var scrollDirection = 1,
        scrollDelay = 3000,
        scrollSpeed = 30;
      slideTitle();

      function slideTitle() {
        var speed = (title.scrollLeft != 0) ? scrollSpeed : scrollDelay;
        scrollDirection =
          (title.scrollLeft == 0) ? 1 : (title.scrollLeft == title.scrollWidth - title.clientWidth) ? -1 : scrollDirection;
        title.scrollLeft += scrollDirection;
        setTimeout(slideTitle, speed);
      }
    }
  }
}

Player.prototype.update = function() {
  if (this.playBack !== false) {
    this.updateTime(this.player_timeTotal, this.source.duration);
    this.updateTime(this.player_timeNow, this.source.currentTime);
    this.updateProgress();
    setTimeout(this.update.bind(this), 1000);
  }
}

Player.prototype.setBuffering = function(parameter) {
  this.buffering = parameter;
}
Player.prototype.addCover = function(mountPoint) {
  var cover = mountPoint.appendChild(this.addElem(this.mountOptions.cover));
  var coverImg = document.createElement('img');
  cover.appendChild(coverImg);
  coverImg.src = this.staticPath + this.mountOptions.coverImg;
  return cover;
}

Player.prototype.mountNode = function(mountPoint, mountElem) {
  return mountPoint.appendChild(this.addElem(mountElem));
}
Player.prototype.addElem = function(classList) {
  var elem = document.createElement('div');
  this.addClassName(elem, classList);
  return elem;
}

Player.prototype.addClassName = function(elem, classList) {
  if (typeof classList === 'string') {
    (elem.classList) ?
    elem.classList.add(classList):
      elem.className += elem.className.length > 0 ? ' ' + classList : classList;
  }

  if (typeof classList === 'array' || typeof classList === 'object') {
    if (elem.classList) {
      for (var i = 0; i < classList.length; i++) {
        elem.classList.add(classList[i]);
      }
    } else {
      for (var i = 0; i < classList.length; i++) {
        elem.className += elem.className.length > 0 ? ' ' + classList[i] : classList[i];
      }
    }
  }
}
Player.prototype.removeClassName = function(elem, classList) {
  if (typeof classList === 'string') {
    (elem.classList) ?
    elem.classList.remove(classList):
      elem.className = elem.className.replace(regExp(classList[i]), '');
  }
  if (typeof classList === 'array' || typeof classList === 'object') {
    if (elem.classList) {
      for (var i = 0; i < classList.length; i++) {
        elem.classList.remove(classList[i]);
      }
    } else {
      for (var i = 0; i < classList.length; i++) {
        elem.className = elem.className.replace(regExp(classList[i]), '');
      }
    }
  }

  function regExp(name) {
    return new RegExp('(^| )' + name + '( |$)');
  }
}

Player.prototype.updateProgress = function() {
  if (this.source.duration) {
    this.progress = (this.source.currentTime / this.source.duration) * 100;
    this.progress_current.style.width = this.progress + '%';
  } else {
    this.progress_current.style.width = 0 + '%';
  }
  this.playBack = (this.progress == 100) ? false : this.playBack;
}

Player.prototype.setUpVolume = function(value) {
  this.source.volume = value;
  this.setVolumePickPositionX(this.calculateX(value, this.calculateWidth(this.volume_bar)));
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

Player.prototype.clearActiveState = function() {
  for (var i = 0; i < this.controlButtons.length; i++) {
    this.removeClassName(this.controlButtons[i], [this.mountOptions.controlBtnActive, this.mountOptions.controlBtnToggle]);
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
  var volume_pick = this.volume_pick;

  document.addEventListener("mouseup", releasePick);
  this.volume_bar.addEventListener("mousedown", this.onVolumeClick.bind(this));
  this.volume_bar.addEventListener("mousemove", this.onVolumeMove.bind(this));

  this.progress_bar.addEventListener("click", this.onProgressBarClick.bind(this));
  for (var i = 0; i < this.controlButtons.length; i++) {
    this.controlButtons[i].addEventListener("click", this.togglePlay.bind(this));
  }

  function releasePick() {
    volume_pick.active = false;
  }

}

Player.prototype.onProgressBarClick = function(event) {
  var widthTotal = this.calculateWidth(this.progress_bar);
  var x = this.getSelectedX(event.clientX, this.progress_bar);
  this.selectedProgress = (this.selectedProgress > this.calculateBuffer()) ?
    this.calculateBuffer() : Math.ceil((x / widthTotal) * 100);
  this.source.currentTime = this.source.duration * (this.selectedProgress / 100);
  this.updateTime(this.player_timeNow, this.source.currentTime);
  this.updateProgress();
}

Player.prototype.onVolumeClick = function(event) {
  this.volume_pick.active = true;
  this.setVolumePickPositionX(this.getSelectedX(event.clientX, this.volume_bar));
  this.setVolume(this.getSelectedPercent(event.clientX, this.volume_bar));
}

Player.prototype.setVolumePickPositionX = function(x) {
  var pick_width = getComputedStyle(this.volume_pick).width.slice(0, -2);
  this.volume_pick.style.left = Math.floor(x - pick_width / 2) + 'px';
}

Player.prototype.onVolumeMove = function(event) {
  var x = this.getSelectedX(event.clientX, this.volume_bar);
  if (this.volume_pick.active && x >= 0 && x <= this.calculateWidth(this.volume_bar)) {
    this.setVolumePickPositionX(x);
    this.setVolume(this.getSelectedPercent(event.clientX, this.volume_bar));
  }
}

Player.prototype.calculateX = function(percent, width) {
  return width * percent;
}
Player.prototype.calculateWidth = function(obj) {
  return obj.offsetWidth;
}
Player.prototype.getSelectedX = function(mouseX, obj) {
  return mouseX - obj.getBoundingClientRect().left;
}
Player.prototype.getSelectedPercent = function(mouseX, obj) {
  return (Math.floor((this.getSelectedX(mouseX, obj) / this.calculateWidth(obj)) * 100)) / 100;
}

Player.prototype.setVolume = function(value) {
  value = (value < 0) ? 0 : ((value > 1) ? 1 : value);
  this.source.volume = value;
}

Player.prototype.startPlay = function(btn) {
  switch (btn) {
    case (this.playBtn):
      this.source.play();
      this.playBack = true;
      this.addClassName(this.pauseBtn, this.mountOptions.controlBtnToggle);
      this.addClassName(btn, this.mountOptions.controlBtnActive);
      break;
    case (this.pauseBtn):
      this.source.pause();
      this.playBack = false;
      this.addClassName(this.playBtn, this.mountOptions.controlBtnToggle);
      this.addClassName(btn, this.mountOptions.controlBtnActive);
      break;
  }
}

Player.prototype.stopPlay = function(btn) {
  this.clearActiveState();
  this.addClassName(this.playBtn, this.mountOptions.controlBtnToggle);
  this.source.pause();
  this.playBack = false;
  this.source.currentTime = 0;
  this.updateTime(this.player_timeNow, this.source.currentTime);
  this.updateProgress();
}
Player.prototype.togglePlay = function(event) {
  this.clearActiveState();
  switch (event.target) {
    case (this.playBtn):
    case (this.pauseBtn):
      this.startPlay(event.target);
      break;
    case this.stopBtn:
      this.stopPlay();
      break;
  }
  this.update();
}