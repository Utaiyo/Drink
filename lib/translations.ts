/**
 * 多言語対応の翻訳辞書
 * DSSシステム全体で使用するテキストを管理
 */

export type Language = 'ja' | 'ko' | 'en' | 'zh-TW';

export interface Translations {
  // 質問
  questions: {
    q1: {
      title: string;
      options: {
        refreshing: string;
        tired: string;
        excited: string;
        calm: string;
      };
    };
    q2: {
      title: string;
      options: {
        noSugar: string;
        light: string;
        medium: string;
        sweet: string;
      };
    };
    q3: {
      title: string;
      options: {
        noIce: string;
        light: string;
        normal: string;
        extra: string;
      };
    };
    q4: {
      title: string;
      options: {
        light: string;
        jelly: string;
        chewy: string;
        smooth: string;
      };
    };
    q5: {
      title: string;
      options: {
        noMilk: string;
        lowCaffeine: string;
        lowSugar: string;
        none: string;
      };
    };
  };
  // UI要素
  ui: {
    start: string;
    next: string;
    submit: string;
    back: string;
    restart: string;
    selectLanguage: string;
    recommendations: string;
    whyRecommended: string;
  };
  // 理由文テンプレート
  reasons: {
    refreshing: string;
    tired: string;
    excited: string;
    calm: string;
    sugarMatch: string;
    textureMatch: string;
    constraintMatch: string;
  };
}

export const translations: Record<Language, Translations> = {
  ja: {
    questions: {
      q1: {
        title: '今の気分は？',
        options: {
          refreshing: 'さっぱりしたい',
          tired: 'ちょっと疲れてる',
          excited: 'テンション高め',
          calm: '落ち着きたい',
        },
      },
      q2: {
        title: '今日の甘さは？',
        options: {
          noSugar: '甘くない',
          light: 'ほんのり',
          medium: 'ちょい甘',
          sweet: '甘いのが好き',
        },
      },
      q3: {
        title: '氷の量は？',
        options: {
          noIce: '氷なし',
          light: '少なめ',
          normal: '普通',
          extra: '多め',
        },
      },
      q4: {
        title: '口の中のイメージは？',
        options: {
          light: 'すっきり軽い',
          jelly: 'ぷるぷる',
          chewy: 'もちもち',
          smooth: 'なめらか',
        },
      },
      q5: {
        title: '制約（任意・複数可）',
        options: {
          noMilk: '乳製品は避けたい',
          lowCaffeine: 'カフェイン控えめ',
          lowSugar: '低糖がいい',
          none: '特になし',
        },
      },
    },
    ui: {
      start: '診断を始める',
      next: '次へ',
      submit: '結果を見る',
      back: '戻る',
      restart: 'もう一度診断する',
      selectLanguage: '言語を選択',
      recommendations: 'おすすめドリンク',
      whyRecommended: 'なぜおすすめか',
    },
    reasons: {
      refreshing: 'さっぱりしたいという気分に合わせて、爽やかで軽い味わいのドリンクです。',
      tired: '疲れを感じている方に、リフレッシュできる味わいをおすすめします。',
      excited: 'テンション高めの気分にぴったりの、元気が出るドリンクです。',
      calm: '落ち着きたい気分に合わせて、穏やかで優しい味わいのドリンクです。',
      sugarMatch: 'ご希望の甘さに合わせて選びました。',
      textureMatch: 'お好みの口当たりに合うドリンクです。',
      constraintMatch: 'ご指定の制約条件を満たしています。',
    },
  },
  ko: {
    questions: {
      q1: {
        title: '지금 기분은?',
        options: {
          refreshing: '시원하게 하고 싶어요',
          tired: '조금 피곤해요',
          excited: '텐션 높아요',
          calm: '차분하게 하고 싶어요',
        },
      },
      q2: {
        title: '오늘의 단맛은?',
        options: {
          noSugar: '달지 않게',
          light: '은은하게',
          medium: '조금 달게',
          sweet: '달게 좋아해요',
        },
      },
      q3: {
        title: '얼음 양은?',
        options: {
          noIce: '얼음 없음',
          light: '적게',
          normal: '보통',
          extra: '많이',
        },
      },
      q4: {
        title: '입 안의 느낌은?',
        options: {
          light: '깔끔하고 가볍게',
          jelly: '젤리처럼',
          chewy: '쫄깃하게',
          smooth: '부드럽게',
        },
      },
      q5: {
        title: '제약사항 (선택사항, 복수 선택 가능)',
        options: {
          noMilk: '유제품 피하고 싶어요',
          lowCaffeine: '카페인 적게',
          lowSugar: '저당 좋아요',
          none: '특별히 없어요',
        },
      },
    },
    ui: {
      start: '진단 시작하기',
      next: '다음',
      submit: '결과 보기',
      back: '뒤로',
      restart: '다시 진단하기',
      selectLanguage: '언어 선택',
      recommendations: '추천 음료',
      whyRecommended: '왜 추천하는가',
    },
    reasons: {
      refreshing: '시원하게 하고 싶다는 기분에 맞춰 상쾌하고 가벼운 맛의 음료입니다.',
      tired: '피곤함을 느끼시는 분께 상쾌한 맛을 추천합니다.',
      excited: '텐션이 높은 기분에 딱 맞는 활력을 주는 음료입니다.',
      calm: '차분하게 하고 싶은 기분에 맞춰 온화하고 부드러운 맛의 음료입니다.',
      sugarMatch: '원하시는 단맛에 맞춰 선택했습니다.',
      textureMatch: '선호하시는 식감에 맞는 음료입니다.',
      constraintMatch: '지정하신 제약조건을 만족합니다.',
    },
  },
  en: {
    questions: {
      q1: {
        title: 'How are you feeling?',
        options: {
          refreshing: 'Want something refreshing',
          tired: 'A bit tired',
          excited: 'Feeling energetic',
          calm: 'Want to relax',
        },
      },
      q2: {
        title: 'How sweet do you want it?',
        options: {
          noSugar: 'No sugar',
          light: 'Lightly sweet',
          medium: 'Moderately sweet',
          sweet: 'I like it sweet',
        },
      },
      q3: {
        title: 'How much ice?',
        options: {
          noIce: 'No ice',
          light: 'Light ice',
          normal: 'Normal',
          extra: 'Extra ice',
        },
      },
      q4: {
        title: 'What texture do you prefer?',
        options: {
          light: 'Light and crisp',
          jelly: 'Jelly-like',
          chewy: 'Chewy',
          smooth: 'Smooth',
        },
      },
      q5: {
        title: 'Constraints (optional, multiple selection)',
        options: {
          noMilk: 'Avoid dairy',
          lowCaffeine: 'Low caffeine',
          lowSugar: 'Low sugar',
          none: 'None',
        },
      },
    },
    ui: {
      start: 'Start Diagnosis',
      next: 'Next',
      submit: 'See Results',
      back: 'Back',
      restart: 'Restart',
      selectLanguage: 'Select Language',
      recommendations: 'Recommended Drinks',
      whyRecommended: 'Why Recommended',
    },
    reasons: {
      refreshing: 'Based on your preference for something refreshing, this drink offers a crisp and light taste.',
      tired: 'For those feeling tired, we recommend this refreshing drink.',
      excited: 'This energizing drink matches your high-energy mood perfectly.',
      calm: 'This drink offers a gentle and soothing taste that matches your desire to relax.',
      sugarMatch: 'Selected to match your preferred sweetness level.',
      textureMatch: 'This drink matches your preferred texture.',
      constraintMatch: 'This drink meets your specified constraints.',
    },
  },
  'zh-TW': {
    questions: {
      q1: {
        title: '現在的心情是？',
        options: {
          refreshing: '想要清爽',
          tired: '有點累',
          excited: '精神很好',
          calm: '想要放鬆',
        },
      },
      q2: {
        title: '今天的甜度是？',
        options: {
          noSugar: '不甜',
          light: '微甜',
          medium: '適中甜',
          sweet: '喜歡甜的',
        },
      },
      q3: {
        title: '冰塊量是？',
        options: {
          noIce: '無冰',
          light: '少冰',
          normal: '正常',
          extra: '多冰',
        },
      },
      q4: {
        title: '喜歡的口感是？',
        options: {
          light: '清爽輕盈',
          jelly: 'Q彈',
          chewy: '有嚼勁',
          smooth: '滑順',
        },
      },
      q5: {
        title: '限制條件（可選，可複選）',
        options: {
          noMilk: '避免乳製品',
          lowCaffeine: '低咖啡因',
          lowSugar: '低糖',
          none: '無',
        },
      },
    },
    ui: {
      start: '開始診斷',
      next: '下一步',
      submit: '查看結果',
      back: '返回',
      restart: '重新診斷',
      selectLanguage: '選擇語言',
      recommendations: '推薦飲品',
      whyRecommended: '推薦理由',
    },
    reasons: {
      refreshing: '根據您想要清爽的需求，這款飲品提供清新輕盈的口感。',
      tired: '對於感到疲累的您，我們推薦這款能提神的飲品。',
      excited: '這款充滿活力的飲品完美符合您精神飽滿的心情。',
      calm: '這款飲品提供溫和舒緩的口感，符合您想要放鬆的需求。',
      sugarMatch: '已根據您偏好的甜度選擇。',
      textureMatch: '這款飲品符合您偏好的口感。',
      constraintMatch: '這款飲品符合您指定的限制條件。',
    },
  },
};

/**
 * ブラウザの言語設定から初期言語を取得
 */
export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ja';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('zh')) return 'zh-TW';
  return 'ja';
}

