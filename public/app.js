(function () {
  "use strict";

  const year = document.querySelector("#current-year");
  const skipLink = document.querySelector(".skip-link");
  const main = document.querySelector("#main-content");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (skipLink && main) {
    const clearRestoredSkipFocus = () => {
      if (document.activeElement === skipLink) {
        skipLink.blur();
      }
    };

    skipLink.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        main.focus({ preventScroll: true });
      });
    });
    document.addEventListener("pointerdown", clearRestoredSkipFocus, {
      passive: true
    });
    window.addEventListener("pageshow", clearRestoredSkipFocus);
  }
})();
