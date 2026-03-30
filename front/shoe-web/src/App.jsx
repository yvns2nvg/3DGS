import React, { useState } from 'react';

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [modelUrl, setModelUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState(null);

  const handleGenerate = async () => {
    if (!prompt) return alert("프롬프트를 입력해주세요!");
    
    setIsLoading(true);
    setDebugLog({ message: "⏳ 백엔드 서버로 요청을 전송 중입니다...", time: new Date().toLocaleTimeString() });

    try {
      // 1. 엔드포인트 설정 (명세서에 맞춘 주소)
      const targetUrl = 'https://shoe-backend-559188768549.asia-northeast3.run.app/api/shoes/generate';
      const payload = { prompt: prompt }; 
      
      console.log("🚀 [API 요청]:", targetUrl, payload);

      // 2. 백엔드 통신 시작
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      // 3. 응답 데이터 처리
      const data = await response.json();

      // 4. 실시간 로그 업데이트 (결과 확인용)
      setDebugLog({
        endpoint: '/api/shoes/generate',
        status: response.status,
        ok: response.ok ? "✅ 성공" : "❌ 실패",
        request_data: payload,
        response_data: data,
        time: new Date().toLocaleTimeString()
      });

      if (response.ok) {
        // 백엔드가 주는 데이터 구조(file_url, url, path 등)에 따라 URL 설정
        const finalUrl = data.file_url || data.url || data.path || data.result;
        
        if (finalUrl) {
          setModelUrl(finalUrl);
          console.log("✨ 3D 모델 로드 성공:", finalUrl);
        } else {
          console.warn("⚠️ 응답 데이터에 모델 URL 필드가 없습니다. JSON 구조를 확인하세요.");
        }
      } else {
        console.error("❗ 서버 에러 발생:", response.status);
      }

    } catch (error) {
      setDebugLog({ 
        status: "💥 네트워크 연결 에러", 
        error: error.message,
        tip: "백엔드 서버가 켜져 있는지, 혹은 CORS 설정이 되어 있는지 확인하세요."
      });
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      {/* 상단 헤더 */}
      <header className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">👟 AI Shoe Factory</h1>
          <p className="text-gray-400 text-sm italic">Dong-A Univ. AI Dept. Graduation Project</p>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          System Status: <span className="text-green-500 font-bold underline">ONLINE (M4 Pro)</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 왼쪽: 입력창 및 3D 뷰어 (3/4 차지) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex gap-3 shadow-xl">
            <input
              type="text"
              className="flex-1 bg-gray-700 border-none rounded-xl px-5 py-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500 text-lg"
              placeholder="만들고 싶은 신bal의 컨셉을 입력하세요..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`px-10 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-900/20'
              }`}
            >
              {isLoading ? "생성 중..." : "모델 굽기"}
            </button>
          </div>

          {/* 3D 모델 표시 영역 */}
          <div className="bg-black aspect-video rounded-3xl border border-gray-700 overflow-hidden relative shadow-inner">
            {modelUrl ? (
              <model-viewer
                src={modelUrl}
                camera-controls 
                auto-rotate 
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1"
                style={{ width: '100%', height: '100%' }}
              >
                <div slot="poster" className="flex items-center justify-center h-full text-gray-600">
                  3D 모델을 불러오고 있습니다...
                </div>
              </model-viewer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 italic">
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="not-italic text-blue-400 font-medium animate-pulse">GPU가 열심히 렌더링 중입니다...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-4xl mb-4 opacity-20">👟</p>
                    <p>문장을 입력하면 이곳에 3D 모델이 나타납니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 네트워크 실시간 모니터 (1/4 차지) */}
        <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex flex-col h-[600px] shadow-xl">
          <h2 className="text-xs font-bold uppercase text-blue-400 mb-4 flex items-center justify-between">
            <span>📡 Live API Monitor</span>
            <span className="bg-blue-900/30 px-2 py-0.5 rounded text-[10px]">JSON</span>
          </h2>
          <div className="bg-gray-950 rounded-xl p-4 flex-1 font-mono text-[10px] overflow-auto text-green-400 border border-gray-900 custom-scrollbar">
            {debugLog ? (
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(debugLog, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-700 h-full flex items-center justify-center text-center px-4">
                서버와 주고받는 모든 데이터가 <br/> 이곳에 실시간으로 표시됩니다.
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-tighter">
              Ready for Deployment 🚀
            </p>
          </div>
        </div>

      </main>

      <footer className="max-w-6xl mx-auto mt-10 text-center text-gray-600 text-[10px] uppercase tracking-widest border-t border-gray-800 pt-6">
        Designed for High-Performance AI Inference | 2026 iyunseung
      </footer>
    </div>
  );
};

export default App;