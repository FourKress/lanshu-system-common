/* eslint-disable no-return-await */
import _ from 'lodash';
import axios from 'axios';
import { filterEmptyKey, isEmpty } from '../../utils';
import { setCache, getCache, removeCache } from '../../utils/cache';

const CancelToken = axios.CancelToken;

export default {
  props: {
    createUrl: {
      type: String,
    },
    readUrl: {
      type: String,
      required: true,
    },
    httpMethod: {
      type: String,
      default: 'post',
    },
    successHandle: {
      type: Function,
    },
    updateUrl: {
      type: String,
    },
    deleteUrl: {
      type: String,
    },
    pagination: {
      type: [Boolean, Object],
      default() {
        return {
          page: 1,
          size: 20,
        };
      },
    },
    orders: {
      type: Array,
    },
    externalParams: {
      type: Object,
      default() {
        return {};
      },
    },
    loadWhenCreated: {
      type: Boolean,
      default: true,
    },
    beforeReadMethod: Function,
    handleSearchParams: Function,
    handleData: Function,
    resetParamsFlag: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    this.page = this.pagination;
    this.locationConditions?.map((d) => {
      if (d.key instanceof Array && d.value?.length > 0) {
        d.key.map((dd, ii) => {
          if (typeof d.value === 'function') {
            const value = d.value();
            this.params[dd] = value?.[ii];
          } else {
            this.params[dd] = d.value?.[ii];
          }
        });
      } else if (!(d.key instanceof Array) && !isEmpty(d.value)) {
        if (typeof d.value === 'function') {
          this.params[d.key] = d.value();
        } else {
          this.params[d.key] = d.value;
        }
      }
    });
    if (this.loadWhenCreated) this.readMethod(this.params);
  },
  data() {
    return {
      tableList: [],
      page: {},
      params: {},
      treeResource: {},
    };
  },
  computed: {
    copyExternalParams() {
      return _.cloneDeep(this.externalParams);
    },
  },
  watch: {
    resetParamsFlag: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.params = {};
        }
      },
    },
  },
  methods: {
    /**
     * ??????????????????
     * @param {*} url ????????????????????????method??????????????? __get__ __post__ ?????????????????????????????????????????????????????????
     * @param {*} params ??????????????????
     */
    async query(url = '', params, loading) {
      const method = url.match(/__(\w+)__/)?.[1] ?? this.httpMethod.toLowerCase();
      // cancelToken?????????undefined,
      let cancelToken;
      if (this.requestCancel) {
        // ??????????????????????????????
        this.handleCancelFnc('???????????????????????????');
        // ???????????????????????????token
        cancelToken = new CancelToken((c) => {
          this.handleCancelFnc = c;
        });
      }
      const { page, current, size } = params;
      const transformParams = {
        ...params,
        page: undefined,
        size: undefined,
        current: undefined,
        pageRequest: {
          page: current || page,
          size,
        },
      };
      if (method === 'get') {
        return await this.$https({
          method: 'get',
          url: url.replace(/__(\w+)__/, ''),
          params: transformParams,
          loading,
          cancelToken,
        });
      }
      return await this.$https({
        method: 'post',
        url: url.replace(/__(\w+)__/, '', params),
        data: transformParams,
        loading,
        cancelToken,
      });
    },
    /**
     * ????????????????????????
     */
    search(params) {
      // ???????????????????????????
      if (this.conditionsFormat) {
        this.params = this.conditionsFormat(params);
        // ??????????????????????????????????????????????????????interrupt??????
        if (this.params.interrupt) return;
      } else if (!isEmpty(params)) {
        // ??????????????????????????????
        this.params = params;
      }
      // searchCallback?????????readMethod?????????
      // if (this.searchCallback) {
      //   this.searchCallback(this.params);
      // }
      this.readMethod({ ...this.params, page: 1 });
    },
    changeCondition(value, options) {
      const { key } = options;
      if (key) {
        if (key instanceof Array) {
          key.map((k, i) => {
            this.params[k] = value[i];
          });
        } else {
          this.params[key] = value;
        }
      }
      this.$emit('changeCondition', this.params);
    },
    /**
     * ????????????
     * @param {*} params ????????????
     */
    async createMethod(params) {
      const url = _.template(this.createUrl)(params);
      const res = await this.query(url, params);
      if (res.code === 10000) {
        this.readMethod();
        this.$message.success('????????????');
      }
    },
    /**
     * ?????????????????????
     * ??????pages????????????????????????????????????size???page
     * ?????????????????????????????????????????????????????????????????????????????????
     */
    filterParams(params) {
      const pa = {
        ...params,
      };
      Object.entries(pa).map((d) => {
        if (d[1]?.length === 0) {
          pa[d[0]] = undefined;
        }
      });
      const data = {
        ...pa,
        pages: undefined,
        total: undefined,
      };
      return filterEmptyKey(data, true);
    },
    /**
     * ?????????tableList???????????????
     * */
    handleTableData(res) {
      const { handleData } = this;
      let handledData = res.data?.records || res.data;

      if (typeof handleData === 'function') handledData = handleData(res);

      const children = this.$attrs?.['tree-props']?.children;
      const defaultExpandAll = this.$attrs?.defaultExpandAll;
      if (handledData?.[0]?.hasOwnProperty(children) && !defaultExpandAll) {
        // ?????????????????????
        this.getTreeResourceByRecursion(handledData);
      }
      return handledData;
    },
    /**
     * @description: ?????????????????????
     * @param {*} arr
     * @return {*}
     */
    getTreeResourceByRecursion(arr = []) {
      const { children, hasChildren } = this.$attrs?.['tree-props'];
      arr.map((d) => {
        if (d?.[children]?.length > 0) {
          d[hasChildren] = true;
          this.getTreeResourceByRecursion(d[children]);
        }
        this.treeResource[d[this.rowKey]] = _.cloneDeep(d[children]);
        d[children] = [];
      });
    },
    /**
     * ????????????
     * @description ?????????????????? this.params ?????????????????????params???????????????externalParams?????????????????????
     */
    async readMethod(params) {
      if (this.beforeReadMethod) {
        this.beforeReadMethod();
      }
      this.selectedRows = [];
      this.tableList = [];
      // ?????????????????????????????????????????????
      if (this.page) {
        params = {
          ...this.page,
          ...params,
        };
      }
      if (!isEmpty(params) && JSON.stringify(params) !== '{}') {
        this.params = {
          ...this.params,
          ...params,
        };
      }
      // ??????????????????
      const orders = this.locationOrders && this.locationOrders.length > 0
        ? this.locationOrders
        : this.orders;
      if (!isEmpty(orders)) params.orders = orders;
      if (this.mockData) return;
      this.loading = true;
      let newParams = this.filterParams({
        ...this.externalParams,
        ...this.params,
        ...params,
      });
      if (this.conditionCache) {
        // ????????????
        setCache(this.cacheKey, newParams);
      }

      if (this.handleSearchParams) {
        newParams = this.handleSearchParams(newParams);
      }

      const res = await this.query(this.readUrl, newParams, false);
      this.loading = false;
      if (res.code === '0') {
        if (this.page) {
          this.page = Object.assign(
            {},
            this.page,
            {
              page: res.data.number,
              total: res.data.totalElements,
              pages: res.data.totalPages,
            },
          );
        }
        this.tableList = this.handleTableData(res);
        const pages = Math.ceil(this.page.total / this.page.size);
        if (this.tableList?.length === 0 && this.page.page > 1) {
          // ?????????????????????????????????????????????????????????
          this.readMethod({
            current: Math.min(pages, this.page.page - 1),
          });
        }
        if (typeof this.$refs.vTable?.resizeTable === 'function') {
          this.$refs.vTable.resizeTable();
        }

        if (this.successHandle) {
          this.successHandle();
        }
        // ????????????????????????searchCallback
        if (this.searchCallback) {
          const callbackParams = _.cloneDeep(this.params);
          const { size, page, total } = callbackParams;
          callbackParams.pageRequest = {
            size,
            page,
            total,
          };
          delete callbackParams.size;
          delete callbackParams.page;
          delete callbackParams.total;
          delete callbackParams.pages;
          delete callbackParams.current;
          this.searchCallback(callbackParams);
        }
      }
    },
    /**
     * ????????????
     * @param {*} params ??????????????????
     */
    async updateMethod(params) {
      const url = _.template(this.updateUrl)(params);
      const res = await this.query(url, params);
      if (res.code === 10000) {
        this.readMethod();
        this.$message.success('????????????');
      }
    },
    /**
     * ????????????
     * @param {*} params ????????????
     */
    async deleteMethod(params) {
      const url = _.template(this.deleteUrl)(params);
      const res = await this.query(url, params);
      if (res.code === 10000) {
        this.readMethod();
        this.$message.success('???????????????');
      }
    },
    resetFormField(key) {
      this.$refs.vSearch.resetFormField(key);
    },
    load(tree, treeNode, resolve) {
      const key = tree[this.rowKey];
      resolve(this.treeResource[key]);
    },
  },
};
