import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginUser } from '@/api/login.js'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
export const useUserStore = defineStore(
  'user',
  () => {
    //定义管理用户数据的state
    const userInfo = ref(null)
    const token = ref('')
    const router = useRouter()
    const route = useRoute()
    // 定义获取接口数据的action函数
    //登录
    const toLogin = async (login) => {
      try {
        const res = await loginUser(login)
        if (res.data.token) {
          token.value = res.data.token
          localStorage.setItem('token', token.value)
        }
        userInfo.value = res.data.user_info
        showToast('登录成功')
        let redirectPath = route.query.redirect || '/'
        router.push(redirectPath, 500)
      } catch (error) {
        console.error(error)
      }
    }
    const isLoggedIn = computed(() => !!userInfo.value)
    // 以对象的形式把state和action return出去
    return {
      userInfo,
      token,
      toLogin,
      isLoggedIn,
    }
  },
  {
    persist: true,
  },
)
