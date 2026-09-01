/* Theme switch.
   - First visit: follow the OS preference (CSS handles that on its own).
   - Explicit choice: stored in localStorage and applied on every visit
     (see the inline script in <head>, which runs before first paint).
   - The button is a role="switch"; aria-checked mirrors the dark theme. */
(function () {
  "use strict";

  var KEY = "theme";
  var root = document.documentElement;
  var button = document.getElementById("theme-switch");
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var colors = { light: "#f9f5d7", dark: "#1d2021" };

  if (!button) return;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(theme, remember) {
    root.setAttribute("data-theme", theme);
    button.setAttribute("aria-checked", String(theme === "dark"));
    // Keep the browser chrome colour in step with an explicit choice.
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute("content", colors[theme]);
    if (remember) {
      try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode etc. */ }
    }
  }

  var initial = stored();
  if (initial !== "light" && initial !== "dark") initial = media.matches ? "dark" : "light";
  apply(initial, false);

  button.addEventListener("click", function () {
    apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  // No explicit choice yet? Keep following the OS if it changes.
  var onChange = function (e) { if (!stored()) apply(e.matches ? "dark" : "light", false); };
  if (media.addEventListener) media.addEventListener("change", onChange);
  else if (media.addListener) media.addListener(onChange);
})();
