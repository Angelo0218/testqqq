const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://globalai.vip/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL_TEXT = process.env.OPENAI_MODEL_TEXT || 'gemini-3-flash-preview';
const OPENAI_MODEL_VISION = process.env.OPENAI_MODEL_VISION || 'gemini-3-flash-preview';

async function openaiChat(messages, model) {
  if (!OPENAI_API_KEY) return null;
  
  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7
      })
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try { 
    return JSON.parse(text.slice(start, end + 1)); 
  } catch { 
    return null; 
  }
}

export async function generateDiaryResponse(content) {
  const text = (content || '').trim();
  if (text.length < 2) return '請多寫一些內容讓我回應你。';

  const prompt = `你是鼓勵型教練，請用繁體中文回覆，80字以內。

日記內容：${text}`;

  const aiText = await openaiChat(
    [{ role: 'user', content: prompt }],
    OPENAI_MODEL_TEXT
  );
  
  return aiText || '我讀完了你的日記，保持這個習慣，你做得很好！';
}

export async function analyzeMealImage(imageStr) {
  const fallback = () => {
    let hash = 0;
    for (let i = 0; i < (imageStr || '').length; i++) {
      hash = ((hash << 5) - hash) + imageStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    return {
      calories: (seed % 400) + 300,
      protein: (seed % 30) + 10,
      fat: (seed % 20) + 5,
      carb: (seed % 60) + 20,
      summary: '無法分析圖片，這是估算值'
    };
  };

  if (!imageStr || !OPENAI_API_KEY) return fallback();

  const prompt = '你是營養師，請根據照片估算營養素與熱量。' +
    '只回傳 JSON：{"calories": number, "protein": number, "fat": number, "carb": number, "summary": string}。' +
    'summary 請用繁體中文一句話描述餐點。';

  try {
    const aiText = await openaiChat(
      [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageStr } }
          ]
        }
      ],
      OPENAI_MODEL_VISION
    );
    
    const json = extractJson(aiText);
    if (json && Number.isFinite(json.calories)) {
      return {
        calories: Number(json.calories),
        protein: Number(json.protein || 0),
        fat: Number(json.fat || 0),
        carb: Number(json.carb || 0),
        summary: json.summary || ''
      };
    }
  } catch {
    return fallback();
  }

  return fallback();
}

export async function generateSummary(stats) {
  const prompt = `請用繁體中文輸出總覽與一句建議（80字內）。
專注分鐘: ${stats.focusMinutes}
任務完成率: ${stats.todoRate}% (${stats.completedTodos}/${stats.totalTodos})
今日熱量: ${stats.todayCalories}
日記數: ${stats.diaryCount}`;

  const aiText = await openaiChat(
    [{ role: 'user', content: prompt }],
    OPENAI_MODEL_TEXT
  );
  
  return aiText || '總覽準備就緒，保持你的動力並平衡你的能量。';
}
