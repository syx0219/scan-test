<template>
  <div>
    <!-- 核心扫码组件 -->
    <qrcode-stream
      v-if="isCameraActive"
      :constraints="cameraConfig"
      @detect="onDetect"
      @error="onCameraError"
    >
      <!-- 扫码界面遮罩 -->
      <div class="overlay">
        <div class="scan-frame"></div>
        <div class="tip-text">对准二维码到框内</div>
      </div>
    </qrcode-stream>
    <!-- 权限提示 -->
    <div v-if="showPermissionAlert" class="permission-alert">
      <van-icon name="warning" size="24px" />
      <p>需要摄像头权限才能扫码</p>
      <van-button type="primary" @click="retryCamera">重新授权</van-button>
    </div>
    <!-- 操作按钮组 -->
    <div class="button-group">
      <!-- 切换摄像头按钮 -->
      <van-button class="switch-camera-btn" type="primary" round @click="switchCamera">
        {{ cameraType === 'user' ? '后置摄像头' : '前置摄像头' }}
      </van-button>
      <!-- 关闭按钮 -->
      <van-button class="close-btn" type="danger" round @click="handleClose">关闭</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
const isCameraActive = ref(false);
const showPermissionAlert = ref(false);
const cameraType = ref("environment"); // 'user' 前置 | 'environment' 后置
const isScanning = ref(true); // 控制是否继续扫描
let successTimer = ref();
let errorTimer = ref();
 // 计算摄像头配置
const cameraConfig = computed(() => ({
    facingMode: cameraType.value,
})); 
// 切换摄像头
const switchCamera = () => {
    cameraType.value = cameraType.value === "user" ? "environment" : "user";
    // 重新初始化摄像头
    initCamera();
};
// 扫码结果处理
const onDetect = (result) => {
    if (!isScanning.value) return; // 如果已停止扫描，不处理结果
    const decodedText = result[0]?.rawValue;
    console.log(decodedText)
}
// 摄像头错误处理
const onCameraError = async (error) => {
    console.error("摄像头错误:", error);
    if (error.name === "NotAllowedError") {
        showPermissionAlert.value = true;
    } else if (error.name === "NotFoundError") {
    // console.log("未找到摄像头", "未找到摄像头");
        showToast("未找到摄像头");
    }
};
// 重新尝试授权
const retryCamera = () => {
    showPermissionAlert.value = false;
    initCamera();
};
// 初始化摄像头
const initCamera = async () => {
    try {
        let devices = await navigator.mediaDevices.enumerateDevices();
        let videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
        );
        /*    console.log(videoDevices.length > 0,'videoDevices');
           console.log(videoDevices[0].deviceId !== '','videoDevices');*/
        // 权限检测逻辑（通过 deviceId 是否为空判断）
        const hasPermission = videoDevices.length > 0 && videoDevices[0].deviceId !== '';
        // console.log('hasPermission-是否已获取摄像头权限',hasPermission)
        // 未获取权限时的处理
        if (!hasPermission) {
            // console.log('尚未获得摄像头权限，开始请求权限...');
            //触发权限弹窗并获取流
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: cameraType.value }
            });
            //停止初始化的媒体流（仅用于触发权限）
            stream.getTracks().forEach(track => track.stop());
            // 重新枚举获取完整设备列表
            devices = await navigator.mediaDevices.enumerateDevices();
            videoDevices = devices.filter(device => device.kind === "videoinput");
        }
        // console.log("可用摄像头:", videoDevices);
        if (videoDevices.length === 0) {
            throw new Error("NotFoundError");
        }
        isCameraActive.value = true;
        isScanning.value = true; // 确保扫描状态为开启
        /*    console.log("当前选择的摄像头类型:", cameraType.value);
           console.log("可用摄像头列表:", videoDevices);*/
    } catch (error) {
        await onCameraError(error);
    }
};
// 关闭扫码
const handleClose = () => {
    isScanning.value = false;
    isCameraActive.value = false;
    router.go(-1);
};
onMounted(() => {
    initCamera();
});
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
    height: 80%;
    pointer-events: none;
}

.scan-frame {
    position: relative;
    border: 2px solid #07c160;
    height: 60%;
    margin: 20% auto;
    border-radius: 4px;
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.5);
    clip-path: inset(0 0 0 0);
}

/* 扫描线动画 */
.scan-frame::after {
    content: "";
    osition: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, transparent, #07c160, transparent);
    animation: scan-line 2s linear infinite;
    box-shadow: 0 0 10px #07c160;
}

/* 四个角的装饰 */
.scan-frame::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    border-image: linear-gradient(45deg, #07c160, transparent, #07c160) 1;
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
        box-shadow: 0 0 5px #07c160;
    }
    50% {
        box-shadow: 0 0 20px #07c160;
    }
    100% {
        box-shadow: 0 0 5px #07c160;
    }
}

.tip-text {
    color: white;
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    text-shadow: 0 0 5px rgba(7, 193, 96, 0.5);
}

.button-group {
    position: fixed;
    bottom: 30px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 20px;
    z-index: 10000;
}

.switch-camera-btn,.close-btn {
    min-width: 120px;
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