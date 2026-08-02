// aHR0cHM6Ly9naXRodWIuY29tL2x1b3N0MjYvYWNhZGVtaWMtaG9tZXBhZ2U=
$(function () {
    lazyLoadOptions = {
        scrollDirection: 'vertical',
        effect: 'fadeIn',
        effectTime: 300,
        placeholder: "",
        onError: function(element) {
            console.log('[lazyload] Error loading ' + element.data('src'));
        },
        afterLoad: function(element) {
            if (element.is('img')) {
                // remove background-image style
                element.css('background-image', 'none');
            } else if (element.is('div')) {
                // set the style to background-size: cover; 
                element.css('background-size', 'cover');
                element.css('background-position', 'center');
            }
        }
    }

    $('img.lazy, div.lazy:not(.always-load)').Lazy({visibleOnly: true, ...lazyLoadOptions});
    $('div.lazy.always-load').Lazy({visibleOnly: false, ...lazyLoadOptions});

    $('[data-toggle="tooltip"]').tooltip()

    var $grid = $('.grid').masonry({
        "percentPosition": true,
        "itemSelector": ".grid-item",
        "columnWidth": ".grid-sizer"
    });
    // layout Masonry after each image loads
    $grid.imagesLoaded().progress(function () {
        $grid.masonry('layout');
    });

    $(".lazy").on("load", function () {
        $grid.masonry('layout');
    });

    var filterButtons = document.querySelectorAll('[data-publication-filter]');
    if (filterButtons.length) {
        var publicationEntries = document.querySelectorAll('.publication-entry');
        var publicationGroups = document.querySelectorAll('[data-publication-group]');
        var emptyState = document.getElementById('publication-filter-empty');
        var validFilters = ['all', 'lead', 'collaboration'];

        function applyPublicationFilter(filter) {
            if (validFilters.indexOf(filter) === -1) filter = 'all';

            var visibleCount = 0;
            publicationEntries.forEach(function (entry) {
                var isVisible = filter === 'all' || entry.dataset.authorRole === filter;
                entry.hidden = !isVisible;
                if (isVisible) visibleCount += 1;
            });

            publicationGroups.forEach(function (group) {
                group.hidden = !group.querySelector('.publication-entry:not([hidden])');
            });

            filterButtons.forEach(function (button) {
                var isActive = button.dataset.publicationFilter === filter;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            emptyState.hidden = visibleCount !== 0;

            var url = new URL(window.location.href);
            if (filter === 'lead') {
                url.searchParams.delete('filter');
            } else {
                url.searchParams.set('filter', filter);
            }
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                applyPublicationFilter(button.dataset.publicationFilter);
            });
        });

        var initialFilter = new URLSearchParams(window.location.search).get('filter') || 'lead';
        applyPublicationFilter(initialFilter);
    }
})
