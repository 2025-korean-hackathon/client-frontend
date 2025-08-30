import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, MessageCircle, Send, Filter, Star, Clock, Gift } from 'lucide-react';

const WorkStayPlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  const [loginData, setLoginData] = useState({ id: '', password: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedTag, setSelectedTag] = useState('전체');
  const chatEndRef = useRef(null);

  // 더미 데이터
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
      rating: 4.8,
      reviews: 23
    },
    {
      id: 2,
      title: '강원도 감자 캐기 체험',
      region: '강원도',
      duration: '1박 2일',
      participants: '3-6명',
      period: '상시모집',
      type: '상시',
      tags: ['채소', '수확', '자연'],
      benefits: ['숙박', '식사', '교통지원'],
      image: '🥔',
      description: '강원도 대관령 감자밭에서 감자 캐기 체험과 농촌 생활을 경험해보세요.',
      rating: 4.6,
      reviews: 15
    },
    {
      id: 3,
      title: '경북 사과 농장 일손돕기',
      region: '경상북도',
      duration: '3박 4일',
      participants: '2-5명',
      period: '2024.09.20 - 2024.10.30',
      type: '기간제',
      tags: ['과수', '수확', '체험'],
      benefits: ['숙박', '지역화폐'],
      image: '🍎',
      description: '경북 영주 사과농장에서 수확철 일손을 도우며 농촌의 정취를 느껴보세요.',
      rating: 4.9,
      reviews: 31
    },
    {
      id: 4,
      title: '전남 벼 수확 체험',
      region: '전라남도',
      duration: '2박 3일',
      participants: '4-8명',
      period: '2024.10.01 - 2024.11.15',
      type: '기간제',
      tags: ['곡물', '수확', '전통'],
      benefits: ['숙박', '식사', '교통지원', '지역화폐'],
      image: '🌾',
      description: '전남 평야지대에서 벼 수확 체험과 전통 농업 방식을 배워보세요.',
      rating: 4.7,
      reviews: 18
    },
    {
      id: 5,
      title: '충북 버섯 재배 체험',
      region: '충청북도',
      duration: '1박 2일',
      participants: '2-3명',
      period: '상시모집',
      type: '상시',
      tags: ['재배', '실내작업', '힐링'],
      benefits: ['숙박', '식사'],
      image: '🍄',
      description: '충북 음성 버섯농장에서 버섯 재배 과정을 체험하고 농촌 생활을 즐겨보세요.',
      rating: 4.5,
      reviews: 12
    },
    {
      id: 6,
      title: '경기도 딸기 농장 체험',
      region: '경기도',
      duration: '1박 2일',
      participants: '2-4명',
      period: '2024.12.01 - 2025.02.28',
      type: '기간제',
      tags: ['과일', '재배', '체험'],
      benefits: ['교통지원', '지역화폐'],
      image: '🍓',
      description: '경기도 파주 딸기농장에서 딸기 재배 과정을 배우고 수확의 기쁨을 만끽하세요.',
      rating: 4.8,
      reviews: 27
    }
  ];

  const regions = ['전체', '제주', '강원도', '경상북도', '전라남도', '충청북도', '경기도'];
  const tags = ['전체', '과수', '채소', '수확', '힐링', '자연', '체험', '곡물', '전통', '재배', '실내작업', '과일'];

  useEffect(() => {
    filterExperiences();
  }, [selectedRegion, selectedTag]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filterExperiences = () => {
    let filtered = experiences;
    
    if (selectedRegion !== '전체') {
      filtered = filtered.filter(exp => exp.region === selectedRegion);
    }
    
    if (selectedTag !== '전체') {
      filtered = filtered.filter(exp => exp.tags.includes(selectedTag));
    }
    
    setFilteredExperiences(filtered);
  };

  const handleLogin = () => {
    if (loginData.id === 'workplay' && loginData.password === 'workplay.01') {
      setIsLoggedIn(true);
      setShowLogin(false);
      setCurrentPage('home');
      setChatMessages([{
        type: 'bot',
        content: '안녕하세요! 촌캉스 워크스테이에 오신 것을 환영합니다! 🌱\n어떤 종류의 농촌 체험을 찾고 계신가요? 지역이나 활동, 기간 등 원하시는 조건을 말씀해 주세요!'
      }]);
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isLoggedIn) return;

    const userMessage = { type: 'user', content: newMessage };
    setChatMessages(prev => [...prev, userMessage]);

    // 간단한 챗봇 응답 로직
    setTimeout(() => {
      let botResponse = '';
      const msg = newMessage.toLowerCase();
      
      if (msg.includes('제주') || msg.includes('감귤')) {
        botResponse = '제주 감귤 수확 체험을 추천드립니다! 🍊 2박 3일 동안 제주의 아름다운 자연과 함께 감귤 수확을 체험할 수 있어요.';
        // 제주 관련 체험만 필터링
        setFilteredExperiences(experiences.filter(exp => exp.region === '제주' || exp.tags.includes('과수')));
      } else if (msg.includes('감자') || msg.includes('강원')) {
        botResponse = '강원도 감자 캐기 체험은 어떠세요? 🥔 대관령의 시원한 바람과 함께 감자 캐기를 체험할 수 있습니다!';
        setFilteredExperiences(experiences.filter(exp => exp.region === '강원도' || exp.tags.includes('채소')));
      } else if (msg.includes('사과')) {
        botResponse = '경북 사과 농장 일손돕기를 추천합니다! 🍎 사과 수확철의 바쁜 농장에서 보람찬 경험을 하실 수 있어요.';
        setFilteredExperiences(experiences.filter(exp => exp.tags.includes('과수')));
      } else if (msg.includes('상시') || msg.includes('언제나')) {
        botResponse = '상시 모집 중인 체험들을 보여드릴게요! 언제든지 참여 가능한 프로그램들입니다. 🕐';
        setFilteredExperiences(experiences.filter(exp => exp.type === '상시'));
      } else if (msg.includes('숙박') || msg.includes('잠')) {
        botResponse = '숙박이 제공되는 체험들을 찾아드릴게요! 🏠 편안한 농촌 숙소에서 머무르며 체험할 수 있습니다.';
        setFilteredExperiences(experiences.filter(exp => exp.benefits.includes('숙박')));
      } else if (msg.includes('짧게') || msg.includes('1박') || msg.includes('당일')) {
        botResponse = '짧은 기간 체험을 찾으시는군요! 1박 2일 코스들을 추천해드립니다. ⏰';
        setFilteredExperiences(experiences.filter(exp => exp.duration.includes('1박')));
      } else {
        botResponse = '더 구체적인 조건을 말씀해 주시면 맞춤 추천을 도와드릴게요! 예를 들어 "제주에서 과일 체험하고 싶어" 또는 "상시 모집하는 곳 찾아줘" 같이 말씀해 주세요. 😊';
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
    alert(`${experience.title} 체험 신청이 완료되었습니다! 곧 담당자가 연락드릴 예정입니다. 🎉`);
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50" style={{backgroundColor: '#EFF3FE'}}>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="workplay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="workplay.01"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
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
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen" style={{backgroundColor: '#EFF3FE'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold" style={{color: '#4467B4'}}>촌캉스 워크스테이</h1>
              {isLoggedIn && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  로그인됨
                </span>
              )}
            </div>
            <button
              onClick={() => setCurrentPage('landing')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 체험 목록 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 필터 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">체험 필터</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험 태그</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              
              <div className="grid gap-4">
                {filteredExperiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
                    onClick={() => handleExperienceClick(exp)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{exp.image}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{exp.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{exp.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            exp.type === '기간제' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {exp.type}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{exp.region}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{exp.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{exp.participants}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{exp.rating} ({exp.reviews})</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {exp.benefits.map((benefit, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                              >
                                <Gift className="w-3 h-3 inline mr-1" />
                                {benefit}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            {exp.period}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 채팅 봇 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm h-96 flex flex-col">
              <div className="flex items-center space-x-3 p-4 border-b">
                <MessageCircle className="w-6 h-6" style={{color: '#4467B4'}} />
                <h3 className="font-semibold">AI 체험 추천봇</h3>
              </div>

              {!isLoggedIn ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>로그인 후 AI 추천 서비스를<br />이용할 수 있습니다</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            msg.type === 'user'
                              ? 'bg-blue-500 text-white'
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

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="원하는 체험을 말씀해 주세요..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-3 py-2 rounded-lg text-white"
                        style={{backgroundColor: '#4467B4'}}
                      >
                        <Send className="w-4 h-4" />
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
  );

  return (
    <>
      {currentPage === 'landing' ? <LandingPage /> : <HomePage />}
    </>
  );
};

export default WorkStayPlatform;