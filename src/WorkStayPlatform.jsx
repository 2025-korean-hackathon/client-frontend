import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Users, MessageCircle, Send, Filter, Clock, Gift } from 'lucide-react';

const WorkStayPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTag, setSelectedTag] = useState('전체');
  const chatEndRef = useRef(null);

  // 더미 데이터 - 더 많은 체험 추가
  const experiences = [
    {
      id: 1,
      title: '제주 감귤 수확 체험',
      region: '제주',
      duration: '2박 3일',
      participants: '2-4명',
      period: '2024.11.01 - 2024.12.15',
      type: '기간제',
      tags: ['과수', '수확', '힐링'],
      benefits: ['숙박', '식사', '지역화폐'],
      image: '🍊',
      description: '제주 감귤농장에서 수확 작업을 도우며 제주의 자연을 만끽하세요.',
      distance: '3시간',
      transportSupport: false
    },
    {
      id: 2,
      title: '충남 천안 사과 농장',
      region: '충청남도',
      duration: '1박 2일',
      participants: '2-4명',
      period: '상시모집',
      type: '상시',
      tags: ['과수', '수확', '체험'],
      benefits: ['숙박', '식사', '교통지원'],
      image: '🍎',
      description: '세종에서 1시간 거리, 천안 사과농장에서 수확 체험을 즐겨보세요.',
      distance: '1시간',
      transportSupport: true
    },
    {
      id: 3,
      title: '대전 도심 농장 체험',
      region: '대전',
      duration: '당일',
      participants: '1-5명',
      period: '상시모집',
      type: '상시',
      tags: ['도시농업', '체험', '힐링'],
      benefits: ['교통지원', '지역화폐'],
      image: '🌱',
      description: '세종 근처 대전 도심 농장에서 도시농업을 체험해보세요.',
      distance: '40분',
      transportSupport: true
    },
    {
      id: 4,
      title: '충북 청주 딸기 농장',
      region: '충청북도',
      duration: '1박 2일',
      participants: '2-3명',
      period: '2024.12.01 - 2025.02.28',
      type: '기간제',
      tags: ['과일', '재배', '체험'],
      benefits: ['숙박', '교통지원'],
      image: '🍓',
      description: '세종에서 1시간 20분 거리, 청주 딸기농장에서 겨울철 딸기를 수확해보세요.',
      distance: '1시간 20분',
      transportSupport: true
    },
    {
      id: 5,
      title: '공주 밤 수확 체험',
      region: '충청남도',
      duration: '당일',
      participants: '3-6명',
      period: '2024.09.20 - 2024.10.30',
      type: '기간제',
      tags: ['견과류', '수확', '자연'],
      benefits: ['식사', '교통지원'],
      image: '🌰',
      description: '세종에서 50분 거리, 공주 밤나무 숲에서 밤 수확을 체험하세요.',
      distance: '50분',
      transportSupport: true
    },
    {
      id: 6,
      title: '논산 딸기 농장 체험',
      region: '충청남도',
      duration: '1박 2일',
      participants: '2-4명',
      period: '2024.12.01 - 2025.03.15',
      type: '기간제',
      tags: ['과일', '재배', '힐링'],
      benefits: ['숙박', '식사'],
      image: '🍓',
      description: '논산 딸기농장에서 겨울철 달콤한 딸기 수확을 경험해보세요.',
      distance: '1시간 10분',
      transportSupport: false
    },
    {
      id: 7,
      title: '부여 연꽃 농장 체험',
      region: '충청남도',
      duration: '당일',
      participants: '2-5명',
      period: '2024.07.01 - 2024.08.31',
      type: '기간제',
      tags: ['꽃', '체험', '힐링'],
      benefits: ['식사', '교통지원'],
      image: '🪷',
      description: '부여 연꽃 농장에서 연꽃과 함께하는 힐링 체험을 즐겨보세요.',
      distance: '1시간',
      transportSupport: true
    },
    {
      id: 8,
      title: '조치원 벼 농장 체험',
      region: '세종',
      duration: '당일',
      participants: '4-8명',
      period: '2024.10.01 - 2024.11.15',
      type: '기간제',
      tags: ['곡물', '수확', '전통'],
      benefits: ['식사', '지역화폐'],
      image: '🌾',
      description: '세종 조치원에서 벼 수확과 전통 농업 방식을 배워보세요.',
      distance: '30분',
      transportSupport: false
    },
    {
      id: 9,
      title: '아산 포도 농장 체험',
      region: '충청남도',
      duration: '1박 2일',
      participants: '2-4명',
      period: '2024.08.15 - 2024.09.30',
      type: '기간제',
      tags: ['과일', '수확', '체험'],
      benefits: ['숙박', '식사', '교통지원'],
      image: '🍇',
      description: '아산 포도농장에서 달콤한 포도 수확을 체험해보세요.',
      distance: '1시간 30분',
      transportSupport: true
    },
    {
      id: 10,
      title: '계룡 버섯 농장 체험',
      region: '충청남도',
      duration: '당일',
      participants: '2-3명',
      period: '상시모집',
      type: '상시',
      tags: ['재배', '실내작업', '힐링'],
      benefits: ['식사'],
      image: '🍄',
      description: '계룡 버섯농장에서 버섯 재배 과정을 체험해보세요.',
      distance: '45분',
      transportSupport: false
    },
    {
      id: 11,
      title: '당진 배 농장 체험',
      region: '충청남도',
      duration: '2박 3일',
      participants: '2-5명',
      period: '2024.09.01 - 2024.10.31',
      type: '기간제',
      tags: ['과수', '수확', '체험'],
      benefits: ['숙박', '식사', '교통지원'],
      image: '🍐',
      description: '당진 배농장에서 가을 배 수확의 기쁨을 만끽하세요.',
      distance: '1시간 50분',
      transportSupport: true
    },
    {
      id: 12,
      title: '세종 도시농업 체험',
      region: '세종',
      duration: '당일',
      participants: '1-6명',
      period: '상시모집',
      type: '상시',
      tags: ['도시농업', '채소', '힐링'],
      benefits: ['지역화폐'],
      image: '🥬',
      description: '세종시 도시농업단지에서 친환경 채소 재배를 체험해보세요.',
      distance: '20분',
      transportSupport: false
    }
  ];

  const regions = ['전체', '세종', '충청남도', '충청북도', '대전', '제주'];
  const tags = ['전체', '과수', '채소', '수확', '힐링', '자연', '체험', '곡물', '전통', '재배', '실내작업', '과일', '도시농업', '꽃', '견과류'];

  const filterExperiences = useCallback(() => {
    let filtered = [...experiences];
    
    if (selectedRegion !== '전체') {
      filtered = filtered.filter(exp => exp.region === selectedRegion);
    }
    
    if (selectedTag !== '전체') {
      filtered = filtered.filter(exp => exp.tags.includes(selectedTag));
    }
    
    setFilteredExperiences(filtered);
  }, [selectedRegion, selectedTag]);

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setFilteredExperiences(experiences);
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [filterExperiences]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleLogin = () => {
    if (loginData.id === 'workplay' && loginData.password === 'workplay.01') {
      setIsLoggedIn(true);
      setShowLogin(false);
      setCurrentPage('home');
      setChatMessages([{
        type: 'bot',
        content: '안녕하세요! 촌캉스 워크스테이에 오신 것을 환영합니다! \n어떤 종류의 농촌 체험을 찾고 계신가요? 지역이나 활동, 기간 등 원하시는 조건을 말씀해 주세요!'
      }]);
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isLoggedIn) return;

    const userMessage = { type: 'user', content: newMessage };
    setChatMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      let botResponse = '';
      const msg = newMessage.toLowerCase();
      
      if (msg.includes('세종') && (msg.includes('1시간') || msg.includes('30분'))) {
        const nearbyExperiences = experiences.filter(exp => {
          const time = parseInt(exp.distance);
          return time <= 90; // 1시간 30분 = 90분
        }).sort((a, b) => {
          if (a.transportSupport && !b.transportSupport) return -1;
          if (!a.transportSupport && b.transportSupport) return 1;
          return parseInt(a.distance) - parseInt(b.distance);
        });
        botResponse = '1시간 30분 안에 갈 수 있는 곳으로 선별했으며, 교통편이 중요하기 때문에 교통 지원이 있는 곳을 좀 더 우선적으로 보여드리겠습니다.';
        setFilteredExperiences(nearbyExperiences);
      } else if (msg.includes('친구') && msg.includes('3명')) {
        const currentFiltered = filteredExperiences.length > 0 ? filteredExperiences : experiences;
        const filtered = currentFiltered.filter(exp => {
          const maxPeople = parseInt(exp.participants.split('-')[1]);
          return maxPeople >= 3;
        });
        botResponse = '최대 인원 3명인 곳으로 추천해드리겠습니다.';
        setFilteredExperiences(filtered);
      } else if (msg.includes('제주') || msg.includes('감귤')) {
        botResponse = '제주 감귤 수확 체험을 추천드립니다! 🍊 2박 3일 동안 제주의 아름다운 자연과 함께 감귤 수확을 체험할 수 있어요.';
        setFilteredExperiences(experiences.filter(exp => exp.region === '제주' || exp.tags.includes('과수')));
      } else if (msg.includes('딸기')) {
        botResponse = '딸기 농장 체험들을 보여드릴게요! 🍓 겨울철 따뜻한 하우스에서 달콤한 딸기를 수확할 수 있습니다.';
        setFilteredExperiences(experiences.filter(exp => exp.tags.includes('과일') && exp.title.includes('딸기')));
      } else if (msg.includes('상시') || msg.includes('언제나')) {
        botResponse = '상시 모집 중인 체험들을 보여드릴게요! 언제든지 참여 가능한 프로그램들입니다.';
        setFilteredExperiences(experiences.filter(exp => exp.type === '상시'));
      } else if (msg.includes('숙박') || msg.includes('잠')) {
        botResponse = '숙박이 제공되는 체험들을 찾아드릴게요! 🏠 편안한 농촌 숙소에서 머무르며 체험할 수 있습니다.';
        setFilteredExperiences(experiences.filter(exp => exp.benefits.includes('숙박')));
      } else {
        botResponse = '더 구체적인 조건을 말씀해 주시면 맞춤 추천을 도와드릴게요! 예를 들어 "세종 사람인데, 가는데 최대 1시간30분 안으로 갈 수 있는 곳으로 추천해줘" 같이 말씀해 주세요. 😊';
      }
      
      setChatMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
    }, 1000);

    setNewMessage('');
  };

  const handleExperienceClick = (experience) => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    alert(`${experience.title} 체험 신청이 완료되었습니다! 🎉`);
  };

  return (
    <div>
      {/* 랜딩 페이지 */}
      {currentPage === 'landing' && (
        <div className="min-h-screen" style={{backgroundColor: '#EFF3FE'}}>
          <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                촌캉스 워크스테이
              </h1>
              <p className="text-xl text-gray-600 mb-2">일하고, 머물고, 추억을 수확하다</p>
              <p className="text-lg text-gray-500">열정 하나면, 여행도 일도 가능하다</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg"
                  style={{backgroundColor: '#4467B4'}}
                >
                  로그인하기
                </button>
                
                <button
                  onClick={() => {
                    setCurrentPage('home');
                    setFilteredExperiences(experiences);
                  }}
                  className="w-full py-4 px-6 border-2 rounded-xl font-semibold text-gray-700 bg-white transition-all duration-200 hover:bg-gray-50"
                  style={{borderColor: '#4467B4'}}
                >
                  체험하기 (둘러보기)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 홈 페이지 */}
      {currentPage === 'home' && (
        <div className="min-h-screen" style={{backgroundColor: '#EFF3FE'}}>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{color: '#4467B4'}}>촌캉스 워크스테이</h1>
                <div className="flex items-center space-x-4">
                  {isLoggedIn && (
                    <button
                      onClick={() => setShowMyPage(true)}
                      className="text-gray-700 hover:text-gray-900 font-medium"
                    >
                      김예슬님
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setCurrentPage('landing');
                      setChatMessages([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex gap-6">
              {/* 왼쪽: 체험 목록 (3/4) */}
              <div className="flex-1 w-3/4 space-y-4">
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
                        {regions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">체험 태그</label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {tags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 체험 목록 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    농촌 체험 ({filteredExperiences.length}개)
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {filteredExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                        onClick={() => handleExperienceClick(exp)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">{exp.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                              exp.type === '기간제' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {exp.type}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-xs line-clamp-2">{exp.description}</p>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div>{exp.region} · {exp.duration}</div>
                            <div>{exp.participants} · 거리: {exp.distance}</div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {exp.benefits.slice(0, 2).map((benefit, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {benefit}
                              </span>
                            ))}
                            {exp.benefits.length > 2 && (
                              <span className="text-xs text-gray-500">+{exp.benefits.length - 2}</span>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {exp.period}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 채팅 봇 (1/4) */}
              <div className="w-1/4">
                <div className="bg-white rounded-xl shadow-sm h-96 flex flex-col sticky top-6">
                  <div className="flex items-center space-x-3 p-4 border-b">
                    <MessageCircle className="w-5 h-5" style={{color: '#4467B4'}} />
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
                          <div
                            key={idx}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-2 py-1 rounded text-xs whitespace-pre-line ${
                                msg.type === 'user'
                                  ? 'text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                              style={msg.type === 'user' ? {backgroundColor: '#4467B4'} : {}}
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
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="원하는 체험을 말씀해 주세요..."
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="px-2 py-1 rounded text-white"
                            style={{backgroundColor: '#4467B4'}}
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
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                <input
                  type="text"
                  value={loginData.id}
                  onChange={(e) => setLoginData({...loginData, id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="workplay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="workplay.01"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowLogin(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700"
                >
                  취소
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-white"
                  style={{backgroundColor: '#4467B4'}}
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 마이페이지 모달 */}
      {showMyPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">
                    체험 내역
                  </button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">
                    찜한 체험
                  </button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">
                    작성한 후기
                  </button>
                  <button className="w-full py-2 px-4 text-left hover:bg-gray-50 rounded-lg">
                    설정
                  </button>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMyPage(false)}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-white"
                  style={{backgroundColor: '#4467B4'}}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkStayPlatform;