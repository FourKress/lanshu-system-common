<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-content_content">
        <img src="../../assets/img/401.png" />
        <p><span class="ft16">非常抱歉，您没有当前操作权限，请联系管理人员</span></p>
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
  min-height: calc(100vh - 50px);
  .not-found-content {
    height: 100%;
    width: 820px;
    margin: 0 auto;
    display: table;
  }
  .not-found-content_content {
    height: calc(100vh - 50px);
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    img {
      width: 50vw;
    }
  }
  .not-found-content_btn {
    margin-top: 30px;
  }
}
</style>
