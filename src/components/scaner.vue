<template>
  <div class="scaner" ref="scaner">
    <van-notify v-model:show="showBanner" type="danger" duration="3000">
      <van-icon class="close_icon" name="close" @click="() => showBanner = false" />
      <p class="text">{{$t("scaner.notifyText")}}</p>
    </van-notify>
    <div class="cover">
      <p class="line"></p>
      <span class="square top left"></span>
      <span class="square top right"></span>
      <span class="square bottom right"></span>
      <span class="square bottom left"></span>
      <p class="tips">{{$t("scaner.tips")}}</p>
    </div>
    <video
      v-show="showPlay"
      class="source"
      ref="video"
      :width="videoWH.width"
      :height="videoWH.height"
      controls
    ></video>
    <canvas v-show="!showPlay" ref="canvas" />
    <button v-show="showPlay" @click="run">{{$t("scaner.startBtn")}}</button>
    <!-- <div class="loaded">
        <button class="btns" @click="clickFile">选择二维码</button>
        <input type="file" name="file" hidden ref="file" @change="fileChange">
    </div> -->
  </div>
</template>

<script setup name="scaner">
import { ref, onMounted, defineProps,getCurrentInstance,
computed,watch, onBeforeUnmount,defineEmits} from "vue";
import adapter from 'webrtc-adapter';
import jsQR from 'jsqr';
const { $t } = getCurrentInstance().proxy;
const showPlay = ref(false);
const showBanner = ref(false);
const containerWidth = ref(null);
const active = ref(false);
const video = ref(null);
const canvas = ref(null);
const file = ref(null);
const emit = defineEmits(["code-scanned","error-captured"]);
const previousCode = ref(null);
const parity = ref(0);
const context = computed(()=>canvas.value.getContext('2d'));
const props = defineProps({
    // 使用后置相机
    useBackCamera: {
      type: Boolean,
      default: true
    },
    // 扫描识别后停止
    stopOnScaned: {
      type: Boolean,
      default: true
    },
    drawOnfound: {
      type: Boolean,
      default: true
    },
    // 线条颜色
    lineColor: {
      type: String,
      default: '#03C03C'
    },
    // 线条宽度
    lineWidth: {
      type: Number,
      default: 2
    },
    // 视频宽度
    videoWidth: {
      type: Number,
      default: document.documentElement.clientWidth || document.body.clientWidth
    },
    // 视频高度
    videoHeight: {
      type: Number,
      default: document.documentElement.clientHeight - 48 || document.body.clientHeight - 48
    },
    responsive: {
      type: Boolean,
      default: false
    }
});
const clickFile = () => {
  file.value.click();
}
const fileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = new Image();
      imageData.onload = () => {
        canvas.value.width = imageData.width / 2;
        canvas.value.height = imageData.height / 2;
        context.value.drawImage(imageData, 0, 0, canvas.value.width, canvas.value.height);
        const imageDataArray = context.value.getImageData(0, 0, canvas.value.width, canvas.value.height).data;
        const code = jsQR(imageDataArray, canvas.value.width, canvas.value.height);
        if (code) {
          // console.log('QR Code Data:', code.data);
          emit("code-scanned", code.data);
          // found(code.data);
        } else {
          console.error('QR Code not found');
        }
      };
      imageData.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
const videoWH = computed(() => {
  if (containerWidth.value) {
    const width = containerWidth.value;
    const height = width * 0.75;
    return { width, height };
  }
  return { width: props.videoWidth, height: props.videoHeight };
});

const fullStop = () => {
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach(t => t.stop());
  }
};

const drawLine = (begin, end) => {
  context.value.beginPath();
  context.value.moveTo(begin.x, begin.y);
  context.value.lineTo(end.x, end.y);
  context.value.lineWidth = props.lineWidth;
  context.value.strokeStyle = props.lineColor;
  context.value.stroke();
};

const drawBox = (location) => {
  if (props.drawOnfound) {
    drawLine(location.topLeftCorner, location.topRightCorner);
    drawLine(location.topRightCorner, location.bottomRightCorner);
    drawLine(location.bottomRightCorner, location.bottomLeftCorner);
    drawLine(location.bottomLeftCorner, location.topLeftCorner);
  }
};

const tick = () => {
  if (video.value && video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
    canvas.value.height = videoWH().height;
    canvas.value.width = videoWH().width;
    context.value.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
    const imageData = context.value.getImageData(0, 0, canvas.value.width, canvas.value.height);
    let code = false;
    try {
      code = jsQR(imageData.data, imageData.width, imageData.height);
    } catch (e) {
      console.error(e);
    }
    if (code) {
      drawBox(code.location);
      found(code.data);
    }
  }
  run();
};

const inits = () => {
  if (props.responsive) {
    nextTick(() => {
      containerWidth.value = scaner.value.clientWidth;
    });
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    previousCode.value = null;
    parity.value = 0;
    active.value = true;

    const facingMode = props.useBackCamera ? { exact: 'environment' } : 'user';
    const handleSuccess = stream => {
      video.value.srcObject = stream;
      video.value.playsInline = true;
      const playPromise = video.value.play();
      playPromise.catch(() => (showPlay.value = true));
      playPromise.then(run);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then(handleSuccess)
      .catch(() => {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(handleSuccess)
          .catch(error => {
            emit("error-captured", error);
          });
      });
  }
};

const run = () => {
  if (active.value) {
    requestAnimationFrame(tick);
  }
};

const found = (code) => {
  if (previousCode.value !== code) {
    previousCode.value = code;
  } else if (previousCode.value === code) {
    parity.value += 1;
  }
  if (parity.value > 2) {
    active.value = props.stopOnScaned ? false : true;
    parity.value = 0;
    emit("code-scanned", code);
  }
};

onMounted(() => {
  inits();
  showBanner.value = true;
});

onBeforeUnmount(() => {
  fullStop();
});

watch(active, (newActive) => {
  if (!newActive) {
    fullStop();
  }
}, { immediate: true });
</script>

<style lang="css" scoped>
.scaner {
  background: rgba(0,0,0,0.8);
  width: 100%;
  height: 100%;
  position: relative;
}
.scaner .text {
  padding: 0;
  margin: 0;
  color: #FFFFFF;
  font-size: 12px;
  text-align: justify;
  text-align-last: left;
  width: 90%;
}
.scaner .close_icon {
  display: inline-block;
  font-size: 20px;
  position: absolute;
  right: 5px;
  top: 8px;
}
.scaner .cover {
  height: 220px;
  width: 220px;
  position: absolute;
  top:50%;
  left:50%;
  -webkit-transform: translate(-50%,-50%);
  -moz-transform: translate(-50%,-50%);
  -ms-transform: translate(-50%,-50%);
  -o-transform: translate(-50%,-50%);
  transform: translate(-50%,-50%);
  border: .5px solid #999999;
  z-index: 1111;
}
.scaner .cover .line {
  width: 200px;
  height: 1px;
  margin-left: 10px;
  background: #02a6f7;
  background: linear-gradient(to right, transparent, #02a6f7, #00A0F0, #02a6f7, transparent);
  position: absolute;
  -webkit-animation: scan 1.75s infinite linear;
  -moz-animation: scan 1.75s infinite linear;
  -ms-animation: scan 1.75s infinite linear;
  -o-animation: scan 1.75s infinite linear;
  animation: scan 1.75s infinite linear;
  -webkit-animation-fill-mode: both;
  -moz-animation-fill-mode: both;
  -ms-animation-fill-mode: both;
  -o-animation-fill-mode: both;
  animation-fill-mode: both;
  border-radius: 1px;
}
.scaner .cover .square {
  display: inline-block;
  height: 20px;
  width: 20px;
  position: absolute;
}
.scaner .cover .square.top {
  top: 0;
  border-top: 1px solid #02a6f7;
}
.scaner .cover .square.left {
  left: 0;
  border-left: 1px solid #02a6f7;
}
.scaner .cover .square.bottom {
  bottom: 0;
  border-bottom: 1px solid #02a6f7;
}
.scaner .cover .square.right {
 right: 0;
  border-right: 1px solid #02a6f7;
}
.scaner .cover .tips {
  position: absolute;
  bottom: -55px;
  width: 100%;
  font-size: 14px;
  color: #fff;
  opacity: 0.8;
}
@-webkit-keyframes scan {
  0% {top: 0}
  25% {top: 50px}
  50% {top: 100px}
  75% {top: 150px}
  100% {top: 200px}
}
@-moz-keyframes scan {
  0% {top: 0}
  25% {top: 50px}
  50% {top: 100px}
  75% {top: 150px}
  100% {top: 200px}
}
@-o-keyframes scan {
  0% {top: 0}
  25% {top: 50px}
  50% {top: 100px}
  75% {top: 150px}
  100% {top: 200px}
}
@keyframes scan {
  0% {top: 0}
  25% {top: 50px}
  50% {top: 100px}
  75% {top: 150px}
  100% {top: 200px}
}
.scaner .loaded{
    width: 100%;
    position: absolute;
    bottom: 90px;
}
.scaner .loaded .btns{
    width: 150px;
    display: block;
    margin: 0 auto;
    background-color: #009FF1;
    color: #FFFFFF;
    border-radius: 8px;
    font-size: 16px;
    line-height: 30px;
    border: 0;
    outline: none;
}
</style>
