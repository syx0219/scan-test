<template>
  <div class="login">
    <div class="warp">
      <p class="title">{{ $t('login.loginLabel') }}</p>
      <div>
        <van-form @submit="onSubmit" label-align="top">
          <van-cell-group inset>
            <van-field
              v-model="form.email"
              :label="$t('login.emailLabel')"
              name="email"
              :rules="[{ validator: validator }]"
            />
            <van-field
              v-model="form.password"
              type="password"
              name="password"
              :label="$t('login.passwordLabel')"
              :rules="[{ validator: validatePass }]"
            />
          </van-cell-group>
          <div style="margin: 16px">
            <van-button round block type="primary" native-type="submit">{{
              $t('login.submitBut')
            }}</van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user.js'
const user = useUserStore()
const { $t } = getCurrentInstance().proxy
const form = ref({
  email: '',
  password: '',
})
const pattern = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/
//密码验证法则：
const passwoedPattern =
  /^((?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[!@#$%^&*()_+\-\=])|(?=.*\d)(?=.*[!@#$%^&*()_+\-\=]))[A-Za-z\d!@#$%^&*()_+\-\=]{8,}$/
// 校验函数返回 true 表示校验通过，false 表示不通过
const validator = (val) => {
  let isValidEmail = pattern.test(val)
  if (!isValidEmail) {
    return '邮箱格式错误'
  }
}
const validatePass = (value) => {
  if (value === '' || !passwoedPattern.test(value)) {
    return '密码格式错误'
  }
}

const onSubmit = async (values) => {
  //   console.log('submit', values)
  if (values.password === '') {
    return showToast('password cannot be empty')
  }
  if (values.email === '') {
    return showToast('Email cannot be empty')
  }
  try {
    user.toLogin(values)
  } catch (err) {
    if (err.indexOf('Email already exists') != -1) {
      form.value.password = ''
      activeName.value = 'login'
    }
    console.error(err)
  }
}
</script>
<style scoped>
.login {
  width: 100%;
  height: 100%;
  background: #f9f9fb;
  position: relative;
}
.warp {
  width: 90%;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(152, 152, 152, 0.4);
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  padding: 30px 0;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.warp .title {
  font-weight: 500;
  font-size: 25px;
  color: #343434;
  line-height: 30px;
  margin-bottom: 30px;
  text-align: center;
}
::v-deep(.van-cell) {
  border-bottom: 0.5px solid rgba(152, 152, 152, 0.4);
}
::v-deep(.van-cell:after) {
  border: 0;
}
</style>