import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, Send, Filter } from 'lucide-react';

/** 시간 문자열 → 분 */
const parseDistanceToMinutes = (s = '') => {
  if (!s) return Infinity;
  const h = (s.match(/(\d+)\s*시간/) || [])[1];
  const m = (s.match(/(\d+)\s*분/) || [])[1];
  return (h ? parseInt(h, 10) * 60 : 0) + (m ? parseInt(m, 10) : 0);
};


/** 평균 평점 계산 */
const getAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10; // 소수점 1자리
};

/** 별점 표시 */
const StarRating = ({ value = 0, size = 16 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="inline-flex items-center">
      {stars.map((s) => (
        <svg
          key={s}
          viewBox="0 0 20 20"
          className={`${value >= s ? 'fill-yellow-400' : 'fill-gray-300'} mr-0.5`}
          width={size}
          height={size}
        >
          <path d="M10 15.27L15.18 18l-1.64-5.03L18 9.24l-5.19-.03L10 4 7.19 9.21 2 9.24l4.46 3.73L4.82 18z" />
        </svg>
      ))}
      <span className="ml-2 text-sm text-gray-700">{value.toFixed(1)}</span>
    </div>
  );
};

const FRUIT_KEYWORDS = ['딸기','사과','포도','블루베리','감귤','귤','복숭아','배','자두','체리','감','수박','참외','멜론','토마토','베리'];
const isFruitPicking = (exp = {}) => {
  const text = `${exp.title || ''} ${exp.description || ''} ${(exp.tags || []).join(' ')}`;
  const hasFruit = FRUIT_KEYWORDS.some(k => text.includes(k)) || (exp.tags || []).includes('과일');
  const hasAction = /수확|따기|픽킹|pick|체험/i.test(text);
  return hasFruit && hasAction;
};



/** 간단한 구글맵 임베드 (API 키 불필요) */
const MapEmbed = ({ address }) => {
  if (!address) {
    return <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">위치 정보가 없습니다</div>;
  }
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <div className="w-full">
      <iframe
        title="map"
        src={src}
        className="w-full h-64 md:h-80 rounded-lg"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
      />
      <div className="text-xs text-gray-500 mt-1">주소 기준 위치 표시 (Google Maps)</div>
    </div>
  );
};

/** 신청서 모달 */
const ApplyModal = ({ open, onClose, experience, onSubmit }) => {
  const [form, setForm] = useState({ name: '', phone: '', start: '', end: '', note: '' });

  useEffect(() => {
    if (open) setForm({ name: '', phone: '', start: '', end: '', note: '' });
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">신청서 작성 — {experience?.title}</h3>
        <div className="grid grid-cols-1 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="연락처 (010-****-****)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.start} onChange={e => setForm({ ...form, start: e.target.value })} />
            <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={form.end} onChange={e => setForm({ ...form, end: e.target.value })} />
          </div>
          <textarea className="border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="요청 사항" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700">취소</button>
          <button
            onClick={() => onSubmit(form)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#4467B4' }}
          >
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkStayPlatform = () => {
  // 데이터
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 채팅/필터의 기준 리스트 (항상 여기에 필터 적용)
const [baseList, setBaseList] = useState([]);

// 현재 결과의 출처: 'init' | 'browse' | 'chat'
const [resultSource, setResultSource] = useState('init');

  // UI 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing' | 'home' | 'detail'
  const [selected, setSelected] = useState(null);            // 상세보기 대상
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem('favorites');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // 필터
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTag, setSelectedTag] = useState('전체');

  const [applyOpen, setApplyOpen] = useState(false);

  const chatEndRef = useRef(null);

  // JSON 로드
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch('/experiences.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setExperiences(arr);
        setBaseList(arr);                // ✅ 기준 리스트 세팅
        setFilteredExperiences(arr);
        setResultSource('init');         // ✅ 출처 초기화        setFilteredExperiences(arr);
      } catch (e) {
        setLoadError('데이터를 불러오지 못했습니다. public/experiences.json을 확인해주세요.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 즐겨찾기 저장
  useEffect(() => {
    try { localStorage.setItem('favorites', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  // 동적 필터 목록
  const regions = useMemo(() => ['전체', ...Array.from(new Set(experiences.map(e => e.region).filter(Boolean)))], [experiences]);
  const tags = useMemo(() => ['전체', ...Array.from(new Set(experiences.flatMap(e => e.tags || []).filter(Boolean)))], [experiences]);

// 선택값을 기준으로 주어진 리스트에 필터 적용
const applyFilters = useCallback((list) => {
  let filtered = [...list];
  if (selectedRegion !== '전체') {
    filtered = filtered.filter(exp => exp.region === selectedRegion);
  }
  if (selectedTag !== '전체') {
    filtered = filtered.filter(exp => (exp.tags || []).includes(selectedTag));
  }
  return filtered;
}, [selectedRegion, selectedTag]);

// baseList나 필터가 바뀌면 화면용 목록 갱신
useEffect(() => {
  setFilteredExperiences(applyFilters(baseList));
  // ⚠️ resultSource는 여기서 바꾸지 않음 (채팅 출처 유지 위해)
}, [baseList, applyFilters]);

  // 채팅 스크롤
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleLogin = () => {
    if (loginData.id === 'workplay' && loginData.password === 'workplay.01') {
      setIsLoggedIn(true);
      setShowLogin(false);
      setCurrentPage('home');
      setChatMessages([{
        type: 'bot',
        content: `안녕하세요! 제로투어에 오신 것을 환영합니다!
어떤 종류의 농촌 체험을 찾고 계신가요? 지역이나 활동, 기간 등 원하시는 조건을 말씀해 주세요!`
      }]);
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

// 참가자 인원 최대치 파싱( "2-4명" 또는 "2명" 모두 지원 )
const getMaxParticipants = (txt = '') => {
  const range = txt.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return parseInt(range[2], 10);
  const single = txt.match(/(\d+)/);
  return single ? parseInt(single[1], 10) : 0;
};

const handleSendMessage = () => {
  if (!newMessage.trim() || !isLoggedIn) return;

  // 1) 채팅 UI 업데이트
  const userMessage = { type: 'user', content: newMessage };
  setChatMessages(prev => [...prev, userMessage]);

  // 2) 항상 기준 목록(baseList)에서 시작
  const start = baseList.length ? baseList : experiences;

  setTimeout(() => {
    let botResponse = '';
    const msg = newMessage.toLowerCase();
    let result = start; // ← 모든 분기에서 여기에 대입

    if (msg.includes('세종') && (msg.includes('1시간') || msg.includes('30분'))) {
      result = start
        .filter(exp => parseDistanceToMinutes(exp.distance) <= 90)
        .sort((a, b) => {
          if (a.transportSupport && !b.transportSupport) return -1;
          if (!a.transportSupport && b.transportSupport) return 1;
          return parseDistanceToMinutes(a.distance) - parseDistanceToMinutes(b.distance);
        });
      botResponse = '1시간 30분 안에 갈 수 있는 곳으로 선별했고, 교통 지원이 있는 체험을 우선적으로 보여드릴게요.';
    } else if (msg.includes('친구') && msg.includes('3명')) {
      result = start.filter(exp => getMaxParticipants(exp.participants) >= 3);
      botResponse = '최대 인원 3명 이상 가능한 체험으로 추천해드렸어요.';
    } else if (msg.includes('제주') || msg.includes('감귤')) {
      result = start.filter(exp => exp.region === '제주' || (exp.tags || []).includes('과수'));
      botResponse = '제주 감귤 수확 체험을 추천드려요! 🍊';
    } else if (msg.includes('딸기')) {
      result = start.filter(exp => (exp.tags || []).includes('과일') && (exp.title || '').includes('딸기'));
      botResponse = '딸기 농장 체험들을 모아 보여드릴게요! 🍓';
    } else if (msg.includes('상시') || msg.includes('언제나')) {
      result = start.filter(exp => exp.type === '상시');
      botResponse = '상시 모집 중인 체험입니다.';
    } else if (msg.includes('숙박') || msg.includes('잠')) {
      result = start.filter(exp => (exp.benefits || []).includes('숙박'));
      botResponse = '숙박 제공 체험만 모아 보여드릴게요. 🏠';
    } else if (/(어려운건.*힘들|너무\s*어려운|초보|쉬(워|게)|가벼운)/.test(msg)) {
      const hardPattern = /(고강도|중장비|새벽|장시간|병입|포장라인|지게차|하역|무거운)/;
      result = start
        .filter(exp => (exp.tags || []).includes('힐링'));
      botResponse = '후기와 설명을 참고해서 초보자도 쉬운 곳으로 추천했어요.';
    } else {
      botResponse = '더 구체적인 조건을 알려주시면 맞춤 추천 드릴게요!';
      // result = start; // 변화 없음
    }
    
    // 3) ✅ 기준/화면 목록 동시 갱신 + 출처 표시
    setBaseList(result);
    setFilteredExperiences(applyFilters(result)); // 필터는 항상 기준 목록에 적용
    setResultSource('chat');

    // 4) 봇 메시지 출력
    setChatMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
  }, 600);
  

  setNewMessage('');
};

  /** 카드 클릭 → 상세보기 */
  const openDetail = (exp) => {
    setSelected(exp);
    setCurrentPage('detail');
  };

  const toggleFavorite = (id) => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openApply = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setApplyOpen(true);
  };

  const submitApplication = (form) => {
    if (!form.name || !form.phone || !form.start || !form.end) {
      alert('이름/연락처/기간을 입력해주세요.');
      return;
    }
    alert(`신청 완료!\n이름: ${form.name}\n연락처: ${form.phone}\n기간: ${form.start} ~ ${form.end}\n체험: ${selected?.title}`);
    setApplyOpen(false);
  };

  // 로딩/에러
  if (loading) return <div className="p-6 text-gray-600">데이터 불러오는 중…</div>;
  if (loadError) return <div className="p-6 text-red-600">{loadError}</div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFF3FE' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#4467B4' }}>
              {currentPage === 'landing' ? '제로 투어' : currentPage === 'detail' ? '상세보기' : '제로 투어'}
            </h1>

            <div className="flex items-center space-x-3">
              {currentPage === 'detail' && (
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                >
                  ← 목록으로
                </button>
              )}

              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setShowMyPage(true)}
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      김예슬님
                    </button>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setShowMyPage(false);
                        setCurrentPage('landing');
                        setChatMessages([]);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 rounded-lg font-medium text-white"
                    style={{ backgroundColor: '#4467B4' }}
                  >
                    로그인
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Pages */}
{currentPage === 'landing' && (
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      
      {/* 로고 영역 */}
      <div className="mb-8">
        <img 
          src="/logo/logo.png" 
          alt="제로 투어 로고" 
          className="w-32 h-32 object-contain mx-auto"
        />
      </div>

      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">제로 투어</h2>
        <p className="text-xl text-gray-600 mb-2">일하고, 머물고, 추억을 수확하다</p>
        <p className="text-lg text-gray-500">열정 하나면, 여행도 일도 가능하다</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="space-y-4">
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg"
            style={{ backgroundColor: '#4467B4' }}
          >
            로그인하기
          </button>

          <button
onClick={() => {
  setCurrentPage('home');
  setBaseList(experiences);                        // ✅ 기준을 전체로
  setSelectedRegion('전체');                       // ✅ 필터 초기화
  setSelectedTag('전체');
  setFilteredExperiences(applyFilters(experiences));
  setResultSource('browse');                       // ✅ 출처: 브라우징
}}

            className="w-full py-4 px-6 border-2 rounded-xl font-semibold text-gray-700 bg-white transition-all duration-200 hover:bg-gray-50"
            style={{ borderColor: '#4467B4' }}
          >
            체험하기 (둘러보기)
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {currentPage === 'home' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* 왼쪽: 목록 */}
            <div className="flex-1 space-y-4">
              {/* 필터 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <h3 className="text-md font-semibold">체험 필터</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">지역</label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {regions.map(region => <option key={region} value={region}>{region}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">체험 태그</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 목록 */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800">
                  농촌 체험 ({filteredExperiences.length}개)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                      onClick={() => openDetail(exp)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">{exp.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                              exp.type === '기간제' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {exp.type}
                          </span>
                        </div>

                        {/* 2줄 말줄임 */}
                        <p
                          className="text-gray-600 text-xs"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {exp.description}
                        </p>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div>{exp.region} · {exp.duration}</div>
                          <div>위치: {exp.location || '미정'}</div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(exp.benefits || []).slice(0, 2).map((b, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{b}</span>
                          ))}
                          {(exp.benefits || []).length > 2 && (
                            <span className="text-xs text-gray-500">+{exp.benefits.length - 2}</span>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">{exp.period}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽: 채팅 봇 */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm h-96 flex flex-col lg:sticky lg:top-6">
                <div className="flex items-center space-x-3 p-4 border-b">
                  <MessageCircle className="w-5 h-5" style={{ color: '#4467B4' }} />
                  <h3 className="font-medium text-sm">AI 체험 추천봇</h3>
                </div>

                {!isLoggedIn ? (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-gray-500">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">로그인 후 AI 추천 서비스를<br />이용할 수 있습니다</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs px-2 py-1 rounded text-xs whitespace-pre-line ${
                              msg.type === 'user' ? 'text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                            style={msg.type === 'user' ? { backgroundColor: '#4467B4' } : {}}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="원하는 체험을 말씀해 주세요..."
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-2 py-1 rounded text-white"
                          style={{ backgroundColor: '#4467B4' }}
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {currentPage === 'detail' && selected && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selected.title}</h2>
                <div className="text-sm text-gray-600 mt-1">
                  {selected.region} · {selected.duration} · 인원 {selected.participants || '정보 없음'}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selected.tags || []).map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{t}</span>
                  ))}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                selected.type === '기간제' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
              }`}>
                {selected.type}
              </span>
            </div>

            <p className="text-gray-700">{selected.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">기간: <span className="text-gray-800">{selected.period}</span></div>
                <div className="text-sm text-gray-600">위치: <span className="text-gray-800">{selected.location || '미정'}</span></div>
                <div className="text-sm text-gray-600">혜택: <span className="text-gray-800">{(selected.benefits || []).join(', ') || '없음'}</span></div>
                {selected.distance && isLoggedIn && resultSource === 'chat' && (
  <div className="text-sm text-gray-600 flex items-center gap-2">
    <span>
      참고 이동시간: <span className="text-gray-800">{selected.distance}</span>
    </span>
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                 bg-purple-50 text-purple-700 border border-purple-200"
      title="사용자 설명/데이터를 바탕으로 AI가 추정한 참고 정보입니다. 실제와 다를 수 있어요."
    >
      AI 제공 정보
    </span>
  </div>
)}
                <div className="text-sm text-gray-600">교통지원: <span className="text-gray-800">{selected.transportSupport ? '있음' : '없음'}</span></div>
              </div>
              <MapEmbed address={selected.location} />
            </div>


            {/* 후기 섹션 */}
<div className="pt-4 border-t">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-semibold text-gray-900">후기</h3>

    {/* 평균 평점 */}
    <div className="flex items-center gap-2">
      <StarRating value={getAverageRating(selected.reviews || [])} />
      <span className="text-sm text-gray-500">
        ({(selected.reviews || []).length}건)
      </span>
    </div>
  </div>

  {/* 로그인 전: 흐릿 + 오버레이 */}
  {!isLoggedIn ? (
    <div className="relative">
      <div className="grid gap-3 blur-sm pointer-events-none select-none">
        {(selected.reviews || []).slice(0, 3).map((rev, i) => (
          <div key={i} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-800">{rev.author}</div>
              <StarRating value={rev.rating} size={14} />
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{rev.date}</div>
            <p className="text-sm text-gray-700 mt-2">{rev.content}</p>
          </div>
        ))}
        {(selected.reviews || []).length === 0 && (
          <div className="border rounded-lg p-3 text-sm text-gray-500 bg-gray-50">
            아직 후기가 없습니다.
          </div>
        )}
      </div>

      {/* 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 border rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-gray-700 mb-2">로그인 후 이용하세요!</p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: '#4467B4' }}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  ) : (
    // 로그인 후: 전체 후기 표시
    <div className="grid gap-3">
      {(selected.reviews || []).map((rev, i) => (
        <div key={i} className="border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-800">{rev.author}</div>
            <StarRating value={rev.rating} size={14} />
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{rev.date}</div>
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{rev.content}</p>
        </div>
      ))}
      {(selected.reviews || []).length === 0 && (
        <div className="border rounded-lg p-3 text-sm text-gray-500 bg-gray-50">
          아직 후기가 없습니다. 첫 번째 후기를 남겨보세요!
        </div>
      )}
    </div>
  )}
</div>


            {/* 액션 버튼 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toggleFavorite(selected.id)}
                className={`px-4 py-2 rounded-lg border ${favorites.includes(selected.id) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-700'}`}
              >
                {favorites.includes(selected.id) ? '★ 찜됨' : '☆ 찜하기'}
              </button>
              <button
                onClick={openApply}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: '#4467B4' }}
              >
                신청서 작성하기
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-4 py-2 rounded-lg border text-gray-700"
              >
                목록으로
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                <input
                  type="text"
                  value={loginData.id}
                  onChange={(e) => setLoginData({ ...loginData, id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="workplay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="workplay.01"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowLogin(false)} className="flex-1 py-3 px-4 border rounded-lg font-medium text-gray-700">취소</button>
                <button onClick={handleLogin} className="flex-1 py-3 px-4 rounded-lg font-medium text-white" style={{ backgroundColor: '#4467B4' }}>
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 마이페이지 모달 */}
      {showMyPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">마이페이지</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-lg font-semibold">김예슬님</h3>
                <p className="text-gray-600">workplay</p>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-gray-600">참여한 체험</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-gray-600">작성한 후기</div>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">체험 내역</button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">찜한 체험</button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">작성한 후기</button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">설정</button>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowMyPage(false)} className="flex-1 py-3 px-4 rounded-lg font-medium text-white" style={{ backgroundColor: '#4467B4' }}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신청서 모달 */}
      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        experience={selected}
        onSubmit={submitApplication}
      />
    </div>
  );
};

export default WorkStayPlatform;
