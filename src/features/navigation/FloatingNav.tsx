import { router, usePathname, type Href } from "expo-router";
import { Bell, Home, Layers3, UserRound } from "lucide-react-native";

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
  return pathname.startsWith("/new-deal") || pathname.startsWith("/deal/");
}

export function FloatingNav() {
  const pathname = usePathname();
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
      items={destinations}
      onFabPress={() => router.push("/new-deal")}
      onItemPress={(item) => goToDestination(item.key)}
      variant="with-fab"
    />
  );
}
