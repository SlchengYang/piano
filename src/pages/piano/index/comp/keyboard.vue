<template>
  <div ref="keyboardConatiner" class="keyboard-c">
    <div
      ref="keyboard"
      class="keyboard"
      :style="{ transform: `scale(${scale}) translateX(-${left}px)` }"
      :class="{ hidenum: !cacheConf.showKbdNum }"
    >
      <div ref="blacks" class="black" />
      <div ref="whites" class="white" />
    </div>
    <!-- <pre class="info">{{ infos.join('\n') }}</pre> -->
  </div>
</template>
<script>
import { offset } from '../../util/index';
import { setKeyBoard } from './size';
import { whiteDom, blackDom, getKey } from './keyboard';
import { keypress } from './piano-control';

export default {
  data() {
    return {
      scale: 1,
      offsetTop: 0,
      offsetLeft: 0,
      left: 0,
      // infos: ['asdfasdf', 'aaaa'],
      highlightedKey: null,
    };
  },

  computed: {
    cacheConf() {
      return this.$store.state.cacheConf;
    },
  },

  mounted() {
    this.init();
    this.initEvent();

    setKeyBoard(this);
    
    // 监听高亮音符事件
    window.addEventListener('highlightNote', this.handleHighlightNote);
    window.addEventListener('playCoil', (event) => {
      this.playCoilAnimation(event.detail.key, event.detail.duration);
    });
    
    // 监听钢琴按键事件，用于发送到自由练习组件
    keypress.onDown((keys = []) => {
      keys.forEach((key) => {
        const event = new CustomEvent('pianoKeyPress', {
          detail: { key }
        });
        window.dispatchEvent(event);
      });
    });
  },
  
  beforeDestroy() {
    window.removeEventListener('highlightNote', this.handleHighlightNote);
    window.removeEventListener('playCoil', this.playCoilAnimation);
  },

  methods: {
    playCoilAnimation(key, duration) {
      if (this.keyDoms && this.keyDoms[key]) {
        const keyElement = this.keyDoms[key];
        const coil = keyElement.querySelector('.coil');
        if (coil) {
          coil.style.animation = 'none';
          // eslint-disable-next-line no-void
          void coil.offsetWidth;
          coil.style.animation = `coil-animation ${duration}s linear`;
        }
      }
    },
    // 处理高亮提示事件 - 修复版本
    handleHighlightNote(event) {
      const keyToHighlight = event.detail.key;
      
      // 1. 确保键盘已初始化
      if (!this.keyDoms) {
        console.warn('Keyboard DOM elements not initialized yet');
        // 延迟重试高亮
        setTimeout(() => this.handleHighlightNote(event), 100);
        return;
      }
      
      // 2. 清理所有可能的高亮状态
      this.clearAllHighlights();
      
      // 3. 设置新的高亮
      if (this.keyDoms[keyToHighlight]) {
        try {
          this.keyDoms[keyToHighlight].classList.add('highlight');
          this.highlightedKey = keyToHighlight;
          
          // 4. 如果当前按键不在可视区域内，自动滚动到该位置
          this.scrollToHighlightedKey(keyToHighlight);
        } catch (e) {
          console.error('Error setting highlight:', e);
        }
      } else {
        console.warn('Key not found in keyDoms:', keyToHighlight);
      }
    },
    
    // 清除所有键的高亮状态
    clearAllHighlights() {
      if (!this.keyDoms) return;
      
      // 移除之前高亮键的高亮状态
      if (this.highlightedKey && this.keyDoms[this.highlightedKey]) {
        this.keyDoms[this.highlightedKey].classList.remove('highlight');
      }
      
      // 为确保没有残留的高亮，遍历并清除所有可能的高亮
      for (const key in this.keyDoms) {
        if (this.keyDoms[key] && this.keyDoms[key].classList) {
          this.keyDoms[key].classList.remove('highlight');
        }
      }
    },
    
    // 自动滚动到高亮的键
    scrollToHighlightedKey(keyIndex) {
      // 此函数确保高亮的键在可视区域内
      if (!this.keyDoms[keyIndex]) return;
      
      // 获取键的位置
      const keyPosition = parseInt(this.keyDoms[keyIndex].style.left || 0, 10);
      
      // 检查键是否在可视区域外
      const visibleWidth = window.innerWidth / this.scale;
      const currentLeftOffset = this.left;
      const keyRightPosition = keyPosition + 40; // 假设键宽度为40
      
      if (keyPosition < currentLeftOffset || keyRightPosition > currentLeftOffset + visibleWidth) {
        // 如果键不在可视区域内，调整left值
        let newLeft = keyPosition - visibleWidth / 2 + 20; // 居中显示
        
        // 边界检查
        if (newLeft < 0) newLeft = 0;
        
        // 应用新的滚动位置 - 仅在需要时执行
        if (Math.abs(newLeft - this.left) > 50) { // 只有偏差较大时才滚动
          this.$store.state.cacheConf.left = newLeft / 2100; // 假设钢琴总宽度为2100
          this.left = newLeft;
        }
      }
    },
    
    init() {
      const { blacks, whites } = this.$refs;
      blacks.innerHTML = blackDom;
      whites.innerHTML = whiteDom;

      const keyDoms = new Array(89);

      function doCache(pdom) {
        for (let i = 0; i < pdom.children.length; i += 1) {
          const item = pdom.children[i];
          // item.setAttribute('class', Math.random() < 0.1 ? 'act' : ''); // 方便调试按键按下时显示的样式
          const key = parseInt(item.getAttribute('data-key'), 10);
          if (key) {
            keyDoms[key] = item;
            const coil = document.createElement('div');
            coil.className = 'coil';
            item.appendChild(coil);
          }
        }
      }
      doCache(blacks);
      doCache(whites);
      this.keyDoms = keyDoms;
    },

    initEvent() {
      // const element = this.$refs.keyboard;
      const { keyboardConatiner } = this.$refs;

      const mouseEvent = () => {
        let isDown = false;
        keyboardConatiner.addEventListener(
          'mousedown',
          (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDown = true;
            // console.log('down');
            const x = e.pageX - this.offsetLeft;
            const y = e.pageY - this.offsetTop;
            const key = getKey(x / this.scale + this.left, y / this.scale);
            if (key) {
              keypress.down([key], true, 1);
            }
          },
          true,
        );

        // console.log(this.$parent.$el);
        document.addEventListener(
          'mousemove',
          (e) => {
            if (isDown) {
              e.stopPropagation();
              e.preventDefault();
              // console.log('move');
              const x = e.pageX - this.offsetLeft;
              const y = e.pageY - this.offsetTop;
              const key = getKey(x / this.scale + this.left, y / this.scale);
              keypress.down([key], true, 1);
            }
          },
          true,
        );
        document.addEventListener(
          'mouseup',
          (e) => {
            if (isDown) {
              e.stopPropagation();
              e.preventDefault();
              // console.log('up');
              isDown = false;
              const x = e.pageX - this.offsetLeft;
              const y = e.pageY - this.offsetTop;
              const key = getKey(x / this.scale + this.left, y / this.scale);
              keypress.up([key], 1);
            }
          },
          true,
        );
      };

      const touchEvent = () => {
        let isDown = false;
        keyboardConatiner.addEventListener(
          'touchstart',
          (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDown = true;
            // console.log(e);
            // console.log('down');
            // this.infos.push(`down ${e.touches.length} ${Date.now()}`);
            const { touches } = e;
            const keys = [];
            for (let i = 0; i < e.touches.length; i += 1) {
              const pst = touches[i];
              const x = pst.pageX - this.offsetLeft;
              const y = pst.pageY - this.offsetTop;
              const key = getKey(x / this.scale + this.left, y / this.scale);
              if (key) {
                keys.push(key);
              }
            }
            if (keys.length) {
              keypress.down(keys, true, 1);
            }
          },
          true,
        );

        // console.log(this.$parent.$el);
        document.addEventListener(
          'touchmove',
          (e) => {
            if (isDown) {
              e.stopPropagation();
              e.preventDefault();
              const { touches } = e;
              const keys = [];
              for (let i = 0; i < e.touches.length; i += 1) {
                const pst = touches[i];
                const x = pst.pageX - this.offsetLeft;
                const y = pst.pageY - this.offsetTop;
                const key = getKey(x / this.scale + this.left, y / this.scale);
                if (key) {
                  keys.push(key);
                }
              }
              keypress.down(keys, true, 1);
            }
          },
          true,
        );
        document.addEventListener(
          'touchend',
          (e) => {
            if (isDown) {
              e.stopPropagation();
              e.preventDefault();
              if (e.touches.length === 0) {
                isDown = false;
              }
              const { touches } = e;
              const keys = [];
              for (let i = 0; i < e.touches.length; i += 1) {
                const pst = touches[i];
                const x = pst.pageX - this.offsetLeft;
                const y = pst.pageY - this.offsetTop;
                const key = getKey(x / this.scale + this.left, y / this.scale);
                if (key) { keys.push(key); }
              }
              keypress.down(keys, true, 1);
              if (touches.length === 0) {
                isDown = false;
              }
            }
          },
          true,
        );
      };

      if ('ontouchstart' in window) {
        touchEvent();
      }
      mouseEvent();

      keypress.onDown((keys = []) => {
        keys.forEach((i) => {
          // 确保按下键时不影响高亮状态
          if (this.keyDoms[i]) {
            // 保存之前的class状态
            const hadHighlight = this.keyDoms[i].classList.contains('highlight');
            
            // 设置为激活状态
            this.keyDoms[i].setAttribute('class', 'act');
            
            // 如果之前有高亮，恢复高亮
            if (hadHighlight) {
              this.keyDoms[i].classList.add('highlight');
            }
          }
        });
      });

      keypress.onUp((keys = []) => {
        keys.forEach((i) => {
          // 恢复按键状态时保留高亮
          if (this.keyDoms[i]) {
            // 检查是否是当前需要高亮的键
            const shouldHighlight = (i === this.highlightedKey);
            
            // 清除当前class
            this.keyDoms[i].setAttribute('class', '');
            
            // 如果需要高亮，则重新添加高亮状态
            if (shouldHighlight) {
              this.keyDoms[i].classList.add('highlight');
            }
          }
        });
      });
    },

    setSize(scale, left) {
      this.scale = scale;
      this.left = left;
      const offsetValue = offset(this.$refs.keyboard);
      this.offsetTop = offsetValue.top + 200;
      this.offsetLeft = offsetValue.left;
      // console.log(offsetValue);
    },
  },
};
</script>
<style lang="stylus">
.keyboard-c {
    position: absolute;
    bottom: 0;
    left: 0;
    width 100%;
    padding 0 0 15px;
}
.keyboard {
    position absolute;
    bottom 15px;
    height: 200px;
    touch-action: none;
    cursor: default;
    overflow: visible;
    transition: transform 0.2s;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    transform-origin: 0 100%;
    font-size 12px;
    box-shadow 0 0 10px #0004;
    >.black {
        position: absolute;
        height: 125px;
        margin: 0 0 0 26px;
        width: 0;
        bottom: 75px;
        z-index: 4;
        pointer-events none;
        >div {
            position: absolute;
            left: 0;
            top: 0;
            width: 27px;
            height: 100%;
            background-color: #444444;
            border: 1px solid #0008;
            border-radius: 3px;
            color: #fff;
            text-align: center;
            &.act {
                background-color #c783b2;
                border-color #0008;
            }
            >.pckey {
                position: absolute;
                width: 100%;
                bottom: 5px;
                font-size: 12px;
                color: #fff;
            }
            &.highlight {
                background-color: #ff9500;
                border-color: #ff6d00;
                animation: keyPulse 1.5s infinite;
                box-shadow: 0 0 15px #ff9500;
                z-index: 5;
            }
        }
    }
    >.white {
        height: 200px;
        white-space nowrap;
        bottom: 0px;
        margin: 0 0 0 1px;
        z-index: 2;
        pointer-events none;
        >div{
            position: relative;
            display inline-block;
            width: 41px;
            height: 100%;
            background-color: #fff;
            border: 1px solid #0004;
            margin: 0 0 0 -1px;
            box-sizing: border-box;
            border-radius: 4px;
            text-align: center;
            color: #000;

            &.act {
                background-color #ad3c8a99;
            }
            
            &.highlight {
                background-color: #fff0e0;
                border-color: #ff9500;
                animation: keyPulse 1.5s infinite;
                box-shadow: 0 0 15px #ff950080;
                z-index: 3;
            }

            >div{
                position: absolute;
                width: 100%;
                bottom: 10px;
                font-size: 12px;
            }
            >.pckey {
                position: absolute;
                width: 100%;
                bottom: 30px;
                font-size: 14px;
                color: #a43983;
            }
        }
    }
    &.hidenum {
        >div>div>span{
            display: none;
        }
    }
}

@keyframes keyPulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}

.coil {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    border: 2px solid #ff9500;
    transform: translate(-50%, -50%);
    opacity: 0;
    box-sizing: border-box;
}

@keyframes coil-animation {
    from {
        width: 0;
        height: 0;
        opacity: 1;
    }
    to {
        width: 100%;
        height: 100%;
        opacity: 0;
    }
}
</style>
