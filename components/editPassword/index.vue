<template>
  <v-dialog
    :visible.sync="visible"
    custom-class="edit-pass-dialog"
    @dialogSure="dialogSure"
    title="修改密码"
    width="420px"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="80px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入原密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入6-20位数字、字母组合的密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="isNewPassword">
        <el-input
          v-model="form.isNewPassword"
          type="password"
          placeholder="请再次输入密码"
        ></el-input>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<script>
export default {
  name: 'EditPassword',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const reg = /^\S{6,20}$/;
    const validateFormat = (rule, value, callback) => {
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error('请输入6-20长度的密码'));
      }
    };
    const validateRepeat = (rule, value, callback) => {
      const { oldPassword, newPassword } = this.form;
      if (oldPassword === newPassword) {
        callback(new Error('新密码和旧密码不能一样'));
      } else {
        callback();
      }
    };
    const validateSame = (rule, value, callback) => {
      const { isNewPassword, newPassword } = this.form;
      if (isNewPassword !== newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };

    return {
      form: {
        oldPassword: '',
        newPassword: '',
        isNewPassword: '',
      },
      rules: {
        oldPassword: [
          { required: true, trigger: 'blur', message: '原密码不能为空' },
          { required: true, trigger: 'blur', validator: validateFormat },
        ],
        newPassword: [
          { required: true, trigger: 'blur', message: '新密码不能为空' },
          { required: true, trigger: 'blur', validator: validateFormat },
          { required: true, trigger: 'blur', validator: validateRepeat },
        ],
        isNewPassword: [
          { required: true, trigger: 'blur', message: '确认密码不能为空' },
          { required: true, trigger: 'blur', validator: validateFormat },
          { required: true, trigger: 'blur', validator: validateSame },
        ],
      },
    };
  },
  methods: {
    dialogSure() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('update:visible', false);
          this.$emit('sure', this.form);
        }
      });
    },
  },
};
</script>

<style scoped>

</style>
