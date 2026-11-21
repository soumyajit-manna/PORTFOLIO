// Boot sequence and shared browser state.
const root = document.documentElement;
const body = document.body;
const themeToggle = document.querySelector("#theme-toggle");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const preloader = document.querySelector("#preloader");
const bootLog = document.querySelector("#boot-log");
const cursorMark = document.querySelector("#cursor-mark");
const cursorTag = document.querySelector("#cursor-tag");
const clock = document.querySelector("#local-time");
const themePreferenceKey = "portfolio-theme";
const bootLines = [
  "> soumyajit.dev --boot",
  "> loading stack: mongo · express · react · node",
  "> mounting 5+ live platforms ... ok",
  "> ready.",
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wait = (time) => new Promise((resolve) => window.setTimeout(resolve, time));

function setTheme(theme) {
  const isLight = theme === "light";
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} mode`);
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.querySelector(".theme-toggle-icon").textContent = isLight ? "☾" : "☼";
  themeToggle.querySelector(".theme-toggle-label").textContent = isLight ? "DARK" : "LIGHT";
}

let initialTheme = "dark";
try {
  if (window.localStorage.getItem(themePreferenceKey) === "light") initialTheme = "light";
} catch (error) {
  console.error("Could not read the saved theme preference:", error);
}
setTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  setTheme(nextTheme);
  try {
    window.localStorage.setItem(themePreferenceKey, nextTheme);
  } catch (error) {
    console.error("Could not save the theme preference:", error);
  }
});

async function typeBootLine(text) {
  const line = document.createElement("div");
  line.className = "boot-line";
  bootLog.append(line);
  const delay = 380 / Math.max(text.length, 1);
  for (const character of text) {
    line.textContent += character;
    await wait(delay);
  }
}

async function finishBoot() {
  for (const line of bootLines) await typeBootLine(line);
  await wait(120);
  body.classList.add("is-ready");
  body.classList.remove("is-booting");
  preloader.classList.add("is-opening");
  await wait(1000);
  preloader.remove();
}

if (reduceMotion) {
  body.classList.add("is-ready");
  preloader.remove();
} else {
  body.classList.add("is-booting");
  finishBoot();
}

const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function updateClock() {
  clock.textContent = `Haldia, IN — ${clockFormatter.format(new Date())} IST`;
}

updateClock();
window.setInterval(updateClock, 30_000);

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .2 })
  : null;

document.querySelectorAll(".m, .f").forEach((element, index) => {
  element.style.setProperty("--t", `${Math.min(index % 5, 4) * 70}ms`);
  if (reduceMotion || !revealObserver) element.classList.add("in");
  else revealObserver.observe(element);
});

const navLinks = [...document.querySelectorAll(".dock a[data-section]")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.section === entry.target.id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((link) => {
    const section = document.getElementById(link.dataset.section);
    if (section) sectionObserver.observe(section);
  });
}

const aboutSection = document.querySelector("#about");
const aboutWords = [...document.querySelectorAll("#about-copy .word")];
const timeline = document.querySelector("#timeline");
const timelineFill = document.querySelector("#timeline-fill");
const timelineEntries = [...document.querySelectorAll(".timeline-entry")];
const projectCards = [...document.querySelectorAll("[data-project]")];
const projectVideos = [...document.querySelectorAll(".project-video")];
const contactSection = document.querySelector("#contact");
const contactTitle = document.querySelector("#contact-title");
const progressBar = document.querySelector("#scroll-progress");
let scrollFrame = 0;

if (projectVideos.length && !reduceMotion) {
  const playVideo = (video) => {
    video.play().catch((error) => {
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") {
        console.error("Project preview video failed to play:", error);
      }
    });
  };

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) playVideo(entry.target);
        else entry.target.pause();
      });
    }, { rootMargin: "120px 0px", threshold: .12 });
    projectVideos.forEach((video) => videoObserver.observe(video));
  } else {
    projectVideos.forEach(playVideo);
  }
}

const resumeDownload = document.querySelector("#resume-download");
const resumeDownloadStatus = document.querySelector("#resume-download-status");

resumeDownload?.addEventListener("click", async (event) => {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
    || window.location.protocol === "file:"
  ) return;

  event.preventDefault();
  resumeDownloadStatus.hidden = true;
  resumeDownloadStatus.textContent = "";

  try {
    const response = await fetch(resumeDownload.href);
    if (!response.ok) throw new Error(`Resume request failed (${response.status}).`);

    const pdf = await response.blob();
    if (!pdf.size || (pdf.type && !/pdf|octet-stream/i.test(pdf.type))) {
      throw new Error("The server did not return a PDF file.");
    }

    const objectUrl = URL.createObjectURL(pdf);
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = resumeDownload.download;
    downloadLink.hidden = true;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    console.error("Resume download failed:", error);
    resumeDownloadStatus.textContent = "The download could not start. Please use “View resume” or try again.";
    resumeDownloadStatus.hidden = false;
  }
});

function updateScrollEffects() {
  scrollFrame = 0;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;

  const aboutRect = aboutSection.getBoundingClientRect();
  const aboutProgress = clamp(
    (window.innerHeight * .78 - aboutRect.top) / (aboutRect.height + window.innerHeight * .25),
    0,
    1,
  );
  aboutWords.forEach((word, index) => {
    if (reduceMotion) {
      word.style.opacity = "1";
      return;
    }
    const start = index / Math.max(aboutWords.length, 1);
    const light = clamp((aboutProgress - start * .72) / .2, 0, 1);
    word.style.opacity = String(.16 + light * .84);
  });

  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const progress = clamp((window.innerHeight * .72 - rect.top) / rect.height, 0, 1);
    timelineFill.style.transform = `scaleY(${reduceMotion ? 1 : progress})`;
    timelineEntries.forEach((entry) => {
      entry.classList.toggle("is-past", reduceMotion || entry.getBoundingClientRect().top < window.innerHeight * .72);
    });
  }

  projectCards.forEach((card, index) => {
    const nextCard = projectCards[index + 1];
    if (!nextCard) {
      card.style.setProperty("--card-scale", "1");
      card.style.setProperty("--card-opacity", "1");
      return;
    }
    if (reduceMotion) {
      card.style.setProperty("--card-scale", "1");
      card.style.setProperty("--card-opacity", "1");
      return;
    }
    const nextTop = nextCard.getBoundingClientRect().top;
    const stickyTop = window.innerWidth <= 760 ? 72 : 84;
    const progress = clamp((window.innerHeight * .84 - nextTop) / (window.innerHeight * .84 - stickyTop), 0, 1);
    card.style.setProperty("--card-scale", String(1 - progress * .07));
    card.style.setProperty("--card-opacity", String(1 - progress * .45));
  });

  if (contactTitle && reduceMotion) {
    contactTitle.style.setProperty("--contact-x", "0px");
  } else if (contactTitle) {
    const rect = contactSection.getBoundingClientRect();
    const progress = clamp((window.innerHeight - rect.top) / window.innerHeight, 0, 1);
    contactTitle.style.setProperty("--contact-x", `${(1 - progress) * -80}px`);
  }
}

// Keep scroll-driven work to one paint per animation frame.
function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
requestScrollUpdate();

if (finePointer) {
  body.classList.add("has-custom-cursor");
  let pointerX = -100;
  let pointerY = -100;
  let tagX = -100;
  let tagY = -100;
  let tagFrame = 0;

  // The coordinate tag eases toward the pointer; the crosshair itself stays immediate.
  function moveTag() {
    tagX += (pointerX + 18 - tagX) * .14;
    tagY += (pointerY + 18 - tagY) * .14;
    cursorTag.style.transform = `translate3d(${tagX}px, ${tagY}px, 0)`;
    if (Math.abs(pointerX + 18 - tagX) + Math.abs(pointerY + 18 - tagY) > .3) {
      tagFrame = window.requestAnimationFrame(moveTag);
    } else {
      tagFrame = 0;
    }
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursorMark.style.left = `${pointerX}px`;
    cursorMark.style.top = `${pointerY}px`;
    cursorMark.classList.add("is-visible");
    cursorTag.classList.add("is-visible");

    const target = event.target instanceof Element ? event.target.closest("a, button") : null;
    cursorMark.classList.toggle("is-link", Boolean(target));
    if (target?.classList.contains("project-button")) cursorTag.textContent = "OPEN ↗";
    else if (target?.matches('a[target="_blank"], a[href^="http"]')) cursorTag.textContent = "LINK ↗";
    else if (target) cursorTag.textContent = "GO ↗";
    else cursorTag.textContent = `x ${String(Math.round(pointerX)).padStart(4, "0")} · y ${String(Math.round(pointerY)).padStart(4, "0")}`;

    if (!tagFrame) tagFrame = window.requestAnimationFrame(moveTag);

    if (!reduceMotion) {
      root.style.setProperty("--sun-x", `${(window.innerWidth / 2 - pointerX) * .045}px`);
      root.style.setProperty("--sun-y", `${(window.innerHeight / 2 - pointerY) * .045}px`);
      root.querySelectorAll(".letter").forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const distance = Math.hypot(pointerX - (rect.left + rect.width / 2), pointerY - (rect.top + rect.height / 2));
        const weight = distance > 260 ? 500 : 800 - 300 * (distance / 260);
        letter.style.setProperty("--letter-weight", String(Math.round(weight)));
      });
    }
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    cursorMark.classList.remove("is-visible", "is-link");
    cursorTag.classList.remove("is-visible");
    cursorTag.textContent = "x 0000 · y 0000";
  });

  if (!reduceMotion) {
    document.querySelectorAll(".mag").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${dx * .3}px, ${dy * .4}px)`;
      });
      button.addEventListener("pointerleave", () => { button.style.transform = ""; });
    });

    document.querySelectorAll("[data-tilt]").forEach((visual) => {
      visual.addEventListener("pointermove", (event) => {
        const rect = visual.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        visual.style.setProperty("--tilt-x", `${(0.5 - y) * 30}deg`);
        visual.style.setProperty("--tilt-y", `${(x - 0.5) * 24}deg`);
      });
      visual.addEventListener("pointerleave", () => {
        visual.style.setProperty("--tilt-x", "0deg");
        visual.style.setProperty("--tilt-y", "0deg");
      });
    });

    document.querySelectorAll(".stack-cell").forEach((cell) => {
      cell.addEventListener("pointermove", (event) => {
        const rect = cell.getBoundingClientRect();
        cell.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        cell.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      });
    });

  }
}
