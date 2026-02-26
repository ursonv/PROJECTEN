import { useState, useEffect } from "react";
import { useLocation, useMatches } from "@remix-run/react";
import OnboardingTour from "./OnboardingTour";

const TOUR_SEEN_KEY = "onboardingSeen:index"; 
const INDEX_ROUTE_ID = "routes/_index";

type Props = {
  user: {
    email: string;
    user_metadata?: { full_name?: string; profile_image_url?: string };
  } | null;
};

export default function Header({ user }: Props) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const location = useLocation();
  const matches = useMatches();
  const lastId = matches.at(-1)?.id ?? "";
  const isIndex = lastId === INDEX_ROUTE_ID || location.pathname === "/";

  useEffect(() => setIsHydrated(true), []);

  const startTourOnClick = () => {
    setRunTour(true);
  };

  const displayName = user?.user_metadata?.full_name || user?.email;
  const avatarSrc = user?.user_metadata?.profile_image_url || "/default-avatar-photo.jpg";

  return (
    <>
      <header className="position-absolute top-0 end-0 c-header d-flex justify-content-end align-items-center">
        <div className="c-header__content d-flex align-items-center">
          <button
            type="button"
            className="c-header__content--info"
            data-tour="help"
            aria-label="Uitleg over de app"
            title="Uitleg over de app"
            onClick={startTourOnClick}        
          >
            <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
          </button>

          <img
            src={avatarSrc}
            alt="Profielfoto"
            className="rounded-circle c-header__content--img"
            data-tour="avatar"
          />

          <span className="c-header__displayname" data-tour="displayname">
            {displayName}
          </span>

          <form method="post" action="/logout">
            <button
              type="submit"
              className="c-header__content--btn logout"
              data-tour="logout"
              aria-label="Uitloggen"
              title="Uitloggen"
            >
              <i className="fa-solid fa-sign-out-alt" aria-hidden="true"></i>
            </button>
          </form>
        </div>
      </header>

      {runTour && (
        <OnboardingTour
          run={runTour}
          onClose={() => setRunTour(false)}
        />
      )}
    </>
  );
}
