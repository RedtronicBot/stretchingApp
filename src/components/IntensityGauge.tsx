const IntensityGauge = ({ intensity }: { intensity: number | [number, number] }) => {
  const [min, max] = Array.isArray(intensity) ? intensity : [intensity, intensity]
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-[#5B7079] dark:text-[#93A9B0]">Intensité</span>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
          <span
            key={level}
            className={`h-1.5 w-3 rounded-full ${level >= min && level <= max ? "bg-[#5E8F73] dark:bg-[#7DB394]" : "bg-[#CBD8D8] dark:bg-[#26404A]"}`}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold">{min === max ? min : `${min}-${max}`}/10</span>
    </div>
  )
}

export default IntensityGauge
