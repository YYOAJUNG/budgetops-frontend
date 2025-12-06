// 구글 스프레드시트 피드백 데이터 타입
export interface FeedbackResponse {
  timestamp: string;
  satisfaction: number;
  positivePoints: string;
  negativePoints: string;
  additionalComments: string;
}

/**
 * 구글 스프레드시트에서 피드백 데이터 가져오기
 */
export async function getFeedbackData(): Promise<FeedbackResponse[]> {
  // 제공된 CSV URL 직접 사용
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRStxYQBNwVsQJhBpH7HhDaX7YPJhPi5_WMy4SDaUNXOkbYiAemvUPFkutB-cGtV0wKvIn72-DVKMNs/pub?output=csv';
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    // BOM 제거 (UTF-8 BOM이 있는 경우)
    const cleanCsvText = csvText.replace(/^\uFEFF/, '');
    
    // CSV 파싱
    const lines = cleanCsvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return [];
    }
    
    // 헤더는 무시하고 데이터만 처리 (헤더: 타임스탬프, 만족도, 긍정점, 부정점, 기타의견)
    const data: FeedbackResponse[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // CSV 파싱 (쉼표로 구분, 따옴표 처리)
      const values = parseCSVLine(lines[i]);
      
      // 최소 2개 컬럼 (타임스탬프, 만족도)는 있어야 함
      if (values.length < 2) continue;
      
      data.push({
        timestamp: values[0] || '',
        satisfaction: parseInt(values[1]) || 0,
        positivePoints: values[2] || '',
        negativePoints: values[3] || '',
        additionalComments: values[4] || '',
      });
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch feedback data:', error);
    throw error;
  }
}

// CSV 라인 파싱 헬퍼 함수
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

/**
 * 만족도 통계 계산
 */
export interface SatisfactionStats {
  average: number;
  total: number;
  distribution: { [key: number]: number };
}

export function calculateSatisfactionStats(data: FeedbackResponse[]): SatisfactionStats {
  const validSatisfaction = data.filter(d => d.satisfaction > 0);
  const total = validSatisfaction.length;
  const sum = validSatisfaction.reduce((acc, d) => acc + d.satisfaction, 0);
  const average = total > 0 ? sum / total : 0;
  
  const distribution: { [key: number]: number } = {};
  validSatisfaction.forEach(d => {
    distribution[d.satisfaction] = (distribution[d.satisfaction] || 0) + 1;
  });
  
  return {
    average: Math.round(average * 10) / 10,
    total,
    distribution,
  };
}
