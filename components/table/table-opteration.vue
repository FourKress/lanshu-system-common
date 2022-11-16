<template>
  <div class="v-table-opt">
    <span
      v-for="(item) in items"
      :key="item.value"
      class="v-blue"
      @click="click(item.value)"
    >{{item.label}}</span>
    <v-more-dropdown
      v-if="moreItems && moreItems.length > 0"
      :title="moreTitle"
      :menus="moreItems"
      @click="click"
    ></v-more-dropdown>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: {
    row: {
      type: Object,
      default: () => ({}),
    },
    column: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    items() {
      return this.column.items;
    },
    moreTitle() {
      return this.column.moreTitle;
    },
    moreItems() {
      return this.column.moreItems;
    },
  },
  methods: {
    click(value) {
      const { row, column } = this;
      const { handler } = column;
      const { $index: index, row: data } = row;
      if (typeof handler === 'function') handler(value, { data, column, index });
    },
  },
};
</script>

<style lang="less" scoped>
.v-table-opt {
  span {
    margin-right: 17px;
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
