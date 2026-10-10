const MAX_SHOWN = 5

type Props = {
  title: string
  errors: string[]
}

export default function ErrorNotice({ title, errors }: Props) {
  if (errors.length === 0) return null

  return (
    <div role="alert" className="mt-3 rounded-2xl bg-[#F0DFC6] px-4 py-3 text-[14px] text-[#5A4020] dark:bg-[#3A3022] dark:text-[#F0DFC6]">
      <p className="font-semibold">{title}</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
        {errors.slice(0, MAX_SHOWN).map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
      {errors.length > MAX_SHOWN && <p className="mt-1.5">… et {errors.length - MAX_SHOWN} autre{errors.length - MAX_SHOWN > 1 ? "s" : ""}.</p>}
    </div>
  )
}
