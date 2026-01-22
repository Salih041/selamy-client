import { useCallback, useRef } from "react";

export const useDebounce = (callback, delay) => {
    const timer = useRef(null);

    const debouncedCallback = useCallback((...args)=>{
        if(timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(()=>{
            callback(...args);
        },delay);
    },[callback, delay])

    return debouncedCallback;
}