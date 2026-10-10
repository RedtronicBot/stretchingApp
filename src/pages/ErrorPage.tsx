import { Link } from "react-router"

const display = "font-['Bricolage_Grotesque',system-ui,sans-serif]"

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-[#E8EEEE] pt-[env(safe-area-inset-top,0px)] font-['Figtree',system-ui,sans-serif] text-base leading-normal text-[#16303A] dark:bg-[#0F1E24] dark:text-[#E6EFEF]">
      <main className="mx-auto flex min-h-screen max-w-110 flex-col items-center justify-center px-5 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0DFC6] text-3xl text-[#5A4020] dark:bg-[#3A3022] dark:text-[#F0DFC6]">
          ?
        </span>
        <h1 className={`${display} mt-6 text-2xl leading-tight font-bold`}>Page introuvable</h1>
        <p className="mt-2 text-[#5B7079] dark:text-[#93A9B0]">Cette page ou cette séance n'existe pas.</p>

        <Link to="/" className="mt-8 rounded-full bg-[#16303A] px-6 py-3 font-semibold text-[#F6F9F8] dark:bg-[#E6EFEF] dark:text-[#0F1E24]">
          Retour à l'accueil
        </Link>
      </main>
    </div>
  )
}

export default ErrorPage
