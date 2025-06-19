<template>
  <div ref="piano" class="piano" :style="{ top: hideNavBar ? '0px' : '0px' }">
    <panelsMain />
    <musical-notes />
    <note-bar />
    <keyboard />
    <div v-if="loading" class="loading">
      <div class="loading-status">
        <xwLoading :loading="true">
          {{ loadmsg ? loadmsg : "loading..." }}
        </xwLoading>
      </div>
      <div class="loading-bar" :style="{ width: `${persent}%` }" />
    </div>
    <unsupported v-if="isunsupported" :reason="'不支持html5音频接口(AudioContext)特性'" />
  </div>
</template>

<script>
import noteBar from './note-bar.vue';
import keyboard from './keyboard.vue';
import panelsMain from './panels-main.vue';
import musicalNotes from './musical-notes.vue';
import { setPiano, resize } from './size';
import { loadSoundfont, tryInitAudioContext } from '../../midi/xiwnn-midi';
import { start, stop } from './keyboard-pc';
import xwLoading from '../../../../comp/xw-comp/xw-loading.vue';
import { isIE } from '../../../../comp/tools/version-test';
import xwMessage from '@/comp/xw-comp/xw-message';

export default {
  components: {
    noteBar,
    keyboard,
    panelsMain,
    musicalNotes,
    xwLoading,
    unsupported() {
      return import(/* webpackChunkName: "piano/unsupported" */ '../../../../comp/tools/unsupported.vue');
    },
  },
  data() {
    return {
      loading: false,
      loadmsg: '',
      persent: 0,
      isunsupported: isIE(),
    };
  },
  computed: {
    hideNavBar() {
      return this.$store.state.hideNavBar;
    },    background() {
      return this.$store.state.background || 'pianobg.jpg'; // 从Vuex获取背景（仅用于计算属性，不直接应用）
    },
  },
  // 移除背景相关的watch，让上层app.vue处理
  mounted() {
    this.$refs.piano.style.bottom = '0';
    setPiano(this);
    this.init();
    this.initSize();
    // 不再在这里设置背景，交给上层app.vue处理
  },  destroyed() {
    stop();
  },
  methods: {
    initSize() {
      const width = window.innerWidth;
      if (width > 0) {
        if (width < 415) {
          this.$store.state.cacheConf.scale = 20;
        } else if (width < 600) {
          this.$store.state.cacheConf.scale = 15;
        } else if (width < 800) {
          this.$store.state.cacheConf.scale = 10;
        } else {
          return;
        }
        this.$nextTick(resize);
      }
    },
    init() {
      this.loadJS()
        .then(() => {})
        .catch((e) => {
          xwMessage.error(e.message || 'loading soundfonts error');
        });
      start(this.$store.state.cacheConf);
    },
    async loadJS() {
      this.loading = true;
      try {
        await loadSoundfont({
          soundfontUrl: '/js/piano/soundfont',
          instrument: 'acoustic_grand_piano',
          onProgress: (type, loaded) => {
            if (type === 'mp3') {
              this.persent = (loaded / 1434960) * 100;
            } else {
              this.persent = (loaded / 1707887) * 100;
            }
          },
        });
        this.loadmsg = 'loading...';
        await tryInitAudioContext();
        this.loadmsg = 'load resources success';
      } catch (e) {
        this.loadmsg = 'load resources ERROR';
      }
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
  },
};
</script>
<style lang="stylus">
.piano {
    position: absolute;
    overflow: hidden;
    top: 50px;
    left: 0;
    right: 0;
    // bottom: 0; // 这样做是因为搜索引擎的快照显示不全
    // background #0002;
    background-image bg
    >.loading {
        position absolute;
        z-index 20;
        top 50%;
        left 50%;
        width 200px;
        background #fff;
        padding 0 0 10px 0;
        box-shadow 0 0 5px #0003;
        border-radius 5px;
        overflow hidden
        transform translate(-50%, -50%);
        >.loading-status {
            position relative
            height 7em;
            font-size: 13px;
            .loading-icon {
                padding 3em 0 0 ;
            }
        }
        >.text {
            padding 20px 0;
            font-size 15px;
            text-align center;
        }
        >.loading-bar {
            display block;
            height 2px;
            max-width 100%;
            background #0166bdd9;
        }
    }

}
</style>
