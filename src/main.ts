import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

async function initializeCamera() {
    const apiToken = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzExNjAxNjAyLCJzdWIiOiIyY2ZkMzFiZC1lMWFmLTQ1N2QtYWJmYy1hOThhNzkzMzRlMWZ-U1RBR0lOR34wOTM2YTE4NC00NjJiLTQ5YjgtOGZjYi05YzAwMDNmMmUwNzUifQ.xEpM3aiqXNU6uIM6w70BfsWag42WdXt3wnGv-hckOUk";
    const cameraKit = await bootstrapCameraKit({ apiToken });
    const canvas = document.getElementById('my-canvas')as HTMLCanvasElement;
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Adjust canvas display size based on the device
    canvas.style.width = isMobile ? '350px' : '1080px';
    canvas.style.height = isMobile ? '605px' : '607px';

    const session = await cameraKit.createSession({ liveRenderTarget: canvas });
    session.events.addEventListener('error', (event) => {
        console.log('Lens error:', event.detail.error);
    });

    const facingMode = isMobile ? "environment" : "user";
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
    });
    const source = createMediaStreamSource(stream);
    await session.setSource(source);

    // Adjust render size based on the device
    if (isMobile) {
        await source.setRenderSize(1170, 2022);
    } else {
        await source.setRenderSize(1920, 1080);
    }

    const lensId = isMobile ? "1bce51d2-98c9-48d4-bb81-8f935b17fd12" : "50507980875";
    const groupId = "663f5bb4-e694-4260-862f-8979394d866a";

    const lens = await cameraKit.lensRepository.loadLens(lensId, groupId);
    await session.applyLens(lens);

    await session.play();
    console.log("Lens rendering has started!");
}

// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loadCameraButton = document.getElementById('loadCameraButton');
    if (loadCameraButton) {
        loadCameraButton.addEventListener('click', initializeCamera);
    } else {
        console.error('Load camera button not found');
    }
});
