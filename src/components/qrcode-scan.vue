<template>
  <div>
    <qrcode-stream
      v-if="isCameraActive"
      :constraints="cameraConfig"
      @detect="onDetect"
      @error="onCameraError"
    >
      <!-- 扫码界面遮罩 -->
      <div class="overlay">
        <div class="scan-frame"></div>
        <div class="tip-text">{{ $t('scaner.tips') }}</div>
      </div>
    </qrcode-stream>
    <!-- 权限提示 -->
    <div v-if="showPermissionAlert" class="permission-alert">
      <van-icon name="warning" size="24px" />
      <p>{{ $t('scaner.notifyText') }}</p>
      <van-button type="primary" @click="retryCamera">{{ $t('scaner.startBtn') }}</van-button>
    </div>
  </div>
</template>

<script setup name="qrcode-scan">
import { ref, computed, onMounted, defineEmits, getCurrentInstance } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
const { $t } = getCurrentInstance().proxy
const isCameraActive = ref(false)
const showPermissionAlert = ref(false)
const cameraType = ref('environment') // 'user' 前置 | 'environment' 后置
const isScanning = ref(true) // 控制是否继续扫描
let successTimer = ref()
let errorTimer = ref()
const errorMessage = ref('')
const emit = defineEmits(['code-scanned'])
// 计算摄像头配置
const cameraConfig = ref(null)
// 扫码结果处理
const onDetect = (result) => {
  if (!isScanning.value) return // 如果已停止扫描，不处理结果
  const decodedText = result[0]?.rawValue
  emit('code-scanned', decodedText)
}
// 摄像头错误处理
const onCameraError = async (error) => {
  // console.error('摄像头错误:', error)
  switch (error.name) {
    case 'NotAllowedError':
      errorMessage.value = $t('home.allowedError')
      break
    case 'NotFoundError':
      errorMessage.value = $t('home.foundError')
      break
    case 'NotSupportedError':
      errorMessage.value = $t('home.supportedError')
      break
    case 'NotReadableError':
      errorMessage.value = $t('home.readableError')
      break
    case 'OverconstrainedError':
      errorMessage.value = $t('home.constrainedError')
      break
    default:
      errorMessage.value = $t('home.unknownError') + error.message
  }
  showFailToast(errorMessage.value)
}
// 重新尝试授权
const retryCamera = () => {
  showPermissionAlert.value = false
  initCamera()
}
// 初始化摄像头
const initCamera = async () => {
  try {
    let devices = await navigator.mediaDevices.enumerateDevices()
    let videoDevices = devices.filter((device) => device.kind === 'videoinput')
    const deviceArr = videoDevices.filter((device) => device.label === 'camera2 3, facing back')
    if (deviceArr.length === 0) {
      cameraConfig.value = {
        facingMode: cameraType.value,
        autoFocus: true,
      }
    } else {
      cameraConfig.value = {
        facingMode: cameraType.value,
        deviceId: deviceArr[0].deviceId,
        autoFocus: true,
        width: 1200,
        height: 800,
      }
    }
    /*    console.log(videoDevices.length > 0,'videoDevices');
           console.log(videoDevices[0].deviceId !== '','videoDevices');*/
    // 权限检测逻辑（通过 deviceId 是否为空判断）
    const hasPermission = videoDevices.length > 0 && videoDevices[0].deviceId !== ''

    // console.log('hasPermission-是否已获取摄像头权限',hasPermission)
    // 未获取权限时的处理
    if (!hasPermission) {
      // console.log('尚未获得摄像头权限，开始请求权限...');
      //触发权限弹窗并获取流
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraType.value,
          autoFocus: true,
        },
      })
      //停止初始化的媒体流（仅用于触发权限）
      stream.getTracks().forEach((track) => track.stop())
      // 重新枚举获取完整设备列表
      devices = await navigator.mediaDevices.enumerateDevices()
      videoDevices = devices.filter((device) => device.kind === 'videoinput')
    }
    // console.log("可用摄像头:", videoDevices);
    if (videoDevices.length === 0) {
      throw new Error('NotFoundError')
    }
    isCameraActive.value = true
    isScanning.value = true // 确保扫描状态为开启
    /*    console.log("当前选择的摄像头类型:", cameraType.value);
           console.log("可用摄像头列表:", videoDevices);*/
  } catch (error) {
    await onCameraError(error)
  }
}
onMounted(() => {
  initCamera()
})
</script>
<style scoped>
.scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 9999;
}
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 100%;
  pointer-events: none;
}

.scan-frame {
  position: relative;
  border: 2px solid #00a0f0;
  height: 60%;
  margin: 20% auto;
  border-radius: 4px;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5);
  clip-path: inset(0 0 0 0);
}

/* 扫描线动画 */
.scan-frame::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, transparent, #00a0f0, transparent);
  animation: scan-line 2s linear infinite;
  box-shadow: 0 0 10px #00a0f0;
}

/* 四个角的装饰 */
.scan-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  border: 2px solid transparent;
  border-image: linear-gradient(45deg, #00a0f0, transparent, #00a0f0) 1;
  animation: border-glow 2s linear infinite;
}

/* 扫描线动画 */
@keyframes scan-line {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    top: 100%;
    opacity: 1;
  }
}

/* 边框发光动画 */
@keyframes border-glow {
  0% {
    box-shadow: 0 0 5px #00a0f0;
  }
  50% {
    box-shadow: 0 0 20px #00a0f0;
  }
  100% {
    box-shadow: 0 0 5px #00a0f0;
  }
}

.tip-text {
  color: #fff;
  text-align: center;
  font-size: 14px;
  text-shadow: 0 0 5px rgba(0, 160, 240, 0.5);
}

.permission-alert {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  width: 80%;
}
.permission-alert button {
  margin-top: 20px;
}
</style>