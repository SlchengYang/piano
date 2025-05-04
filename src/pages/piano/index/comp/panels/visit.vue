<template>
  <div class="visit-ct">
    <div class="logo-ct">
      <div class="pn-logo">
        <img src="../../assets/keyboard.png" alt="钢琴键盘" />
      </div>
      <div class="pn-info">
        <h1>在线钢琴模拟器</h1>
      </div>
    </div>
    <div class="tips-wrapper">
      <div ref="tipsDom" v-html="tips[tipIdx]" />
    </div>
    <div class="doc-div" v-html="mainDoc" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      tips: [
        '',
        '',
        ''
      ],
      tipIdx: 0,
      sinterval: 0,
    };
  },

  computed: {
    mainDoc() {
      return this.$store.state.mainDoc;
    },
  },

  mounted() {
    this.sinterval = setInterval(() => {
      if (window.innerWidth <= 360) {
        this.slideTips2();
      } else {
        this.slideTips();
      }
    }, 5000);
  },

  destroyed() {
    clearInterval(this.sinterval);
  },

  methods: {
    slideTips() {
      this.$refs.tipsDom.setAttribute('class', 'hidden');
      setTimeout(() => {
        this.tipIdx = (this.tipIdx + 1) % this.tips.length;
        this.$refs.tipsDom.setAttribute('class', '');
      }, 300);
    },
    slideTips2() {
      if (!(this.tipIdx2 >= 0)) {
        this.tipIdx2 = this.tipIdx;
      }
      this.tipIdx2 = (this.tipIdx2 + 1) % this.tips.length;
      this.$refs.tipsDom.innerHTML = this.tips[this.tipIdx2];
    },
    // gotoOld () {
    //     window.location.href = 'http://www.xiwnn.com/piano?t=old';
    // }
  },
};
</script>

<style lang="stylus">
.visit-ct {
  padding: 1em 0 0 0;
  >.logo-ct {
    position relative
    margin 0px 0 0;
    >.pn-logo {
      position absolute;
      top 0px;
      left 18px;
      width 40px;
      max-width 30%;
      overflow hidden;
      border-radius 110px;
      border 2px solid #fff;
      box-shadow 0 0 10px #0003;
      margin 0 auto;
      &:before {
        padding-top 100%;
        content '';
        display block;
      }
      >img{
        position absolute;
        top 0;
        max-height 100%;
      }
    }
    >.pn-info {
      margin 0 0 0 78px;
      >h1{
        padding 4px 0 0 0;
        margin 0;
        font-size 16px;
        font-weight bold;
      }
      >p {
        margin 0;
        word-break break-all;
        // margin-top 15px;
      }
    }
  }
  >.tips-wrapper {
    padding 50px 0 30px 0;
    margin 0 20px;
    font-size 17px;
    >div {
      text-align center;
      transition opacity 0.3s;
      &.hidden {
        opacity 0;
      }
      b {
        margin 0 6px;
        font-size 18px;
        color #444;
      }
    }
  }

  >.doc-div{
    margin 0 15px;
    padding 10px 0 0 0;
    p {
      margin 8px 0;
    }
  }
}
</style>
