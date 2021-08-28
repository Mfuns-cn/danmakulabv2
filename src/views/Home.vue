<template>
  <v-app>
    <v-app-bar dense app color="primary" dark>
      <v-app-bar-title
        >Mfuns Danmaku Lab <v-chip small>core 1.5.5</v-chip></v-app-bar-title
      >
      <v-spacer></v-spacer>
      <v-btn title="导出文件" @click="exportFile" dark icon>
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn title="背景颜色" dark icon v-bind="attrs" v-on="on">
            <v-icon>mdi-palette</v-icon>
          </v-btn>
        </template>
        <v-sheet class="pa-1 color-select">
          <v-sheet
            v-for="val in colorList"
            :key="val"
            elevation="1"
            :color="val"
            width="30"
            v-ripple
            height="30"
            class="ma-1"
            @click="changeColor(val)"
          ></v-sheet>
        </v-sheet>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col class="row-box" md="5"
            ><div class="row row-box" ref="container" id="container"></div
          ></v-col>
          <v-col
            md="7"
            :style="'background-color:' + color"
            class="box row-box"
            ref="danmakuBox"
          >
            <v-sheet elevation="1" class="control">
              <v-btn color="primary" icon @click="syncDanmaku" title="同步代码">
                <v-icon>mdi-sync-circle</v-icon></v-btn
              >
              <v-btn color="orange" @click="skip(-5000)" icon title="后退5秒">
                <v-icon>mdi-skip-previous</v-icon></v-btn
              >
              <v-btn
                v-if="!isPlay"
                @click="play"
                color="green"
                icon
                title="播放"
              >
                <v-icon>mdi-play</v-icon></v-btn
              >
              <v-btn v-else color="green" @click="pause" icon title="暂停">
                <v-icon>mdi-pause</v-icon></v-btn
              >

              <v-btn color="orange" @click="skip(5000)" icon title="前进5秒">
                <v-icon>mdi-skip-next</v-icon></v-btn
              >
              <v-btn color="red" @click="stop" icon title="停止">
                <v-icon>mdi-stop</v-icon></v-btn
              >
              <v-btn
                color="primary"
                @click="fullscreen"
                v-if="!isFull"
                icon
                title="全屏"
              >
                <v-icon>mdi-fullscreen</v-icon></v-btn
              >
              <v-btn
                color="primary"
                @click="fullscreen"
                v-else
                icon
                title="退出全屏"
              >
                <v-icon>mdi-fullscreen-exit</v-icon></v-btn
              >
            </v-sheet>
            <v-sheet class="time">
              <v-btn text color="primary" tile elevation="1" title="跳转至...">
                {{ time }}
              </v-btn>
            </v-sheet>
            <MFADE class="danmaku row" :danmaku="danamkuText" ref="danmaku" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import * as monaco from "monaco-editor";
import MFADE from "../components/MFADE.vue";
import screenfull from "screenfull";
import { saveAs } from "file-saver";
export default {
  name: "Home",
  components: { MFADE },
  data() {
    return {
      editor: null, //文本编辑器
      isPlay: false, //播放状态
      danamkuText: "[]", //弹幕内容
      time: "00:00", //显示的时间
      timeId: 0, //时间定时器id
      isFull: false,
      colorList: ["white", "black"],
      color: "white",
    };
  },
  mounted() {
    this.initTime();
    // 监听全屏变化
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        this.isFull = screenfull.isFullscreen;
      });
    }
    //载入自动保存
    let save = this.getAutoSave();
    if (save) {
      this.danamkuText = save;
    }
    this.initEditor();
    //开启自动保存
    this.autoSave();
  },
  beforeDestroy() {
    this.stopTime();
  },
  methods: {
    initEditor() {
      // 初始化编辑器，确保dom已经渲染
      this.editor = monaco.editor.create(this.$refs.container, {
        value: this.danamkuText, //编辑器初始显示文字
        language: "json", //语言支持自行查阅demo
        automaticLayout: true, //自动布局
        theme: "vs-dark", //官方自带三种主题vs, hc-black, or vs-dark
        tabSize: "2",
      });
    },
    getValue() {
      return this.editor.getValue(); //获取编辑器中的文本
    },
    /**
     * 同步弹幕
     */
    syncDanmaku() {
      this.danamkuText = this.getValue();
      //加入异步队列，否则会出现bug 原因未知
      setTimeout(() => {
        this.$refs.danmaku.core.reset();
      }, 0);
      this.pause();
    },
    /**
     * 播放
     */
    play() {
      this.isPlay = true;
      this.$refs.danmaku.core.start();
    },
    /**
     * 暂停
     */
    pause() {
      this.isPlay = false;
      this.$refs.danmaku.core.pause();
    },
    /**
     * 停止
     */
    stop() {
      this.pause();
      this.$refs.danmaku.core.skip(0);
    },
    /**
     * 跳转
     */
    skip(num) {
      let time = this.$refs.danmaku.core.time();
      time = time + num;
      if (time <= 0) {
        //不允许小于0
        time = 0;
      }
      console.log(time);
      this.$refs.danmaku.core.skip(time);
    },
    /**
     * 初始化时间条
     */
    initTime() {
      this.timeId = setInterval(() => {
        let curTime = this.$refs.danmaku.core.time();
        let s = parseInt(curTime / 1000); //秒
        let ms = parseInt((curTime % 1000) / 10); //毫秒
        if (ms < 10) {
          ms = "0" + ms; // 不够前面补0
        }
        this.time = `${s}:${ms}`;
      }, 16);
    },
    /**
     * 停止时间条
     */
    stopTime() {
      clearInterval(this.timeId);
    },
    /**
     * 切换全屏
     */
    fullscreen() {
      screenfull.toggle(this.$refs.danmakuBox);
    },
    /**
     * 修改颜色
     */
    changeColor(color) {
      this.color = color;
    },
    /**
     * 导出文件
     */
    exportFile() {
      let blob = new Blob([this.getValue()], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "弹幕导出.json");
    },
    autoSave() {
      setInterval(() => {
        window.localStorage.danamkuText = this.getValue();
      }, 2000);
    },
    getAutoSave() {
      return window.localStorage.danamkuText;
    },
  },
};
</script>
<style>
.row-box {
  height: calc(100vh - 48px) !important;
  overflow: hidden;
}
.box {
  height: 100%;
  position: relative;
}
.danmaku,
.control,
.time,
.background {
  position: absolute !important;
}
.danmaku {
  width: 100%;
  height: 100%;
  z-index: 1;
}
.control {
  right: 10px;
  top: 10px;
  z-index: 2;
}
.time {
  top: 10px;
  left: 10px;
  z-index: 2;
}
.color-select {
  display: flex;
}
</style>
