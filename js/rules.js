const rulesCategories = [
  {
    id: "gameplay",
    title: "Правила игры",
    href: "/rules",
  },
  {
    id: "social",
    title: "Правила общения",
    href: "/rules/social",
  },
  {
    id: "wars",
    title: "Правила войн",
    href: "/rules/wars",
  },
];

const pageCategory = document.body.dataset.rulesCategory;
const pageSource = document.body.dataset.rulesSource;

const categoriesNav = document.getElementById("rulesCategories");
const rulesNav = document.getElementById("rulesNav");
const rulesContent = document.getElementById("rulesContent");
const rulesPageTitle = document.getElementById("rulesPageTitle");
const rulesPageLead = document.getElementById("rulesPageLead");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCategories() {
  if (!categoriesNav) {
    return;
  }

  categoriesNav.innerHTML = rulesCategories
    .map((category) => {
      const activeClass =
        category.id === pageCategory ? " rules-nav-link-active" : "";

      return `
        <a class="rules-nav-link${activeClass}" href="${category.href}">
          ${escapeHtml(category.title)}
        </a>
      `;
    })
    .join("");
}

function renderPage(data) {
  if (!rulesNav || !rulesContent) {
    return;
  }

  if (rulesPageTitle && data.title) {
    rulesPageTitle.textContent = data.title;
  }

  if (rulesPageLead && data.lead) {
    rulesPageLead.textContent = data.lead;
  }

  const sections = Array.isArray(data.sections) ? data.sections : [];

  rulesNav.innerHTML = sections
    .map(
      (section) => `
        <a class="rules-nav-link" href="#${escapeHtml(section.id)}">
          ${escapeHtml(section.title)}
        </a>
      `,
    )
    .join("");

  rulesContent.innerHTML = sections
    .map((section) => {
      const items = (Array.isArray(section.items) ? section.items : [])
        .map((item) => {
          const list = Array.isArray(item.list)
            ? `<ul class="rules-list">${item.list
                .map((entry) => `<li>${escapeHtml(entry)}</li>`)
                .join("")}</ul>`
            : "";

          return `
            <article class="rules-item">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.text)}</p>
              ${list}
            </article>
          `;
        })
        .join("");

      return `
        <section class="rules-section panel" id="${escapeHtml(section.id)}">
          <h2 class="rules-section-title">${escapeHtml(section.title)}</h2>
          <div class="rules-items">${items}</div>
        </section>
      `;
    })
    .join("");
}

async function loadRulesPage() {
  renderCategories();

  if (!pageSource) {
    return;
  }

  try {
    const response = await fetch(pageSource);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderPage(data);
  } catch (error) {
    if (rulesContent) {
      rulesContent.innerHTML = `
        <section class="rules-section panel">
          <h2 class="rules-section-title">Не удалось загрузить правила</h2>
          <div class="rules-items">
            <article class="rules-item">
              <h3>Ошибка загрузки</h3>
              <p>
                Проверьте путь к файлу правил и повторите попытку. Если проблема
                сохраняется, обновите страницу позже.
              </p>
            </article>
          </div>
        </section>
      `;
    }

    if (rulesNav) {
      rulesNav.innerHTML = "";
    }

    console.error("Failed to load rules page", error);
  }
}

loadRulesPage();
