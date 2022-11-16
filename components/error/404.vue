<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-content_content">
        <img src="../../assets/img/404.png" />
        <v-button @click="goBack" type="primary" class="not-found-content_btn">返回上一页</v-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped lang="less">
.not-found {
  background-color: #ffffff !important;
  min-height: 100vh;
  .not-found-content {
    height: 100%;
    width: 820px;
    margin: 0 auto;
    display: table;
  }
  .not-found-content_content {
    height: 100vh;
    display: table-cell;
    text-align: center;
    vertical-align: middle;
  }
  .not-found-content_btn {
    margin-top: 30px;
  }
}
</style>
