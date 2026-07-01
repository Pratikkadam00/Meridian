import { router, usePathname, type Href } from "expo-router";
import { Bell, Home, Layers3, UserRound } from "lucide-react-native";

import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { FloatingNav as FloatingNavShell, type FloatingNavItem } from "@/shared/ui/FloatingNav";

type DestinationKey = "home" | "deals" | "reminders" | "settings";

type Destination = FloatingNavItem<DestinationKey> & {
  href: Href;
};

const destinations: Destination[] = [
  {
    key: "home",
    href: "/home",
    label: "Home",
    icon: Home,
  },
  {
    key: "deals",
    href: "/deals",
    label: "Deals",
    icon: Layers3,
  },
  {
    key: "reminders",
    href: "/reminders",
    label: "Reminders",
    icon: Bell,
  },
  {
    key: "settings",
    href: "/settings",
    label: "Profile",
    icon: UserRound,
  },
];

function getActiveKey(pathname: string): DestinationKey | null {
  if (pathname.startsWith("/home")) {
    return "home";
  }

  if (pathname.startsWith("/deals")) {
    return "deals";
  }

  if (pathname.startsWith("/reminders")) {
    return "reminders";
  }

  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  return null;
}

function shouldHideNav(pathname: string) {
  return pathname.startsWith("/new-deal") || pathname.startsWith("/deal/") || pathname.startsWith("/commission") || pathname.startsWith("/documents");
}

export function FloatingNav() {
  const pathname = usePathname();
  const { isRTL } = useI18nControls();
  const activeKey = getActiveKey(pathname);

  function goToDestination(key: DestinationKey) {
    const destination = destinations.find((item) => item.key === key);

    if (!destination) {
      return;
    }

    if (destination.key !== activeKey) {
      router.replace(destination.href);
    }
  }

  return (
    <FloatingNavShell
      activeKey={activeKey}
      hidden={shouldHideNav(pathname)}
      isRTL={isRTL}
      items={destinations}
      onFabPress={() => router.push("/new-deal")}
      onItemPress={(item) => goToDestination(item.key)}
      variant="with-fab"
    />
  );
}
