import { useEffect } from "react"

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, callback: () => void, buttonRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const outsideRef = ref.current && !ref.current.contains(target)
      const outsideButton = !buttonRef?.current || !buttonRef.current.contains(target)
      if (outsideRef && outsideButton) {
        callback()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, callback, buttonRef])
}
