<template>
  <div class="piano-sts">
    <div class="loading-overlay" v-if="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <!-- 设置页面标题 -->
    <div class="settings-header">
      <h2 class="settings-title">
        <span class="title-icon">⚙️</span>
        钢琴设置
      </h2>
      <p class="settings-subtitle">个性化您的钢琴体验</p>
    </div>

    <div class="form-ct">
      <div class="form">
        <!-- 显示设置分组 -->
        <div class="settings-group">
          <h3 class="group-title">
            <span class="group-icon">👀</span>
            显示设置
          </h3>
          <div class="sts-row">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">显示键盘上数字</label>
                <span class="setting-desc">在钢琴键上显示对应的键盘数字</span>
              </div>
              <div class="setting-control">
                <xwSwitch v-model="state.cacheConf.showKbdNum" />
              </div>
            </div>
          </div>
        </div>

        <!-- 尺寸设置分组 -->
        <div class="settings-group">
          <h3 class="group-title">
            <span class="group-icon">📐</span>
            尺寸设置
          </h3>
          <div class="sts-row">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">键盘缩放</label>
                <span class="setting-desc">调整钢琴键盘的大小</span>
              </div>
              <div class="setting-control scale-control">
                <xw-button type="secondary" class="scale-btn" @click="scaleCG(-1)">
                  <span class="btn-icon">-</span>
                </xw-button>
                <div class="scale-display">
                  <span class="scale-value">{{ state.cacheConf.scale }}</span>
                  <span class="scale-unit">x</span>
                </div>
                <xw-button type="primary" class="scale-btn" @click="scaleCG(1)">
                  <span class="btn-icon">+</span>
                </xw-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 背景设置分组 -->
        <div class="settings-group">
          <h3 class="group-title">
            <span class="group-icon">🎨</span>
            背景设置
          </h3>
          <div class="sts-bg">
            <div class="setting-item">
              <div class="setting-info">
                <label class="setting-label">选择背景</label>
                <span class="setting-desc">为您的钢琴选择一个漂亮的背景</span>
              </div>
              <div class="setting-control bg-control">
                <div class="bg-selector">
                  <select class="bg-select" v-model="selectedBackground" @change="changeBackground">
                    <option value="0.jpg">经典蓝</option>
                    <option value="1.jpg">温暖橙</option>
                    <option value="2.jpg">清新绿</option>
                    <option value="3.jpg">优雅紫</option>
                    <option value="4.jpg">浪漫粉</option>
                    <option value="5.jpg">神秘黑</option>
                    <option value="6.jpg">纯净白</option>
                    <option value="7.jpg">日落金</option>
                    <option value="8.jpg">海洋蓝</option>
                    <option value="9.jpg">森林绿</option>
                    <option value="10.jpg">薰衣草</option>
                    <option value="11.jpg">樱花粉</option>
                    <option value="12.jpg">星空夜</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <input type="file" ref="fileInput" @change="handleFileChange" style="display: none" accept="image/*" />
                <xw-button type="upload" class="upload-btn" @click="selectFile">
                  <span class="btn-icon">📁</span>
                  选择文件
                </xw-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="settings-group">
          <h3 class="group-title">
            <span class="group-icon">👁️</span>
            预览
          </h3>
          <div class="preview-area">
            <div class="piano-preview">
              <div class="mini-piano">
                <div class="white-key" v-for="i in 7" :key="i"></div>
                <div class="black-key" v-for="i in 5" :key="i" :style="{left: getBlackKeyPosition(i)}"></div>
              </div>
              <p class="preview-text">当前设置效果预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 键盘调整控制器 -->
    <div v-show="state.cacheConf.barScale < 1" class="btm-fixed">
      <div class="keyboard-adjuster">
        <div class="adjuster-header">
          <span class="adjuster-title">键盘位置调整</span>
        </div>
        <div class="visible-line">
          <div
            class="visible-bar"
            :style="{
              width: `${state.cacheConf.barScale * 100}%`,
              left: `${(1 - state.cacheConf.barScale) * state.cacheConf.left * 100}%`
            }"
          />
        </div>
        <div class="control-buttons">
          <button class="control-btn left-btn" @click="mleft(false)">
            <span class="btn-icon">←</span>
            向左
          </button>
          <button class="control-btn right-btn" @click="mleft(true)">
            向右
            <span class="btn-icon">→</span>
          </button>
        </div>
      </div>
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
  },  methods: {
    getBlackKeyPosition(index) {
      const positions = ['8.5%', '21.5%', '48%', '61%', '74%'];
      return positions[index - 1] || '0%';
    },
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
    },    // settings.vue的methods部分修改
    applyBackground() {
      const bg = this.$store.state.background || 'pianobg.jpg';
      try {
        document.body.style.background = '';
        if (bg.startsWith('data:image')) {
          document.body.style.backgroundImage = `url(${bg})`;
        } else {
          document.body.style.backgroundImage = `url(${require(`@/assets/${bg}`)})`;
        }
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundAttachment = 'fixed';
      } catch (error) {
        console.error('设置页面背景应用失败:', error);
        // fallback到默认背景
        try {
          document.body.style.backgroundImage = `url(${require('@/assets/pianobg.jpg')})`;
        } catch (fallbackError) {
          console.error('默认背景设置失败:', fallbackError);
        }
      }
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.piano-sts {
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow-y: auto;

  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1001;
    color: white;
    backdrop-filter: blur(5px);

    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    p {
      margin-top: 15px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .settings-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 20px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .settings-title {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .title-icon {
        font-size: 32px;
        animation: spin 3s linear infinite;
      }
    }

    .settings-subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .form-ct {
    position: relative;
    padding: 0;

    .form {
      padding: 30px 20px;
      max-width: 800px;
      margin: 0 auto;

      .settings-group {
        background: white;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 25px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        animation: fadeIn 0.6s ease;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
        }

        .group-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;

          .group-icon {
            font-size: 24px;
            color: #667eea;
          }
        }

        .sts-row {
          margin-bottom: 0;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;

          .setting-info {
            flex: 1;

            .setting-label {
              display: block;
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
              user-select: none;
            }

            .setting-desc {
              font-size: 14px;
              color: #666;
              line-height: 1.4;
            }
          }

          .setting-control {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;

            &.scale-control {
              .scale-btn {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.3s ease;

                .btn-icon {
                  font-size: 20px;
                }

                &:hover {
                  transform: scale(1.1);
                }
              }

              .scale-display {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
                display: flex;
                align-items: center;
                gap: 5px;
                min-width: 60px;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

                .scale-value {
                  font-size: 18px;
                  font-weight: bold;
                }

                .scale-unit {
                  font-size: 14px;
                  opacity: 0.8;
                }
              }
            }

            &.bg-control {
              flex-direction: column;
              align-items: flex-end;
              gap: 15px;

              .bg-selector {
                .bg-select {
                  padding: 12px 16px;
                  border: 2px solid #e0e7ff;
                  border-radius: 10px;
                  font-size: 14px;
                  background: white;
                  color: #333;
                  min-width: 180px;
                  transition: all 0.3s ease;

                  &:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                  }
                }
              }

              .upload-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: linear-gradient(135deg, #ffd43b, #fab005);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;

                .btn-icon {
                  font-size: 16px;
                }

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(255, 212, 59, 0.4);
                }
              }
            }
          }
        }

        .preview-area {
          .piano-preview {
            background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
            border: 2px dashed #c7d2fe;
            border-radius: 12px;
            padding: 30px;
            text-align: center;

            .mini-piano {
              position: relative;
              display: inline-block;
              margin-bottom: 15px;

              .white-key {
                display: inline-block;
                width: 20px;
                height: 60px;
                background: white;
                border: 1px solid #ddd;
                margin-right: 1px;
                border-radius: 0 0 4px 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              }

              .black-key {
                position: absolute;
                top: 0;
                width: 12px;
                height: 36px;
                background: #333;
                border-radius: 0 0 2px 2px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                z-index: 2;
              }
            }

            .preview-text {
              font-size: 14px;
              color: #667eea;
              margin: 0;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .btm-fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 100;

    .keyboard-adjuster {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;

      .adjuster-header {
        text-align: center;
        margin-bottom: 15px;

        .adjuster-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .visible-line {
        position: relative;
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
        margin: 0 60px 20px 60px;
        overflow: hidden;

        .visible-bar {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: all 0.3s ease;
        }
      }

      .control-buttons {
        display: flex;
        justify-content: space-between;
        margin: 0 20px;

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;

          .btn-icon {
            font-size: 16px;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          &.left-btn {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);

            &:hover {
              box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
            }
          }

          &.right-btn {
            background: linear-gradient(135deg, #51cf66, #40c057);

            &:hover {
              box-shadow: 0 6px 20px rgba(81, 207, 102, 0.4);
            }
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .settings-header {
      padding: 20px 15px;

      .settings-title {
        font-size: 24px;
        flex-direction: column;
        gap: 8px;
      }

      .settings-subtitle {
        font-size: 14px;
      }
    }

    .form-ct .form {
      padding: 20px 15px;

      .settings-group {
        padding: 20px;

        .setting-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;

          .setting-control {
            width: 100%;
            justify-content: center;

            &.bg-control {
              align-items: center;
            }
          }
        }
      }
    }

    .btm-fixed .keyboard-adjuster {
      padding: 15px;

      .visible-line {
        margin: 0 40px 15px 40px;
      }

      .control-buttons {
        margin: 0 10px;
        gap: 10px;

        .control-btn {
          flex: 1;
          justify-content: center;
          padding: 10px 15px;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
