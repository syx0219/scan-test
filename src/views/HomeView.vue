<template>
  <div class="home">
    <div class="nav">
      <img src="@/assets/Elecrow-LOGO.webp" alt="Elecrow-LOGO" />
    </div>
    <div class="tips">
      <p class="tips_title">Elecrow Scan</p>
      <p class="tips_descript">Scan QRcode By Your Browser</p>
    </div>
    <van-button type="primary" class="button" @click="router.push('/scan')">{{
      $t('home.startScan')
    }}</van-button>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const { $t } = getCurrentInstance().proxy
const router = useRouter()
onMounted(() => {
  localStorage.setItem('token', '9f02d361abe3c9b000b7a2dc8f121a8f')
})
</script>

<style>
.home {
  height: 100%;
  background: #f0f8ff;
  position: relative;
}
.home .nav {
  width: 100%;
  padding: 10px 0;
}
.home .nav img {
  display: block;
  width: 226px;
  height: 50px;
  margin: 0 auto;
  border: 0;
}
.tips {
  width: 100%;
  position: absolute;
  bottom: 50%;
  left: 0;
  padding-top: 200px;
  color: #259cfd;
  text-align: center;
  animation: move 5s ease-in-out infinite;
  animation-fill-mode: both;
}
.tips p {
  padding: 0;
  margin: 0;
}
.tips .tips_title {
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15);
}
.tips .tips_descript {
  font-size: 20px;
  padding-top: 12px;
}
.button {
  height: 56px;
  width: 246px;
  line-height: 56px;
  background-size: 100% 100%;
  position: absolute;
  bottom: 72px;
  left: 50%;
  margin-left: -123px;
  outline: none;
  border: none;
  -webkit-appearance: none;
  user-select: none;
  color: #ffffff;
  font-size: 18px;
  filter: drop-shadow(1px 1px 5px rgba(0, 0, 0, 0.25));
}

@keyframes move {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(36px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
