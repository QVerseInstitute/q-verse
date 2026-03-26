const timelineSource = document.body.dataset.timelineSource;

const timelinePageTitle = document.getElementById("timelinePageTitle");
const timelinePageLead = document.getElementById("timelinePageLead");
const timelineIntro = document.getElementById("timelineIntro");
const timelineOverview = document.getElementById("timelineOverview");
const timelineFilters = document.getElementById("timelineFilters");
const timelineEraNav = document.getElementById("timelineEraNav");
const timelineSummary = document.getElementById("timelineSummary");
const timelineStack = document.getElementById("timelineStack");

let timelineState = {
  activeTag: "all",
  data: null,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getTagMap(data) {
  return new Map((data.tags || []).map((tag) => [tag.id, tag]));
}

function getTagClass(tagId) {
  return `timeline-tag-${tagId}`;
}

function getFilteredEras() {
  if (!timelineState.data) {
    return [];
  }

  const activeTag = timelineState.activeTag;

  return (timelineState.data.eras || [])
    .map((era) => ({
      ...era,
      events: (era.events || []).filter(
        (event) => activeTag === "all" || event.tag === activeTag,
      ),
    }))
    .filter((era) => era.events.length > 0);
}

function renderOverview(data) {
  if (!timelineOverview) {
    return;
  }

  timelineOverview.innerHTML = (data.overview || [])
    .map(
      (item) => `
        <article class="card panel timeline-overview-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `,
    )
    .join("");
}

function renderFilters(data) {
  if (!timelineFilters) {
    return;
  }

  const tags = data.tags || [];
  const activeTag = timelineState.activeTag;

  timelineFilters.innerHTML = [
    `
      <button
        class="timeline-filter${activeTag === "all" ? " is-active" : ""}"
        type="button"
        data-tag="all"
      >
        Все события
      </button>
    `,
    ...tags.map(
      (tag) => `
        <button
          class="timeline-filter ${getTagClass(tag.id)}${activeTag === tag.id ? " is-active" : ""}"
          type="button"
          data-tag="${escapeHtml(tag.id)}"
        >
          ${escapeHtml(tag.label)}
        </button>
      `,
    ),
  ].join("");
}

function renderEraNav(eras) {
  if (!timelineEraNav) {
    return;
  }

  timelineEraNav.innerHTML = eras
    .map(
      (era) => `
        <a class="timeline-era-link" href="#${escapeHtml(era.id)}">
          <span>${escapeHtml(era.label)}</span>
          <strong>${escapeHtml(era.title)}</strong>
        </a>
      `,
    )
    .join("");
}

function renderSummary(eras) {
  if (!timelineSummary) {
    return;
  }

  const eventsCount = eras.reduce((sum, era) => sum + era.events.length, 0);
  const erasCount = eras.length;

  timelineSummary.textContent = `${eventsCount} событий в ${erasCount} эпохах`;
}

function renderTimeline(eras, data) {
  if (!timelineStack) {
    return;
  }

  const tagMap = getTagMap(data);

  if (eras.length === 0) {
    timelineStack.innerHTML = `
      <article class="panel timeline-era timeline-era-empty">
        <div class="timeline-era-head">
          <div>
            <p class="timeline-era-label">Фильтр</p>
            <h2>События не найдены</h2>
          </div>
        </div>
        <p class="timeline-empty-copy">
          Для выбранной категории пока нет записей. Выберите другой фильтр или
          добавьте события в JSON-файл таймлайна.
        </p>
      </article>
    `;
    return;
  }

  timelineStack.innerHTML = eras
    .map((era) => {
      const events = era.events
        .map((event) => {
          const tag = tagMap.get(event.tag);
          const tagLabel = tag ? tag.label : event.tag;

          return `
            <article class="timeline-event">
              <div class="timeline-marker"></div>
              <div class="timeline-event-body">
                <div class="timeline-event-meta">
                  <span class="timeline-tag ${getTagClass(event.tag)}">${escapeHtml(tagLabel)}</span>
                  <span class="timeline-date">${escapeHtml(event.date)}</span>
                </div>
                <h3>${escapeHtml(event.title)}</h3>
                <p>${escapeHtml(event.text)}</p>
              </div>
            </article>
          `;
        })
        .join("");

      return `
        <article class="panel timeline-era" id="${escapeHtml(era.id)}">
          <div class="timeline-era-head">
            <div>
              <p class="timeline-era-label">${escapeHtml(era.label)}</p>
              <h2>${escapeHtml(era.title)}</h2>
            </div>
            <p class="timeline-era-range">${escapeHtml(era.range)}</p>
          </div>
          <div class="timeline-events">${events}</div>
        </article>
      `;
    })
    .join("");
}

function renderPage(data) {
  timelineState.data = data;

  if (timelinePageTitle && data.title) {
    timelinePageTitle.textContent = data.title;
  }

  if (timelinePageLead && data.lead) {
    timelinePageLead.textContent = data.lead;
  }

  if (timelineIntro && data.intro) {
    timelineIntro.textContent = data.intro;
  }

  renderOverview(data);
  renderFilters(data);

  const filteredEras = getFilteredEras();
  renderEraNav(filteredEras);
  renderSummary(filteredEras);
  renderTimeline(filteredEras, data);
}

function bindEvents() {
  if (!timelineFilters) {
    return;
  }

  timelineFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");

    if (!button || !timelineState.data) {
      return;
    }

    timelineState.activeTag = button.dataset.tag || "all";
    renderPage(timelineState.data);
  });
}

async function loadTimeline() {
  if (!timelineSource) {
    return;
  }

  try {
    const response = await fetch(timelineSource);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    renderPage(data);
    bindEvents();
  } catch (error) {
    if (timelineStack) {
      timelineStack.innerHTML = `
        <article class="panel timeline-era timeline-era-empty">
          <div class="timeline-era-head">
            <div>
              <p class="timeline-era-label">Ошибка</p>
              <h2>Не удалось загрузить таймлайн</h2>
            </div>
          </div>
          <p class="timeline-empty-copy">
            Проверьте путь к JSON-файлу таймлайна и повторите попытку.
          </p>
        </article>
      `;
    }

    if (timelineSummary) {
      timelineSummary.textContent = "Ошибка загрузки";
    }

    console.error("Failed to load timeline", error);
  }
}

loadTimeline();
