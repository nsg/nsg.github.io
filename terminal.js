/* A tiny terminal-shaped interface for the home page.
   Commands are matched explicitly; visitor input is only ever rendered as text. */
(function () {
  "use strict";

  var form = document.getElementById("terminal-form");
  var input = document.getElementById("terminal-input");
  var output = document.getElementById("terminal-output");
  var scrollPane = form && form.closest(".pane-scroll");
  if (!form || !input || !output) return;

  var history = [];
  var historyIndex = 0;
  var commands = [
    "help", "about", "contact", "whoami", "pwd", "ls", "cat", "nsg",
    "github", "history", "theme", "date", "uname", "echo", "cd", "clear"
  ];

  function scrollToPrompt() {
    if (scrollPane) scrollPane.scrollTop = scrollPane.scrollHeight;
  }

  function line(className, text) {
    var element = document.createElement("p");
    if (className) element.className = className;
    element.textContent = text;
    output.appendChild(element);
    return element;
  }

  function block(text, className) {
    var element = document.createElement("pre");
    if (className) element.className = className;
    element.textContent = text;
    output.appendChild(element);
    return element;
  }

  function commandLine(command) {
    var element = document.createElement("p");
    element.className = "cmd terminal-command";

    var prompt = document.createElement("span");
    prompt.className = "ps1";
    prompt.setAttribute("aria-hidden", "true");
    prompt.innerHTML = '<span class="uh">nsg@lab</span>:<span class="cwd">~/nsg.github.io</span> <span class="git">(master)</span> $';

    var text = document.createTextNode(" " + command);
    element.appendChild(prompt);
    element.appendChild(text);
    output.appendChild(element);
  }

  function addLink(label, href) {
    var element = document.createElement("p");
    var link = document.createElement("a");
    link.className = "terminal-link";
    link.href = href;
    link.textContent = label;
    if (href.charAt(0) !== "#") link.rel = "me";
    element.appendChild(link);
    output.appendChild(element);
  }

  function changeTheme(requested) {
    var button = document.getElementById("theme-switch");
    if (!button) return false;
    var current = button.getAttribute("aria-checked") === "true" ? "dark" : "light";
    if (requested !== current) button.click();
    return true;
  }

  function goTo(section) {
    var targets = { about: "top", home: "top", sheet: "sheet", info: "sheet", contact: "contact", account: "account" };
    var id = targets[section];
    if (!id) return false;
    var target = document.getElementById(id);
    input.blur();
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (id !== "top") window.history.replaceState(null, "", "#" + id);
    else window.history.replaceState(null, "", window.location.pathname + window.location.search);
    return true;
  }

  function run(raw) {
    var trimmed = raw.trim();
    if (!trimmed) return;

    var parts = trimmed.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    switch (name) {
      case "help":
        block([
          "Available commands:",
          "  about              a short introduction",
          "  contact            how to get in touch",
          "  ls [interests]      list this site or its interests",
          "  cat about.md        read a page-sized file",
          "  nsg --info          show the data sheet",
          "  nsg --range         show the operating range",
          "  nsg --repos         link to GitHub repositories",
          "  cd <section>        jump to about, sheet, account or contact",
          "  theme <light|dark>  change the colour scheme",
          "  whoami · pwd · date · uname -a · echo <text>",
          "  history · clear",
          "",
          "Keys: ↑/↓ history · Tab complete · Ctrl+L clear · Ctrl+C cancel · Esc blur"
        ].join("\n"));
        break;

      case "about":
        line("", "Stefan Berggren — IT architect by title, systems administrator by instinct.");
        break;

      case "contact":
        line("", "Pick any personal repository commit; the author email is one I actually read.");
        addLink("Browse Stefan's repositories ↗", "https://github.com/nsg?tab=repositories");
        break;

      case "whoami":
        line("", "guest");
        break;

      case "pwd":
        line("", "/home/guest/nsg.github.io");
        break;

      case "ls":
        if (!args.length) block("about.md  account.txt  contact.txt  interests/  repositories@", "terminal-link");
        else if (/^(~\/)?interests\/?$/.test(args[0])) block("Automation/  Clusters/  Docker/  High availability/  Incus/  LXD/  Podman/  Snapcraft/", "terminal-link");
        else line("terminal-error", "ls: cannot access '" + args.join(" ") + "': No such file or directory");
        break;

      case "cat":
        if (args[0] === "about.md") line("", "I love to tinker with code and tweak systems—from tiny devices to data centers. Lately, AI and GPU programming have been a big focus.");
        else if (args[0] === "account.txt") line("", "This is Stefan's personal account. Check a commit's email to see which hat he was wearing.");
        else if (args[0] === "contact.txt") line("", "No form, no tracker. The author email on a personal repository commit is the safe default.");
        else if (!args.length) line("terminal-error", "cat: missing file operand");
        else line("terminal-error", "cat: " + args.join(" ") + ": No such file or directory");
        break;

      case "nsg":
        if (args[0] === "--info") block("Role               IT architect\nBackground         Systems administration\nCurrently learning Programming the GPU\nBuilds and runs    Clusters, containers and automation");
        else if (args[0] === "--range") block("tiny devices ── single boards ── servers ── clusters ── data centers");
        else if (args[0] === "--repos") addLink("github.com/nsg?tab=repositories ↗", "https://github.com/nsg?tab=repositories");
        else line("terminal-error", "nsg: try 'nsg --info', 'nsg --range' or 'nsg --repos'");
        break;

      case "github":
        addLink("github.com/nsg ↗", "https://github.com/nsg");
        break;

      case "history":
        block(history.map(function (item, index) { return String(index + 1).padStart(3, " ") + "  " + item; }).join("\n"));
        break;

      case "theme":
        if (args[0] === "light" || args[0] === "dark") {
          if (changeTheme(args[0])) line("", "Theme set to " + args[0] + ".");
        } else if (!args.length) {
          var dark = document.documentElement.getAttribute("data-theme") === "dark";
          line("", dark ? "dark" : "light");
        } else line("terminal-error", "theme: expected 'light' or 'dark'");
        break;

      case "date":
        line("", new Date().toString());
        break;

      case "uname":
        line("", args[0] === "-a" ? "nsg.github.io lab 1.0 web gruvbox tmux" : "nsg.github.io");
        break;

      case "echo":
        line("", trimmed.slice(parts[0].length).trimStart());
        break;

      case "cd":
        if (!args.length || args[0] === "~") goTo("about");
        else if (!goTo(args[0].replace(/^#/, "").replace(/\/$/, "").toLowerCase())) line("terminal-error", "cd: " + args[0] + ": No such section");
        break;

      case "clear":
        output.replaceChildren();
        break;

      default:
        line("terminal-error", "bash: " + parts[0] + ": command not found. Try 'help'.");
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var command = input.value;
    if (!command.trim()) return;
    commandLine(command);
    history.push(command);
    historyIndex = history.length;
    input.value = "";
    run(command);
    while (output.childElementCount > 80) output.firstElementChild.remove();
    scrollToPrompt();
    if (!/^cd(?:\s|$)/i.test(command.trim())) input.scrollIntoView({ block: "nearest" });
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (event.key === "ArrowUp" && historyIndex > 0) historyIndex -= 1;
      if (event.key === "ArrowDown" && historyIndex < history.length) historyIndex += 1;
      input.value = historyIndex < history.length ? history[historyIndex] : "";
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === "Tab") {
      var matches = commands.filter(function (command) { return command.indexOf(input.value.trim().toLowerCase()) === 0; });
      if (matches.length === 1) {
        event.preventDefault();
        input.value = matches[0] + " ";
      }
    } else if (event.key === "Escape") {
      input.blur();
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      output.replaceChildren();
      scrollToPrompt();
    } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      commandLine(input.value + "^C");
      input.value = "";
      historyIndex = history.length;
      scrollToPrompt();
    }
  });
})();
