// =========================================================
// Helplines & resources directory (helplines.html)
// Data lives in one array so it is easy to keep up to date.
// Numbers last checked against each organisation's website: October 2026.
// =========================================================

const HELPLINES = [
  {
    name: "Emergency ambulance (SCDF)",
    description: "If someone's life is in immediate danger, including after self-harm or an overdose.",
    categories: ["crisis"],
    urgent: true,
    hours: "24 hours",
    contacts: [{ label: "Call", value: "995", href: "tel:995" }]
  },
  {
    name: "National mindline 1771",
    description: "Singapore's national mental health helpline. Trained counsellors listen, support and point you to the right services. You can stay anonymous.",
    categories: ["crisis", "everyone"],
    urgent: true,
    hours: "24 hours",
    contacts: [
      { label: "Call", value: "1771", href: "tel:1771" },
      { label: "WhatsApp", value: "6669 1771", href: "https://wa.me/6566691771" },
      { label: "Webchat", value: "mindline.sg", href: "https://www.mindline.sg/" }
    ]
  },
  {
    name: "Samaritans of Singapore (SOS)",
    description: "Confidential emotional support for anyone in crisis, thinking about suicide, or affected by suicide.",
    categories: ["crisis", "everyone"],
    urgent: true,
    hours: "24 hours",
    contacts: [
      { label: "Call", value: "1767", href: "tel:1767" },
      { label: "CareText", value: "9151 1767 (WhatsApp)", href: "https://wa.me/6591511767" },
      { label: "Website", value: "sos.org.sg", href: "https://www.sos.org.sg/" }
    ]
  },
  {
    name: "CHAT (Community Health Assessment Team)",
    description: "Free, confidential mental health check-ins for young people aged 16 to 30, run by IMH.",
    categories: ["youth"],
    hours: "See website for current hours",
    contacts: [
      { label: "Call", value: "6493 6500", href: "tel:+6564936500" },
      { label: "Website", value: "chat.mentalhealth.sg", href: "https://www.chat.mentalhealth.sg/" }
    ]
  },
  {
    name: "Tinkle Friend",
    description: "A helpline and chat service by the Singapore Children's Society for primary school children.",
    categories: ["youth"],
    hours: "Weekday afternoons — see website",
    contacts: [
      { label: "Call", value: "1800 274 4788", href: "tel:18002744788" },
      { label: "Website", value: "tinklefriend.sg", href: "https://www.tinklefriend.sg/" }
    ]
  },
  {
    name: "AWARE Women's Helpline",
    description: "Support for women facing abuse, discrimination, relationship or emotional difficulties.",
    categories: ["women"],
    hours: "See website for current hours",
    contacts: [
      { label: "Call", value: "1800 777 5555", href: "tel:18007775555" },
      { label: "Website", value: "aware.org.sg", href: "https://www.aware.org.sg/" }
    ]
  },
  {
    name: "MindSG (HealthHub)",
    description: "Government self-help hub with articles, exercises and tools for looking after your mental wellbeing.",
    categories: ["selfhelp"],
    hours: "Online, any time",
    contacts: [{ label: "Website", value: "healthhub.sg/mindsg", href: "https://www.healthhub.sg/programmes/mindsg" }]
  },
  {
    name: "Mindful.org — Getting started",
    description: "A beginner-friendly guide to mindfulness and simple breathing practices.",
    categories: ["selfhelp"],
    hours: "Online, any time",
    contacts: [{ label: "Website", value: "mindful.org", href: "https://www.mindful.org/mindfulness-how-to-do-it/" }]
  }
];

const CATEGORY_LABELS = {
  crisis: "24/7 crisis",
  everyone: "Everyone",
  youth: "Youth & children",
  women: "Women",
  selfhelp: "Self-help"
};

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("helplineGrid");
  if (!grid) return;

  const search = document.getElementById("helplineSearch");
  const filters = document.getElementById("helplineFilters");
  const count = document.getElementById("helplineCount");
  let activeCategory = "all";

  const renderCard = (h) => {
    const isExternal = (href) => href.startsWith("http");
    const tags = h.categories
      .map((c) => `<span class="tag${c === "crisis" ? " is-urgent" : ""}">${CATEGORY_LABELS[c]}</span>`)
      .join("");
    const contacts = h.contacts
      .map((c) => `
        <li>
          <span class="contact-label">${c.label}</span>
          <a href="${c.href}"${isExternal(c.href) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${c.value}${isExternal(c.href) ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ""}</a>
        </li>`)
      .join("");

    return `
      <div class="col-md-6 col-xl-4">
        <article class="mw-card helpline-card">
          <div class="helpline-tags">${tags}</div>
          <h3>${h.name}</h3>
          <p class="text-muted">${h.description}</p>
          <ul class="contact-list">${contacts}</ul>
          <p class="small mb-0"><strong>Hours:</strong> ${h.hours}</p>
        </article>
      </div>`;
  };

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const shown = HELPLINES.filter((h) => {
      const inCategory = activeCategory === "all" || h.categories.includes(activeCategory);
      const text = `${h.name} ${h.description} ${h.contacts.map((c) => `${c.label} ${c.value}`).join(" ")}`.toLowerCase();
      return inCategory && (!query || text.includes(query));
    });

    grid.innerHTML = shown.length
      ? shown.map(renderCard).join("")
      : `<div class="col-12"><p class="empty-state mb-0">No services match. Try another word, or call <a href="tel:1771">1771</a> to be pointed in the right direction.</p></div>`;
    count.textContent = `Showing ${shown.length} of ${HELPLINES.length} services`;
  };

  filters.addEventListener("change", (e) => {
    if (e.target.name !== "category") return;
    activeCategory = e.target.value;
    render();
  });

  search.addEventListener("input", render);
  render();
});
