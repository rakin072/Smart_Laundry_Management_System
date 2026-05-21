import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@washingtonpost/wpds-ui-kit";
import { Button } from "@washingtonpost/wpds-ui-kit";
import { Icon } from "@washingtonpost/wpds-ui-kit";
import Bell from "@washingtonpost/wpds-assets/asset/bell";
import Menu from "@washingtonpost/wpds-assets/asset/menu";
import Close from "@washingtonpost/wpds-assets/asset/close";
import { useAuth } from "../context/AuthContext";
import { useNotificationCount } from "../hooks/useNotificationCount";

const Nav = styled("nav", {
  position: "sticky",
  top: 0,
  zIndex: "$shell",
  backgroundColor: "$background",
  borderBottom: "1px solid $subtle",
  boxShadow: "$100",
});

const NavInner = styled("div", {
  maxWidth: "1200px",
  margin: "0 auto",
  px: "$150",
  height: "64px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "$100",
});

const LogoLink = styled(Link, {
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "$075",
});

const LogoText = styled("span", {
  fontFamily: "$headline",
  fontWeight: "$bold",
  fontSize: "$150",
  color: "$primary",
  lineHeight: "$headline",
  "& span": {
    color: "$teal100",
  },
});

const NavLinks = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$150",
  "@sm": { display: "none" },
});

const NavLink = styled(Link, {
  fontFamily: "$meta",
  fontSize: "$087",
  fontWeight: "$regular",
  color: "$onBackground",
  textDecoration: "none",
  padding: "$025 $050",
  borderRadius: "$025",
  transition: "color 0.2s, background 0.2s",
  "&:hover": {
    color: "$teal100",
    backgroundColor: "$teal600",
  },
  variants: {
    active: {
      true: {
        color: "$teal100",
        fontWeight: "$bold",
      },
    },
  },
});

const NavActions = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "$075",
});

const BellBtn = styled("button", {
  position: "relative",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "$050",
  borderRadius: "$025",
  color: "$onBackground",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.2s",
  "&:hover": { color: "$teal100" },
});

const NotifBadge = styled("span", {
  position: "absolute",
  top: "2px",
  right: "2px",
  width: "8px",
  height: "8px",
  borderRadius: "$round",
  backgroundColor: "$error",
  border: "2px solid $background",
});

const MobileMenuBtn = styled("button", {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "$050",
  color: "$onBackground",
  display: "none",
  "@sm": { display: "flex", alignItems: "center" },
});

const MobileMenu = styled("div", {
  display: "none",
  flexDirection: "column",
  backgroundColor: "$background",
  borderTop: "1px solid $subtle",
  padding: "$100 $150",
  gap: "$075",
  "@sm": { display: "flex" },
});

const MobileNavLink = styled(Link, {
  fontFamily: "$meta",
  fontSize: "$100",
  color: "$onBackground",
  textDecoration: "none",
  padding: "$075 $100",
  borderRadius: "$050",
  "&:hover": {
    color: "$teal100",
    backgroundColor: "$teal600",
  },
});

export default function Navbar() {
  const { user, customer, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useNotificationCount();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Nav>
      <NavInner>
        <LogoLink to="/">
          <LogoText>
            Fresh<span>Wash</span>
          </LogoText>
        </LogoLink>

        <NavLinks>
          <NavLink to="/" active={isActive("/") ? true : undefined}>
            Home
          </NavLink>
          {user && (
            <>
              <NavLink
                to="/dashboard"
                active={isActive("/dashboard") ? true : undefined}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/orders"
                active={isActive("/orders") ? true : undefined}
              >
                My Orders
              </NavLink>
              {customer?.is_admin && (
                <NavLink
                  to="/admin-panel"
                  active={
                    location.pathname.startsWith("/admin-panel")
                      ? true
                      : undefined
                  }
                >
                  Admin
                </NavLink>
              )}
            </>
          )}
        </NavLinks>

        <NavActions>
          {user ? (
            <>
              <BellBtn
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
              >
                <Icon size="100" label="Notifications">
                  <Bell />
                </Icon>
                {unreadCount > 0 && <NotifBadge />}
              </BellBtn>
              <Button
                variant="secondary"
                density="compact"
                css={{ "@sm": { display: "none" } }}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                density="compact"
                css={{ "@sm": { display: "none" } }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant="cta"
                density="compact"
                css={{ "@sm": { display: "none" } }}
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </>
          )}
          <MobileMenuBtn
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <Icon size="100" label="Menu">
              {mobileOpen ? <Close /> : <Menu />}
            </Icon>
          </MobileMenuBtn>
        </NavActions>
      </NavInner>

      {mobileOpen && (
        <MobileMenu>
          <MobileNavLink to="/" onClick={() => setMobileOpen(false)}>
            Home
          </MobileNavLink>
          {user ? (
            <>
              <MobileNavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </MobileNavLink>
              <MobileNavLink to="/orders" onClick={() => setMobileOpen(false)}>
                My Orders
              </MobileNavLink>
              <MobileNavLink
                to="/notifications"
                onClick={() => setMobileOpen(false)}
              >
                Notifications {unreadCount > 0 && `(${unreadCount})`}
              </MobileNavLink>
              {customer?.is_admin && (
                <MobileNavLink
                  to="/admin-panel"
                  onClick={() => setMobileOpen(false)}
                >
                  Admin Panel
                </MobileNavLink>
              )}
              <Button
                variant="secondary"
                density="compact"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>
                Login
              </MobileNavLink>
              <MobileNavLink
                to="/register"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </MobileNavLink>
            </>
          )}
        </MobileMenu>
      )}
    </Nav>
  );
}
