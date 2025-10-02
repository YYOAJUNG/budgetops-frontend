import React from 'react';
import { Button } from './ui/button';
import { ClipboardList } from 'lucide-react';
import { trackButtonClick } from '../utils/analytics';

interface SurveyButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  textType?: 'none' | 'short' | 'medium' | 'long';
  className?: string;
}

export function SurveyButton({ 
  variant = 'ghost', 
  size = 'sm', 
  textType = 'none',
  className = ''
}: SurveyButtonProps) {
  const handleSurveyClick = () => {
    trackButtonClick('survey_feedback', 'Survey', window.location.pathname, {
      survey_type: 'user_feedback',
      page_context: window.location.pathname,
      text_type: textType
    });
    
    // Open survey in new tab
    window.open('https://docs.google.com/forms/d/1qk64qDj26qbyUApxVwnG1mr_WgqVT1yRiSD1QIy6lA8', '_blank');
  };

  const buttonSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textOptions = {
    none: '',
    short: '설문조사',
    medium: '피드백 남기기',
    long: '설문조사 참여하기'
  };

  const tooltipText = '사용자 경험 개선을 위한 설문조사에 참여해주세요';

  // Icon only button
  if (textType === 'none') {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleSurveyClick}
        className={`${buttonSizes[size]} ${className}`}
        title={tooltipText}
      >
        <ClipboardList className={iconSizes[size]} />
      </Button>
    );
  }

  // Button with text
  return (
    <Button
      variant={variant}
      onClick={handleSurveyClick}
      className={`gap-2 ${className}`}
      title={tooltipText}
    >
      <ClipboardList className={iconSizes[size]} />
      {textOptions[textType]}
    </Button>
  );
}