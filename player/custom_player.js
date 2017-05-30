function Player(options) {
     // cSpell:ignoreRegExp /[а-я]/i
     //определяем настройки по умолчанию
     this.scrDir = './player/';
     optionsDefault = {
          //поиск по ID
          sourceID: 'cPlay__audioSource',
          //исключение поиск по классу
          controlBtnClass: 'cPlay__btn',
          title: 'cPlay__title',
          progressBar: 'cPlay__bar',
          progressBarInner: 'cPlay__bar_inner',
          progressBarBuffer: 'cPlay__bar_buffer',
          timeNow: 'cPlay__timeNow',
          timeTotal: 'cPlay__timeTotal',
          volume: 'cPlay__volume',
          volumePicker: 'cPlay__volumePicker',
          buffering: true,
          snapToBuffer: true,
     }

     this.options = optionsDefault;
     //если добавлены опции - проверяем их и перезаписываем опции по умолчанию
     if (options !== undefined) {
          this.getProps(options);
     }

     this.source = this.getElem(this.options.sourceID);
     this.player_title = this.getElem(this.options.title);

     this.controlButtons = document.getElementsByClassName("custom-player__btn");
     this.playBtn = document.getElementById("player_play"); //создать программно по атрибуту role
     this.stopBtn = document.getElementById("player_stop"); //создать программно по атрибуту role
     this.title_inner = document.getElementById("title_inner"); //создать программно
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

Player.prototype.getElem = function(elemName) {
     var elem = null;
     //поиск по ID
     try {
          elem = document.getElementById(elemName);
          if (elem) {
               if (elem.hasAttribute('role')) {
                    elem.role = elem.getAttribute('role');
               }
          } else {
               throw ("Обращение к несуществующему элементу. Нет такого элемента - <b>" + elemName + "</b>");
          }
     } catch (error) {
          var output = error;
          this.generateMsg(output);
     };
     return elem;
}

Player.prototype.generateMsg = function(msg) {
     var elem = document.createElement('div');
     var styles = document.createElement('link');
     styles.rel = "stylesheet";
     styles.href = this.scrDir + 'cPlay__error.css';
     elem.innerHTML = msg;
     document.body.appendChild(elem);
     document.head.appendChild(styles);
     if (elem.classList) {
          elem.classList.add('cPlay__error');
          setTimeout(function() {
               elem.classList.add('cPlay__error_active');
          }, 100)
     }
}

Player.prototype.getProps = function(options) {
     for (var property in options) {
          if (this.options.hasOwnProperty(property)) {
               this.options[property] = options[property];
          }
          if (!this.options.hasOwnProperty(property)) {
               console.warn('Нет такой опции:', property, 'Доступные опции: ', this.options);
               delete options[property];
          }
     }
     return options;
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