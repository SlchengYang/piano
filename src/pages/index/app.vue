<template>
  <div class="home-page">
    <!-- 音乐装饰元素 -->
    <div class="music-decoration">
      <div class="floating-note note-1">♪</div>
      <div class="floating-note note-2">♫</div>
      <div class="floating-note note-3">♩</div>
      <div class="floating-note note-4">♬</div>
      <div class="floating-note note-5">♯</div>
      <div class="floating-note note-6">♭</div>
    </div>

    <!-- 标题和介绍区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="main-title">
          <span class="title-icon">🎹</span>
          虚拟钢琴演奏厅
          <span class="title-decoration"></span>
        </h1>
        <p class="hero-subtitle">
          在这里，每一个音符都是您心灵的表达
        </p>
        <div class="feature-badges">
          <span class="badge">
            <span class="badge-icon">🎵</span>
            在线演奏
          </span>
          <span class="badge">
            <span class="badge-icon">🎼</span>
            节奏游戏
          </span>
          <span class="badge">
            <span class="badge-icon">🎧</span>
            MIDI支持
          </span>
        </div>
      </div>
    </div>

    <pianoBanner />
    
    <div class="content-wrapper">
      <div class="intro-section">
        <div class="intro-card">
          <div class="card-icon">🎹</div>
          <h3>交互式钢琴</h3>
          <p>支持键盘和MIDI设备演奏，让您随时随地享受音乐创作的乐趣</p>
        </div>
        
        <div class="intro-card">
          <div class="card-icon">🎯</div>
          <h3>节奏游戏</h3>
          <p>挑战各种难度的乐谱，提升您的演奏技巧和音乐感知能力</p>
        </div>
        
        <div class="intro-card">
          <div class="card-icon">🎼</div>
          <h3>丰富功能</h3>
          <p>录制回放、设置调节、历史记录等多种功能，打造专属音乐体验</p>
        </div>
      </div>
      
      <div class="action-section">
        <router-link to="/piano/" class="start-button">
          <span class="button-icon">🚀</span>
          开始演奏
          <span class="button-arrow">→</span>
        </router-link>
      </div>
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
  mounted() {
    // 清除body的背景设置，设置首页特有的背景
    document.body.style.backgroundImage = '';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundPosition = 'center center';
  },  beforeDestroy() {
    // 离开首页时，只清除首页的渐变背景，不影响其他页面的背景图片
    document.body.style.background = '';
    // 注意：不清除backgroundImage，让其他页面自己管理
  },
};
</script>

<style lang="stylus">
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-3deg);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.home-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;

  .music-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;

    .floating-note {
      position: absolute;
      font-size: 2.5rem;
      color: rgba(255, 255, 255, 0.15);
      animation: float 6s ease-in-out infinite;

      &.note-1 {
        top: 10%;
        left: 8%;
        animation-delay: 0s;
        font-size: 3rem;
      }

      &.note-2 {
        top: 15%;
        right: 12%;
        animation-delay: 1s;
        font-size: 2rem;
      }

      &.note-3 {
        top: 45%;
        left: 5%;
        animation-delay: 2s;
        font-size: 2.5rem;
      }

      &.note-4 {
        top: 60%;
        right: 8%;
        animation-delay: 3s;
        font-size: 2.8rem;
      }

      &.note-5 {
        top: 75%;
        left: 15%;
        animation-delay: 4s;
        font-size: 2.2rem;
      }

      &.note-6 {
        top: 80%;
        right: 20%;
        animation-delay: 5s;
        font-size: 2.6rem;
      }
    }
  }

  .hero-section {
    position: relative;
    z-index: 2;
    padding: 60px 20px 40px;
    text-align: center;
    color: white;

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      animation: fadeInUp 1s ease-out;

      .main-title {
        font-size: 3.5rem;
        font-weight: 800;
        margin: 0 0 20px 0;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

        .title-icon {
          font-size: 4rem;
          animation: pulse 2s infinite;
        }

        .title-decoration {
          width: 100px;
          height: 4px;
          background: linear-gradient(90deg, #ffd43b, #fab005);
          border-radius: 2px;
          margin-top: 10px;
        }
      }

      .hero-subtitle {
        font-size: 1.3rem;
        font-weight: 300;
        margin: 0 0 40px 0;
        opacity: 0.9;
        line-height: 1.6;
        animation: fadeInUp 1s ease-out 0.3s both;
      }

      .feature-badges {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
        animation: fadeInUp 1s ease-out 0.6s both;

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;

          .badge-icon {
            font-size: 1.1rem;
          }

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  .content-wrapper {
    position: relative;
    z-index: 2;
    background: white;
    border-radius: 30px 30px 0 0;
    margin-top: 40px;
    padding: 50px 20px;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);

    .intro-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto 60px auto;

      .intro-card {
        background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
        border: 1px solid rgba(102, 126, 234, 0.1);
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        transition: all 0.3s ease;
        animation: fadeInUp 1s ease-out;

        &:nth-child(1) { animation-delay: 0.2s; }
        &:nth-child(2) { animation-delay: 0.4s; }
        &:nth-child(3) { animation-delay: 0.6s; }

        &:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 15px 0;
        }

        p {
          font-size: 1rem;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
      }
    }

    .action-section {
      text-align: center;
      animation: fadeInUp 1s ease-out 0.8s both;

      .start-button {
        display: inline-flex;
        align-items: center;
        gap: 15px;
        padding: 20px 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 50px;
        font-size: 1.3rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .button-icon {
          font-size: 1.5rem;
        }

        .button-arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);

          &::before {
            left: 100%;
          }

          .button-arrow {
            transform: translateX(5px);
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .hero-section {
      padding: 40px 15px 30px;

      .hero-content {
        .main-title {
          font-size: 2.5rem;
          gap: 10px;

          .title-icon {
            font-size: 3rem;
          }
        }

        .hero-subtitle {
          font-size: 1.1rem;
          margin-bottom: 30px;
        }

        .feature-badges {
          gap: 15px;

          .badge {
            padding: 10px 16px;
            font-size: 0.8rem;
          }
        }
      }
    }

    .content-wrapper {
      padding: 40px 15px;

      .intro-section {
        grid-template-columns: 1fr;
        gap: 25px;

        .intro-card {
          padding: 30px 25px;

          .card-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
          }

          h3 {
            font-size: 1.3rem;
          }

          p {
            font-size: 0.9rem;
          }
        }
      }

      .action-section {
        .start-button {
          padding: 16px 32px;
          font-size: 1.1rem;
          gap: 12px;

          .button-icon {
            font-size: 1.3rem;
          }

          .button-arrow {
            font-size: 1rem;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .music-decoration {
      .floating-note {
        font-size: 1.8rem;

        &.note-1 {
          font-size: 2.2rem;
        }

        &.note-2 {
          font-size: 1.5rem;
        }

        &.note-3 {
          font-size: 1.8rem;
        }

        &.note-4 {
          font-size: 2rem;
        }

        &.note-5 {
          font-size: 1.6rem;
        }

        &.note-6 {
          font-size: 1.9rem;
        }
      }
    }

    .hero-section {
      .hero-content {
        .main-title {
          font-size: 2rem;
        }

        .hero-subtitle {
          font-size: 1rem;
        }
      }
    }
  }
}
</style>
