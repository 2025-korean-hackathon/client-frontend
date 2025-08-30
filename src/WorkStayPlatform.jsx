import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MessageCircle, Send, Filter } from 'lucide-react';

/** 시간 문자열 → 분 */
const parseDistanceToMinutes = (s = '') => {
  if (!s) return Infinity;
  const h = (s.match(/(\d+)\s*시간/) || [])[1];
  const m = (s.match(/(\d+)\s*분/) || [])[1];
  return (h ? parseInt(h, 10) * 60 : 0) + (m ? parseInt(m, 10) : 0);
};
// 경험 카드 따뜻한 스킨 분류
const getWarmSkinClass = (exp = {}) => {
  const t = `${exp.title || ''} ${exp.description || ''} ${(exp.tags || []).join(' ')}`;

  // 키워드 기반 매핑 (원하면 더 추가 가능)
  if (/복숭아|살구|감|자두|귤|감귤|오렌지/.test(t)) return 'skin-peach';
  if (/배|참외|멜론|수박|힐링|휴식/.test(t)) return 'skin-pear';
  if (/포도|베리|블루베리|체리/.test(t)) return 'skin-rose';

  // 태그 기반 보정
  if ((exp.tags || []).includes('과일')) return 'skin-butter';
  if ((exp.tags || []).includes('힐링')) return 'skin-pear';

  // 기본값
  return 'skin-butter';
};

// 체험 타입별 이미지/이모지 반환
const getExperienceImage = (exp = {}) => {
  // ID별 실제 이미지 매핑 (1~6번 이미지)
  if (exp.id === 1) return '/1.png';  // 대전 식물원 가드닝 체험
  if (exp.id === 2) return '/2.png';  // 천안 배 농장 수확 체험  
  if (exp.id === 3) return '/3.png';  // 청주 딸기 농장 체험
  if (exp.id === 4) return '/4.png';  // 부산 해안가 염전 체험
  if (exp.id === 5) return '/5.png';  // 제주 감귤밭 일손돕기
  if (exp.id === 6) return '/6.png';  // 강원도 산나물 채취 체험

  const t = `${exp.title || ''} ${exp.description || ''} ${(exp.tags || []).join(' ')}`;

  // 과일별 이미지
  if (/사과/.test(t)) return '🍎';
  if (/배/.test(t)) return '🍐';
  if (/복숭아|살구/.test(t)) return '🍑';
  if (/포도/.test(t)) return '🍇';
  if (/딸기/.test(t)) return '🍓';
  if (/감귤|오렌지|귤/.test(t)) return '🍊';
  if (/수박/.test(t)) return '🍉';
  if (/참외|멜론/.test(t)) return '🍈';
  if (/체리/.test(t)) return '🍒';
  if (/밤/.test(t)) return '🌰';

  // 채소별 이미지
  if (/배추|양배추/.test(t)) return '🥬';
  if (/무|당근/.test(t)) return '🥕';
  if (/감자/.test(t)) return '🥔';
  if (/고구마/.test(t)) return '🍠';
  if (/옥수수/.test(t)) return '🌽';
  if (/토마토/.test(t)) return '🍅';
  if (/고추/.test(t)) return '🌶️';
  if (/마늘|양파/.test(t)) return '🧄';

  // 곡물/기타
  if (/벼|쌀|논/.test(t)) return '🌾';
  if (/콩/.test(t)) return '🫘';

  // 작업별 이미지
  if (/심기|파종/.test(t)) return '🌱';
  if (/수확|따기/.test(t)) return '🚜';
  if (/김매기|제초/.test(t)) return '🌿';
  if (/과수원|나무/.test(t)) return '🌳';

  // 태그 기반
  if ((exp.tags || []).includes('과일')) return '🍎';
  if ((exp.tags || []).includes('힐링')) return '🌸';
  if ((exp.tags || []).includes('체험')) return '🌾';

  // 기본값
  return '🌾';
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
        className="w-full h-64 md:h-80 rounded-lg map-frame"
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
      <div className="card p-6 w-full max-w-lg">
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
          <button onClick={onClose} className="px-4 py-2 rounded-lg btn-outline">취소</button>
          <button onClick={() => onSubmit(form)} className="px-4 py-2 rounded-lg btn-primary">
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
        setResultSource('init');         // ✅ 출처 초기화
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
      const raw = newMessage;            // 원문
      const msg = raw.toLowerCase();     // 기존 분기용 (영문 키워드 등)
      const msgKo = raw;                 // 기존 분기와의 호환성 유지

      // 🔧 표준화: 공백/구두점/조사 제거 → 다양한 표현 매칭 허용
      const normalize = (s = '') =>
        s
          .toLowerCase()
          .replace(/\s+/g, '')                        // 모든 공백 제거
          .replace(/[.,!?~…·'"“”‘’()\-_/]/g, '')      // 흔한 구두점 제거
          .replace(/에서|으로|로|에|을|를|은|는|이|가|께|한테|까지|부터/g, ''); // 조사 제거
      const n = normalize(raw);

      const hasAny = (str, kws) => kws.some(k => str.includes(k));

      let result = start; // ← 모든 분기에서 여기에 대입

      // 👇 [신규 하드코딩 케이스] 군입대 전 전국 과일농장 투어 (부산 → 논산)
      // 👇 [신규 하드코딩 케이스] 군입대 전 전국 과일농장 투어 (부산 → 논산)
    if (
      hasAny(n, ['군입대전', '군입대']) &&
      hasAny(n, ['전국투어', '전국', '투어']) &&
      n.includes('부산') &&
      n.includes('논산') &&
      hasAny(n, ['과일농장', '과일', '농장'])
    ) {
      console.debug('[HARD-CODED ROUTE] 부산→논산 과일농장 투어 매칭됨:', { raw });

      // 1) 시연용 데모 Experience 4개만 사용 (기존 목록과 병합 X)
      const demoExperiences = [
        {
          id: 9001,
          title: '대구 복숭아 농장 일손돕기',
          region: '대구',
          duration: '당일',
          participants: '2-4명',
          period: '7~9월 (주말 위주)',
          type: '기간제',
          tags: ['과일', '수확', '체험', '힐링'],
          benefits: ['간식제공', '교통지원'],
          description: '달콤한 복숭아 수확 보조. 초보 가능, 사진 스팟 많아요!',
          distance: '1시간 10분',
          transportSupport: true,
          location: '대구광역시 달성군 논공읍 복숭아길 77',
          reviews: [
            { author: '지후', rating: 5, date: '2025-07-12', content: '복숭아 향이 미쳤습니다. 사진맛집!' },
          ],
        },
        {
          id: 9002,
          title: '경북 영천 포도밭 체험',
          region: '경북 영천',
          duration: '반일',
          participants: '2-6명',
          period: '8~10월',
          type: '기간제',
          tags: ['과일', '수확', '체험'],
          benefits: ['포도시식', '지역화폐'],
          description: '머루·캠벨 포도 수확 및 포장 보조. 그늘 많아 한여름에도 덜 덥습니다.',
          distance: '1시간 40분',
          transportSupport: false,
          location: '경상북도 영천시 금호읍 포도길 21',
          reviews: [
            { author: '나연', rating: 4, date: '2025-08-03', content: '포도 진짜 달아요. 아이랑 같이 와도 좋을 듯!' },
          ],
        },
        {
          id: 9003,
          title: '전북 익산 배 농장 체험',
          region: '전북 익산',
          duration: '당일',
          participants: '3-5명',
          period: '9~11월',
          type: '기간제',
          tags: ['과일', '수확', '체험'],
          benefits: ['중식제공'],
          description: '배 봉지 씌우기·수확 보조. 숙련도 필요 없음, 팀 활동 위주.',
          distance: '2시간 10분',
          transportSupport: false,
          location: '전라북도 익산시 함열읍 배밭로 12-3',
          reviews: [
            { author: '준호', rating: 5, date: '2025-09-01', content: '팀으로 하니 금방 끝나고 재밌었어요.' },
          ],
        },
{
          id: 9004,
          title: '충남 공주 밤밭 함께해요',
          region: '충남 공주',
          duration: '당일',
          participants: '2-3명',
          period: '9~11월',
          type: '기간제',
          tags: ['과일', '수확', '체험', '힐링'],
          benefits: ['교통지원'],
          description: '밤 줍기·선별 보조. 숲길 산책 가능, 힐링 코스 강추.',
          distance: '1시간 50분',
          transportSupport: true,
          location: '충청남도 공주시 탄천면 밤밭길 5',
          reviews: [
            { author: '현수', rating: 4, date: '2025-10-05', content: '공기 너무 좋고 밤도 실했어요.' },
          ],
        },
        {
          id: 9005,
          title: '대전 식물원 가드닝 체험',
          region: '대전',
          duration: '반일',
          participants: '4-8명',
          period: '연중',
          type: '상시',
          tags: ['식물', '가드닝', '체험', '힐링'],
          benefits: ['간식제공', '교통지원'],
          description: '온실에서 다양한 식물들과 함께하는 가드닝 체험. 실내 활동으로 날씨에 구애받지 않아요!',
          distance: '45분',
          transportSupport: true,
          location: '대전광역시 서구 만년동 식물원길 42',
          reviews: [
            { author: '민지', rating: 5, date: '2025-01-15', content: '온실이 따뜻하고 식물들이 정말 예뻐요!' },
            { author: '성호', rating: 4, date: '2025-01-20', content: '힐링되는 시간이었습니다.' },
          ],
          image: '🌿',
        },
        {
          id: 9006,
          title: '천안 배 농장 수확 체험',
          region: '천안',
          duration: '당일',
          participants: '3-6명',
          period: '8~10월',
          type: '기간제',
          tags: ['과일', '수확', '체험'],
          benefits: ['중식제공', '과일지급'],
          description: '달콤한 천안 배 수확 체험! 신선한 배를 직접 따보고 가져갈 수 있어요.',
          distance: '1시간 20분',
          transportSupport: false,
          location: '충청남도 천안시 동남구 배밭로 123',
          reviews: [
            { author: '지영', rating: 5, date: '2025-09-10', content: '배가 정말 크고 달아요!' },
            { author: '태민', rating: 4, date: '2025-09-15', content: '가족과 함께 즐거운 시간이었어요.' },
          ],
          image: '🍐',
        },
        {
          id: 9007,
          title: '청주 딸기 농장 체험',
          region: '청주',
          duration: '반일',
          participants: '2-5명',
          period: '12~5월',
          type: '기간제',
          tags: ['과일', '수확', '체험', '딸기'],
          benefits: ['딸기시식', '딸기가져가기'],
          description: '싱싱한 딸기를 직접 따보고 맛볼 수 있는 특별한 체험! 아이들과 함께 오기 좋아요.',
          distance: '1시간 10분',
          transportSupport: true,
          location: '충청북도 청주시 서원구 딸기밭로 56',
          reviews: [
            { author: '수정', rating: 5, date: '2025-02-20', content: '딸기가 너무 달고 싱싱해요!' },
            { author: '준석', rating: 5, date: '2025-03-05', content: '아이가 너무 좋아했어요.' },
          ],
          image: '🍓',
        },
      ];

      // 2) 모든 체험 포함 (과일 체험 + 대전/천안/청주 지역 체험)
      const ONLY = demoExperiences.filter(exp => 
        isFruitPicking(exp) || ['대전', '천안', '청주'].includes(exp.region)
      );
      const ROUTE_ORDER = [9001, 9002, 9003, 9004, 9005, 9006, 9007];
      const result = [...ONLY].sort(
        (a, b) => ROUTE_ORDER.indexOf(a.id) - ROUTE_ORDER.indexOf(b.id)
      );

      // 10초 딜레이 후 실행
      setTimeout(() => {
        setBaseList(result);
        setSelectedRegion('전체');
        setSelectedTag('전체');
        setFilteredExperiences(result);
        setResultSource('chat');

        const botResponse =
          '추천 경로를 안내드릴게요!\n' +
          '부산 출발 → 대구 복숭아 농장 → 경북 영천 포도밭 → 전북 익산 배 농장 → 충남 공주 밤밭 → 논산 도착!!\n' +
          '전국을 돌며 과일농장 체험도 하고, 여행의 추억도 쌓으실 수 있습니다.';

        setChatMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      }, 10000); // ⏳ 10초 대기

      return; // ✅ 다른 분기로 내려가지 않음
    }

      else if (msg.includes('세종') && (msg.includes('1시간') || msg.includes('30분'))) {
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
        result = start.filter(exp => (exp.tags || []).includes('힐링'));
        botResponse = '후기와 설명을 참고해서 초보자도 쉬운 곳으로 추천했어요.';
      } else {
        botResponse = '더 구체적인 조건을 알려주시면 맞춤 추천 드릴게요!';
      }

      // 3) ✅ 기준/화면 목록 동시 갱신 + 출처 표시
      setBaseList(result);
      setFilteredExperiences(applyFilters(result));
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
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="header-glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold brand-text">
              {currentPage === 'landing' ? '제로 투어' : currentPage === 'detail' ? '상세보기' : '제로 투어'}
            </h1>

            <div className="flex items-center space-x-3">
              {currentPage === 'detail' && (
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-3 py-1.5 rounded-lg btn-outline text-sm"
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
                    className="px-4 py-2 rounded-lg font-medium btn-primary"
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
                className="w-80 h-100 object-contain mx-auto"
              />
            </div>

            <div className="text-center mb-12">
  <h2 
    className="text-5xl font-extrabold mb-4 tracking-tight"
    style={{ color: "#27AE60", fontFamily: "'THE딸기마카롱miri','TmoneyRoundWindExtraBold','Cafe24Ssurround','BMJUA','sans-serif'" }}
  >
    제로 투어
  </h2>
  
  <p 
    className="text-2xl mb-3"
    style={{ color: "#363636", fontWeight: 700, fontFamily: "'SUITE-Regular','Pretendard','sans-serif'" }}
  >
    0원으로 떠나는 가장 값진 여행
  </p>
  
  <p 
    className="text-lg"
    style={{ color: "#363636", fontWeight: 500 }}
  >
    일하고, 머물고, 추억을 수확하다
  </p>
</div>


            <div className="card p-8 max-w-md w-full">
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full py-4 px-6 rounded-xl font-semibold btn-primary transition-all duration-200 hover:shadow-lg"
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
                  className="w-full py-4 px-6 btn-outline font-semibold transition-all duration-200 hover:bg-gray-50"
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
              <div className="card p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Filter className="w-4 h-4 brand-text" />
                  <h3 className="text-md font-semibold">알바 필터</h3>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperiences.map((exp, index) => (
                       <div
                         key={exp.id}
                         className={`card card--hover card-skin ${getWarmSkinClass(exp)} p-0 cursor-pointer group experience-card`}
                         onClick={() => openDetail(exp)}
                         style={{ animationDelay: `${index * 0.1}s` }}
                       >
                      {/* 카드 상단 이미지 영역 */}
                      <div className="relative h-32 overflow-hidden rounded-t-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        
                                            {/* 메인 이미지 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getExperienceImage(exp).startsWith('/') ? (
                        <img 
                          src={getExperienceImage(exp)} 
                          alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-6xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                          {getExperienceImage(exp)}
                        </div>
                      )}
                    </div>
                        
                        {/* 배경 패턴 */}
                        <div className="absolute inset-0 bg-pattern"></div>
                        
                        {/* 기간제 태그 */}
                        <div className="absolute top-3 right-3 z-10">
                          {exp.type === '기간제' && (
                            <span className="chip chip--period text-xs font-bold pulse-badge shadow-lg">
                              {exp.type}
                            </span>
                          )}
                        </div>
                        
                        {/* 하단 그라데이션 오버레이 */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent"></div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* 헤더 섹션 */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-title-strong leading-tight group-hover:text-green-700 transition-colors duration-300">
                            {exp.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{exp.region}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{exp.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* 설명 */}
                        <p
                          className="text-gray-700 text-sm leading-relaxed font-normal"
                          style={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden',
                            minHeight: '2.5rem'
                          }}
                        >
                          {exp.description}
                        </p>

                        {/* 위치 & 기간 정보 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/50 rounded-lg px-3 py-2">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{exp.location || '위치 미정'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/50 rounded-lg px-3 py-2">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">{exp.period}</span>
                          </div>
                        </div>

                        {/* 혜택 태그 */}
                        <div className="flex flex-wrap gap-1.5">
                          {(exp.benefits || []).slice(0, 3).map((b, idx) => {
                            let chipClass = "chip chip--benefit-brown transition-all duration-200 hover:scale-105";
                            if (b === "숙박") chipClass += " chip--accommodation";
                            if (b === "식사") chipClass += " chip--meal";
                            if (b === "체험") chipClass += " chip--experience";
                            return (
                              <span key={idx} className={`${chipClass} text-xs font-medium shadow-sm`}>
                                {b}
                              </span>
                            );
                          })}
                          {(exp.benefits || []).length > 3 && (
                            <span className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full border border-gray-200">
                              +{exp.benefits.length - 3}
                            </span>
                          )}
                        </div>

                        {/* 하단 정보 */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            {exp.transportSupport && (
                              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 100-2 1 1 0 000 2z"/>
                                </svg>
                                <span>교통지원</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                            자세히 보기 →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽: 채팅 봇 */}
            <div className="w-full lg:w-1/4">
              <div className="card h-96 flex flex-col lg:sticky lg:top-6">
                <div className="flex items-center space-x-3 p-4 border-b">
                  <MessageCircle className="w-5 h-5 brand-text" />
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
                            className={`max-w-xs px-2 py-1 rounded text-xs whitespace-pre-line ${msg.type === 'user' ? 'bubble-user' : 'bubble-bot'}`}
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
                          className="px-2 py-1 rounded btn-primary"
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
          <div className={`card card-skin ${getWarmSkinClass(selected)} p-0 space-y-6 overflow-hidden`}>
            {/* 상단 이미지 헤더 */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                  {getExperienceImage(selected).startsWith('/') ? (
                    <img 
                      src={getExperienceImage(selected)} 
                      alt={selected.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-8xl opacity-90">
                      {getExperienceImage(selected)}
                    </div>
                  )}
                </div>
              <div className="absolute inset-0 bg-pattern"></div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent"></div>
              {selected.type === '기간제' && (
                <div className="absolute top-4 right-4">
                  <span className="chip chip--period text-sm font-bold pulse-badge shadow-lg">
                    {selected.type}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-6">
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
                      className="chip chip--ai text-[10px] font-medium"
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
                        className="px-4 py-2 rounded-lg btn-primary"
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
                className={`px-4 py-2 rounded-lg btn-outline ${favorites.includes(selected.id) ? 'border-green-300 text-green-700' : ''}`}
              >
                {favorites.includes(selected.id) ? '★ 찜됨' : '☆ 찜하기'}
              </button>
              <button
                onClick={openApply}
                className="px-4 py-2 rounded-lg btn-primary"
              >
                신청서 작성하기
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-4 py-2 rounded-lg btn-outline"
              >
                목록으로
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card p-8 max-w-md w-full">
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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button onClick={() => setShowLogin(false)} className="flex-1 py-3 px-4 btn-outline font-medium">취소</button>
                <button onClick={handleLogin} className="flex-1 py-3 px-4 btn-primary font-medium">
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
          <div className="card p-8 max-w-md w-full">
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
                    <div className="text-2xl font-bold text-green-600">3</div>
                    <div className="text-sm text-gray-600">참여한 체험</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">2</div>
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
                <button onClick={() => setShowMyPage(false)} className="flex-1 py-3 px-4 btn-primary font-medium">
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
