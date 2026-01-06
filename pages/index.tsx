import React, { useState, useEffect } from 'react';
import { Language, translations, getInitialLanguage } from '../lib/translations';
import { UserAnswers, recommendDrinks, ScoredDrink } from '../lib/dss';
import { LanguageSelector } from '../components/LanguageSelector';
import { QuestionCard } from '../components/QuestionCard';
import { ResultCard } from '../components/ResultCard';
import { StaffViewModal } from '../components/StaffViewModal';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import styles from '../styles/Home.module.css';

type QuestionStep = 'start' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'result';

export default function Home() {
  const [language, setLanguage] = useState<Language>('ja');
  const [step, setStep] = useState<QuestionStep>('start');
  const [answers, setAnswers] = useState<UserAnswers>({
    mood: 'refreshing',
    sweetness: 'medium',
    ice: 'normal',
    texture: 'smooth',
    constraints: {
      noMilk: false,
      lowCaffeine: false,
      lowSugar: false,
    },
  });
  const [results, setResults] = useState<ScoredDrink[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrinkForStaff, setSelectedDrinkForStaff] = useState<ScoredDrink | null>(null);

  // ブラウザ言語で初期化
  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);

  const handleAnswer = (questionKey: string, value: string) => {
    if (questionKey === 'q1') {
      setAnswers((prev) => ({
        ...prev,
        mood: value as UserAnswers['mood'],
      }));
    } else if (questionKey === 'q2') {
      setAnswers((prev) => ({
        ...prev,
        sweetness: value as UserAnswers['sweetness'],
      }));
    } else if (questionKey === 'q3') {
      setAnswers((prev) => ({
        ...prev,
        ice: value as UserAnswers['ice'],
      }));
    } else if (questionKey === 'q4') {
      setAnswers((prev) => ({
        ...prev,
        texture: value as UserAnswers['texture'],
      }));
    } else if (questionKey === 'q5') {
      // Q4は複数選択（チェックボックス）
      setAnswers((prev) => {
        const currentConstraints = prev.constraints;
        const constraintKey = value as keyof typeof currentConstraints;
        
        // トグル処理
        if (value === 'none') {
          // 「特になし」が選択されたら他の制約を全て解除
          return {
            ...prev,
            constraints: {
              noMilk: false,
              lowCaffeine: false,
              lowSugar: false,
            },
          };
        } else {
          // 他の制約が選択されたら「特になし」を解除
          return {
            ...prev,
            constraints: {
              ...currentConstraints,
              [constraintKey]: !currentConstraints[constraintKey],
            },
          };
        }
      });
    }
  };

  const handleNext = () => {
    if (step === 'start') {
      setStep('q1');
    } else if (step === 'q1') {
      setStep('q2');
    } else if (step === 'q2') {
      setStep('q3');
    } else if (step === 'q3') {
      setStep('q4');
    } else if (step === 'q4') {
      setStep('q5');
    } else if (step === 'q5') {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 'q1') {
      setStep('start');
    } else if (step === 'q2') {
      setStep('q1');
    } else if (step === 'q3') {
      setStep('q2');
    } else if (step === 'q4') {
      setStep('q3');
    } else if (step === 'q5') {
      setStep('q4');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const recommendations = await recommendDrinks(answers, language);
      setResults(recommendations);
      setStep('result');
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      const errorMessages: Record<Language, string> = {
        ja: 'エラーが発生しました。もう一度お試しください。',
        ko: '오류가 발생했습니다. 다시 시도해주세요.',
        en: 'An error occurred. Please try again.',
        'zh-TW': '發生錯誤，請再試一次。',
      };
      alert(errorMessages[language]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStep('start');
    setAnswers({
      mood: 'refreshing',
      sweetness: 'medium',
      ice: 'normal',
      texture: 'smooth',
      constraints: {
        noMilk: false,
        lowCaffeine: false,
        lowSugar: false,
      },
    });
    setResults([]);
  };

  const t = translations[language];
  const canProceed =
    step === 'start' ||
    (step === 'q1' && answers.mood) ||
    (step === 'q2' && answers.sweetness) ||
    (step === 'q3' && answers.ice) ||
    (step === 'q4' && answers.texture) ||
    step === 'q5';

  // プログレスバー用のステップ計算
  const getCurrentStep = (): number => {
    const stepMap: Record<QuestionStep, number> = {
      start: 0,
      q1: 1,
      q2: 2,
      q3: 3,
      q4: 4,
      q5: 5,
      result: 5,
    };
    return stepMap[step];
  };

  return (
    <div className={styles.container}>
      <LanguageSelector
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <main className={styles.main}>
        {(step !== 'start' && step !== 'result') && (
          <ProgressBar
            currentStep={getCurrentStep()}
            totalSteps={5}
            language={language}
          />
        )}

        {step === 'start' && (
          <div className={styles.startScreen}>
            <div className={styles.startIcon}>🥤</div>
            <h1 className={styles.title}>
              {language === 'ja' && 'ドリンク診断'}
              {language === 'ko' && '음료 진단'}
              {language === 'en' && 'Drink Diagnosis'}
              {language === 'zh-TW' && '飲品診斷'}
            </h1>
            <p className={styles.subtitle}>
              {language === 'ja' && '1分以内の質問に答えるだけで、あなたにぴったりのドリンクをおすすめします'}
              {language === 'ko' && '1분 이내의 질문에 답하기만 하면 당신에게 딱 맞는 음료를 추천합니다'}
              {language === 'en' && 'Answer a few questions in under 1 minute, and we\'ll recommend the perfect drink for you'}
              {language === 'zh-TW' && '只需回答幾個問題，我們就會為您推薦最適合的飲品'}
            </p>
            <button
              className={styles.primaryButton}
              onClick={handleNext}
            >
              {t.ui.start}
            </button>
          </div>
        )}

        {step === 'q1' && (
          <>
            <QuestionCard
              questionKey="q1"
              translations={t}
              selectedValue={answers.mood}
              onSelect={(value) => handleAnswer('q1', value)}
            />
            <div className={styles.buttons}>
              <button
                className={styles.secondaryButton}
                onClick={handleBack}
              >
                {t.ui.back}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!canProceed}
              >
                {t.ui.next}
              </button>
            </div>
          </>
        )}

        {step === 'q2' && (
          <>
            <QuestionCard
              questionKey="q2"
              translations={t}
              selectedValue={answers.sweetness}
              onSelect={(value) => handleAnswer('q2', value)}
            />
            <div className={styles.buttons}>
              <button
                className={styles.secondaryButton}
                onClick={handleBack}
              >
                {t.ui.back}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!canProceed}
              >
                {t.ui.next}
              </button>
            </div>
          </>
        )}

        {step === 'q3' && (
          <>
            <QuestionCard
              questionKey="q3"
              translations={t}
              selectedValue={answers.ice}
              onSelect={(value) => handleAnswer('q3', value)}
            />
            <div className={styles.buttons}>
              <button
                className={styles.secondaryButton}
                onClick={handleBack}
              >
                {t.ui.back}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!canProceed}
              >
                {t.ui.next}
              </button>
            </div>
          </>
        )}

        {step === 'q4' && (
          <>
            <QuestionCard
              questionKey="q4"
              translations={t}
              selectedValue={answers.texture}
              onSelect={(value) => handleAnswer('q4', value)}
            />
            <div className={styles.buttons}>
              <button
                className={styles.secondaryButton}
                onClick={handleBack}
              >
                {t.ui.back}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!canProceed}
              >
                {t.ui.next}
              </button>
            </div>
          </>
        )}

        {step === 'q5' && (
          <>
            <QuestionCard
              questionKey="q5"
              translations={t}
              selectedValue={[
                answers.constraints.noMilk ? 'noMilk' : '',
                answers.constraints.lowCaffeine ? 'lowCaffeine' : '',
                answers.constraints.lowSugar ? 'lowSugar' : '',
                !answers.constraints.noMilk &&
                !answers.constraints.lowCaffeine &&
                !answers.constraints.lowSugar
                  ? 'none'
                  : '',
              ].filter(Boolean)}
              onSelect={(value) => handleAnswer('q5', value)}
              isMultiple={true}
            />
            <div className={styles.buttons}>
              <button
                className={styles.secondaryButton}
                onClick={handleBack}
              >
                {t.ui.back}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={loading}
              >
                {loading
                  ? language === 'ja'
                    ? '計算中...'
                    : language === 'ko'
                    ? '계산 중...'
                    : language === 'zh-TW'
                    ? '計算中...'
                    : 'Calculating...'
                  : t.ui.submit}
              </button>
            </div>
            {loading && <LoadingSkeleton />}
          </>
        )}

        {step === 'result' && (
          <div className={styles.results}>
            <h2 className={styles.resultsTitle}>{t.ui.recommendations}</h2>
            {results.map((drink, index) => (
              <div
                key={drink.id}
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
                className={styles.resultCardWrapper}
              >
                <ResultCard
                  drink={drink}
                  rank={index + 1}
                  language={language}
                  onShowStaffView={() => setSelectedDrinkForStaff(drink)}
                />
              </div>
            ))}
            <button
              className={styles.primaryButton}
              onClick={handleRestart}
            >
              {t.ui.restart}
            </button>
          </div>
        )}
      </main>
      
      {selectedDrinkForStaff && (
        <StaffViewModal
          drink={selectedDrinkForStaff}
          answers={answers}
          isOpen={true}
          onClose={() => setSelectedDrinkForStaff(null)}
        />
      )}
    </div>
  );
}

