<template>
  <div class="piano-sts">
    <div class="loading-overlay" v-if="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    <div class="form-ct">
      <div class="form">
        <div class="sts-row">
          <label>显示键盘上数字：</label>
          <xwSwitch v-model="state.cacheConf.showKbdNum" />
        </div>
        <div class="sts-row">
          <label>放大和缩小键盘：</label>
          <xw-button type="primary" @click="scaleCG(-1)">缩小</xw-button>
          <b class="scaletext">{{ state.cacheConf.scale }}</b>
          <xw-button type="primary" @click="scaleCG(1)">放大</xw-button>
        </div>
        <div class="sts-bg">
          <label for="background-select">选择背景：</label>
          <select id="background-select" v-model="selectedBackground" @change="changeBackground">
            <option value="0.jpg">0</option>
            <option value="1.jpg">1</option>
            <option value="2.jpg">2</option>
            <option value="3.jpg">3</option>
            <option value="4.jpg">4</option>
            <option value="5.jpg">5</option>
            <option value="6.jpg">6</option>
            <option value="7.jpg">7</option>
            <option value="8.jpg">8</option>
            <option value="9.jpg">9</option>
            <option value="10.jpg">10</option>
            <option value="11.jpg">11</option>
            <option value="12.jpg">12</option>
            <option value="custom">自定义</option>
          </select>
          <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" />
          <xw-button type="primary" @click="selectFile">选择文件</xw-button>
        </div>
      </div>
    </div>
    <div v-show="state.cacheConf.barScale < 1" class="btm-fixed">
      <div class="visible-line">
        <div
          class="visible-bar"
          :style="{
            width: `${state.cacheConf.barScale * 100}%`,
            left: `${(1 - state.cacheConf.barScale) * state.cacheConf.left * 100}%`
          }"
        />
      </div>
      <div class="xw-btn f-btn lef" @click="mleft(false)">左</div>
      <div class="xw-btn f-btn rit" @click="mleft(true)">右</div>
    </div>
  </div>
</template>

<script>
import xwSwitch from '../comp/xw-switch.vue';
import { resize } from '../size';
import xwButton from '../../../../../comp/xw-comp/xw-button.vue';
import settingsMidiPeripheral from './settings-midi-peripheral.vue';

export default {
  components: {
    xwSwitch,
    xwButton,
    settingsMidiPeripheral,
  },
  data() {
    return {
      selectedBackground: localStorage.getItem('background') || 'pianobg.jpg',
      loading: false,
    }
  },
  mounted() {
    this.selectedBackground = this.$store.state.background;
    this.applyBackground();
  },
  computed: {
    state() {
      return this.$store.state;
    },
  },
  watch: {
    'state.hideNavBar': function _() {
      this.$nextTick(resize);
    },
    'state.cacheConf.showKbdNum': function _() {
      //
    },
  },
  methods: {
    selectFile() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.loading = true;
        const reader = new FileReader();
        reader.onload = (e) => {
          const customBackground = e.target.result;
          this.$store.commit('SET_BACKGROUND', customBackground);
          localStorage.setItem('background', customBackground);
          this.selectedBackground = 'custom';
          this.applyBackground();
          this.loading = false;
        };
        reader.readAsDataURL(file);
      }
    },
    scaleCG(v) {
      let s = this.state.cacheConf.scale;
      s += v;
      if (s < 1) {
        s = 1;
      } else if (s > 5) {
        s = 5;
      }
      this.state.cacheConf.scale = s;
      this.$nextTick(resize);
    },
    mleft(v) {
      let f = this.state.cacheConf.left;
      if (v) {
        f += 0.1;
      } else {
        f -= 0.1;
      }
      if (f < 0) {
        f = 0;
      } else if (f > 1) {
        f = 1;
      }
      this.state.cacheConf.left = f;
      resize();
    },
    // settings.vue的methods部分修改
    applyBackground() {
      const bg = this.$store.state.background || 'pianobg.jpg';
      const style = document.documentElement.style;
      if (bg.startsWith('data:image')) {
        style.backgroundImage = `url(${bg})`;
      } else {
        style.backgroundImage = `url(${require(`@/assets/${bg}`)})`;
      }
      style.backgroundSize = '100% auto';
      style.backgroundRepeat = 'no-repeat';
      style.backgroundPosition = 'center top';
      style.backgroundAttachment = 'fixed';
    },
    // 切换背景时更新 Vuex 和 localStorage
    changeBackground() {
      if (this.selectedBackground === 'custom') {
        this.$refs.fileInput.click();
      } else {
        const bg = this.selectedBackground || 'pianobg.jpg';
        this.$store.commit('SET_BACKGROUND', bg);
        localStorage.setItem('background', bg);
        this.applyBackground(); // 立即生效
      }
    }
  },
};
/**
 * 调大调小键盘的按钮
 * 左右移动键盘可见区的按钮
 * 显示或隐藏键盘上字母和数字的按钮
 */
</script>

<style lang="stylus">
@import '../comp/btn.styl';
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.piano-sts{
    height 100%;
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1001;
      color: white;
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 4px solid white;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      p {
        margin-top: 10px;
      }
    }
    font-size 15px;
    >.form-ct {
        position absolute;
        top 0;
        left 0;
        width 100%;
        bottom 32px;
        overflow-y auto;
        >div.form {
            padding 20px;
            >.sts-row {
                padding 0 0 8px;
                >label {
                    margin 0 0px 0 0;
                    user-select none;
                }
            }
        }
    }
    .scaletext {
        display inline-block;
        padding 0 10px;
    }
    >.btm-fixed {
        position absolute;
        bottom 0px;
        left 0;
        height 32px;
        width 100%;
        // padding 16px 0 0 0;
        >.visible-line {
            position relative;
            top 16px;
            height 1px;
            background-color #0006;
            margin 0 36px;
            pointer-events none;
            >.visible-bar {
                position relative;
                width 0;
                top -2px;
                height 5px;
                background-color #2579c294;
                // border 1px solid #fff;
                // box-shadow 0 0 5px #0003;
            }
        }
        >.f-btn {
            position absolute;
            top 2px;
            margin 0 2px;
            width 28px;
            height 24px;
            line-height 25px;
            text-align center;
            font-size 12px;
            padding 0;
            &.rit {
                right 0;
            }
        }
    }
}
</style>
