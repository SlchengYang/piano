/* eslint-disable no-restricted-syntax */
/* eslint-disable no-continue */
export default class MidiTimeLine {
  constructor() {
    this.timeline = [];
    this.reset();
    this.listeners = {};
    this.noteDropSpeed = 6; // 6ms/px
  }

  on(type, cb) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(cb);
  }

  emit(type, data) {
    const cbs = this.listeners[type];
    if (cbs) {
      cbs.forEach((cb) => {
        cb(data);
      });
    }
  }

  reset() {
    this.timeline = new Array(99);
    for (let i = 0; i < this.timeline.length; i += 1) {
      this.timeline[i] = [];
    }
  }

  recordKeyDown(keys) {
    const now = Date.now();
    for (const i of keys) {
      const arr = this.timeline[i];
      const last = arr[arr.length - 1];
      if (last && last[1] === 1) {
        continue;
      }
      arr.push([now, 1]); // 时间，力度

      // 节奏游戏模式
      if (this.gameMode) {
        const note = this.findNote(i, now);
        if (note) {
          const diff = Math.abs(now - note.pressTime);
          if (diff < 50) {
            this.emit('hit', { type: 'perfect', key: i });
          } else if (diff < 100) {
            this.emit('hit', { type: 'good', key: i });
          } else {
            this.emit('miss', { key: i });
          }
          note.hited = true;
        } else {
          this.emit('miss', { key: i });
        }
      }
    }
  }

  findNote(key, time) {
    const notes = this.timeline[key];
    if (!notes) {
      return null;
    }
    for (let i = 0; i < notes.length; i += 2) {
      const note = notes[i];
      if (!note.hited) {
        const pressTime = note[0] + (this.noteDropSpeed * 300); // 假设判定线在300px的位置
        if (Math.abs(time - pressTime) < 150) { // 允许150ms的误差
          return { ...note, pressTime };
        }
      }
    }
    return null;
  }

  recordKeyUp(keys) {
    for (const i of keys) {
      const arr = this.timeline[i];
      const last = arr[arr.length - 1];
      if (last && last[1] === 0) {
        continue;
      }
      // 力度 -1 表示是音的结束
      arr.push([Date.now(), 0]); // [时间，力度]
    }
  }

  // 从保存的文件中加载
  // eslint-disable-next-line class-methods-use-this
  load() {}

  // 保存成结构化数据
  // eslint-disable-next-line class-methods-use-this
  save() {}
}
