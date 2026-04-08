import { useEffect, useRef } from "react";

type Handler = () => void;

export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  handler: Handler,
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef<Handler>(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handlerRef.current();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return ref;
}
