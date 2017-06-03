#  Custom audio player v1
-------------------------
Audio player with ie9 support.

[Live example](http://victorpunko.ru/development/audio_control)
![img](http://victorpunko.ru/development/audio_control)


## Simple to use
--------

Add mountPoint into your index.html file

```html
    <!--your container-->
    <div class="container">
        <div id="cPlayMountPoint">
        <!--mount point-->
        <!--required id-->
        </div>
    </div>
```
Then in your app.js initialize new Player.

```javascript

var player = new Player({
    //options
    mountPoint: "cPlayMountPoint",
    source: "./player/audio.mp3",
    titleText: "Hello audio",
    });
```

## Template

```html

<div class="cPlay">
    <div class="cPlayCover">
      <img src="./player/cover.jpg">
    </div>
    <div class="cPlayContent">
      <h1 class="cPlayContent__title">Title</h1>
      <div class="cPlayContentProgress">
        <div class="cPlayProgressBar">
          <div class="cPlayProgressBar__buffer"></div>
          <div class="cPlayProgressBar__inner"></div>
        </div>
        <div class="cPlayContentProgress__time cPlayContentProgress__time_now">00:00</div>
        <div class="cPlayContentProgress__time cPlayContentProgress__time_total">00:00</div>
      </div>
      <div class="cPlayControls">
        <button class="cPlayControls__btn cPlayControls__btn_play"></button>
        <button class="cPlayControls__btn cPlayControls__btn_pause"></button>
        <button class="cPlayControls__btn cPlayControls__btn_stop"></button>
      </div>
    </div>
  </div>

```
