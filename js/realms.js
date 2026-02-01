const tabs = document.querySelectorAll('.realm-tab');
const contents = document.querySelectorAll('.realm-content');
const root = document.querySelector('.realms');
const character = document.getElementById('realmCharacter');

function setActiveRealm(tab) {
    // tabs
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // content
    contents.forEach(c => c.classList.remove('active'));
    const content = document.getElementById(tab.dataset.realm);
    if (content) content.classList.add('active');

    // accent color
    root.style.setProperty('--realm-accent', tab.dataset.color);

    // character fade
    if (tab.dataset.character) {
        character.classList.remove('visible');

        setTimeout(() => {
            character.src = tab.dataset.character;
            character.classList.add('visible');
        }, 120);
    }
}

const initialTab = document.querySelector('.realm-tab.active') || tabs[0];
if (initialTab) {
    character.src = initialTab.dataset.character;
    requestAnimationFrame(() => {
        character.classList.add('visible');
    });
    setActiveRealm(initialTab);
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveRealm(tab));
});
