'use client';

import { useErrorStore } from '@/store/error';
import { ErrorToast } from './error-toast';

export function ErrorContainer() {
  const { errors, removeError } = useErrorStore();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {errors.map((error) => (
        <ErrorToast
          key={error.id}
          error={error}
          onDismiss={removeError}
        />
      ))}
    </div>
  );
}
