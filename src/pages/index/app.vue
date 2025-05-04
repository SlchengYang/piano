<template>
  <div class="home-page">
    <pianoBanner />
    <div class="content-wrapper">
      <p class="intros">
        这是一个交互式的网页钢琴模拟器，可以通过电脑键盘或连接MIDI设备进行演奏。
      </p>
    </div>
  </div>
</template>

<script>
import pianoBanner from './comps/piano-banner.vue';

export default {
  name: 'HelloWorld',
  components: {
    pianoBanner,
  },
  props: {
  },
};
</script>

<style lang="stylus">
.home-page {
  >.content-wrapper {
    margin 6em 0 3em;
    text-align center;
    >.intros {
      font-size 14px;
      margin 1em 1em;
    }
  }
}
</style>
