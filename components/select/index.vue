<template>
  <el-select
    :clearable="clearable"
    v-on="$listeners"
    v-bind="$attrs"
    :multiple="multiple"
    ref="ElSelect"
    @visible-change="visibleChange"
    @change="change"
  >
    <!-- 枚举增加全选反选功能 -->
    <template v-if="chooseAll">
      <el-option
        label="选择全部"
        value="chooseAll"
        :class="{ selected: selectedAll }">
      </el-option>
    </template>
    <template v-for="(item, index) of locationOptions">
      <el-option
        v-if="show(item, index)"
        :key="item.code || index"
        :label="itemValue(item)"
        :value="getDeepValue(item, valueKey)"
        :disabled="item.disabled"
      >
        <slot
          name="option"
          :data="item"
        ></slot>
      </el-option>
    </template>
    <slot></slot>
    <template #prefix>
      <slot name="prefix"></slot>
    </template>
  </el-select>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { type } from 'os';
import { isEmpty, getDeepValue, getDataType } from '../../utils';
import https from '../../utils/https';

export default {
  props: {
    disableValues: {
      type: [Array, Function],
    },
    optionsDispose: {
      type: Function,
    },
    enumCode: {
      type: String,
    },
    options: {
      type: [Array, Object],
    },
    optionUrl: [String, Object],
    labelKey: {
      type: [String, Array],
      default: 'label',
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    filterOption: Function,
    multiple: {
      type: Boolean,
      default: false,
    },
    validAlways: Boolean,
    chooseAll: Boolean,
  },
  inject: {
    enterSearch: {
      default: false,
    },
  },
  data() {
    return {
      isChecked: false, // 是否已经验证
      optionsArr: undefined,
      preValue: undefined, // 上一个已选的值
      selectedAll: false,
    };
  },
  created() {
    // 当有枚举值code时，触发请求枚举options方法
    if (this.enumCode) {
      this.getEmumOptions(this.enumCode);
    }
    if (this.optionUrl) {
      this.query(this.optionUrl);
    }
  },
  mounted() {
    if (this.validAlways) {
      this.validValue(this.locationOptions);
    }
  },
  computed: {
    ...mapGetters('global', ['enumOptions']),
    labelKeyArr() {
      if (typeof this.labelKey === 'string') {
        return [this.labelKey];
      }
      return this.labelKey;
    },
    locationOptions() {
      if (this.$slots?.default) {
        // 当有default slots的时候，不使用options渲染
        return null;
      }
      if (this.options?.length > 0) {
        // 当传有options的时候，不使用enumCode。
        let _options = this.setDisableOptions(this.options);
        if (this.optionsDispose) {
          _options = this.optionsDispose(_options);
        }
        return _options;
      }
      if (this.enumCode) {
        // 当有enumCode时，使用vuex的枚举值。
        let _options = this.setDisableOptions(
          this.enumOptions[this.enumCode] || [],
        );
        if (this.optionsDispose) {
          _options = this.optionsDispose(_options);
        }
        return _options;
      }
      if (this.optionsArr?.length > 0) {
        let _options = this.setDisableOptions(this.optionsArr || []);
        if (this.optionsDispose) {
          _options = this.optionsDispose(_options);
        }
        return _options;
      }
      return null;
    },
  },
  watch: {
    locationOptions: {
      handler(value) {
        if (!this.isChecked || this.validAlways) {
          this.validValue(value);
        }
      },
      deep: true,
    },
  },
  methods: {
    getDeepValue,
    ...mapActions('global', ['getEmumOptions']),
    itemValue(item) {
      return this.labelKeyArr.map((x) => getDeepValue(item, x)).join('');
    },
    setDisableOptions(options) {
      /**
       * 当没有disable值设置时
       */
      if (!this.disableValues) {
        return options;
      }
      return options.map((x) => {
        if (this.disableValues instanceof Array) {
          x.disabled = this.disableValues.includes(
            getDeepValue(x, this.valueKey),
          );
        } else if (typeof this.disableValues === 'function') {
          x.disabled = this.disableValues(getDeepValue(x, this.valueKey));
        }
        return x;
      });
    },
    show(item, i) {
      const { filterOption } = this;
      if (typeof filterOption === 'function') return filterOption(item, i);
      return true;
    },
    change(value) {
      // 枚举增加全选反选
      if (getDataType(value) === 'array' && value.find((v) => v === 'chooseAll')) {
        this.selectedAll = !this.selectedAll;
        if (this.selectedAll) {
          const all = this.locationOptions.map(opt => opt[this.valueKey]);
          this.$emit('input', all);
        } else {
          this.$emit('input', []);
        }
        return;
      }
      this.selectedAll = this.locationOptions ? value.length === this.locationOptions.length : false;

      this.$emit('input', value);
      const option = this.locationOptions?.find(
        (option) => getDeepValue(option, this.valueKey) === value,
      );
      this.$emit('change', value);
      this.$emit('changeOption', value, option, {
        preValue: this.preValue,
      });
      this.preValue = value;
    },
    visibleChange(value) {
      if (this.enterSearch) this.$refs.ElSelect.selectOption = () => {};
      this.$emit('visibleChange', value);
      if (!value) {
        this.$refs.ElSelect.blur();
      }
    },
    /**
     * @description: 检测值是否有效，无效就删除
     *
     */
    validValue(list) {
      // validAlways 等于 false 时,不校验
      if (this.validAlways === false) {
        this.isChecked = true;
        return;
      }
      const value = this.$attrs.value;
      if (value && isEmpty(this.preValue)) {
        this.preValue = value;
      }
      let { preValue } = this;
      let checkVal;
      if (this.multiple) {
        checkVal = preValue;
      } else {
        checkVal = preValue ? [preValue] : [];
      }
      if (list?.length > 0 && !isEmpty(preValue)) {
        const checkedOptions = list.filter((option) =>
          checkVal.includes(getDeepValue(option, this.valueKey)),
        );
        if (checkVal?.length !== checkedOptions?.length) {
          // this.change(
          //   this.multiple ? [checkedOptions?.map((d) => getDeepValue(d, this.valueKey))] : '',
          // );
          this.$emit(
            'input',
            this.multiple
              ? [checkedOptions?.map((d) => getDeepValue(d, this.valueKey))]
              : '',
          );
        } else if (
          preValue &&
          checkedOptions?.length > 0 &&
          isEmpty(this.$attrs.value)
        ) {
          // this.change(this.multiple ? checkVal : preValue);
          this.$emit('input', this.multiple ? checkVal : preValue);
        }
      } else if (isEmpty(list)) {
        if (this.isChecked || !isEmpty(preValue)) {
          this.$emit('input', this.multiple ? [] : '');
        }
      }
      this.isChecked = true;
    },
    query(opUrl) {
      const obj = {
        method: 'get',
        data: {},
        params: {},
      };
      if (typeof opUrl === 'string') {
        const exre = /^_+([a-zA-Z]+)_+\//g.exec(opUrl);
        if (exre) {
          obj.method = exre[1] || 'get';
        }
        obj.url = opUrl.replace(/^_+([a-zA-Z]+)_+\//g, '');
      }
      https(obj).then((res) => {
        if (res.code === 10000) {
          this.$set(this, 'optionsArr', res.data);
        }
      });
    },
  },
};
</script>

<style lang="less" scoped>
.el-select {
  width: 100%;
}
</style>
