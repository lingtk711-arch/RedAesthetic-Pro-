import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  Check,
  Copy,
  Sliders,
  Heart,
  BookmarkCheck,
  ArrowRight,
  Maximize2,
  Info,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import {
  ExtractedCameraPaletteResult,
  MorandiColorItem,
  extractMorandiPaletteFromCanvas,
  rgbToHex,
} from '../utils/morandiColorExtractor';

interface CameraColorExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPaletteToCover: (result: ExtractedCameraPaletteResult) => void;
  onGoToContentMode?: () => void;
}

export const CameraColorExtractorModal: React.FC<CameraColorExtractorModalProps> = ({
  isOpen,
  onClose,
  onApplyPaletteToCover,
  onGoToContentMode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sampleLoopRef = useRef<number | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraState, setCameraState] = useState<'idle' | 'streaming' | 'captured' | 'permission_denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveSampleHex, setLiveSampleHex] = useState<string>('#8EA89D');
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedCameraPaletteResult | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isSavedToLibrary, setIsSavedToLibrary] = useState<boolean>(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Initialize camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    // Clean up existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraState('idle');
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('当前浏览器环境不支持直接调用摄像头 API');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setCameraState('streaming');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraState('permission_denied');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? '摄像头访问被拒绝，请在浏览器地址栏允许使用相机权限，或使用下方拍照上传按钮。'
          : '未能启动摄像头视频流，可能设备未连接或权限受限。'
      );
    }
  }, []);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (sampleLoopRef.current) {
      cancelAnimationFrame(sampleLoopRef.current);
      sampleLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Real-time live center sampling loop
  useEffect(() => {
    if (cameraState !== 'streaming' || !videoRef.current) return;

    const sampleCenter = () => {
      const video = videoRef.current;
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 16;
        offCanvas.height = 16;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          // Draw center region
          ctx.drawImage(
            video,
            video.videoWidth / 2 - 8,
            video.videoHeight / 2 - 8,
            16,
            16,
            0,
            0,
            16,
            16
          );
          const pixel = ctx.getImageData(8, 8, 1, 1).data;
          const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
          setLiveSampleHex(hex);
        }
      }
      sampleLoopRef.current = requestAnimationFrame(sampleCenter);
    };

    sampleLoopRef.current = requestAnimationFrame(sampleCenter);

    return () => {
      if (sampleLoopRef.current) {
        cancelAnimationFrame(sampleLoopRef.current);
      }
    };
  }, [cameraState]);

  // Open & Close cycle
  useEffect(() => {
    if (isOpen) {
      setCameraState('idle');
      setCapturedPhotoUrl(null);
      setExtractedResult(null);
      setIsSavedToLibrary(false);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, startCamera, stopCamera]);

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame and extract Morandi palette
  const handleTakeSnapshot = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger flash animation
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 220);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoBase64 = canvas.toDataURL('image/jpeg', 0.85);

    // Stop live stream once photo is taken
    stopCamera();
    setCapturedPhotoUrl(photoBase64);
    setCameraState('captured');

    // Step 1: Immediate instant client-side Morandi analysis (guaranteed instant UI response)
    const instantResult = extractMorandiPaletteFromCanvas(canvas, '自然采光环境');
    setExtractedResult(instantResult);

    // Step 2: Parallel AI multimodal enhancement (fetch rich XHS psychology & flower text)
    setIsAnalyzingAi(true);
    try {
      const res = await fetch('/api/gemini/camera-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoBase64,
          userSceneHint: '手机相机捕捉环境色彩',
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        setExtractedResult(resData.data);
      }
    } catch (err) {
      console.warn('AI camera palette enhancement fallback to instant canvas extraction:', err);
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  // File input fallback (for mobile devices where getUserMedia might be restricted in iframes)
  const handleNativeCameraFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedPhotoUrl(dataUrl);
      setCameraState('captured');

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const instantResult = extractMorandiPaletteFromCanvas(canvas, '拍照上传环境照');
          setExtractedResult(instantResult);
        }
      };
      img.src = dataUrl;

      // Enhance with server API
      setIsAnalyzingAi(true);
      fetch('/api/gemini/camera-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          userSceneHint: '手机相机快照',
        }),
      })
        .then((r) => r.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            setExtractedResult(resData.data);
          }
        })
        .catch((err) => console.warn('AI fallback:', err))
        .finally(() => setIsAnalyzingAi(false));
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setExtractedResult(null);
    setIsSavedToLibrary(false);
    startCamera(facingMode);
  };

  // Copy Hex code
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Save to user's local ambient palette collection
  const handleSaveToPaletteLibrary = () => {
    if (!extractedResult) return;
    try {
      const stored = localStorage.getItem('redaesthetic_ambient_palettes');
      const list = stored ? JSON.parse(stored) : [];
      const newEntry = {
        id: `ambient-${Date.now()}`,
        time: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        title: extractedResult.paletteTitle,
        colors: extractedResult.palette,
        photoUrl: capturedPhotoUrl,
      };
      localStorage.setItem('redaesthetic_ambient_palettes', JSON.stringify([newEntry, ...list].slice(0, 20)));
      setIsSavedToLibrary(true);
      setSavedCount((prev) => prev + 1);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Apply to Draft
  const handleApplyAndClose = () => {
    if (!extractedResult) return;
    onApplyPaletteToCover(extractedResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#CBDED3] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#F0F5F2] via-[#FAFBF9] to-[#F7EDED] border-b border-[#DFEBE3] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A725B] text-white flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-sc font-bold text-base text-[#2A4434]">
                  环境色彩相机捕捉器
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E3EFE8] text-[#2F523D] font-bold border border-[#CBDED3]">
                  莫兰迪小红书美学提纯
                </span>
              </div>
              <p className="text-xs text-[#5D7769] mt-0.5">
                对准眼前桌面、绿植、衣着或自然光影，实时测光并自动提炼符合小红书审美的低饱和色卡
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
            title="关闭取景器"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* CAMERA VIEW / CAPTURED PREVIEW */}
          {cameraState !== 'captured' ? (
            <div className="flex flex-col items-center gap-4">
              {/* Viewfinder Window */}
              <div className="relative w-full max-w-xl aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-[#CBDED3] shadow-inner flex items-center justify-center group">
                {/* Shutter Flash Animation */}
                {isShutterFlashing && (
                  <div className="absolute inset-0 bg-white z-40 animate-fade-out" />
                )}

                {/* Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    cameraState === 'streaming' ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Loading / Starting Indicator */}
                {cameraState === 'idle' && !errorMessage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#8EA89D]" />
                    <span className="text-xs font-medium">正在启动高清摄像头与测光传感器...</span>
                  </div>
                )}

                {/* Permission Denied / Error View */}
                {cameraState === 'permission_denied' && (
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-gray-900 text-white gap-3 z-20">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-1">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-200">未能直接开启摄像头视频流</h4>
                    <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                      {errorMessage || '当前浏览器限制了视频流自动启动。您仍可直接点击下方按钮拍照或上传相册照片。'}
                    </p>
                    <label className="mt-2 px-4 py-2.5 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-semibold cursor-pointer shadow-md transition flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>调用系统原生相机拍照</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleNativeCameraFallback}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Live Viewfinder Overlays (When Streaming) */}
                {cameraState === 'streaming' && (
                  <>
                    {/* Corner Aesthetic Framing Brackets */}
                    <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-white/80 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-white/80 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-white/80 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-white/80 rounded-br-lg pointer-events-none" />

                    {/* Center Focus Reticle with Color Dot */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-20 h-20 rounded-full border border-white/40 flex items-center justify-center animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full border border-white shadow-md transition-colors duration-200" style={{ backgroundColor: liveSampleHex }} />
                        <div className="absolute top-0 w-2 h-[1px] bg-white/70" />
                        <div className="absolute bottom-0 w-2 h-[1px] bg-white/70" />
                        <div className="absolute left-0 w-[1px] h-2 bg-white/70" />
                        <div className="absolute right-0 w-[1px] h-2 bg-white/70" />
                      </div>
                    </div>

                    {/* Top Live Ambient Color Pill */}
                    <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
                      <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-2 border border-white/20 shadow-md">
                        <span className="w-3.5 h-3.5 rounded-full shadow-xs border border-white/40 shrink-0" style={{ backgroundColor: liveSampleHex }} />
                        <span>中心采样色: <code className="font-mono text-[#F3DDE0] font-bold">{liveSampleHex}</code></span>
                        <span className="text-[10px] text-white/70 border-l border-white/20 pl-2">自然漫射光</span>
                      </div>
                    </div>

                    {/* Top Right Flip Camera Button */}
                    <button
                      onClick={handleToggleFacingMode}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition cursor-pointer border border-white/20 shadow-sm"
                      title="翻转后置/前置摄像头"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>

                    {/* Bottom Guide Pill */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
                      <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[10px] flex items-center gap-1.5 border border-white/10">
                        <SunMedium className="w-3 h-3 text-[#E8C5C8]" />
                        <span>建议对准自然光下的器物、织物或绿植，点击快门自动生成色卡</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Shutter Action Controls */}
              {cameraState === 'streaming' && (
                <div className="flex items-center gap-6 mt-1">
                  <label className="p-3 rounded-2xl bg-[#F0F5F2] hover:bg-[#E3EDE6] text-[#2A4434] transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-[#D0E2D6]" title="从相册选取或使用系统相机">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleNativeCameraFallback}
                      className="hidden"
                    />
                    <span>系统相册 / 拍摄</span>
                  </label>

                  {/* Main Shutter Button */}
                  <button
                    onClick={handleTakeSnapshot}
                    className="w-18 h-18 rounded-full bg-white border-4 border-[#4A725B] p-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
                    title="立即拍摄并提取莫兰迪色谱"
                  >
                    <div className="w-full h-full rounded-full bg-[#4A725B] group-hover:bg-[#3B5D49] flex items-center justify-center text-white transition-colors">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    onClick={handleToggleFacingMode}
                    className="p-3 rounded-2xl bg-[#F0F5F2] hover:bg-[#E3EDE6] text-[#2A4434] transition cursor-pointer text-xs font-semibold flex items-center gap-1.5 border border-[#D0E2D6]"
                    title="翻转镜头"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-[#4A725B]" />
                    <span>翻转镜头</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CAPTURED & EXTRACTED RESULTS VIEW */
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left: Captured Photo Frame (5 Cols) */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#CBDED3] shadow-md bg-gray-50">
                    {capturedPhotoUrl && (
                      <img
                        src={capturedPhotoUrl}
                        alt="Captured Environment"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm self-start mb-1 font-medium">
                        📸 现场实拍帧已固化
                      </span>
                      <h4 className="text-xs font-bold leading-tight">
                        {extractedResult?.sceneDetected || '环境美学实景取色'}
                      </h4>
                      <p className="text-[10px] text-white/80 mt-0.5">
                        {extractedResult?.ambientLighting || '自然漫射柔光'}
                      </p>
                    </div>

                    {isAnalyzingAi && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-[#2A4434] z-10">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#4A725B]" />
                        <span className="text-xs font-bold">小红书美学总监正在提纯莫兰迪色谱...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRetake}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#CBDED3] hover:bg-[#F0F5F2] text-[#2A4434] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#4A725B]" />
                    <span>重新开启相机拍摄</span>
                  </button>
                </div>

                {/* Right: Extracted Morandi Palette Breakdown (7 Cols) */}
                <div className="md:col-span-7 flex flex-col gap-4">
                  {extractedResult && (
                    <>
                      {/* Title & Anchor */}
                      <div className="p-4 rounded-2xl bg-[#F6FAF7] border border-[#DFEBE3] flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E3EFE8] text-[#2A4434] font-bold border border-[#CBDED3]">
                            色彩主题
                          </span>
                          <h4 className="font-serif-sc font-bold text-sm text-[#243B2E] mt-1">
                            {extractedResult.paletteTitle}
                          </h4>
                          <p className="text-[11px] text-[#5D7769] mt-0.5">
                            情绪锚点：<strong className="text-[#C27A83]">{extractedResult.emotionalAnchor}</strong>
                          </p>
                        </div>

                        <button
                          onClick={handleSaveToPaletteLibrary}
                          disabled={isSavedToLibrary}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                            isSavedToLibrary
                              ? 'bg-[#E3EFE8] text-[#2A4434]'
                              : 'bg-white border border-[#CBDED3] text-[#4A725B] hover:bg-[#F3F8F5]'
                          }`}
                        >
                          {isSavedToLibrary ? <Check className="w-3.5 h-3.5" /> : <BookmarkCheck className="w-3.5 h-3.5" />}
                          <span>{isSavedToLibrary ? '已保存色卡' : '收藏此色卡'}</span>
                        </button>
                      </div>

                      {/* 5-Color Proportion Strip */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#2A4434]">
                          <span className="flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-[#4A725B]" />
                            莫兰迪 5 色梯队 (黄金 55:25:10:7:3 配比)
                          </span>
                          <span className="text-[10px] text-gray-400 font-normal">点击色块可快速复制 HEX</span>
                        </div>

                        <div className="w-full h-9 rounded-2xl overflow-hidden flex shadow-inner border border-gray-200">
                          {extractedResult.palette.map((color, i) => (
                            <button
                              key={i}
                              onClick={() => handleCopyHex(color.hex)}
                              style={{ backgroundColor: color.hex, width: color.ratio }}
                              className="h-full relative group transition-transform hover:opacity-90 cursor-pointer"
                              title={`点击复制: ${color.name} ${color.hex}`}
                            >
                              <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white bg-black/40 transition-opacity">
                                复制
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Color Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {extractedResult.palette.map((color, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleCopyHex(color.hex)}
                            className="p-2.5 rounded-xl bg-white border border-[#E3EDE7] hover:border-[#4A725B]/40 transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className="w-7 h-7 rounded-lg shadow-2xs border border-black/10 shrink-0"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[11px] font-bold text-gray-800 truncate">
                                  {color.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {color.role} · {color.ratio}
                                </span>
                              </div>
                            </div>
                            <button
                              className="p-1 rounded-md text-gray-400 group-hover:text-[#4A725B] transition shrink-0"
                              title="复制 HEX"
                            >
                              {copiedHex === color.hex ? (
                                <Check className="w-3.5 h-3.5 text-[#4A725B]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Psychology and XHS Cover Strategies */}
              {extractedResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#EDF4F0]">
                  {/* Left: Psychology */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5EFE8] flex flex-col gap-2">
                    <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#C27A83]" />
                      色彩心理学与视网膜减压机制
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      {extractedResult.psychologyAnalysis}
                    </p>
                    <div className="text-[11px] text-[#4A725B] font-medium pt-1 border-t border-gray-100">
                      🎯 受众共鸣：{extractedResult.targetAudienceResonance}
                    </div>
                  </div>

                  {/* Right: Cover Flower Text & Action */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#E5EFE8] flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-[#2A4434] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#4A725B]" />
                        推荐小红书封面花字灵感
                      </span>
                      <div className="flex flex-col gap-1 text-xs text-gray-700">
                        {extractedResult.recommendedCoverFlowerTexts?.map((text, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-[#E8EFEA] text-[11px]">
                            <span className="text-[10px] font-bold text-[#C27A83]">P{idx + 1}</span>
                            <span className="truncate">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Apply Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleApplyAndClose}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#4A725B] hover:bg-[#385845] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#F5D5D8]" />
                        <span>一键装配至当前小红书封面</span>
                      </button>

                      {onGoToContentMode && (
                        <button
                          onClick={() => {
                            handleApplyAndClose();
                            onGoToContentMode();
                          }}
                          className="py-2.5 px-3.5 rounded-xl bg-white border border-[#CBDED3] hover:bg-[#F3F8F5] text-[#2A4434] text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>去操盘</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#4A725B]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
