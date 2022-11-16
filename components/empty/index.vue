<template>
  <div class="v-page-empty">
    <img src="../../assets/img/empty.png">
    <p>{{msg}}~</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: String,
      default: '暂时没有任何信息~',
    },
  },
};
</script>

<style lang="less">
.v-page-empty {
  text-align: center;
  position: relative;
  img {
    width: 60%;
    margin-top: 10%;
  }
  p {
    font-size: 12px;
    font-weight: 400;
    color: rgba(71, 95, 123, 1);
    line-height: 22px;
    margin-top: 3%;
  }
}
</style>
