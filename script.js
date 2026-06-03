const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("section[id]")];

const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: [0.2, 0.4, 0.6],
  }
);

sections.forEach((section) => observer.observe(section));

const revealItems = [
  ...document.querySelectorAll(
    ".about-copy, .devops-board, .capability-card, .experience-header, .experience-metrics article, .experience-card"
  ),
];

revealItems.forEach((item, index) => {
  item.classList.add("reveal-item");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 90}ms`);

  if (item.matches(".about-copy, .experience-header")) {
    item.classList.add("reveal-from-left");
  }

  if (item.matches(".devops-board, .experience-card")) {
    item.classList.add("reveal-from-right");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.18,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const skillFilters = [...document.querySelectorAll("[data-skill-filter]")];
const skillCards = [...document.querySelectorAll("[data-skill-card]")];
const skillDetailTitle = document.querySelector("#skillDetailTitle");
const skillDetailLevel = document.querySelector("#skillDetailLevel");
const skillDetailSummary = document.querySelector("#skillDetailSummary");
const skillDetailImpact = document.querySelector("#skillDetailImpact");
const skillDetailTools = document.querySelector("#skillDetailTools");
const skillDetailMeter = document.querySelector("#skillDetailMeter");
const skillDetailDepthText = document.querySelector("#skillDetailDepthText");

const updateSkillDetail = (card) => {
  if (!card) {
    return;
  }

  skillCards.forEach((skillCard) => {
    const isActive = skillCard === card;
    skillCard.classList.toggle("active", isActive);
    skillCard.setAttribute("aria-pressed", String(isActive));
  });

  const depth = card.dataset.skillDepth || "80";
  const tools = (card.dataset.skillTools || "")
    .split(",")
    .map((tool) => tool.trim())
    .filter(Boolean);

  if (skillDetailTitle) {
    skillDetailTitle.textContent = card.dataset.skillTitle || "";
  }

  if (skillDetailLevel) {
    skillDetailLevel.textContent = card.dataset.skillLevel || "";
  }

  if (skillDetailSummary) {
    skillDetailSummary.textContent = card.dataset.skillSummary || "";
  }

  if (skillDetailImpact) {
    skillDetailImpact.textContent = card.dataset.skillImpact || "";
  }

  if (skillDetailDepthText) {
    skillDetailDepthText.textContent = `${depth}%`;
  }

  if (skillDetailMeter) {
    skillDetailMeter.style.width = `${depth}%`;
  }

  if (skillDetailTools) {
    skillDetailTools.innerHTML = "";
    tools.forEach((tool) => {
      const tag = document.createElement("span");
      tag.textContent = tool;
      skillDetailTools.append(tag);
    });
  }
};

const applySkillFilter = (filter) => {
  skillFilters.forEach((button) => {
    const isActive = button.dataset.skillFilter === filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  skillCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.skillCategory === filter;
    card.hidden = !isVisible;
  });

  const activeCard = skillCards.find((card) => card.classList.contains("active") && !card.hidden);
  const firstVisibleCard = skillCards.find((card) => !card.hidden);
  updateSkillDetail(activeCard || firstVisibleCard);
};

skillFilters.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  button.addEventListener("click", () => {
    applySkillFilter(button.dataset.skillFilter || "all");
  });
});

skillCards.forEach((card) => {
  card.setAttribute("aria-pressed", String(card.classList.contains("active")));
  card.addEventListener("click", () => updateSkillDetail(card));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    updateSkillDetail(card);
  });
});

updateSkillDetail(skillCards.find((card) => card.classList.contains("active")) || skillCards[0]);

const projectTrack = document.querySelector("[data-project-track]");
const projectCards = projectTrack ? [...projectTrack.querySelectorAll(".project-card")] : [];
const projectPrev = document.querySelector("[data-project-prev]");
const projectNext = document.querySelector("[data-project-next]");
const projectDots = document.querySelector("[data-project-dots]");
let projectIndex = 0;

const getVisibleProjectCount = () => {
  if (window.matchMedia("(max-width: 680px)").matches) {
    return 1;
  }

  if (window.matchMedia("(max-width: 1280px)").matches) {
    return 2;
  }

  return 3;
};

const getProjectMaxIndex = () => Math.max(projectCards.length - getVisibleProjectCount(), 0);

const renderProjectDots = () => {
  if (!projectDots) {
    return;
  }

  const dotCount = getProjectMaxIndex() + 1;
  projectDots.innerHTML = "";

  for (let index = 0; index < dotCount; index += 1) {
    const dot = document.createElement("button");
    dot.className = "project-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show project slide ${index + 1}`);
    dot.addEventListener("click", () => updateProjectSlider(index));
    projectDots.append(dot);
  }
};

const updateProjectSlider = (nextIndex = projectIndex) => {
  if (!projectTrack || projectCards.length === 0) {
    return;
  }

  const maxIndex = getProjectMaxIndex();
  projectIndex = Math.min(Math.max(nextIndex, 0), maxIndex);
  const cardWidth = projectCards[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(window.getComputedStyle(projectTrack).columnGap || "0");

  projectTrack.style.transform = `translateX(-${projectIndex * (cardWidth + gap)}px)`;

  if (projectPrev) {
    projectPrev.disabled = projectIndex === 0;
  }

  if (projectNext) {
    projectNext.disabled = projectIndex === maxIndex;
  }

  projectDots?.querySelectorAll(".project-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === projectIndex);
  });
};

projectPrev?.addEventListener("click", () => updateProjectSlider(projectIndex - 1));
projectNext?.addEventListener("click", () => updateProjectSlider(projectIndex + 1));

if (projectTrack && projectCards.length > 0) {
  renderProjectDots();
  updateProjectSlider(0);
  window.addEventListener("resize", () => {
    renderProjectDots();
    updateProjectSlider(projectIndex);
  });
}

const certificateTrack = document.querySelector("[data-certificate-track]");
const certificateCards = certificateTrack ? [...certificateTrack.querySelectorAll(".certificate-card")] : [];
let certificateIndex = 0;

const getCertificateMaxIndex = () => Math.max(certificateCards.length - 1, 0);

const updateCertificateCarousel = (nextIndex = certificateIndex) => {
  if (!certificateTrack || certificateCards.length === 0) {
    return;
  }

  const maxIndex = getCertificateMaxIndex();
  certificateIndex = nextIndex > maxIndex ? 0 : Math.max(nextIndex, 0);
  const cardWidth = certificateCards[0].getBoundingClientRect().width;
  const gap = Number.parseFloat(window.getComputedStyle(certificateTrack).columnGap || "0");

  certificateTrack.style.transform = `translateX(-${certificateIndex * (cardWidth + gap)}px)`;
  certificateCards.forEach((card, index) => {
    card.classList.toggle("active", index === certificateIndex);
  });
};

if (certificateTrack && certificateCards.length > 0) {
  updateCertificateCarousel(0);
  window.setInterval(() => updateCertificateCarousel(certificateIndex + 1), 3000);
  window.addEventListener("resize", () => updateCertificateCarousel(certificateIndex));
}

const copyEmailButton = document.querySelector("[data-copy-email]");

copyEmailButton?.addEventListener("click", async () => {
  const email = copyEmailButton.dataset.copyEmail || "";
  const label = copyEmailButton.querySelector("span");
  const originalText = label?.textContent || "Copy Email";

  try {
    await navigator.clipboard.writeText(email);

    if (label) {
      label.textContent = "Copied";
      window.setTimeout(() => {
        label.textContent = originalText;
      }, 1800);
    }
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

window.addEventListener("load", refreshIcons);
