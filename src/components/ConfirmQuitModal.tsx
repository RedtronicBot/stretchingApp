import { useRef } from "react"
import { useClickOutside } from "../hooks/useClickOutside"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

type Props = {
  onCancel: () => void
  onConfirm: () => void
}

export default function ConfirmQuitModal({ onCancel, onConfirm }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useClickOutside(panelRef, onCancel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16303A]/60 px-5">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quit-title"
        className="w-full max-w-sm rounded-2xl border border-[#CBD8D8] bg-[#F6F9F8] p-6 text-center text-[#16303A] dark:border-[#26404A] dark:bg-[#172A32] dark:text-[#E6EFEF]"
      >
        <h2 id="quit-title" className={`${display} text-xl leading-tight font-bold`}>
          Quitter la séance ?
        </h2>
        <p className="mt-2 text-[15px] text-[#5B7079] dark:text-[#93A9B0]">Ta progression ne sera pas conservée.</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]"
          >
            Reprendre
          </button>
          <button type="button" onClick={onConfirm} className="rounded-full border border-[#CBD8D8] px-6 py-3 font-semibold dark:border-[#26404A]">
            Quitter
          </button>
        </div>
      </div>
    </div>
  )
}
