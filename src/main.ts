import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

let globalStream = null;

async function listCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const videoSourceSelect = document.getElementById('videoSource');
    if (!videoSourceSelect) {
        console.error('Dropdown for video sources not found!');
        return;
    }
    videoSourceSelect.innerHTML = '';
    videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        videoSourceSelect.appendChild(option);
    });
}

async function refreshCamera() {
    if (globalStream) {
        globalStream.getTracks().forEach(track => track.stop());
    }
    const videoSourceSelect = document.getElementById('videoSource');
    const facingModeSelect = document.getElementById('facingMode');
    const cameraTypeSelect = document.getElementById('cameraType');

    if (!videoSourceSelect || !facingModeSelect || !cameraTypeSelect) {
        console.error('One or more camera selection controls are missing!');
        return;
    }

    const constraints = {
        video: {
            deviceId: videoSourceSelect.value ? { exact: videoSourceSelect.value } : undefined,
            facingMode: facingModeSelect.value,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
        },
    };

    try {
        globalStream = await navigator.mediaDevices.getUserMedia(constraints);
        await initializeSession(globalStream, cameraTypeSelect.value);
    } catch (error) {
        console.error('Error accessing the camera', error);
    }
}

async function initializeSession(stream, cameraType) {
    const apiToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzExNjAxNjAyLCJzdWIiOiIyY2ZkMzFiZC1lMWFmLTQ1N2QtYWJmYy1hOThhNzkzMzRlMWZ-U1RBR0lOR34wOTM2YTE4NC00NjJiLTQ5YjgtOGZjYi05YzAwMDNmMmUwNzUifQ.xEpM3aiqXNU6uIM6w70BfsWag42WdXt3wnGv-hckOUk";
    const cameraKit = await bootstrapCameraKit({ apiToken });
    const canvas = document.getElementById('my-canvas');

    if (!canvas) {
        console.error('Canvas element for video output not found!');
        return;
    }
    const source = createMediaStreamSource(stream, { cameraType });
    const session = await cameraKit.createSession({ liveRenderTarget: canvas });
    await session.setSource(source);
    await source.setRenderSize(1920, 1080);

    const lensId = "1bce51d2-98c9-48d4-bb81-8f935b17fd12";
    const groupId = "663f5bb4-e694-4260-862f-8979394d866a";
    const lens = await cameraKit.lensRepository.loadLens(lensId, groupId);
    await session.applyLens(lens);
    await session.play();

    console.log("Lens rendering has started!");
}

async function getOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            let permission = await DeviceOrientationEvent.requestPermission();
            if (permission === "granted") {
                setupOrientationEvent();
            } else {
                alert("Permission not granted for device orientation");
            }
        } catch (error) {
            console.error("Error requesting device orientation permission:", error);
        }
    } else {
        setupOrientationEvent();
    }
}

function setupRecording() {
    const canvas = document.getElementById('my-canvas');
    const startRecordingButton = document.getElementById('startRecording');
    const stopRecordingButton = document.getElementById('stopRecording');
    const downloadButton = document.getElementById('downloadRecording');
    let mediaRecorder;
    let recordedChunks = [];

    startRecordingButton.addEventListener('click', () => {
        recordedChunks = [];
        const stream = canvas.captureStream(30);
        let options = {};
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4', bitsPerSecond: 1000000 };
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
            options = { mimeType: 'video/webm; codecs=vp9', bitsPerSecond: 1000000 };
        } else {
            console.error('Neither MP4 nor VP9 codecs are supported.');
        }
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
            const fileType = options.mimeType.split(';')[0].split('/')[1];
            const blob = new Blob(recordedChunks, { type: options.mimeType });
            downloadButton.href = URL.createObjectURL(blob);
            downloadButton.download = `AR-recorded-video.${fileType}`;
            downloadButton.style.display = 'inline';
        };
        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
    });

    stopRecordingButton.addEventListener('click', () => {
        mediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
    });
}

function setupDeviceEvents() {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = function() {
        console.log('WebSocket connection established');
    };

    ws.onerror = function(error) {
        console.error("WebSocket Error: ", error);
    };

    window.addEventListener("deviceorientation", function (e) {
        const orientationData = {
            type: 'orientation',
            alpha: e.alpha,
            beta: e.beta,
            gamma: e.gamma
        };
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(orientationData));
            window.dispatchEvent(new CustomEvent('orientationData', { detail: orientationData }));
        }
    });

    window.addEventListener("devicemotion", function (e) {
        const motionData = {
            type: 'motion',
            acceleration: e.acceleration,
            accelerationIncludingGravity: e.accelerationIncludingGravity,
            rotationRate: e.rotationRate,
            interval: e.interval
        };
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(motionData));
            window.dispatchEvent(new CustomEvent('motionData', { detail: motionData }));
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await listCameras();
    document.getElementById('refreshCamera')?.addEventListener('click', refreshCamera);
    document.getElementById('refreshCamera')?.addEventListener('click', setupDeviceEvents);
    document.getElementById('get-orientation').addEventListener('click', getOrientation);
    setupRecording();
    setupDeviceEvents();
});

function setupOrientationEvent() {
    window.addEventListener("deviceorientation", function (e) {
        let requestBtn = document.querySelector("#get-orientation");
        if (requestBtn) { requestBtn.remove(); }

        document.getElementById('alpha').textContent = `Alpha: ${e.alpha.toFixed(1)}°`;
        document.getElementById('beta').textContent = `Beta: ${e.beta.toFixed(1)}°`;
        document.getElementById('gamma').textContent = `Gamma: ${e.gamma.toFixed(1)}°`;
        document.getElementById('orientation').textContent = `Orientation: ${Math.abs(e.beta) > Math.abs(e.gamma) ? "portrait" : "landscape"}`;
    });
}