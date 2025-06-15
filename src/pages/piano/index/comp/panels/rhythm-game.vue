<template>
    <div class="free-practice">
      <div class="fp-header">
        <h2>评分模式</h2>
        <p>请按照乐谱弹奏，若超过3秒未按键则视为失败。结束后将给出评分。</p>
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
                <div class="keyboard-key">{{ getKeyboardKeyName(note) }}</div>
                <div class="character">{{ formatDuration(note.duration) }}</div>
                <div class="duration">{{note.duration}}</div>
              </div>
            </div>
          </div>
          <div class="feedback-display" :class="feedbackClass">{{ currentFeedback }}</div>
        </div>
        
        <div class="controls">
          <button class="btn-select" @click="selectSheet">选择乐谱</button>
          <button class="btn-reset" @click="restartGame">重新开始</button>
          <button class="btn-start" @click="startGame" v-if="currentSheet.title">开始游戏</button>
          <button class="btn-history" @click="toggleHistory" v-if="currentSheet.title">历史记录</button>
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
     

      <!-- 评分反馈弹窗 -->
      <!-- <div class="score-feedback" v-if="isScoreFeedbackVisible">
        <div class="feedback-header">
          <h3 v-if="practiceCompleted">练习完成反馈</h3>
          <h3 v-else>很遗憾</h3>
          <span class="close-btn" @click="isScoreFeedbackVisible = false">×</span>
        </div>
        <div class="feedback-content">
          <div class="score-overview">
            <h4 v-if="practiceCompleted">综合评分: <span class="score-number">{{ finalScore.totalScore }}</span>/100</h4>
            <h4 v-else>练习未完成</h4>
          </div>
          <div class="score-details" v-if="practiceCompleted">
            <p>准确性: {{ finalScore.accuracy }}%</p>
            <p>连贯性: {{ finalScore.maxConsecutiveCorrect }}个连续正确</p>
            <p>节奏准确性: {{ finalScore.rhythmAccuracy }}%</p>
          </div>
          <div class="error-details" v-if="!practiceCompleted && errorDetails.length > 0">
            <h4>错误详情:</h4>
            <ul>
              <li v-for="(error, index) in errorDetails" :key="index">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
        <div class="feedback-footer">
          <button class="btn-close" @click="isScoreFeedbackVisible = false">关闭</button>
        </div>
      </div> -->
      <!-- 评分反馈弹窗 -->
      <div class="score-feedback" v-if="isScoreFeedbackVisible">
        <div class="feedback-header">
          <h3>练习评分反馈</h3>
          <span class="close-btn" @click="isScoreFeedbackVisible = false">×</span>
        </div>
        <div class="feedback-content">
          <div class="score-overview">
            <h4>综合评分: <span class="score-number">{{ finalScore.totalScore }}</span>/100</h4>
          </div>
          <div class="score-details">
            <p>准确性: {{ finalScore.accuracy }}%</p>
            <p>连贯性: {{ finalScore.maxConsecutiveCorrect }}个连续正确</p>
            <p>节奏准确性: {{ finalScore.rhythmAccuracy }}%</p>
          </div>
        </div>
        <div class="feedback-footer">
          <button class="btn-close" @click="isScoreFeedbackVisible = false">关闭</button>
        </div>
      </div>


      <!-- 添加提示信息 -->
      <div class="start-message" v-if="startMessageVisible">
        {{ startMessageText }}
      </div>

      <div class="selection-message" v-if="selectionMessageVisible">
        {{ selectionMessageText }}
      </div>

      <!-- 历史记录弹窗 -->
      <div class="history-feedback" v-if="showHistory">
        <div class="feedback-header">
          <h3>历史得分记录</h3>
          <span class="close-btn" @click="showHistory = false">×</span>
        </div>
        <div class="history-content">
          <div class="history-filters">
            <button class="filter-btn" @click="sortHistory('time')">按时间排序</button>
            <button class="filter-btn" @click="sortHistory('score')">按分数排序</button>
          </div>
          <div class="batch-delete">
            <button class="batch-delete-btn" @click="toggleBatchDelete">{{ batchDelete ? '取消多选' : '多选删除' }}</button>
          </div>
          <div class="history-list">
            <div class="history-item" v-for="(record, index) in filteredHistory" :key="index">
              <div class="history-song">{{ record.songName }}</div>
              <div class="history-score">{{ record.score }}</div>
               <div class="history-time">{{ formatTime(record.time) }}</div>
              <div class="history-status">{{ record.completed ? '已完成' : `未完成 (${record.errorReason === 'timeout' ? '超时' : '按错键'})` }}</div>
              <input type="checkbox" v-model="selectedRecords" :value="index" v-if="batchDelete">
              <button class="delete-btn" @click.stop="deleteHistory(index)" v-else>删除</button>
            </div>
          </div>
          <div class="delete-all-container" v-if="!batchDelete">
            <button class="delete-all-btn" @click="deleteAllHistory">删除全部历史记录</button>
          </div>
          <div class="delete-selected-container" v-else>
            <button class="delete-selected-btn" @click="deleteSelectedHistory">删除选中历史记录</button>
          </div>
        </div>
      </div>

      <!-- 开始提示弹窗 -->
      <div class="start-prompt" v-if="showStartPrompt">
        <div class="prompt-content">
          <h3>提示</h3>
          <p>请点击“开始游戏”按钮开始练习。</p>
          <button class="btn-close" @click="closeStartPrompt">确定</button>
        </div>
      </div>

      <!-- 礼花效果 -->
      <div class="confetti-container" v-if="showConfetti">
        <div class="confetti" v-for="i in 300" :key="i" :style="getConfettiStyle()"></div>
      </div>
      <!-- 鞭炮效果 -->
      <div class="firecracker-container" v-if="showFirecracker">
        <div class="firecracker"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { keypress } from '../piano-control';
  import { getKeyConfig } from '../keyboard-pc';
  
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
        },


        
        // 评分反馈相关数据

        isScoreFeedbackVisible: false,
        // finalScore需要在这里声明
        finalScore: null,
        pianoKeyToKeyboardKey: {}, // 钢琴键到键盘按键的映射
        userPerformance: [], // 存储用户的按键表现记录
        practiceCompleted: false, // 是否完成练习
        errorDetails: [], // 错误详情


        // ...其他数据属性
        inactivityTimer: null, // 计时器
        maxInactivityTime: 3000, // 最大无活动时间（毫秒），例如5秒
        waitingForFirstNote: true, // 标志是否在等待第一个音符

        gameStarted: false, // 游戏是否已开始
        startMessageVisible: false, // 是否显示“游戏已开始”提示
        startMessageText: '', // 提示信息内容
        selectionMessageVisible: false, // 是否显示“选择乐谱”提示
        selectionMessageText: '', // 选择乐谱提示信息内容
        timedOut: false, // 是否超时未按下键盘

        // 历史记录相关数据
        showHistory: false, // 是否显示历史记录弹窗
        historyRecords: [], // 历史记录
        filteredHistory: [], // 过滤和排序后的历史记录
        historySort: 'time', // 历史记录排序方式
        batchDelete: false, // 是否处于批量删除模式
        selectedRecords: [], // 选中的历史记录索引
        showStartPrompt: false, // 是否显示开始提示弹窗
        currentFeedback: '', // 当前的反馈信息
        feedbackTimeout: null, // 反馈信息计时器
        startTime: 0, // 游戏开始时间
        lastNoteTime: 0, // 上一个音符的按键时间
        beatDuration: 600, // 每拍的毫秒数
        keyCodeToName: {}, // keyCode到按键名称的映射
        showConfetti: false,
        showFirecracker: false,
      };
    },
    
    mounted() {
      // 初始化keyCode到按键名称的映射
      this.initKeyCodeToNameMapping();
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


        // 启动计时器
        // this.startInactivityTimer();
        // 监听窗口大小变化
        window.addEventListener('resize', this.calculateVisibleNoteCount);
    },
    
    beforeDestroy() {
      // 移除事件监听器
      // 清除计时器

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

      // 初始化keyCode到按键名称的映射
      initKeyCodeToNameMapping() {
        const kbdConfig = getKeyConfig();
        kbdConfig.forEach(row => {
          row.forEach(key => {
            this.keyCodeToName[key.c] = key.n;
          });
        });
      },

      getKeyboardKeyName(note) {
        const keyCode = this.pianoKeyToKeyboardKey[note.key];
        return this.keyCodeToName[keyCode] || '';
      },
      
      handlePianoKey(event) {
        const pressedKey = event.detail.key;
        if (this.gameStarted) {
          this.checkNote(pressedKey);
        } else {
          // 显示提示信息
          this.showStartPrompt = true;
        }
      },

      // ...其他方法

      closeStartPrompt() {
        this.showStartPrompt = false;
      },


      //计时器
      startInactivityTimer() {
        // 清除之前的计时器
        this.clearInactivityTimer();
        // 设置新的计时器
        this.inactivityTimer = setTimeout(() => {
          this.timedOut = true; // 设置超时标志
          this.handleInactivity();
        }, this.maxInactivityTime);
      },

      clearInactivityTimer() {
        if (this.inactivityTimer) {
          clearTimeout(this.inactivityTimer);
          this.inactivityTimer = null;
        }
      },

      handleInactivity() {
        // 用户无活动，判定为出错并终止游戏
        this.showScoreFeedback();
        // this.resetPractice();
      },


    // 检查按下的键是否是当前需要按的音符 三秒未按下键盘或者按错键则结束游戏
    checkNote(keyPressed) {
      if (this.currentNoteIndex >= this.currentSheet.notes.length) {
        return; // 已经完成了所有音符
      }

      const pressTime = new Date().getTime();
      const currentNote = this.currentSheet.notes[this.currentNoteIndex];  //当前音符
      const expectedTime = (this.lastNoteTime || this.startTime) + currentNote.duration * this.beatDuration;
      const timeDiff = Math.abs(pressTime - expectedTime);

      // 检查按下的键是否与当前音符匹配
      const isCorrect = keyPressed === currentNote.key;

      let performance = {
        note: currentNote,
        keyPressed: keyPressed,
        isCorrect: isCorrect,
        timestamp: pressTime,
        accuracy: 'miss'
      };

      if (isCorrect) {
        if (timeDiff < 150) { // Perfect
          performance.accuracy = 'perfect';
        } else if (timeDiff < 300) { // Good
          performance.accuracy = 'good';
        } else { // Correct key, wrong timing
          performance.accuracy = 'good'; // Or a different category
        }
        this.showFeedback(performance.accuracy);
        
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        this.currentNoteIndex++;
        this.lastNoteTime = pressTime;

        // 重置计时器
        this.startInactivityTimer();
        this.waitingForFirstNote = false;

        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          this.highlightCurrentNote();
        } else {
          // 完成了整首曲子
          this.triggerConfetti();
          setTimeout(() => {
            alert('恭喜您完成了这首曲子！');
            this.showScoreFeedback();
          }, 500);
        }
      } else {
        performance.accuracy = 'miss';
        this.showFeedback('miss');
        // 按错了，游戏继续
        this.currentNoteIndex++;
        this.lastNoteTime = pressTime;

        // 重置计时器
        this.startInactivityTimer();
        this.waitingForFirstNote = false;

        if (this.currentNoteIndex < this.currentSheet.notes.length) {
          this.highlightCurrentNote();
        } else {
          // 完成了整首曲子
          this.triggerConfetti();
          setTimeout(() => {
            alert('恭喜您完成了这首曲子！');
            this.showScoreFeedback();
          }, 500);
        }
      }
      this.userPerformance.push(performance);
    },

    triggerConfetti() {
      this.showConfetti = true;
      this.showFirecracker = true;
      setTimeout(() => {
        this.showConfetti = false;
        this.showFirecracker = false;
      }, 3000); // 3秒后隐藏礼花和鞭炮
    },

    getConfettiStyle() {
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      const x = Math.random() * 100; // vw
      const y = Math.random() * 100; // vh
      const rotation = Math.random() * 360; // deg
      const color = colors[Math.floor(Math.random() * colors.length)];
      const animationDuration = 2 + Math.random() * 3; // seconds
      const animationDelay = Math.random() * 2; // seconds

      return {
        left: `${x}vw`,
        top: `${y - 10}vh`, // Start above the screen
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
        animation: `fall ${animationDuration}s linear ${animationDelay}s forwards`,
      };
    },

      showFeedback(type) {
        this.currentFeedback = type;
        if (this.feedbackTimeout) {
          clearTimeout(this.feedbackTimeout);
        }
        this.feedbackTimeout = setTimeout(() => {
          this.currentFeedback = '';
        }, 500);
      },

      // 计算得分
      calculateScore() {
      let totalNotes = this.currentSheet.notes.length;
      let correctNotes = this.userPerformance.filter(item => item.isCorrect).length;
      let accuracy = totalNotes > 0 ? correctNotes / totalNotes : 0;

      // 根据 'perfect' 和 'good' 计算得分
      let scoreFromAccuracy = this.userPerformance.reduce((acc, perf) => {
        if (perf.accuracy === 'perfect') {
          return acc + 2;
        } else if (perf.accuracy === 'good') {
          return acc + 1;
        }
        return acc;
      }, 0);

      // 计算连贯性（按键是否连续正确）
      let consecutiveCorrect = 0;
      let maxConsecutiveCorrect = 0;
      for (let i = 0; i < this.userPerformance.length; i++) {
        if (this.userPerformance[i].isCorrect) {
          consecutiveCorrect++;
          if (consecutiveCorrect > maxConsecutiveCorrect) {
            maxConsecutiveCorrect = consecutiveCorrect;
          }
        } else {
          consecutiveCorrect = 0;
        }
      }

      // 计算节奏准确性（根据按键时间间隔与乐谱设定的节拍匹配情况）
      let rhythmAccuracy = 0;
      if (this.userPerformance.length > 1) {
        let totalRhythmMatch = 0;
        for (let i = 1; i < this.userPerformance.length; i++) {
          const prevNote = this.userPerformance[i - 1].note;
          const prevTimestamp = this.userPerformance[i - 1].timestamp;
          const currentTimestamp = this.userPerformance[i].timestamp;
          const expectedDuration = prevNote.duration * this.beatDuration;
          const actualDuration = currentTimestamp - prevTimestamp;
          if (Math.abs(actualDuration - expectedDuration) < 300) { // 允许300毫秒的误差
            totalRhythmMatch++;
          }
        }
        rhythmAccuracy = (this.userPerformance.length > 1) ? (totalRhythmMatch / (this.userPerformance.length - 1)) : 0;
      }

      // 综合评分（可以根据需要调整权重）
      const accuracyWeight = 0.7;
      const consecutiveWeight = 0.1;
      const rhythmWeight = 0.2;
      const maxPossibleScore = totalNotes > 0 ? totalNotes * 2 : 1; // 每个 'perfect' 2分
      const totalScore = 
        (scoreFromAccuracy / maxPossibleScore) * accuracyWeight + 
        (maxConsecutiveCorrect / totalNotes) * consecutiveWeight + 
        rhythmAccuracy * rhythmWeight;

      return {
        totalScore: Math.round(totalScore * 100),
        accuracy: Math.round(accuracy * 100),
        maxConsecutiveCorrect: maxConsecutiveCorrect,
        rhythmAccuracy: Math.round(rhythmAccuracy * 100),
      };
    },


    // 在游戏结束时调用

    //  showScoreFeedback() {
    //     this.finalScore = this.calculateScore();
    //     this.practiceCompleted = this.currentNoteIndex === this.currentSheet.notes.length;

    //     // if (!this.practiceCompleted) {
    //     //   // 收集错误详情
    //     //   this.errorDetails = [];
    //     //   if (this.timedOut) {
    //     //     this.errorDetails.push("错误原因: 超时未按下键盘");
    //     //   } else {
    //     //     const incorrectNote = this.currentSheet.notes[this.currentNoteIndex];
    //     //     this.errorDetails.push(`错误原因: 按错键，正确键应为 ${incorrectNote.noteName}`);
    //     //   }
    //     // }

    //     completed = this.practiceCompleted;
    //     const historyItem = {
    //       songName: this.currentSheet.title,
    //       score: this.finalScore.totalScore,
    //       time: new Date().toISOString(), // 使用ISO时间格式存储
    //       completed: completed,
    //       errorReason: completed ? null : (this.timedOut ? 'timeout' : 'wrongKey')
    //     };

    //     this.saveHistory(historyItem);

    //     this.isScoreFeedbackVisible = true;
    //     this.resetPractice();
    // },
// 在游戏结束时调用
    showScoreFeedback() {
      this.finalScore = this.calculateScore();
      const completed = this.currentNoteIndex === this.currentSheet.notes.length;

      const historyItem = {
        songName: this.currentSheet.title,
        score: this.finalScore.totalScore,
        time: new Date().toISOString(), // 使用ISO时间格式存储
        completed: completed,
        errorReason: completed ? null : (this.timedOut ? 'timeout' : 'wrongKey')
      };

      this.saveHistory(historyItem);
      this.isScoreFeedbackVisible = true;
      this.resetPractice();
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

          // 触发线圈动画
          const coilEvent = new CustomEvent('playCoil', {
            detail: { key: note.key, duration: note.duration * this.beatDuration / 1000 }
          });
          window.dispatchEvent(coilEvent);
        }
      },
      
      // 选择乐谱
      selectSheet() {
        this.showSheetSelection = true;
        this.clearInactivityTimer();
      },
      
      // 加载选择的乐谱
      loadSheet(sheet) {
        this.currentSheet = sheet;
        this.resetPractice();
        this.showSheetSelection = false;
        this.selectionMessageText = `已选择乐谱: ${sheet.title}`;
        this.selectionMessageVisible = true;
        setTimeout(() => {
          this.selectionMessageVisible = false;
        }, 3000);
      },
      
      // 重置练习
      resetPractice() {
        this.currentNoteIndex = 0;
        this.updateNoteListPosition();
        this.highlightCurrentNote();
        this.userPerformance = []; // 重置用户表现记录
        // ...其他逻辑
        this.clearInactivityTimer(); // 清除计时器
        this.waitingForFirstNote = true; // 重置等待状态
        this.startMessageVisible=false; // 隐藏开始提示信息
        this.gameStarted = false; // 重置游戏状态
 
      },

      restartGame() {
        this.resetPractice();
        this.startMessageText = '游戏已重新开始！请按照乐谱顺序弹奏钢琴键。';
        this.startGame();
      },
    

      // 开始提示弹窗
      startGame() {
        this.startTime = new Date().getTime();
        this.lastNoteTime = this.startTime;
        // // 这里可以添加其他初始化游戏的逻辑
        this.clearInactivityTimer();
        this.waitingForFirstNote = true;

        // this.startInactivityTimer();
        this.highlightCurrentNote();

        this.gameStarted = true;
        if (!this.startMessageText) {
          this.startMessageText = '游戏已开始！请按照乐谱顺序弹奏钢琴键。';
        }
        this.startMessageVisible = true;

      },


  // 历史记录相关方法


    formatTime(isoTime) {
    const date = new Date(isoTime);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },


    // 保存历史记录
      saveHistory(historyItem) {
        let existingHistory = JSON.parse(localStorage.getItem('pianoPracticeHistory') || '[]');
        existingHistory.push(historyItem);
        localStorage.setItem('pianoPracticeHistory', JSON.stringify(existingHistory));
        this.historyRecords = existingHistory;
        this.filteredHistory = [...this.historyRecords];

        console.log('Loaded history records:', historyItem);
        // console.log('History records:', this.historyRecords);
        console.log('Filtered history:', this.filteredHistory);

      },

    // 删除单条历史记录
    deleteHistory(index) {
      this.filteredHistory.splice(index, 1);
      this.historyRecords = [...this.filteredHistory];
      localStorage.setItem('pianoPracticeHistory', JSON.stringify(this.historyRecords));
    },

    // 删除全部历史记录
    deleteAllHistory() {
      if (confirm('确定要删除所有历史记录吗？')) {
        this.historyRecords = [];
        this.filteredHistory = [];
        localStorage.removeItem('pianoPracticeHistory');
      }
    },

    // 排序历史记录
    sortHistory(criteria) {
      this.historySort = criteria;
      this.filteredHistory.sort((a, b) => {
        if (criteria === 'time') {
          return new Date(b.time) - new Date(a.time);
        } else if (criteria === 'score') {
          return b.score - a.score;
        }
        return 0;
      });
    },

    

    // 切换批量删除模式
    toggleBatchDelete() {
      this.batchDelete = !this.batchDelete;
      this.selectedRecords = [];
    },

    // 删除选中的历史记录
    deleteSelectedHistory() {
      if (this.selectedRecords.length === 0) {
        alert('请选择要删除的历史记录');
        return;
      }
      if (confirm(`确定要删除 ${this.selectedRecords.length} 条历史记录吗？`)) {
        // 按索引降序排序，避免删除时索引变化影响
        this.selectedRecords.sort((a, b) => b - a).forEach(index => {
          this.filteredHistory.splice(index, 1);
        });
        this.historyRecords = [...this.filteredHistory];
        localStorage.setItem('pianoPracticeHistory', JSON.stringify(this.historyRecords));
        this.selectedRecords = [];
        this.batchDelete = false;
      }
    },
      toggleHistory() {
    this.showHistory = !this.showHistory;
    console.log('showHistory:', this.showHistory);
  }

  },
  computed: {
    feedbackClass() {
      return this.currentFeedback;
    }
  },
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
    /* 提示信息样式 */
    .start-message, .selection-message {
      position: absolute;
      top: 20px;
      right: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 100;
      text-align: center;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #0166bd;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            
            &:hover {
              color: #267cc6;
              border-color: #267cc6;
              box-shadow: 0 0 0.3em #0003;
              z-index: 5;
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
          
          &:active {
            transform: scale(0.95);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
    
    // 评分反馈弹窗样式

  .score-feedback {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    border-radius: 12px;
    width: 80%;
    max-width: 500px;
    z-index: 1000;
    text-align: center;

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }

      .close-btn {
        font-size: 22px;
        cursor: pointer;
        color: #666;
        transition: color 0.2s;
      }

      .close-btn:hover {
        color: #333;
      }
    }

    .feedback-content {
      margin-bottom: 25px;
    }

    .score-overview {
      margin: 20px 0;
      h4 {
        font-size: 24px;
        margin: 0;
        color: #333;
      }
      .score-number {
        font-size: 36px;
        font-weight: bold;
        color: #ff9500;
        display: block;
        font-family: 'Arial', sans-serif;
      }
    }

    .score-details {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: left;
      p {
        margin: 10px 0;
        color: #333;
        font-size: 16px;
      }
    }

    .error-details {
      background: #fff8e1;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: left;
      h4 {
        margin-top: 0;
        color: #f57c00;
        font-size: 18px;
      }
      ul {
        list-style-type: none;
        padding: 0;
        li {
          padding: 8px 0;
          color: #e65100;
          font-size: 16px;
        }
      }
    }

    .feedback-footer {
      .btn-close {
        background: #0166bd;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s;
      }
    }
  }
 
    .start-message {
      position: absolute;
      top: 20px;
      right: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #333;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 100;
      text-align: center;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #0166bd;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* 历史记录弹窗样式 */
    .history-feedback {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 25px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border-radius: 16px;
    width: 80%;
    max-width: 500px;
    z-index: 1000;

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .close-btn {
        font-size: 20px;
        cursor: pointer;
        color: #666;
      }
    }

    .history-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .filter-btn {
      padding: 8px 12px;
      background: #f5f5f5;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #333;

      &:hover {
        background: #e0e0e0;
      }
    }

    .batch-delete {
      margin-bottom: 15px;
    }

    .batch-delete-btn {
      padding: 8px 12px;
      background: #f5f5f5;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }

    .history-list {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 15px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .history-song {
      flex: 2;
      font-weight: 500;
      color: #333;
    }

    .history-score, .history-time {
      flex: 1;
      text-align: center;
      color: #555;
    }

    .history-status {
      flex: 2;
      text-align: right;
      color: #555;
      font-size: 14px;
    }

    .delete-btn {
      margin-left: 10px;
      padding: 3px 8px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .delete-all-container, .delete-selected-container {
      text-align: center;
      margin-top: 20px;
    }

    .delete-all-btn, .delete-selected-btn {
      padding: 8px 16px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
  }


  .start-prompt {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .prompt-content {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
    width: 80%;
  }

  .prompt-content h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }

  .prompt-content p {
    margin-bottom: 20px;
  }

  .prompt-content .btn-close {
    background: #0166bd;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s;
  }

  .prompt-content .btn-close:hover {
    background: #0277dc;
  }

  .feedback-display {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1.5);
    font-size: 5em;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    opacity: 0;
    transition: all 0.3s ease-out;
    z-index: 100;
  }

  .feedback-display.perfect {
    color: #FFD700; /* Gold */
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .feedback-display.good {
    color: #32CD32; /* LimeGreen */
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .feedback-display.miss {
    color: #FF6347; /* Tomato */
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }

  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    opacity: 0;
  }

  @keyframes fall {
    0% {
      opacity: 1;
      transform: translateY(-10vh) rotateZ(0deg);
    }
    100% {
      opacity: 1;
      transform: translateY(110vh) rotateZ(720deg);
    }
  }

  .firecracker-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    pointer-events: none;
  }

  .firecracker {
    width: 20px;
    height: 200px;
    background: red;
    position: relative;
    animation: firecracker-explode 1s ease-out forwards;
  }

  .firecracker::before, .firecracker::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 40px;
    background: gold;
  }

  .firecracker::before {
    top: -20px;
  }

  .firecracker::after {
    bottom: -20px;
  }

  @keyframes firecracker-explode {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(0.5) rotate(360deg);
      opacity: 0;
    }
  }

  }
  </style>
