import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { getStats, resetStats, formatBytes } from '../utils/stats';

// Chart.js 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Stats() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState(getStats());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 통계 새로고침
  const refreshStats = () => {
    const newStats = getStats();
    console.log('🔄 Stats refreshed:', newStats);
    setStats(newStats);
  };

  // 컴포넌트 마운트 시 통계 로드 및 주기적 업데이트
  useEffect(() => {
    refreshStats();

    // localStorage 변경 감지
    const handleStorageChange = (e) => {
      if (e.key === 'image_converter_stats') {
        console.log('📦 Storage changed, refreshing stats');
        refreshStats();
      }
    };

    // 주기적으로 통계 새로고침 (2초마다)
    const intervalId = setInterval(refreshStats, 2000);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 통계 초기화
  const handleReset = () => {
    const newStats = resetStats();
    setStats(newStats);
    setShowResetConfirm(false);
  };

  // 도넛 차트 데이터 (포맷별 변환 비율)
  const doughnutData = {
    labels: ['JPG', 'PNG', 'WEBP', 'PDF'],
    datasets: [
      {
        label: 'Conversions',
        data: [
          stats.formatCounts.jpg,
          stats.formatCounts.png,
          stats.formatCounts.webp,
          stats.formatCounts.pdf,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // 라인 차트 데이터 (최근 7일 변환 추이)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const dailyCounts = last7Days.map(date => {
    const entry = stats.dailyConversions.find(d => d.date === date);
    return entry ? entry.count : 0;
  });

  const lineData = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    datasets: [
      {
        label: 'Conversions',
        data: dailyCounts,
        fill: false,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 mb-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Usage Statistics</h2>
          </div>
          <svg
            className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Content */}
        {isOpen && (
          <div className="px-4 sm:px-6 pb-6 border-t border-gray-200">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
              {/* 총 변환 횟수 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Conversions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{stats.totalConversions}</p>
                  </div>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>

              {/* 총 파일 개수 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Total Files</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700 mt-1">{stats.totalFiles}</p>
                  </div>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* JPG 변환 */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-red-600 font-medium">JPG Conversions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-1">{stats.formatCounts.jpg}</p>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-red-500 opacity-50">JPG</span>
                </div>
              </div>

              {/* PNG 변환 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">PNG Conversions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">{stats.formatCounts.png}</p>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-blue-500 opacity-50">PNG</span>
                </div>
              </div>

              {/* WEBP 변환 */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-yellow-600 font-medium">WEBP Conversions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-700 mt-1">{stats.formatCounts.webp}</p>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-yellow-500 opacity-50">WEBP</span>
                </div>
              </div>

              {/* PDF 변환 */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-teal-600 font-medium">PDF Conversions</p>
                    <p className="text-2xl sm:text-3xl font-bold text-teal-700 mt-1">{stats.formatCounts.pdf}</p>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-teal-500 opacity-50">PDF</span>
                </div>
              </div>

              {/* 절약한 용량 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-5 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">Total Space Saved</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1">{formatBytes(stats.totalSavedSize)}</p>
                  </div>
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 차트 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* 도넛 차트 */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Conversions by Format</h3>
                <div className="h-64">
                  {stats.totalConversions > 0 ? (
                    <Doughnut data={doughnutData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>No conversion data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 라인 차트 */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Last 7 Days Trend</h3>
                <div className="h-64">
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* 초기화 버튼 */}
            <div className="mt-6 flex justify-end">
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm sm:text-base"
                >
                  Reset Statistics
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-sm sm:text-base text-gray-700 font-medium">Are you sure you want to reset?</p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;
