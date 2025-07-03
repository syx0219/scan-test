<template>
  <div class="scan">
    <div class="nav">
      <img src="@/assets/Elecrow-LOGO.webp" alt="Elecrow-LOGO">
    </div>
    <h1 class="title">{{$t("home.title")}}</h1>
    <div class="scroll-container">
      <qrcode-stream @click="handleClick" :paused="scanPause" :track="paintOutLineAndCenterText" 
      @error="errorCaptured" @camera-on="onCameraOn">
        <div v-if="!cameraReady">
          loading...
        </div>
    </qrcode-stream>
      <!-- <Scaner
        v-on:code-scanned="codeScanned"
        v-on:error-captured="errorCaptured"
        :stop-on-scanned="true"
        :draw-on-found="true"
        :responsive="false"
      /> -->
    </div>
    <van-dialog v-model:show="show" :title="$t('home.result')"
     :confirmButtonText="$t('home.confirmBtn')" @confirm="toSubmit">
      <div class="popup-content">
        <div class="popup-text" v-if="form !== {}">
          <p>DEV_EUI: {{form.dev_eui}}</p>
          <p>APP_EUI: {{form.app_eui}}</p>
          <p>APP_KEY: {{form.app_key}}</p>
          <p>SN: {{form.sn}}</p>
        </div>
        <div class="popup-error" v-if="errorMessage !== ''">{{ errorMessage }}</div>
      </div>
    </van-dialog>
  </div>
</template>
<script setup>
import {onMounted, ref,getCurrentInstance} from 'vue';
// import Scaner from '@/components/scaner.vue';
import { QrcodeStream } from "vue-qrcode-reader";
const { $t } = getCurrentInstance().proxy;
const errorMessage = ref("");
const show = ref(false);
const form = ref({});
const scanPause = ref(false);
const cameraReady = ref(false);
const reactAngles = ref([]);
const codeScanned = (code) => {
  var arr = code.split('"').filter(item => item !== "");
  arr.map(item => {
    let key = item.split(':');
    if (key.length > 1) {
      form.value[key[0]] = key[1];
    }
  })
  show.value = true;
}
const toSubmit = () => {
  show.value = false;
  console.log(form.value);
}
const errorCaptured = (error) => {
  switch (error.name) {
    case "NotAllowedError":
      errorMessage.value = $t("home.allowedError");
      break;
    case "NotFoundError":
      errorMessage.value = $t("home.foundError");
      break;
    case "NotSupportedError":
      errorMessage.value = $t("home.supportedError");
      break;
    case "NotReadableError":
      errorMessage.value = $t("home.readableError");
      break;
    case "OverconstrainedError":
      errorMessage.value = $t("home.constrainedError");
      break;
    default:
      errorMessage.value = $t("home.unknownError") + error.message;
  }
  showFailToast(errorMessage.value);
}
const onCameraOn = function () {
  cameraReady.value = true;
}
const paintOutLineAndCenterText = (detectedCodes, ctx) => {
  // 暂停页面
  scanPause.value = true;
  // 播放语音
  // audioRef.value.play();
  // 画边框和文本
  reactAngles.value.splice();
  for (const detectedCode of detectedCodes) {
    // 画边框
    ctx.lineWidth = 1;
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints
    ctx.strokeStyle = 'red'
    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath();
    ctx.stroke();
    // 画文字
    const { boundingBox, rawValue } = detectedCode
    const centerX = boundingBox.x + boundingBox.width / 2
    const centerY = boundingBox.y + boundingBox.height / 2
    const fontSize = Math.max(12, (50 * boundingBox.width) / ctx.canvas.width)
    console.log(boundingBox.width, ctx.canvas.width)
    ctx.lineWidth = 2;
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#35e5a7'
    ctx.strokeText('>', centerX, centerY)
    // 配置矩形内容
    if (detectedCode.cornerPoints.length==4) {
      reactAngles.value.push({
        leftTop: {x: firstPoint.x, y:firstPoint.y},
        rightTop: {x: otherPoints[0].x, y:otherPoints[0].y},
        rightBottom: {x: otherPoints[1].x, y:otherPoints[1].y},
        leftBottom: {x: otherPoints[2].x, y:otherPoints[2].y},
        text: detectedCode.rawValue
      });
    }
  }
};
// 获取事件的发生位置
const getEventPosition = (ev) => {
  var x, y;
  if (ev.layerX || ev.layerX == 0) {
    x = ev.layerX;
    y = ev.layerY;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    x = ev.offsetX;
    y = ev.offsetY;
  }
  return {x: x, y: y};
};
const handleClick = function (event) {
  // 1. 获取点击点的位置
  var eventPosition = getEventPosition(event);
  // 2. 判断在不在已有的矩形内部，在的话获取二维码解析的结果，并进行业务处理
  var resolveText = handleClickRectAngle(eventPosition);
  if (resolveText != undefined) {
    alert(resolveText);
  }
  // 3. 业务处理完，如果决定跳转就跳转，不决定跳转的话就关闭暂停
  scanPause.value = false;
}
// 判断一个点在不在某个矩形内部的算法，后面可以采取凸包算法，优化判断的实现，不过这里已经能实现了，没必要深究
const handleClickRectAngle = function (eventPosition) {
  for (let i = 0; i < reactAngles.value.length; i++) {
    let reactAngle = reactAngles.value[i];
    if ( ((eventPosition.x >= Math.min(reactAngle.leftTop.x, reactAngle.leftBottom.x)) && (eventPosition.x  <= Math.max(reactAngle.rightTop.x, reactAngle.rightBottom.x)))
    && ((eventPosition.y >= Math.min(reactAngle.leftTop.y, reactAngle.rightTop.y)) && (eventPosition.y  <= Math.max(reactAngle.leftBottom.y, reactAngle.rightBottom.y)))
    ) {
      return reactAngle.text;
    }
  }
  return undefined;
}
onMounted(() => {
  // var str = navigator.userAgent.toLowerCase(); 
  // var ver = str.match(/cpu iphone os (.*?) like mac os/);
  // if (ver && ver[1].replace(/_/g,".") < '10.3.3') {
  //   showFailToast($t("home.failText"));
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
  padding:10px 0;
}
.scan .nav img{
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
.scroll-container{
  flex: 1;
  height: 100%;
}
.popup-content{
  padding: 0 12px;
}
.popup-content p{
  word-break: break-all;
  font-size: 16px;
  line-height: 25px;
  margin: 5px 0;
}

</style>