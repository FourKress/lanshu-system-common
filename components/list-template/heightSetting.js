export default {
  mounted() {
    this.$nextTick(() => {
      this.getVTableHeight();
    });
  },
  props: {
    adjustHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      tableHeight: 'calc(100vh - 270px)',
      searchHeight: 0,
    };
  },
  watch: {
    adjustHeight() {
      this.getVTableHeight();
    },
  },
  methods: {
    getVTableHeight(searchHeight) {
      let allHeight = 0;
      // 添加调整高度
      allHeight += this.adjustHeight;
      // 判断是否有title部分显示
      if (
        this.title.length > 0 ||
        this.slotSet.has('title') ||
        this.slotSet.has('header-event')
      ) {
        allHeight += 50;
      }
      if (this.slotSet.has('notice-message')) {
        const height = this.$refs.noticeMessage.offsetHeight;
        allHeight += height || 34;
      }
      if (this.slotSet.has('search-top-slot')) {
        allHeight += 59;
      }
      // 判断是否显示分割虚线
      if (this.dashLine) {
        allHeight += 8;
      }
      // 是否有表单过滤条件
      if (this.conditions) {
        if (searchHeight) {
          this.searchHeight = searchHeight;
        }
        allHeight += this.searchHeight + 12 || 57;
      }
      // 是否有批量操作及分页按钮
      if (
        this.pagination ||
        this.batchOperation?.length > 0 ||
        this.slotSet.has('bottom-left')
      ) {
        allHeight += 50;
      } else {
        allHeight += 6;
      }
      this.tableHeight = `calc(100vh - ${50 + 36 + 16 + allHeight}px)`;
    },
  },
};
