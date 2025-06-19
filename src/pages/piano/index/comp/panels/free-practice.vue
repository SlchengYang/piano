<template>
  <div class="free-practice">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="music-note note-1">♪</div>
      <div class="music-note note-2">♫</div>
      <div class="music-note note-3">♩</div>
      <div class="music-note note-4">♬</div>
    </div>

    <div class="fp-header">
      <div class="header-content">
        <h2 class="main-title">
          <span class="title-icon">🎹</span>
          自由练习模式
          <span class="title-decoration"></span>
        </h2>
        <p class="subtitle">按照乐谱顺序弹奏钢琴键，系统会自动检测并高亮提示下一个音符</p>
        
        <!-- 进度指示器 -->
        <div class="progress-container">
          <div class="progress-info">
            <span class="progress-text">进度: {{ currentNoteIndex }}/{{ currentSheet.notes.length }}</span>
            <span class="progress-percentage">{{ Math.round((currentNoteIndex / currentSheet.notes.length) * 100) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (currentNoteIndex / currentSheet.notes.length) * 100 + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sheet-container">
      <div class="sheet-header">
        <div class="sheet-info">
          <h3 class="sheet-title">
            <span class="sheet-icon">🎵</span>
            {{ currentSheet.title || '示例乐谱' }}
          </h3>
          <div class="sheet-meta">
            <span class="difficulty" :class="getDifficultyClass(currentSheet.difficulty)">
              {{ getDifficultyText(currentSheet.difficulty) }}
            </span>
            <span class="note-count">{{ currentSheet.notes.length }} 个音符</span>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="action-btn btn-select" @click="selectSheet">
            <span class="btn-icon">📚</span>
            选择乐谱
          </button>
          <button class="action-btn btn-reset" @click="resetPractice">
            <span class="btn-icon">🔄</span>
            重新开始
          </button>
        </div>
      </div>

      <div class="sheet-display">
        <div class="note-list-wrapper" ref="noteListWrapper">
          <div class="note-list" :style="noteListStyle">
            <div
              v-for="(note, index) in currentSheet.notes"
              :key="index"
              class="note-item"
              :class="{
                'current': currentNoteIndex === index,
                'completed': index < currentNoteIndex,
                'upcoming': index === currentNoteIndex + 1
              }"
            >
              <div class="note-content">
                <div class="note-name">{{ note.noteName }}</div>
                <div class="note-symbol">{{ formatDuration(note.duration) }}</div>
                <div class="note-duration">{{ note.duration }}拍</div>
              </div>
              <div class="note-indicator" v-if="currentNoteIndex === index">
                <div class="pulse-ring"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 下一个音符预览 -->
        <div class="next-note-preview" v-if="currentNoteIndex < currentSheet.notes.length">
          <div class="preview-label">下一个音符</div>
          <div class="preview-note">
            <span class="preview-name">{{ currentSheet.notes[currentNoteIndex].noteName }}</span>
            <span class="preview-symbol">{{ formatDuration(currentSheet.notes[currentNoteIndex].duration) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 改进的乐谱选择弹窗 -->
    <div class="sheet-selection-overlay" v-if="showSheetSelection" @click="showSheetSelection = false">
      <div class="sheet-selection" @click.stop>
        <div class="selection-header">
          <h3>
            <span class="header-icon">🎼</span>
            选择乐谱
          </h3>
          <button class="close-btn" @click="showSheetSelection = false">
            <span>✕</span>
          </button>
        </div>
        
        <div class="sheet-list">
          <div
            v-for="(sheet, index) in availableSheets"
            :key="index"
            class="sheet-item"
            :class="{ 'active': sheet.id === currentSheet.id }"
            @click="loadSheet(sheet)"
          >
            <div class="sheet-preview">
              <div class="sheet-cover">
                <span class="cover-icon">🎵</span>
              </div>
              <div class="sheet-details">
                <h4 class="sheet-name">{{ sheet.title }}</h4>
                <div class="sheet-stats">
                  <span class="stat-item">
                    <span class="stat-icon">🎹</span>
                    {{ sheet.notes.length }} 音符
                  </span>
                  <span class="stat-item difficulty-badge" :class="getDifficultyClass(sheet.difficulty)">
                    {{ getDifficultyText(sheet.difficulty) }}
                  </span>
                </div>
                <div class="sheet-preview-notes">
                  <span v-for="(note, i) in sheet.notes.slice(0, 8)" :key="i" class="preview-note-mini">
                    {{ note.noteName }}
                  </span>
                  <span v-if="sheet.notes.length > 8" class="more-notes">...</span>
                </div>
              </div>
            </div>
            <div class="selection-indicator" v-if="sheet.id === currentSheet.id">
              <span>✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成庆祝动画 -->
    <div class="completion-celebration" v-if="showCelebration">
      <div class="celebration-content">
        <div class="celebration-icon">🎉</div>
        <h3>恭喜完成！</h3>
        <p>您成功演奏了《{{ currentSheet.title }}》</p>
        <div class="celebration-stats">
          <div class="stat">
            <span class="stat-value">{{ currentSheet.notes.length }}</span>
            <span class="stat-label">音符</span>
          </div>
          <div class="stat">
            <span class="stat-value">100%</span>
            <span class="stat-label">准确率</span>
          </div>
        </div>
        <button class="celebration-btn" @click="closeCelebration">继续练习</button>
      </div>
    </div>
  </div>
</template>

<script>
import { keypress } from '../piano-control';

// 改进的乐谱数据格式
const sheetData = [
  {
    id: 1,
    title: '欢乐颂',
    difficulty: 'easy',
    composer: '贝多芬',
    description: '经典的欢乐颂主题，适合初学者练习',
    notes: [
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 45, noteName: 'f1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 45, noteName: 'f1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1.5 },
      { key: 42, noteName: 'd1', duration: 0.5 },
      { key: 42, noteName: 'd1', duration: 2 }
    ]
  },
  {
    id: 2,
    title: '小星星',
    difficulty: 'easy',
    composer: '传统儿歌',
    description: '最受欢迎的儿童歌曲，简单易学',
    notes: [
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 40, noteName: 'c1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 47, noteName: 'g1', duration: 2 },
      { key: 45, noteName: 'f1', duration: 1 },
      { key: 45, noteName: 'f1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 44, noteName: 'e1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 42, noteName: 'd1', duration: 1 },
      { key: 40, noteName: 'c1', duration: 2 }
    ]
  },
  {
    id: 3,
    title: '刻在我心底的名字',
    difficulty: 'medium',
    composer: '卢广仲',
    description: '热门流行歌曲，节奏变化丰富',
    notes: [
      { key: 59, noteName: 'g2', duration: 1 },
      { key: 59, noteName: 'g2', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 57, noteName: 'f2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 0.5 },

      { key: 59, noteName: 'g2', duration: 1 },
      { key: 59, noteName: 'g2', duration: 1 },
      { key: 47, noteName: 'g1', duration: 1 },
      { key: 57, noteName: 'f2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 0.5 },
      
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 55, noteName: '#d2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 63, noteName: 'b2', duration: 1 },
      { key: 61, noteName: 'a2', duration: 0.5 },
      { key: 61, noteName: 'a2', duration: 0.5 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 63, noteName: 'b2', duration: 1 },
      { key: 61, noteName: 'a2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },

      { key: 49, noteName: 'a1', duration: 1 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 0.5 },
      { key: 54, noteName: 'd2', duration: 0.5 },
      { key: 51, noteName: 'b1', duration: 1 },

      { key: 52, noteName: 'c2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 61, noteName: 'a2', duration: 1 },
      { key: 59, noteName: 'g2', duration: 0.5 },
      { key: 59, noteName: 'g2', duration: 0.5 },
      { key: 51, noteName: 'b1', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },

      { key: 52, noteName: 'c2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 59, noteName: 'g2', duration: 1 },
      { key: 57, noteName: 'f2', duration: 1 },
      { key: 57, noteName: 'f2', duration: 1 },
      { key: 49, noteName: 'a1', duration: 1 },
      { key: 56, noteName: 'e2', duration: 1 },
      { key: 57, noteName: 'f2', duration: 1 },
      { key: 54, noteName: 'd2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 },
      { key: 52, noteName: 'c2', duration: 1 }
    ]
  }
];

export default {
  data() {
    return {
      availableSheets: sheetData,
      currentSheet: sheetData[0], // 默认加载第一首曲子
      currentNoteIndex: 0,
      showSheetSelection: false,      showCelebration: false, // 显示庆祝动画
      pianoKeyToKeyboardKey: {}, // 钢琴键到键盘按键的映射
      noteItemWidth: 70, // 每个音符项的宽度，根据实际样式调整
      visibleNoteCount: 5, // 可视区域内能显示的音符数量
      noteListStyle: {
        transform: 'translateX(0)'
      },
      lastKeyPressTime: 0, // 添加防重复按键的时间戳
      keyPressDelay: 150, // 按键间隔限制（毫秒）
    };
  },
    mounted() {
    // 初始化钢琴键到键盘按键的映射
    this.initPianoToKeyboardMapping();
    
    // 只监听钢琴按键事件，避免重复
    window.addEventListener('pianoKeyPress', this.handlePianoKey);
    
    // 高亮显示第一个音符
    this.highlightCurrentNote();
    
    // 计算可视区域内能显示的音符数量
    this.calculateVisibleNoteCount();
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.calculateVisibleNoteCount);
  },
    beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('pianoKeyPress', this.handlePianoKey);
    window.removeEventListener('resize', this.calculateVisibleNoteCount);
  },
  
  methods: {
    formatDuration(duration) {
      // 将数字时值转换为音乐符号表示
      const durationMap = {
        0.25: '♪',   // 十六分音符
        0.5: '♫',     // 八分音符
        1: '♩',       // 四分音符
        1.5: '♩.',    // 附点四分音符
        2: '',      // 二分音符
        3: '',     // 附点二分音符
        4: ''        // 全音符
      };
      return durationMap[duration] || duration;
    },
    
    // 获取难度等级的CSS类名
    getDifficultyClass(difficulty) {
      return `difficulty-${difficulty || 'easy'}`;
    },
    
    // 获取难度等级的显示文本
    getDifficultyText(difficulty) {
      const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return difficultyMap[difficulty] || '简单';
    },
    
    // 计算可视区域内能显示的音符数量
    calculateVisibleNoteCount() {
      if (this.$refs.noteListWrapper) {
        const wrapperWidth = this.$refs.noteListWrapper.clientWidth;
        this.visibleNoteCount = 5;
        this.updateNoteListPosition();
      }
    },
    
    // 更新音符列表的位置
    updateNoteListPosition() {
      // 计算需要滚动的距离
      let scrollPosition = 0;
      
      // 当当前音符索引超过可视区域的一半时开始滚动
      if (this.currentNoteIndex >= Math.floor(this.visibleNoteCount / 2)) {
        // 让当前音符保持在可视区域的中心位置
        const centerOffset = Math.floor(this.visibleNoteCount / 2);
        scrollPosition = Math.max(0, (this.currentNoteIndex - centerOffset) * this.noteItemWidth);
        
        // 确保不会滚动超过最后几个音符
        const maxScroll = Math.max(0, (this.currentSheet.notes.length - this.visibleNoteCount) * this.noteItemWidth);
        scrollPosition = Math.min(scrollPosition, maxScroll);
      }
      
      this.noteListStyle = {
        transform: `translateX(-${scrollPosition}px)`,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      };
    },
    
    // 初始化钢琴键到键盘按键的映射（反向映射）
    initPianoToKeyboardMapping() {
      // 从cacheConf获取当前键盘映射
      const pckey2key = this.$store.state.cacheConf.pckey2key;
      
      // 反转映射关系，从钢琴键找到对应的键盘按键
      Object.keys(pckey2key).forEach(keyCode => {
        const pianoKey = pckey2key[keyCode];
        if (!this.pianoKeyToKeyboardKey[pianoKey]) {
          this.pianoKeyToKeyboardKey[pianoKey] = keyCode;
        }
      });
    },
      // 处理用户按下钢琴键的事件
    handlePianoKey(event) {
      const currentTime = Date.now();
      
      // 防止重复按键
      if (currentTime - this.lastKeyPressTime < this.keyPressDelay) {
        return;
      }
      
      this.lastKeyPressTime = currentTime;
      
      const pressedKey = event.detail.key;
      this.checkNote(pressedKey);
    },
    
    // 处理用户按下键盘按键的事件
    handleKeyDown(event) {
      // 这里可以添加物理键盘映射到钢琴键的逻辑
      // 目前不处理，因为项目中已有对应逻辑
    },
    
    // 检查按下的键是否是当前需要按的音符
    checkNote(keyPressed) {
      if (this.currentNoteIndex >= this.currentSheet.notes.length) {
        return; // 已经完成了所有音符
      }

      const currentNote = this.currentSheet.notes[this.currentNoteIndex];
      if (keyPressed === currentNote.key) {
        // 按对了，进行到下一个音符
        this.currentNoteIndex++;
        this.updateNoteListPosition();
        
        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          this.highlightCurrentNote();
        } else {
          // 完成了整首曲子
          setTimeout(() => {
            this.showCelebration = true;
          }, 500);
        }
      }
    },
    
    // 高亮当前音符对应的钢琴键
    highlightCurrentNote() {
      if (this.currentNoteIndex < this.currentSheet.notes.length) {
        const note = this.currentSheet.notes[this.currentNoteIndex];
        // 触发高亮显示当前音符对应的键
        const event = new CustomEvent('highlightNote', {
          detail: { key: note.key }
        });
        window.dispatchEvent(event);
      }
    },
    
    // 选择乐谱
    selectSheet() {
      this.showSheetSelection = true;
    },
    
    // 加载选择的乐谱
    loadSheet(sheet) {
      this.currentSheet = sheet;
      this.resetPractice();
      this.showSheetSelection = false;
    },
      // 重置练习
    resetPractice() {
      this.currentNoteIndex = 0;
      this.lastKeyPressTime = 0; // 重置按键时间戳
      this.updateNoteListPosition();
      this.highlightCurrentNote();
    },
    
    // 关闭庆祝动画
    closeCelebration() {
      this.showCelebration = false;
      this.resetPractice();
    }
  }
};
</script>

<style lang="stylus">
.free-practice {
  position: relative;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  
  // 背景装饰
  .background-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    
    .music-note {
      position: absolute;
      font-size: 2rem;
      color: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
      
      &.note-1 {
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }
      
      &.note-2 {
        top: 20%;
        right: 15%;
        animation-delay: 1s;
      }
      
      &.note-3 {
        bottom: 30%;
        left: 20%;
        animation-delay: 2s;
      }
      
      &.note-4 {
        bottom: 15%;
        right: 10%;
        animation-delay: 3s;
      }
    }
  }
    .fp-header {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-bottom: 15px;
    
    .header-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    .main-title {
      position: relative;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 6px;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      
      .title-icon {
        font-size: 22px;
        animation: bounce 2s infinite;
      }
      
      .title-decoration {
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 2px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 1px;
      }
    }
    
    .subtitle {
      color: #666;
      font-size: 12px;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .progress-container {
      margin-top: 10px;
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
        color: #555;
        
        .progress-percentage {
          font-weight: bold;
          color: #667eea;
        }
      }
      
      .progress-bar {
        width: 100%;
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
      }
    }
  }
    .sheet-container {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    padding: 25px;
    margin-bottom: 20px;
    
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 20px;
      
      .sheet-info {
        flex: 1;
        min-width: 250px;
        
        .sheet-title {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          
          .sheet-icon {
            font-size: 28px;
            animation: pulse 2s infinite;
          }
        }
        
        .sheet-meta {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
          
          .difficulty {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            
            &.difficulty-easy {
              background: #e8f5e8;
              color: #2e7d32;
            }
            
            &.difficulty-medium {
              background: #fff3e0;
              color: #f57c00;
            }
            
            &.difficulty-hard {
              background: #ffebee;
              color: #d32f2f;
            }
          }
          
          .note-count {
            color: #666;
            font-size: 14px;
          }
        }
      }
      
      .sheet-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          
          .btn-icon {
            font-size: 16px;
          }
          
          &.btn-select {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
          }
          
          &.btn-reset {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
            }
          }
        }
      }
    }
      .sheet-display {
      background: linear-gradient(135deg, #f8f9ff, #e8f0ff);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 15px;
      min-height: 100px;
      border: 2px solid rgba(102, 126, 234, 0.1);
      
      .note-list-wrapper {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        margin-bottom: 20px;
      }
      
      .note-list {
        display: inline-flex;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 8px;
        
        .note-item {
          position: relative;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e0e7ff;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          height: 80px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          
          .note-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            height: 100%;
            
            .note-name {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              line-height: 1;
            }
            
            .note-symbol {
              font-size: 20px;
              color: #667eea;
              line-height: 1;
            }
            
            .note-duration {
              font-size: 11px;
              color: #666;
              line-height: 1;
            }
          }
          
          .note-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
            
            .pulse-ring {
              width: 100%;
              height: 100%;
              border: 2px solid #ff6b6b;
              border-radius: 50%;
              animation: pulse-ring 1.5s infinite;
            }
          }
          
          &.current {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            transform: scale(1.1) translateY(-5px);
            border-color: #ff6b6b;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
            z-index: 2;
            
            .note-content {
              .note-name, .note-symbol, .note-duration {
                color: white;
              }
            }
          }
          
          &.completed {
            background: linear-gradient(135deg, #51cf66, #40c057);
            color: white;
            border-color: #51cf66;
            transform: scale(0.95);
            
            .note-content {
              .note-name, .note-symbol, .note-duration {
                color: white;
              }
            }
          }
          
          &.upcoming {
            border-color: #ffd43b;
            background: #fff9db;
            
            .note-content {
              .note-symbol {
                color: #fab005;
              }
            }
          }
        }
      }
      
      .next-note-preview {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        border: 1px solid rgba(102, 126, 234, 0.2);
        
        .preview-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .preview-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          
          .preview-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          
          .preview-symbol {
            font-size: 24px;
            color: #667eea;
          }
        }
      }
    }
    
  }
  
  // 乐谱选择弹窗遮罩
  .sheet-selection-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }
  
  .sheet-selection {
    background: white;
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease;
    transform-origin: center center;
    
    .selection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
      
      h3 {
        margin: 0;
        font-size: 24px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 10px;
        
        .header-icon {
          font-size: 28px;
        }
      }
      
      .close-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: #f5f5f5;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:hover {
          background: #ff6b6b;
          color: white;
          transform: scale(1.1);
        }
        
        span {
          font-size: 18px;
          font-weight: bold;
        }
      }
    }
    
    .sheet-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .sheet-item {
        position: relative;
        background: #f8f9ff;
        border: 2px solid transparent;
        border-radius: 15px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }
        
        &.active {
          border-color: #51cf66;
          background: #e8f5e8;
        }
        
        .sheet-preview {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          
          .sheet-cover {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            
            .cover-icon {
              font-size: 24px;
              color: white;
            }
          }
          
          .sheet-details {
            flex: 1;
            
            .sheet-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin: 0 0 10px 0;
            }
            
            .sheet-stats {
              display: flex;
              gap: 15px;
              margin-bottom: 10px;
              flex-wrap: wrap;
              
              .stat-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
                color: #666;
                
                .stat-icon {
                  font-size: 16px;
                }
                
                &.difficulty-badge {
                  padding: 4px 8px;
                  border-radius: 8px;
                  font-weight: bold;
                  font-size: 12px;
                  
                  &.difficulty-easy {
                    background: #e8f5e8;
                    color: #2e7d32;
                  }
                  
                  &.difficulty-medium {
                    background: #fff3e0;
                    color: #f57c00;
                  }
                  
                  &.difficulty-hard {
                    background: #ffebee;
                    color: #d32f2f;
                  }
                }
              }
            }
            
            .sheet-preview-notes {
              display: flex;
              gap: 5px;
              flex-wrap: wrap;
              
              .preview-note-mini {
                background: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 12px;
                color: #667eea;
                border: 1px solid #e0e7ff;
              }
              
              .more-notes {
                color: #999;
                font-size: 12px;
                align-self: center;
              }
            }
          }
        }
        
        .selection-indicator {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 30px;
          height: 30px;
          background: #51cf66;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }
  }
  
  // 庆祝动画
  .completion-celebration {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.5s ease;
    
    .celebration-content {
      background: white;
      border-radius: 25px;
      padding: 50px;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
      animation: celebrationBounce 0.6s ease;
      max-width: 400px;
      
      .celebration-icon {
        font-size: 80px;
        margin-bottom: 20px;
        animation: bounce 1s infinite;
      }
      
      h3 {
        font-size: 28px;
        color: #333;
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
        font-size: 16px;
        margin-bottom: 30px;
      }
      
      .celebration-stats {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-bottom: 30px;
        
        .stat {
          text-align: center;
          
          .stat-value {
            display: block;
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          
          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
        }
      }
      
      .celebration-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }
  
  // 动画效果
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes modalSlideIn {
    from {
      transform: scale(0.7);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes celebrationBounce {
    0% {
      transform: scale(0.3) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.05) rotate(2deg);
    }
    70% {
      transform: scale(0.95) rotate(-1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    .free-practice {
      padding: 15px;
      
      .fp-header {
        margin-bottom: 15px;
        
        .header-content {
          padding: 15px;
        }
        
        .main-title {
          font-size: 20px;
          flex-direction: column;
          gap: 5px;
        }
        
        .subtitle {
          font-size: 12px;
        }
      }
      
      .sheet-container {
        padding: 20px;
        
        .sheet-header {
          flex-direction: column;
          align-items: stretch;
          
          .sheet-actions {
            justify-content: center;
          }
        }
        
        .sheet-display {
          padding: 15px;
          
          .note-list {
            .note-item {
              min-width: 60px;
              height: 70px;
              padding: 8px 12px;
              
              .note-content {
                .note-name {
                  font-size: 12px;
                }
                
                .note-symbol {
                  font-size: 16px;
                }
                
                .note-duration {
                  font-size: 10px;
                }
              }
            }
          }
        }
      }
      
      .sheet-selection {
        width: 95%;
        padding: 20px;
        
        .sheet-list {
          .sheet-item {
            .sheet-preview {
              flex-direction: column;
              text-align: center;
              
              .sheet-cover {
                align-self: center;
              }
            }
          }
        }
      }
      
      .completion-celebration {
        .celebration-content {
          padding: 30px 20px;
          margin: 20px;
          
          .celebration-icon {
            font-size: 60px;
          }
          
          h3 {
            font-size: 24px;
          }
          
          .celebration-stats {
            flex-direction: column;
            gap: 15px;
          }
        }
      }
    }
  }
}
</style>