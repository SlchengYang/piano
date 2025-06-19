<template>
  <div class="notes">
    <span v-for="n in 15" :key="n"></span>
  </div>
</template>

<script>
export default {
  name: 'musical-notes',
};
</script>

<style lang="stylus" scoped>
.notes
  position absolute
  top 0
  left 0
  width 100%
  height 100%
  overflow hidden
  pointer-events none

.notes span
  position absolute
  bottom -50px
  font-size 2rem
  color rgba(255, 255, 255, 0.2)
  animation float 15s infinite
  opacity 0
  &::before
    content '♪'

  for i in (1..15)
    &:nth-child({i})
      left (i * 6)%
      animation-delay (i * 1)s
      if i % 2 == 0
        font-size 2.5rem
        &::before
          content '♫'
      if i % 3 == 0
        font-size 1.8rem
        &::before
          content '♩'
      if i % 4 == 0
        font-size 2.2rem
        &::before
          content '♬'


@keyframes float
  0%
    transform translateY(0)
    opacity 0
  10%
    opacity 1
  90%
    opacity 1
  100%
    transform translateY(-100vh)
    opacity 0
</style>