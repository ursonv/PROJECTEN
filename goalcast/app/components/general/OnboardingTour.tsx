import { useEffect, useMemo, useState } from "react";
import { useLocation, useMatches } from "@remix-run/react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

const TOUR_SEEN_KEY = "onboardingSeen:index";
const INDEX_ROUTE_ID = "routes/_index";

export default function OnboardingTour({
  run,
  onClose,
}: { run: boolean; onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  const location = useLocation();
  const matches = useMatches();
  const pageId = matches.at(-1)?.id || location.pathname;
  const isIndex = pageId === INDEX_ROUTE_ID || location.pathname === "/";

  useEffect(() => {
    if (run) setStepIndex(0);
  }, [run]);

  const commonHeader: Step[] = [
    {
      target: "body",
      placement: "center",
      content: "Welkom bij GoalCast! We starten een korte rondleiding.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="help"]',
      content: "Klik hier om de uitleg op elk moment opnieuw te starten.",
    },
  ];

  const stepsByPage: Record<string, Step[]> = {
    "routes/_index": [
      { target: '[data-tour="usb-toevoegen-dashboard"]', content: "Voeg hier een nieuwe GoalCast-USB toe." },
      { target: '[data-tour="usb-toevoegen-nav"]', content: "Of voeg een USB-stick toe via de knop in de navigatiebalk." },
      { target: '[data-tour="toegevoegde-mappen"]', content: "Hier zie je de mappen die aan je USB-stick gekoppeld zijn. Je kunt ze verslepen om de volgorde aan te passen, zodat een map eerder wordt getoond." },
      { target: '[data-tour="alle-mappen"]', content: "Hier vind je alle mappen. Selecteer een USB-stick om mappen toe te voegen aan 'Toegevoegde mappen' of ze er weer uit te verwijderen." },
      { target: '[data-tour="logout"]', content: "Hier kan je veilig uitloggen." },
    ],
    "routes/projecten._index": [
      { target: '[data-tour="projecten-title"]', content: "Welkom op de projectenpagina. Hier zie je al je aangemaakte projecten." },
      { target: '[data-tour="projecten-button"]', content: "Hier kun je een nieuwe map toevoegen." },
    ],
    "routes/projecten.$folderId": [
      { target: '[data-tour="project-title"]', content: "Welkom op de projectpagina." },
      { target: '[data-tour="project-button"]', content: "Voeg een slide toe met deze knop. Je kunt slides ook bewerken of verwijderen." },
    ],
    "routes/meldingen": [
      { target: '[data-tour="melding-title"]', content: "Welkom op de meldingenpagina. Hier bekijk je al je meldingen en kun je door de meldingen navigeren." },
    ],
    "routes/instellingen": [
      { target: '[data-tour="instelling-title"]', content: "Welkom op de instellingenpagina." },
      { target: '[data-tour="instelling-profile"]', content: "Hier pas je je profielgegevens aan." },
      { target: '[data-tour="instelling-notificatie"]', content: "Hier beheer je je meldings- en notificatie-instellingen." },
      { target: '[data-tour="instelling-standard"]', content: "Hier stel je standaardinstellingen in voor het maken en bewerken van slides." },
    ],
  };

  const pageSpecific = stepsByPage[pageId] ?? [];
  const steps: Step[] = useMemo(() => [...commonHeader, ...pageSpecific], [pageId]);

  const handleCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if (type === "step:after" || type === "error:target_not_found") {
      setStepIndex((index ?? stepIndex) + 1);
    }

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      if (isIndex) localStorage.setItem(TOUR_SEEN_KEY, "true"); // mag blijven; auto-starten doen we toch niet
      setStepIndex(0);
      onClose();
    }
  };

  // Alleen tonen wanneer run=true
  if (!run || steps.length === 0) return null;

  return (
    <Joyride
      key={`tour-${pageId}`}
      run={run}
      stepIndex={stepIndex}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      disableScrolling
      scrollToFirstStep
      hideCloseButton
      locale={{
        back: "Terug",
        close: "Sluiten",
        last: "Klaar",
        next: "Volgende",
        skip: "Overslaan",
        nextLabelWithProgress: "Volgende ({step}/{steps})",
      }}
      styles={{
        options: {
          zIndex: 10000,
          backgroundColor: "#354052",
          textColor: "#FFFFFF",
          primaryColor: "#DDA40B",
          arrowColor: "#354052",
          overlayColor: "rgba(37, 39, 52, 0.6)",
        },
        tooltipContainer: { borderRadius: "2rem", maxWidth: "500px", width: "100%" },
        tooltipTitle: { fontFamily: '"helvetica-neue-lt-pro", sans-serif', fontSize: "2.1rem", textAlign: "center", padding: "2rem 0 1.5rem" },
        tooltipContent: { fontSize: "1.8rem", lineHeight: 1.6, color: "#FFFFFF" },
        buttonNext: { background: "#DDA40B", color: "#FFFFFF", border: "none", borderRadius: "2rem", padding: "0.8rem 1.2rem", fontWeight: 700, cursor: "pointer" },
        buttonBack: { background: "transparent", color: "#FFFFFF", border: "1px solid rgba(255,255,255,.35)", borderRadius: "2rem", padding: "0.8rem 1.2rem", cursor: "pointer", marginRight: 8 },
        buttonClose: { display: "none" },
        buttonSkip: { color: "#FFFFFF", opacity: 0.8 },
        tooltip: { boxShadow: "0 12px 30px rgba(0,0,0,.18)" },
        spotlight: { borderRadius: "8px" },
      }}
      callback={handleCallback}
      debug
    />
  );
}
