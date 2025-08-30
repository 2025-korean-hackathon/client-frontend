/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 제목용(포스터 느낌)
        display: ['BMJUA','GmarketSansBold','TmoneyRoundWindExtraBold','Pretendard','sans-serif'],
        // 본문/UI
        sans: ['Pretendard','system-ui','-apple-system','BlinkMacSystemFont','sans-serif'],
      },
      colors: {
        brandBrown: '#7A3600', // 따뜻한 브라운(포스터 텍스트)
        brandYellow: '#f4c55c', // 배경 머스타드
      },
    },
  },
  plugins: [],
};
