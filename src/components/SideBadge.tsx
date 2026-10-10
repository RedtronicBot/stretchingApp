import type { Side } from "../features/session/types"

const SideBadge = ({ side }: { side: Side }) => {
  return (
    <span className="rounded-full bg-[#5E8F73]/20 px-2.5 py-0.5 text-[13px] whitespace-nowrap dark:bg-[#7DB394]/20">
      Côté {side === "left" ? "gauche" : "droit"}
    </span>
  )
}

export default SideBadge
