// Navegación accesible para los portales por país de la página principal.
document.addEventListener('DOMContentLoaded', function () {
    const tabList = document.querySelector('.country-tabs');
    const tabs = Array.from(document.querySelectorAll('.country-tab'));
    const panels = Array.from(document.querySelectorAll('.country-panel'));

    if (!tabList || !tabs.length || !panels.length) {
        return;
    }

    const activateTab = function (selectedTab, moveFocus) {
        const country = selectedTab.dataset.country;

        tabs.forEach(function (tab) {
            const isActive = tab === selectedTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        panels.forEach(function (panel) {
            const isActive = panel.id === 'country-panel-' + country;
            panel.classList.toggle('active', isActive);
            panel.toggleAttribute('hidden', !isActive);
        });

        if (moveFocus) {
            selectedTab.focus();
        }
    };

    tabList.addEventListener('click', function (event) {
        const selectedTab = event.target.closest('.country-tab');
        if (selectedTab) {
            activateTab(selectedTab, false);
        }
    });

    tabList.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            return;
        }

        const currentIndex = tabs.findIndex(function (tab) {
            return tab.getAttribute('aria-selected') === 'true';
        });
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;

        event.preventDefault();
        activateTab(tabs[nextIndex], true);
    });
});
