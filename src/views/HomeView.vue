<template>
  <div class="scan">
    <div class="nav">
      <img src="@/assets/Elecrow-LOGO.webp" alt="Elecrow-LOGO" />
    </div>
    <h1 class="title">{{ $t('home.title') }}</h1>
    <div class="scroll-container">
      <qrcode-scan v-on:code-scanned="codeScanned"></qrcode-scan>
      <!-- <Scaner
        v-on:code-scanned="codeScanned"
        v-on:error-captured="errorCaptured"
        :stop-on-scanned="true"
        :draw-on-found="true"
        :responsive="false"
      /> -->
    </div>
    <van-dialog
      v-model:show="show"
      :title="$t('home.result')"
      :confirmButtonText="$t('home.confirmBtn')"
      @confirm="toSubmit"
    >
      <div class="popup-content">
        <div class="popup-text" v-if="text !== ''">{{ text }}</div>
      </div>
    </van-dialog>
  </div>
</template>
<script setup>
import { onMounted, ref, getCurrentInstance } from 'vue'
// import Scaner from '@/components/scaner.vue'
import QrcodeStream from '@/components/qrcode-scan.vue'
import { showToast } from 'vant'
import { addTrackers } from '@/api/scan.js'
const { $t } = getCurrentInstance().proxy
const show = ref(false)
const form = ref({})
const text = ref('')
const codeScanned = (code) => {
  // showToast(code)
  text.value = code
  var arr = code.split('"').filter((item) => item !== '')
  arr.map((item) => {
    let key = item.split(':')
    if (key.length > 1) {
      form.value[key[0]] = key[1]
    }
  })
  show.value = true
}
const toSubmit = async () => {
  show.value = false
  alert(JSON.stringify(form.value))
  // try {
  //   const res = await addTrackers(form.value)
  //   if (res.code === 200) {
  //     showToast('添加成功')
  //     setTimeout(() => {
  //       $router.push('/')
  //     }, 1000)
  //   }
  // } catch (error) {
  //   showToast(error.message)
  // }
}

// const errorCaptured = (error) => {
//   switch (error.name) {
//     case 'NotAllowedError':
//       errorMessage.value = $t('home.allowedError')
//       break
//     case 'NotFoundError':
//       errorMessage.value = $t('home.foundError')
//       break
//     case 'NotSupportedError':
//       errorMessage.value = $t('home.supportedError')
//       break
//     case 'NotReadableError':
//       errorMessage.value = $t('home.readableError')
//       break
//     case 'OverconstrainedError':
//       errorMessage.value = $t('home.constrainedError')
//       break
//     default:
//       errorMessage.value = $t('home.unknownError') + error.message
//   }
//   showFailToast(errorMessage.value)
// }
onMounted(() => {
  // var str = navigator.userAgent.toLowerCase()
  // var ver = str.match(/cpu iphone os (.*?) like mac os/)
  // if (ver && ver[1].replace(/_/g, '.') < '10.3.3') {
  //   showFailToast($t('home.failText'))
  // }
})
</script>
<style scoped>
.scan {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.scan .nav {
  width: 100%;
  padding: 10px 0;
}
.scan .nav img {
  display: block;
  width: 226px;
  height: 50px;
  margin: 0 auto;
  border: 0;
}
.scan .title {
  padding: 0;
  margin: 0;
  font-size: 16px;
  line-height: 40px;
  text-align: center;
}
.scroll-container {
  flex: 1;
  height: 100%;
}
.popup-content {
  padding: 12px;
}
.popup-content .popup-text {
  word-break: break-all;
  font-size: 16px;
  line-height: 25px;
}
</style>