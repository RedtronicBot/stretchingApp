import { ChartLine, Menu, Settings, Target } from "lucide-react"
import { NavLink, Outlet } from "react-router"
const link = [
  { icon: <Target />, label: "Accueil", to: "/" },
  { icon: <Menu />, label: "Séances", to: "/catalogue" },
  { icon: <ChartLine />, label: "Statistiques", to: "/statistics" },
  { icon: <Settings />, label: "Réglages", to: "/settings" },
]
export const NavLayout = () => {
  return (
    <>
      <Outlet />
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 border-t border-[#CBD8D8] bg-[#F6F9F8] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] dark:border-[#26404A] dark:bg-[#172A32]"
      >
        <div className="mx-auto flex max-w-110 justify-around text-[13px] text-[#5B7079] dark:text-[#93A9B0]">
          {link.map((link, index) => (
            <NavLink
              to={link.to}
              key={index}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-2.5 py-0.5 ${isActive ? "font-semibold text-[#16303A] dark:text-[#E6EFEF]" : ""}`
              }
            >
              {link.icon}
              <p>{link.label}</p>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
