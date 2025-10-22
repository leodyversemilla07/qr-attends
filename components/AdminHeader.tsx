// Admin header with navigation
import { Icons } from "./Icons.tsx";

interface NavItem {
  href: string;
  label: string;
  description: string;
}

interface AdminHeaderProps {
  currentPath?: string;
}

export default function AdminHeader({ currentPath = "" }: AdminHeaderProps) {
  const navItems: NavItem[] = [
    {
      href: "/admin",
      label: "Admin Dashboard",
      description: "Manage events and QR codes",
    },
    {
      href: "/attendance",
      label: "Attendance Records",
      description: "View detailed attendance records by event",
    },
    {
      href: "/analytics",
      label: "Analytics & Reports",
      description: "View attendance trends and insights",
    },
    {
      href: "/settings",
      label: "Settings",
      description: "Account settings and password management",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin" && currentPath === "/admin") return true;
    if (href !== "/admin" && currentPath.startsWith(href)) return true;
    return false;
  };

  return (
    <header class="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div class="w-full">
        {/* Top bar with title */}
        <div class="py-3 px-3 sm:py-4 sm:px-6 border-b border-blue-500">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <Icons.Grid class="w-6 h-6 flex-shrink-0" />
              <div class="min-w-0">
                <h1 class="text-base sm:text-xl md:text-2xl font-bold truncate">
                  QR Attendance
                </h1>
                <p class="text-xs text-blue-100 hidden sm:block">
                  Admin Portal
                </p>
              </div>
            </div>
            <a
              href="/"
              class="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
            >
              <Icons.Home class="w-4 h-4" />
              <span class="hidden sm:inline">Home</span>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <nav class="py-2 px-2 sm:py-3 sm:px-6">
          <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <a
                  href={item.href}
                  class={`px-3 py-2.5 sm:px-6 sm:py-2 rounded-lg transition-all duration-200 text-center ${
                    active
                      ? "bg-white text-blue-600 shadow-md font-semibold"
                      : "bg-blue-500 hover:bg-blue-400 text-white font-medium"
                  }`}
                  title={item.description}
                >
                  <div class="text-xs sm:text-sm md:text-base leading-tight">
                    {item.label}
                  </div>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
