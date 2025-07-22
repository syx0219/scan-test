<template>
  <div class="scan">
    <h1 class="title">
      <van-icon name="arrow-left" @click="router.back()" />
      <span>{{ $t('home.title') }}</span>
    </h1>
    <div class="scroll-container">
      <qrcode-scan v-on:code-scanned="codeScanned"></qrcode-scan>
    </div>
    <!-- :confirmButtonText="$t('home.confirmBtn')" -->
    <van-dialog
      v-model:show="show"
      :title="$t('home.result')"
      :confirmButtonText="'close'"
      @confirm="toSubmit"
    >
      <div class="popup-content">
        <!-- <div class="popup-text" v-if="text">{{ text }}</div> -->
        <div class="popup-text" v-if="text">
          <p>DEV_EUI:{{ text.dev_eui }}</p>
          <p>APP_EUI:{{ text.app_eui }}</p>
          <p>APP_KEY:{{ text.app_key }}</p>
          <p>SN:{{ text.sn }}</p>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script setup>
import { ref, getCurrentInstance } from 'vue'
import QrcodeStream from '@/components/qrcode-scan.vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { addTrackers } from '@/api/scan.js'
const router = useRouter()
const { $t } = getCurrentInstance().proxy
const show = ref(false)
const form = ref({})
const text = ref(null)
const codeScanned = (code) => {
  // showToast(code)
  text.value = JSON.parse(code)
  showToast(text.value)
  // text.value = code
  // show.value = true
}
const toSubmit = async () => {
  show.value = false
  try {
    // const res = await addTrackers(form.value)
    const res = await addTrackers({
      dev_eui: '70B3D57ED006EC52',
      app_eui: 'DF565DFDFDFCCCDD',
      app_key: 'BB48F276F36B19B238B8E9C7D8E79558',
      sn: 'TRAL2252400100001',
    })
    if (res.code === 200) {
      showToast($t('home.addSuccess'))
      // setTimeout(() => {
      router.back()
      // }, 500)
    }
  } catch (error) {
    // console.error(error)
    showToast(error)
  }
}
</script>
<style scoped>
.scan {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.scan .title {
  padding: 0;
  margin: 0;
  font-size: 16px;
  line-height: 40px;
  height: 40px;
  text-align: center;
  background-color: #259cfd;
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 0 10px;
}
.scan .title span {
  display: block;
  flex: 1;
  text-align: center;
}
.scroll-container {
  flex: 1;
  height: 100%;
}
.popup-content {
  padding: 12px;
}
.popup-content .popup-text p {
  word-break: break-all;
  font-size: 16px;
  line-height: 25px;
  margin: 5px 0;
  padding: 0;
}
</style>