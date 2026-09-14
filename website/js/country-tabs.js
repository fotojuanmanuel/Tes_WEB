// Navegación accesible y filtros para los portales por país.
document.addEventListener('DOMContentLoaded', function () {
    const tabList = document.querySelector('.country-tabs');
    const tabs = Array.from(document.querySelectorAll('.country-tab'));
    const panels = Array.from(document.querySelectorAll('.country-panel'));
    const countries = tabs.map(function (tab) { return tab.dataset.country; });
    const sectionConfig = {
        noticias: {
            defaultContent: ['.news-filters', '.news-featured', '.grid', '.text-center']
        },
        comunicados: {
            defaultContent: ['.grid', '.text-center']
        },
        eventos: {
            defaultContent: ['.calendar', '.text-center']
        },
        multimedia: {
            defaultContent: ['.multimedia-tabs', '.multimedia-content', '.text-center']
        }
    };
    let selectedCountry = 'cuba';
    let activeSection = null;

    if (!tabList || !tabs.length || !panels.length) {
        return;
    }

    const translate = function (key, replacements) {
        if (window.PressPortalI18n) {
            return window.PressPortalI18n.t(key, replacements);
        }

        const fallbacks = {
            'countries.filterActive': 'Filtro activo: {section} de {country}.',
            'countries.empty': 'No hay contenido de {section} etiquetado para {country} en el portal actual.',
            'countries.clearFilter': 'Ver todo el contenido',
            'countries.sections.noticias': 'Noticias',
            'countries.sections.comunicados': 'Comunicados',
            'countries.sections.eventos': 'Eventos',
            'countries.sections.multimedia': 'Multimedia'
        };
        let value = fallbacks[key] || key;
        Object.keys(replacements || {}).forEach(function (name) {
            value = value.replace('{' + name + '}', String(replacements[name]));
        });
        return value;
    };

    const countryName = function (country) {
        const tab = tabs.find(function (item) { return item.dataset.country === country; });
        return tab ? tab.textContent.trim() : country;
    };

    const prepareSection = function (sectionId) {
        const section = document.getElementById(sectionId);
        const config = sectionConfig[sectionId];
        if (!section || !config) return null;

        config.defaultContent.forEach(function (selector) {
            section.querySelectorAll(selector).forEach(function (element) {
                element.classList.add('country-default-content');
            });
        });

        let status = section.querySelector('.country-filter-status');
        if (!status) {
            status = document.createElement('div');
            status.className = 'country-filter-status';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            status.hidden = true;

            const message = document.createElement('div');
            const heading = document.createElement('strong');
            heading.className = 'country-filter-heading';
            const empty = document.createElement('p');
            empty.className = 'country-filter-empty';
            message.appendChild(heading);
            message.appendChild(empty);

            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'country-filter-clear';
            clearButton.addEventListener('click', clearCountryFilter);

            status.appendChild(message);
            status.appendChild(clearButton);

            const sectionHeading = section.querySelector('h2');
            if (sectionHeading) {
                sectionHeading.insertAdjacentElement('afterend', status);
            }
        }

        return section;
    };

    const updateStatusText = function () {
        if (!activeSection) return;
        const section = document.getElementById(activeSection);
        if (!section) return;

        const name = countryName(selectedCountry);
        const sectionName = translate('countries.sections.' + activeSection);
        const replacements = { country: name, section: sectionName };
        section.querySelector('.country-filter-heading').textContent = translate('countries.filterActive', replacements);
        section.querySelector('.country-filter-empty').textContent = translate('countries.empty', replacements);
        section.querySelector('.country-filter-clear').textContent = translate('countries.clearFilter');
    };

    const updateUrl = function (country, sectionId) {
        if (!window.history || !window.history.replaceState) return;
        const url = new URL(window.location.href);
        if (country && sectionId) {
            url.searchParams.set('pais', country);
            url.searchParams.set('seccion', sectionId);
            url.hash = sectionId;
        } else {
            url.searchParams.delete('pais');
            url.searchParams.delete('seccion');
        }
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    };

    const applyCountryFilter = function (country, sectionId, options) {
        const section = prepareSection(sectionId);
        if (!section || !countries.includes(country)) return;

        if (activeSection && activeSection !== sectionId) {
            const previous = document.getElementById(activeSection);
            if (previous) {
                previous.classList.remove('country-filter-active');
                const previousStatus = previous.querySelector('.country-filter-status');
                if (previousStatus) previousStatus.hidden = true;
            }
        }

        selectedCountry = country;
        activeSection = sectionId;
        section.classList.add('country-filter-active');
        section.querySelector('.country-filter-status').hidden = false;
        updateStatusText();
        updateUrl(country, sectionId);

        if (!options || options.moveFocus !== false) {
            const heading = section.querySelector('h2');
            if (heading) {
                heading.classList.add('country-filter-target');
                heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    function clearCountryFilter() {
        if (!activeSection) return;
        const section = document.getElementById(activeSection);
        if (section) {
            section.classList.remove('country-filter-active');
            const status = section.querySelector('.country-filter-status');
            if (status) status.hidden = true;
        }
        activeSection = null;
        updateUrl(null, null);
    }

    const activateTab = function (selectedTab, moveFocus) {
        const country = selectedTab.dataset.country;
        selectedCountry = country;

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

        if (activeSection) {
            applyCountryFilter(country, activeSection, { moveFocus: false });
        }

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

    panels.forEach(function (panel) {
        panel.addEventListener('click', function (event) {
            const link = event.target.closest('[data-country-section]');
            if (!link) return;
            event.preventDefault();
            applyCountryFilter(panel.id.replace('country-panel-', ''), link.dataset.countrySection);
        });
    });

    document.addEventListener('languageChanged', updateStatusText);

    const params = new URLSearchParams(window.location.search);
    const initialCountry = params.get('pais');
    const initialSection = params.get('seccion');
    if (countries.includes(initialCountry) && sectionConfig[initialSection]) {
        const initialTab = tabs.find(function (tab) { return tab.dataset.country === initialCountry; });
        activateTab(initialTab, false);
        applyCountryFilter(initialCountry, initialSection, { moveFocus: false });
    }
});
