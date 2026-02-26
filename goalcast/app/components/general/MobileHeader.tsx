import { Link } from "@remix-run/react";

type Props = {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
      profile_image_url?: string;
    };
  } | null;
};

export default function MobileHeader({ user }: Props) {

  const displayName = user?.user_metadata?.full_name || user?.email;
  const avatarSrc =
    user?.user_metadata?.profile_image_url || "/default-avatar-photo.jpg";

  return (
    <header className="position-fixed top-0 w-100 z-3 c-mobile-header">
      <div className="d-flex justify-content-between align-items-center">
        <div className="c-mobile-header__logo">
            <Link to="/">
                <img src="/logo-dark.png" alt="logo-dark" className="c-mobile-header__logo--img" />
            </Link>
        </div>
        <div className="c-mobile-header__content d-flex align-items-center">
            <img
            src={avatarSrc}
            alt="Profielfoto"
            className="rounded-circle c-mobile-header__content--img"
            />
            <span>{displayName}</span>
            <form method="post" action="/logout">
                <button type="submit" className="c-mobile-header__content--btn">
                    <i className="fa-solid fa-sign-out-alt"></i>
                </button>
            </form>
        </div>
      </div>
    </header>
  );
}
