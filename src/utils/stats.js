const STATS_KEY = 'image_converter_stats';

// 기본 통계 구조
const defaultStats = {
  totalConversions: 0,
  totalFiles: 0,
  totalSavedSize: 0, // bytes
  formatCounts: {
    jpg: 0,
    png: 0,
    webp: 0,
    pdf: 0,
  },
  dailyConversions: [], // { date: 'YYYY-MM-DD', count: number }
};

// 통계 불러오기
export const getStats = () => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return { ...defaultStats };

    const stats = JSON.parse(stored);

    // 기본 구조와 병합 (새로운 필드 추가 시 호환성 유지)
    return {
      ...defaultStats,
      ...stats,
      formatCounts: {
        ...defaultStats.formatCounts,
        ...(stats.formatCounts || {}),
      },
      dailyConversions: stats.dailyConversions || [],
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
    return { ...defaultStats };
  }
};

// 통계 업데이트
export const updateStats = (data) => {
  try {
    const stats = getStats();
    const { format, originalSize, convertedSize } = data;

    console.log('📊 Updating stats:', {
      format,
      originalSize: Math.round(originalSize),
      convertedSize: Math.round(convertedSize),
      beforeTotal: stats.totalConversions,
    });

    // 총 변환 횟수 증가
    stats.totalConversions += 1;
    stats.totalFiles += 1;

    // 절약한 용량 계산
    const savedSize = originalSize - convertedSize;
    if (savedSize > 0) {
      stats.totalSavedSize += savedSize;
    }

    // 포맷별 카운트 증가
    const formatKey = format.toLowerCase();
    if (stats.formatCounts.hasOwnProperty(formatKey)) {
      stats.formatCounts[formatKey] += 1;
    }

    console.log('📊 Stats after update:', {
      totalConversions: stats.totalConversions,
      formatCounts: stats.formatCounts,
    });

    // 일별 변환 카운트 업데이트
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayEntry = stats.dailyConversions.find(entry => entry.date === today);

    if (todayEntry) {
      todayEntry.count += 1;
    } else {
      stats.dailyConversions.push({ date: today, count: 1 });
    }

    // 최근 7일 데이터만 유지
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    stats.dailyConversions = stats.dailyConversions.filter(entry => {
      return new Date(entry.date) >= sevenDaysAgo;
    });

    // 날짜순 정렬
    stats.dailyConversions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 저장
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));

    return stats;
  } catch (error) {
    console.error('Failed to update stats:', error);
    return getStats();
  }
};

// 통계 초기화
export const resetStats = () => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify({ ...defaultStats }));
    return { ...defaultStats };
  } catch (error) {
    console.error('Failed to reset stats:', error);
    return getStats();
  }
};

// 용량을 읽기 쉬운 형식으로 변환
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
