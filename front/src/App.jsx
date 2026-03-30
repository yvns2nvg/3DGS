import React, { useState } from 'react';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [modelUrl, setModelUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState(null); // 전송 로그 확인용

  const handleGenerate = async () => {
    if (!prompt) return alert("프롬프트를 입력해주세요!");
    
    setIsLoading(true);
    setDebugLog({ message: "⏳ 백엔드로 요청을 보내는 중...", sent_at: new Date().toLocaleTimeString() });

    try {
      // 1. 전송할 데이터 구조 (명세서의 필드명 확인용)
      const payload = { prompt: prompt }; 
      
      // 로그 업데이트: 어떤 데이터를 보내는지 기록
      console.log("🚀 전송 데이터:", payload);

      const response = await fetch('https://shoe-backend-559188768549.asia-northeast3.run.app/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // 2. 로그 업데이트: 백엔드에서 받은 응답 기록
      setDebugLog({
        endpoint: 'api/shoes/generate',
        status: response.status,
        ok: response.ok ? "✅ 성공" : "❌ 실패",
        sent_body: payload,
        received_body: data,
        time: new Date().toLocaleTimeString()
      });

      if (response.ok && data.file_url) {
        setModelUrl(data.file_url); // 성공 시 3D 모델 경로 설정
      }

    } catch (error) {
      setDebugLog({ status: "💥 연결 에러", error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      {/* 헤더 */}
      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-blue-400">👟 AI Shoe Generator</h1>
        <p className="text-gray-400 text-sm">프롬프트 전송 및 3D 모델 생성 테스트</p>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 왼쪽: 입력 및 뷰어 (기존 틀 유지) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-700 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="만들고 싶은 신발을 묘사하세요..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-all"
            >
              {isLoading ? "생성 중..." : "생성하기"}
            </button>
          </div>

          {/* 3D 뷰어 영역 */}
          <div className="bg-black aspect-video rounded-xl border border-gray-700 overflow-hidden relative">
            {modelUrl ? (
              <model-viewer
                src={modelUrl}
                camera-controls auto-rotate shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
              ></model-viewer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 italic">
                {isLoading ? "모델을 굽는 중입니다..." : "결과가 여기에 표시됩니다."}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 실시간 데이터 로그 (새로 추가됨) */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col h-full">
          <h2 className="text-sm font-bold uppercase text-blue-400 mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Data Log
          </h2>
          <div className="bg-gray-900 rounded-lg p-3 flex-1 font-mono text-[11px] overflow-auto text-green-400">
            {debugLog ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(debugLog, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-600">데이터 전송 시 로그가 기록됩니다.</p>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Backend: Asia-Northeast3 (Seoul)
          </p>
        </div>

      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-center text-gray-600 text-xs">
        &copy; 2026 Dong-A Univ AI Major Project
      </footer>
    </div>
  );
};

export default App;