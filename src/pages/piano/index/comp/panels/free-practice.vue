<template>
  <div class="free-practice">
    <div class="fp-header">
      <h2>自由练习模式</h2>
      <p>按照乐谱顺序弹奏钢琴键，系统会自动检测并高亮提示下一个音符</p>
    </div>

    <div class="sheet-container">
      <div class="sheet-title">{{ currentSheet.title || '示例乐谱' }}</div>
      <div class="sheet-display">
        <div class="note-list-wrapper" ref="noteListWrapper">
          <div class="note-list" :style="noteListStyle">
            <div 
              v-for="(note, index) in currentSheet.notes" 
              :key="index"
              class="note-item"
              :class="{ 
                'current': currentNoteIndex === index,
                'completed': index < currentNoteIndex
              }"
            >
              <div class="note-name">{{ note.noteName }}</div>
              <div class="character">{{ formatDuration(note.duration) }}</div>
              <div class="duration">{{note.duration}}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <button class="btn-select" @click="selectSheet">选择乐谱</button>
        <button class="btn-reset" @click="resetPractice">重新开始</button>
      </div>
    </div>

    <div class="sheet-selection" v-if="showSheetSelection">
      <div class="selection-header">
        <h3>选择乐谱</h3>
        <span class="close-btn" @click="showSheetSelection = false">×</span>
      </div>
      <div class="sheet-list">
        <div
          v-for="(sheet, index) in availableSheets"
          :key="index"
          class="sheet-item"
          @click="loadSheet(sheet)"
        >
          {{ sheet.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { keypress } from '../piano-control';

// 简单的乐谱数据格式
const sheetData = [
  {
    id: 1,
    title: '欢乐颂',
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
      showSheetSelection: false,
      pianoKeyToKeyboardKey: {}, // 钢琴键到键盘按键的映射
      noteItemWidth: 70, // 每个音符项的宽度，根据实际样式调整
      visibleNoteCount: 5, // 可视区域内能显示的音符数量
      noteListStyle: {
        transform: 'translateX(0)'
      }
    };
  },
  
  mounted() {
    // 初始化钢琴键到键盘按键的映射
    this.initPianoToKeyboardMapping();
    
    // 监听键盘按下事件
    document.addEventListener('keydown', this.handleKeyDown);
    
    // 监听钢琴按键事件
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
    document.removeEventListener('keydown', this.handleKeyDown);
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
      
      if (this.currentNoteIndex >= this.visibleNoteCount/2) {
        // 当当前音符索引超过可视区域时开始滚动
        scrollPosition = (this.currentNoteIndex - (this.visibleNoteCount - 1)) * this.noteItemWidth;
      }
      
      this.noteListStyle = {
        transform: `translateX(-${scrollPosition}px)`
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
            alert('恭喜您完成了这首曲子！');
            this.resetPractice();
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
      this.updateNoteListPosition();
      this.highlightCurrentNote();
    }
  }
};
</script>

<style lang="stylus">
.free-practice {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  
  .fp-header {
    text-align: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      font-size: 14px;
    }
  }
  
  .sheet-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    padding: 20px;
    
    .sheet-title {
      font-size: 20px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .sheet-display {
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      margin-bottom: 20px;
      min-height: 100px;
      
      .note-list-wrapper {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
      }
      
      .note-list {
        display: inline-flex;
        transition: transform 0.3s ease;
        
        .note-item {
          padding: 10px 15px;
          margin: 5px;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
          flex-shrink: 0;
          
          .note-name {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .keyboard-key {
            font-size: 16px;
            font-weight: bold;
            color: #0166bd;
          }
          
          &.current {
            background: #ff9500;
            color: white;
            transform: scale(1.1);
            font-weight: bold;
            box-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
            
            .keyboard-key {
              color: white;
              font-size: 20px;
            }
          }
          
          &.completed {
            background: #4caf50;
            color: white;
            border-color: #4caf50;
            
            .keyboard-key {
              color: white;
            }
          }
        }
      }
    }
    
    .controls {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      
      button {
        background: #0166bd;
        color: white;
        border: none;
        padding: 10px 20px;
        margin: 0 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s;
        
        &:hover {
          background: #0277dc;
        }
        
        &.btn-reset {
          background: #f44336;
          
          &:hover {
            background: #e53935;
          }
        }
      }
    }
  }
  
  .sheet-selection {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    border-radius: 8px;
    width: 80%;
    max-width: 500px;
    z-index: 1000;
    
    .selection-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      
      h3 {
        margin: 0;
      }
      
      .close-btn {
        font-size: 24px;
        cursor: pointer;
        opacity: 0.6;
        
        &:hover {
          opacity: 1;
        }
      }
    }
    
    .sheet-list {
      .sheet-item {
        padding: 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
        
        &:hover {
          background: #f0f7ff;
        }
        
        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
</style>