const wikiMode = document.body.dataset.wikiMode;
const wikiSource = document.body.dataset.wikiSource;

const wikiState = {
  data: null,
  activeCategory: "all",
  query: "",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getTextMatch(haystack, query) {
  return normalizeValue(haystack).includes(normalizeValue(query));
}

function renderLinkButton(item) {
  if (!item?.href || !item?.label) {
    return "";
  }

  const typeClass = item.type === "ghost" ? " ghost" : " primary";

  return `
    <a href="${escapeHtml(item.href)}">
      <button class="btn${typeClass}">${escapeHtml(item.label)}</button>
    </a>
  `;
}

function isLikelyUrl(value) {
  return /^(https?:\/\/\S+|[a-z0-9.-]+\.[a-z]{2,}\S*)$/i.test(
    String(value || "").trim(),
  );
}

function normalizeUrl(value) {
  const trimmedValue = String(value || "").trim();

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function renderEntryText(value) {
  if (isLikelyUrl(value)) {
    const visibleValue = escapeHtml(value);
    const normalizedValue = escapeHtml(normalizeUrl(value));

    return `
      <a
        class="wiki-entry-link"
        href="${normalizedValue}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${visibleValue}
      </a>
    `;
  }

  return `<p class="wiki-entry-text">${escapeHtml(value || "")}</p>`;
}

function renderEntryContent(item) {
  if (item?.link) {
    const visibleValue = escapeHtml(item.link);
    const normalizedValue = escapeHtml(normalizeUrl(item.link));

    return `
      <a
        class="wiki-entry-link"
        href="${normalizedValue}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${visibleValue}
      </a>
    `;
  }

  return renderEntryText(item?.text);
}

function renderHub() {
  const title = document.getElementById("wikiHubTitle");
  const lead = document.getElementById("wikiHubLead");
  const eyebrow = document.getElementById("wikiHubEyebrow");
  const intro = document.getElementById("wikiHubIntro");
  const featured = document.getElementById("wikiFeatured");
  const filters = document.getElementById("wikiCategoryFilters");
  const search = document.getElementById("wikiHubSearch");
  const entries = document.getElementById("wikiEntries");
  const summary = document.getElementById("wikiHubSummary");

  const data = wikiState.data || {};
  const activeCategory = wikiState.activeCategory;
  const query = wikiState.query;
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const allEntries = Array.isArray(data.entries) ? data.entries : [];

  if (title && data.title) {
    title.textContent = data.title;
  }

  if (lead && data.lead) {
    lead.textContent = data.lead;
  }

  if (eyebrow && data.eyebrow) {
    eyebrow.textContent = data.eyebrow;
  }

  if (intro && data.intro) {
    intro.textContent = data.intro;
  }

  if (search && data.searchPlaceholder) {
    search.placeholder = data.searchPlaceholder;
  }

  if (featured) {
    featured.innerHTML = (Array.isArray(data.featured) ? data.featured : [])
      .map(
        (item) => `
          <article class="card panel wiki-feature-card">
            <div class="wiki-card-meta">
              <span class="wiki-card-category">${escapeHtml(item.category || "Материал")}</span>
              <span class="wiki-card-status">${escapeHtml(item.status || "")}</span>
            </div>
            <div>
              <h3>${escapeHtml(item.title || "Без названия")}</h3>
              <p class="wiki-card-copy">${escapeHtml(item.text || "")}</p>
            </div>
            <div class="wiki-card-actions">
              ${renderLinkButton({
                href: item.href,
                label: item.actionLabel || "Открыть",
                type: "primary",
              })}
            </div>
          </article>
        `,
      )
      .join("");
  }

  if (filters) {
    filters.innerHTML = [
      `
        <button
          class="wiki-filter${activeCategory === "all" ? " is-active" : ""}"
          type="button"
          data-category="all"
        >
          Все категории
        </button>
      `,
      ...categories.map(
        (category) => `
          <button
            class="wiki-filter${activeCategory === category.id ? " is-active" : ""}"
            type="button"
            data-category="${escapeHtml(category.id)}"
          >
            ${escapeHtml(category.label)}
          </button>
        `,
      ),
    ].join("");
  }

  const filteredEntries = allEntries.filter((entry) => {
    const matchesCategory =
      activeCategory === "all" || entry.category === activeCategory;
    const searchableText = [
      entry.title,
      entry.text,
      entry.meta,
      ...(Array.isArray(entry.tags) ? entry.tags : []),
    ].join(" ");
    const matchesQuery = !query || getTextMatch(searchableText, query);

    return matchesCategory && matchesQuery;
  });

  if (summary) {
    summary.textContent = `${filteredEntries.length} материалов`;
  }

  if (entries) {
    entries.innerHTML =
      filteredEntries.length > 0
        ? filteredEntries
            .map(
              (entry) => `
                <article class="panel wiki-entry-card">
                  <div class="wiki-entry-meta">
                    <span class="wiki-entry-category">${escapeHtml(entry.categoryLabel || "Материал")}</span>
                    <span>${escapeHtml(entry.meta || "")}</span>
                  </div>
                  <div>
                    <h3>${escapeHtml(entry.title || "Без названия")}</h3>
                    <p class="wiki-entry-copy">${escapeHtml(entry.text || "")}</p>
                  </div>
                  <div class="wiki-entry-tags">
                    ${(Array.isArray(entry.tags) ? entry.tags : [])
                      .map((tag) => `<span class="wiki-tag">${escapeHtml(tag)}</span>`)
                      .join("")}
                  </div>
                  <div class="wiki-card-actions">
                    ${renderLinkButton({
                      href: entry.href,
                      label: entry.actionLabel || "Открыть",
                      type: "ghost",
                    })}
                  </div>
                </article>
              `,
            )
            .join("")
        : `
            <div class="wiki-empty">
              По текущему фильтру и запросу ничего не найдено.
            </div>
          `;
  }
}

function getArticleSections() {
  const data = wikiState.data || {};
  const query = wikiState.query;
  const sections = Array.isArray(data.sections) ? data.sections : [];

  return sections
    .map((section) => {
      const items = (Array.isArray(section.items) ? section.items : []).filter(
        (item) => {
          if (!query) {
            return true;
          }

          const searchableText = [
            section.title,
            section.description,
            item.title,
            item.text,
            item.link,
            item.meta,
            item.note,
            ...(Array.isArray(item.list) ? item.list : []),
          ].join(" ");

          return getTextMatch(searchableText, query);
        },
      );

      return {
        ...section,
        items,
      };
    })
    .filter(
      (section) =>
        section.items.length > 0 ||
        (!query &&
          (!Array.isArray(section.items) || section.items.length === 0)),
    );
}

function renderArticle() {
  const title = document.getElementById("wikiArticleTitle");
  const lead = document.getElementById("wikiArticleLead");
  const eyebrow = document.getElementById("wikiArticleEyebrow");
  const actions = document.getElementById("wikiArticleActions");
  const facts = document.getElementById("wikiArticleFacts");
  const introCard = document.getElementById("wikiArticleIntroCard");
  const content = document.getElementById("wikiArticleContent");
  const nav = document.getElementById("wikiArticleNav");
  const summary = document.getElementById("wikiArticleSummary");
  const related = document.getElementById("wikiArticleRelated");
  const search = document.getElementById("wikiArticleSearch");

  const data = wikiState.data || {};
  const visibleSections = getArticleSections();
  const totalItems = visibleSections.reduce(
    (sum, section) => sum + (Array.isArray(section.items) ? section.items.length : 0),
    0,
  );

  if (title && data.title) {
    title.textContent = data.title;
    document.title = `Q-Verse — ${data.title}`;
  }

  if (lead && data.lead) {
    lead.textContent = data.lead;
  }

  if (eyebrow && data.eyebrow) {
    eyebrow.textContent = data.eyebrow;
  }

  if (search && data.searchPlaceholder) {
    search.placeholder = data.searchPlaceholder;
  }

  if (actions) {
    const actionButtons = Array.isArray(data.actions)
      ? data.actions.map(renderLinkButton).join("")
      : "";

    if (actionButtons) {
      actions.innerHTML = actionButtons;
    }
  }

  if (facts) {
    facts.innerHTML = (Array.isArray(data.facts) ? data.facts : [])
      .map(
        (fact) => `
          <article class="panel wiki-fact">
            <div class="wiki-fact-label">${escapeHtml(fact.label || "Факт")}</div>
            <div class="wiki-fact-value">${escapeHtml(fact.value || "")}</div>
          </article>
        `,
      )
      .join("");
  }

  if (introCard && data.intro) {
    introCard.textContent = data.intro;
  }

  if (summary) {
    summary.textContent = `${visibleSections.length} разделов, ${totalItems} записей`;
  }

  if (nav) {
    nav.innerHTML = visibleSections
      .map(
        (section, index) => `
          <a class="wiki-nav-link" href="#${escapeHtml(section.id)}">
            <small>Раздел ${index + 1}</small>
            <span>${escapeHtml(section.title || "Без названия")}</span>
          </a>
        `,
      )
      .join("");
  }

  if (content) {
    content.innerHTML =
      visibleSections.length > 0
        ? visibleSections
            .map(
              (section) => `
                <section class="wiki-section panel" id="${escapeHtml(section.id)}">
                  <div class="wiki-section-head">
                    <div>
                      <h2 class="wiki-section-title">${escapeHtml(section.title || "Без названия")}</h2>
                      ${
                        section.description
                          ? `<p class="wiki-section-copy">${escapeHtml(section.description)}</p>`
                          : ""
                      }
                    </div>
                    <div class="wiki-section-id">#${escapeHtml(section.id || "")}</div>
                  </div>

                  <div class="wiki-section-items">
                    ${(Array.isArray(section.items) ? section.items : [])
                      .map((item) => {
                        const list = Array.isArray(item.list)
                          ? `<ul class="wiki-entry-list">${item.list
                              .map((entry) => `<li>${escapeHtml(entry)}</li>`)
                              .join("")}</ul>`
                          : "";

                        return `
                          <article class="wiki-entry">
                            <div class="wiki-entry-head">
                              <h3 class="wiki-entry-title">${escapeHtml(item.title || "Без названия")}</h3>
                              ${
                                item.meta
                                  ? `<div class="wiki-entry-meta">${escapeHtml(item.meta)}</div>`
                                  : ""
                              }
                            </div>
                            ${renderEntryContent(item)}
                            ${list}
                            ${
                              item.note
                                ? `<div class="wiki-entry-note">${escapeHtml(item.note)}</div>`
                                : ""
                            }
                          </article>
                        `;
                      })
                      .join("")}
                  </div>
                </section>
              `,
            )
            .join("")
        : `
            <section class="wiki-section panel">
              <h2 class="wiki-section-title">Ничего не найдено</h2>
              <p class="wiki-section-copy">
                Поиск не дал результатов.
              </p>
            </section>
          `;
  }

  if (related) {
    const relatedItems = Array.isArray(data.related) ? data.related : [];

    related.innerHTML =
      relatedItems.length > 0
        ? relatedItems
            .map(
              (entry) => `
                <article class="panel wiki-entry-card">
                  <div class="wiki-entry-meta">
                    <span class="wiki-entry-category">${escapeHtml(entry.category || "Материал")}</span>
                    <span>${escapeHtml(entry.meta || "")}</span>
                  </div>
                  <div>
                    <h3>${escapeHtml(entry.title || "Без названия")}</h3>
                    <p class="wiki-entry-copy">${escapeHtml(entry.text || "")}</p>
                  </div>
                  <div class="wiki-card-actions">
                    ${renderLinkButton({
                      href: entry.href,
                      label: entry.actionLabel || "Открыть",
                      type: "ghost",
                    })}
                  </div>
                </article>
              `,
            )
            .join("")
        : `
            <div class="wiki-empty">
              Здесь пока нет связанных материалов.
            </div>
          `;
  }
}

function bindHubEvents() {
  const search = document.getElementById("wikiHubSearch");
  const filters = document.getElementById("wikiCategoryFilters");

  if (search) {
    search.addEventListener("input", (event) => {
      wikiState.query = event.target.value || "";
      renderHub();
    });
  }

  if (filters) {
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");

      if (!button) {
        return;
      }

      wikiState.activeCategory = button.dataset.category || "all";
      renderHub();
    });
  }
}

function bindArticleEvents() {
  const search = document.getElementById("wikiArticleSearch");

  if (!search) {
    return;
  }

  search.addEventListener("input", (event) => {
    wikiState.query = event.target.value || "";
    renderArticle();
  });
}

function renderError(message) {
  if (wikiMode === "hub") {
    const entries = document.getElementById("wikiEntries");
    const summary = document.getElementById("wikiHubSummary");

    if (entries) {
      entries.innerHTML = `<div class="wiki-empty">${escapeHtml(message)}</div>`;
    }

    if (summary) {
      summary.textContent = "Ошибка загрузки";
    }
  }

  if (wikiMode === "article") {
    const content = document.getElementById("wikiArticleContent");
    const summary = document.getElementById("wikiArticleSummary");

    if (content) {
      content.innerHTML = `
        <section class="wiki-section panel">
          <h2 class="wiki-section-title">Не удалось загрузить статью</h2>
          <p class="wiki-section-copy">${escapeHtml(message)}</p>
        </section>
      `;
    }

    if (summary) {
      summary.textContent = "Ошибка загрузки";
    }
  }
}

async function loadWikiPage() {
  if (!wikiSource) {
    renderError("Для этой страницы не задан JSON-источник данных.");
    return;
  }

  try {
    const response = await fetch(wikiSource);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    wikiState.data = await response.json();

    if (wikiMode === "hub") {
      renderHub();
      bindHubEvents();
    }

    if (wikiMode === "article") {
      renderArticle();
      bindArticleEvents();
    }
  } catch (error) {
    renderError(
      "Проверьте путь к JSON-файлу вики и повторите попытку.",
    );
    console.error("Failed to load wiki page", error);
  }
}

loadWikiPage();
