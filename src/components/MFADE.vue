<template>
  <div class="MFADE" id="danmaku"></div>
</template>

<script>
import { MFADE } from "mf-ade";
export default {
  name: "MFADE",
  props: {
    danmaku: {
      type: String,
      default: "[]",
    },
  },
  data() {
    return {
      core: null,
    };
  },
  mounted() {
    // 挂载
    this.core = new MFADE({
      containers: document.getElementById("danmaku"),
      danmaku: (send) => {
        send([this.danmaku]);
      },
    });
  },
};
</script>

<style>
.stage {
  box-shadow: 0px 2px 4px 1px #999;
}
</style>
