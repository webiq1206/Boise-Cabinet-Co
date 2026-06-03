"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FolderKanban,
  MessageSquare,
  Menu,
} from "lucide-react";
import { usePortalNav } from "@/components/portal/PortalNavProvider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ADMIN_MOBILE_MORE,
  ADMIN_MOBILE_TABS,
  CUSTOMER_MOBILE_TABS,
  isNavLinkActive,
  PARTNER_MOBILE_MORE,
  PARTNER_MOBILE_TABS,
  type PortalNavLink,
  type PortalShellVariant,
} from "@/components/portal/portalNavConfig";

function NavLinkRow({
  item,
  pathname,
  onNavigate,
}: {
  item: PortalNavLink;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isNavLinkActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors min-h-[44px]",
        active
          ? "bg-primary text-primary-foreground font-medium"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {item.label}
    </Link>
  );
}

function BottomTab({
  href,
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const className = cn(
    "flex flex-col items-center justify-center gap-0.5 min-h-[52px] py-2 text-[10px] leading-tight transition-colors touch-manipulation",
    active && "text-primary font-semibold",
    !active && !disabled && "text-muted-foreground active:text-foreground",
    disabled && "text-muted-foreground/40 pointer-events-none",
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} aria-label={label}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href!} className={className}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

function MoreSheet({
  title,
  items,
  pathname,
  moreActive,
}: {
  title: string;
  items: PortalNavLink[];
  pathname: string;
  moreActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 min-h-[52px] py-2 text-[10px] leading-tight transition-colors touch-manipulation w-full",
            (moreActive || open) && "text-primary font-semibold",
            !(moreActive || open) && "text-muted-foreground active:text-foreground",
          )}
          aria-label="More navigation"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="text-left mb-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLinkRow
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          ))}
          <Link
            href="/api/logout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted min-h-[44px] mt-2 border-t pt-4"
          >
            Sign out
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function CustomerMobileNav({ pathname }: { pathname: string }) {
  const { activeProjectId } = usePortalNav();
  const projectMatch = pathname.match(/^\/portal\/projects\/([^/]+)/);
  const projectId = projectMatch?.[1] ?? activeProjectId;

  const projectHref = projectId ? `/portal/projects/${projectId}` : "/portal";
  const messagesHref = projectId ? `/portal/projects/${projectId}/messages` : "/portal";

  const tabs = [
    { href: "/portal", label: "Home", icon: Home, active: pathname === "/portal" },
    {
      href: projectHref,
      label: "Project",
      icon: FolderKanban,
      active: pathname.startsWith("/portal/projects/"),
      disabled: !projectId,
    },
    {
      href: messagesHref,
      label: "Messages",
      icon: MessageSquare,
      active: pathname.includes("/messages"),
      disabled: !projectId,
    },
    {
      href: "/portal/account",
      label: "Account",
      icon: CUSTOMER_MOBILE_TABS[1].icon,
      active: pathname === "/portal/account",
    },
  ];

  return (
    <div className="grid grid-cols-4">
      {tabs.map((tab) => (
        <BottomTab
          key={tab.label}
          href={tab.href}
          label={tab.label}
          icon={tab.icon}
          active={tab.active}
          disabled={tab.disabled}
        />
      ))}
    </div>
  );
}

function StandardMobileNav({
  pathname,
  primaryTabs,
  moreItems,
  sheetTitle,
}: {
  pathname: string;
  primaryTabs: PortalNavLink[];
  moreItems: PortalNavLink[];
  sheetTitle: string;
}) {
  const moreActive = moreItems.some((item) => isNavLinkActive(pathname, item));

  return (
    <div className="grid grid-cols-4">
      {primaryTabs.map((item) => {
        const Icon = item.icon;
        return (
          <BottomTab
            key={item.href}
            href={item.href}
            label={item.label}
            icon={Icon}
            active={isNavLinkActive(pathname, item)}
          />
        );
      })}
      <MoreSheet
        title={sheetTitle}
        items={moreItems}
        pathname={pathname}
        moreActive={moreActive}
      />
    </div>
  );
}

export function PortalMobileNav({ variant }: { variant: PortalShellVariant }) {
  const pathname = usePathname();
  const navVariant = variant === "partner" ? "partner" : variant;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Portal navigation"
    >
      {navVariant === "customer" && <CustomerMobileNav pathname={pathname} />}
      {navVariant === "admin" && (
        <StandardMobileNav
          pathname={pathname}
          primaryTabs={ADMIN_MOBILE_TABS}
          moreItems={ADMIN_MOBILE_MORE}
          sheetTitle="Admin menu"
        />
      )}
      {(navVariant === "subcontractor" || navVariant === "partner") && (
        <StandardMobileNav
          pathname={pathname}
          primaryTabs={PARTNER_MOBILE_TABS}
          moreItems={PARTNER_MOBILE_MORE}
          sheetTitle="Partner menu"
        />
      )}
    </nav>
  );
}
