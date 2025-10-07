'use client';

import { useState, useCallback } from 'react';
import { showValidationError } from '@/store/error';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // 필수 필드 검사
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${name}은(는) 필수입니다.`;
    }

    // 값이 없으면 다른 검사는 건너뜀
    if (!value) return null;

    // 최소 길이 검사
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `${name}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`;
    }

    // 최대 길이 검사
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `${name}은(는) 최대 ${rule.maxLength}자까지 입력 가능합니다.`;
    }

    // 패턴 검사
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${name} 형식이 올바르지 않습니다.`;
    }

    // 커스텀 검사
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, rules]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  }, [validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
      showValidationError(error);
    }
  }, [values, validateField]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validateForm()) {
        onSubmit(values);
      } else {
        // 첫 번째 오류 필드로 포커스 이동
        const firstErrorField = Object.keys(errors).find(field => errors[field]);
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          if (element) {
            element.focus();
          }
        }
      }
    };
  }, [validateForm, errors]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
    showValidationError(error);
  }, []);

  return {
    values,
    errors,
    touched,
    isValid: Object.keys(errors).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    setFieldError,
    setValues,
  };
}
