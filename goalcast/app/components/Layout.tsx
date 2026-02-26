import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import Header from "./general/Header";
import Navigation from "./general/Navigation";
import MobileNavigation from "./general/MobileNavigation";
import MobileHeader from "./general/MobileHeader";

type LayoutProps = {
  user: any; 
  children: React.ReactNode;
};

export default function Layout({ user, children }: LayoutProps) {
  const isLoggedIn = Boolean(user);

  return (
    <html lang="nl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {isLoggedIn ? (
          <>

              <div className="d-none d-lg-block">
                <Header user={user} />
                <Navigation />
                <main className="position-absolute top-0 end-0 c-container">
                  {children}
                </main>
              </div>

              <div className="d-lg-none">
                <MobileHeader user={user} />
                <MobileNavigation />
                <main className="c-container-mobile">
                  {children}
                </main>
              </div>
          </>
        ) : (
          <main className="c-authcontainer">{children}</main>
        )}
        <ScrollRestoration />
        <Scripts />
        <script
          src="https://kit.fontawesome.com/e40113b07e.js"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
