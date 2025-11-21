import { Ref, useRef, useEffect } from 'react';

/**
 * Hook to handle forwarded refs, allowing the component to use a local ref
 * while also respecting the ref passed down from the parent.
 * @param forwardedRef The ref passed down from the parent component.
 * @returns A local ref object.
 */
export function useForwardedRef<T>(forwardedRef: Ref<T>) {
  const localRef = useRef<T>(null);

  useEffect(() => {
    if (!forwardedRef) return;

    if (typeof forwardedRef === 'function') {
      forwardedRef(localRef.current);
    } else {
      (forwardedRef as React.MutableRefObject<T | null>).current = localRef.current;
    }
  });

  return localRef;
}