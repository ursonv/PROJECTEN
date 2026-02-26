import { checkUsbStatus } from "./checkUsbStatus.server";

// Eerste run direct
checkUsbStatus();

// Elke 15 seconden opnieuw
setInterval(() => {
  checkUsbStatus();
}, 15_000);
