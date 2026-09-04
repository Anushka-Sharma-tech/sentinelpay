"use client";

import Link from "next/link";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/routes";
import { initials } from "@/lib/utils";

export function DashboardTopbar({
  name,
  email,
  demoMode,
}: {
  name: string;
  email: string;
  demoMode: boolean;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-context">
        <span className="topbar-dot" />
        <span>{demoMode ? "Demonstration environment" : "Protected console"}</span>
      </div>
      <div className="topbar-actions">
        <div className="popover-anchor">
          <button
            className="icon-button notification-button"
            type="button"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
          >
            <Icon name="bell" width={19} height={19} />
            <span aria-label="2 demonstration notifications">2</span>
          </button>
          {notificationsOpen && (
            <div className="popover notification-popover">
              <div className="popover-header">
                <div>
                  <strong>Notifications</strong>
                  <span>Demonstration entries</span>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                >
                  <Icon name="close" width={16} height={16} />
                </button>
              </div>
              <Link
                href={routes.riskEvent("RE-E8A3F")}
                onClick={() => setNotificationsOpen(false)}
              >
                <span className="notification-severity critical" />
                <div>
                  <strong>Critical event needs review</strong>
                  <p>Urgent payment request · 10 minutes ago</p>
                </div>
              </Link>
              <Link
                href={routes.investigation("IN-205")}
                onClick={() => setNotificationsOpen(false)}
              >
                <span className="notification-severity high" />
                <div>
                  <strong>Investigation is awaiting a decision</strong>
                  <p>Possible bank impersonation · 1 hour ago</p>
                </div>
              </Link>
            </div>
          )}
        </div>
        <div className="popover-anchor">
          <button
            className="profile-button"
            type="button"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            <span className="avatar">{initials(name)}</span>
            <span className="profile-button-copy">
              <strong>{name}</strong>
              <small>{demoMode ? "Demo profile" : email}</small>
            </span>
            <Icon name="chevron-down" width={15} height={15} />
          </button>
          {profileOpen && (
            <div className="popover profile-popover">
              <div className="profile-summary">
                <span className="avatar avatar-large">{initials(name)}</span>
                <div>
                  <strong>{name}</strong>
                  <span>{email}</span>
                </div>
              </div>
              <Link href={routes.settings} onClick={() => setProfileOpen(false)}>
                <Icon name="settings" width={16} height={16} />
                Profile and security
              </Link>
              <Link href={routes.analytics} onClick={() => setProfileOpen(false)}>
                <Icon name="chart" width={16} height={16} />
                Analytics
              </Link>
              <Link href={routes.modelLab} onClick={() => setProfileOpen(false)}>
                <Icon name="model" width={16} height={16} />
                Model Lab
              </Link>
              <Link
                href={routes.dashboardHowItWorks}
                onClick={() => setProfileOpen(false)}
              >
                <Icon name="flow" width={16} height={16} />
                How it works
              </Link>
              <Link href={routes.home}>
                <Icon name="arrow-left" width={16} height={16} />
                Return to website
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
