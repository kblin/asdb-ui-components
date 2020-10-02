import { customElement, property, LitElement, html, css } from 'lit-element';
import $ from 'jquery';
import './jquery-global';
//import 'jquery-ui/themes/base/core.css';
//import 'jquery-ui/themes/base/theme.css';
//import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui-bundle';
import './asdb-results';
import { fetchDownload } from './downloader';

const SORT_CLASS = '.element-alternatives';

const SORT_OPTIONS = {
    connectWith: SORT_CLASS,
    placeholder: 'element-placeholder',
    opacity: 0.5, // opacity for the element being dragged
    delay: 100, // allows time before dragging for click, potentially useful for the static ones
    activate: function (event, ui) {
        // create empty alternative buckets when dragging
        $('.empty-alternatives').show();
        $(SORT_CLASS).sortable('refreshPositions');
    },
    start: function (event, ui) {
        $(SORT_CLASS)
            .css('margin-left', '2em')
            .css('margin-right', '2em')
            .css('border', '1px dashed gray');
    },
    stop: function (event, ui) {
        // remove empty alternative buckets after dragging
        removeEmptyOptions();
        $(SORT_CLASS)
            .css('margin-left', '')
            .css('margin-right', '')
            .css('border', '');
        updateSearchText();
        // prevent a click event immediately after this, otherwise it'll be removed
        $(event.originalEvent.target).one('click', function (e) {
            if (e) {
                e.stopImmediatePropagation();
            }
        });
    },
    receive: function (event, ui) {
        // if a list becomes non-empty, or a list with none has a non-none added, remove the "any" or "none"
        // TODO be more clever if the item being dropped is a "none" itself
        removeNone(event.target);
        if (ui.item.hasClass('element')) {
            return;
        }
    },
    out: function (event, ui) {
        // if a list becomes non-empty, or a list with none has a non-none added, remove the "any" or "none"
        $('.element-alternatives:not(:has(.element))').not('.empty-alternatives').remove();
    },
};

function addEmptyOptions(element) {
    $('.section-elements').append(
        '<div class="element-alternatives empty-alternatives"><span class="create-alt">create alternative</span></div>',
    );
    $(SORT_CLASS).sortable(SORT_OPTIONS);
}

function removeEmptyOptions() {
    $('.empty-alternatives').hide();
    $('.element-alternatives')
        .filter(function () {
            return $(this).children().length === 0 && $(this).siblings.length > 0;
        })
        .remove();
    $('.section-elements')
        .filter(function () {
            return $(this).children().not('.empty-alternatives').length == 0;
        })
        .prepend('<div class="element-alternatives"><div class="element element-ignore">ignored</div></div>');
    $(SORT_CLASS).sortable(SORT_OPTIONS);
}

function removeNone(element) {
    const target = $(element);
    if (target.hasClass('empty-alternatives')) {
        target.removeClass('empty-alternatives');
        target
            .parent()
            .append(
                '<div class="element-alternatives empty-alternatives"><span class="create-alt">create alternative</span></div>',
            )
            .sortable(SORT_OPTIONS);
        target.children().filter('.create-alt').remove();
        target.removeClass('empty-alternatives');
    }
    target.find('.element-none').remove();
    target.find('.element-ignore').remove();
}

function generateSearchText() {
    let textParts = [];
    $('.section-elements').each(function () {
        const alternatives = $(this).children();
        if (alternatives.length == 0) {
            return;
        }
        let alternates = [];
        alternatives.each(function () {
            const children = [];
            $(this)
                .children()
                .filter('.element')
                .each(function () {
                    const part = $(this).text().trim();
                    if (part.length > 0) {
                        if (part === 'none') {
                            children.push('0');
                        } else if (part !== 'ignored') {
                            children.push(part);
                        }
                    }
                });
            if (children.length > 0) {
                alternates.push(children.join('+'));
            }
        });
        if (alternates.length > 0) {
            textParts.push($(this).attr('data-type') + '=' + alternates.join(','));
        }
    });
    return textParts.join('|');
}

function updateSearchText() {
    const text = generateSearchText();
    let searchText = '?query=' + encodeURIComponent(text);
    if (!text) {
        searchText = '';
    }
    window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${searchText}`,
    );
}

function rebuild() {
    if (!window.location.search) {
        return;
    }
    const rawQuery = decodeURIComponent(
        new URL(window.location).searchParams.get('query'),
    );
    if (!rawQuery) {
        // remove any search params if empty, e.g. "?query="
        window.history.replaceState({}, '', `${window.location.pathname}`);
        return;
    }
    const sections = rawQuery.split('|');
    for (let i = 0; i < sections.length; i++) {
        const all = sections[i].split('=');
        const category = all[0];
        const alternatives = all[1].split(',');
        const container = $(`.section-elements[data-type='${category}'`);
        container.children().remove();
        for (let j = 0; j < alternatives.length; j++) {
            const parts = alternatives[j].split('+');
            const newAlternative = $(
                `<div class="element-alternatives"></div>`,
            ).sortable(SORT_OPTIONS);
            for (let k = 0; k < parts.length; k++) {
                let name = parts[k];
                if (name === '0') {
                    name = 'none';
                } else if (name === '?') {
                    name = 'any';
                }
                const element = $(`<div class="element"></div>`);
                const matching = $('.domain-section .element-inner').filter(
                    function () {
                        return $(this).text().trim() === name;
                    },
                );
                if (matching.length === 0) {
                    showError(`bad query, unknown domain name: ${name}`);
                    reset();
                    return;
                }
                matching
                    .first() // because otherwise it'd clone "any"/"none" from all sections
                    .clone()
                    .appendTo(element);
                element.appendTo(newAlternative);
            }
            newAlternative.appendTo(container);
            newAlternative.sortable(SORT_OPTIONS);
        }
    }
}

function showError(message) {
    $('.error-message > .message').text(message);
    if (!message) {
        $('.error-message').css('opacity', 0);
        return;
    }
    $('.error-message').stop().css('opacity', 1).fadeOut(4000);
}

function clickedElement(event) {
    $(this).remove();
    removeEmptyOptions();
    updateSearchText();
}

function reset() {
    $('.element-alternatives').remove();
    addEmptyOptions();
    removeEmptyOptions();
    window.history.replaceState({}, '', `${window.location.pathname}`);
}

function start() {
    $('.domain-section .element-inner').wrap(`<div class="element"></div>`);
    const container = $('#module-query-svg-container');
    const query = container.attr('data-query');
    rebuild();
    addEmptyOptions();
    $(SORT_CLASS).sortable(SORT_OPTIONS);
    $('.empty-alternatives').hide();
    $('.domain-section .element').draggable({
        helper: 'clone',
        connectToSortable: SORT_CLASS,
        start: SORT_OPTIONS.start,
        stop: SORT_OPTIONS.stop,
    });
    $('#advanced-mode').change(function () {
        if ($(this).prop('checked')) {
            $('#simple-sections').hide();
            $('#advanced-sections').show();
        } else {
            $('#advanced-sections').hide();
            $('#simple-sections').show();
        }
    }).trigger('change'); // ensure current state is respected on soft refresh

    $('.clear-query').on('click', reset);
    // set click event handlers for query elements
    $('.element-alternatives > .element').on('click', clickedElement);
    // and for the element buffet
    $('.domain-section .element').on('click', function (event) {
        const category = $(this).parent().attr('data-type');

        if (!category) {
            // shouldn't happen, but at least don't error out
            return;
        }
        const previous = $(
            `.section-elements[data-type='${category}'] > .element-alternatives:nth-last-child(2)`,
        );
        // if ctrl down, append to most recent in same category (except if the clicked thing is NONE)
        if (event.ctrlKey || event.metaKey) {
            if (category === 'S') {
                showError('Condensation step cannot have two domains in an alternative group');
                return;
            }
            if (category === 'L') {
                showError('Substrate activation cannot have two domains in an alternative group');
                return;
            }
            if (category === 'T') {
                showError('Carrier protein cannot have two domains in an alternative group');
                return;
            }
            if (category === 'F') {
                showError('Epimerase/finalisation cannot have two domains in an alternative group');
                return;
            }
            // TODO: abort if text already inside list
            // TODO: replace "ignore" if in existing
            // abort if None is selected and the existing is anything other than "ignored"
            if ($(this).text().trim() === 'none') {
                if (previous.children().last().text().trim() !== 'ignored') {
                    showError('cannot require none and other types');
                    return; // TODO: alert the user that it's incompatible
                } else {
                    previous.children().remove();
                    previous.removeClass('empty-alternatives');
                }
            }
            $(`<div class="element">${$(this)[0].outerHTML}</div>`)
                .appendTo(previous)
                .on('click', clickedElement);
            $(SORT_CLASS).sortable('refreshPositions');
        } else {
            // else create alternative
            const newAlternative = $(
                `<div class="element-alternatives"><div class="element">${
                    $(this)[0].outerHTML
                }</div></div>`,
            ).sortable(SORT_OPTIONS);
            newAlternative.insertAfter(previous);
            // replace other "ignore" element-alternatives that exist
            if (previous.children() && previous.children().last().hasClass('element-ignore')) {
                previous.remove();
            }
            newAlternative.children().on('click', clickedElement);
        }
        updateSearchText();
    });
}

@customElement('asdb-module-search')
export class AsdbModuleSearch extends LitElement {
    @property({ type: Array })
    clusters = [];

    @property({ type: String })
    state = 'input';

    @property({type: String})
    error = "";

    @property({ type: Number })
    offset = 0;

    @property({ type: Number })
    paginate = 50;

    @property({ type: Number })
    total = 0;

    @property({ type: Boolean })
    loading_more = false;

    loadExample() {
        const searchText = 'S%3DPKS_KS|L%3D0|M%3DPKS_KR%2CPKS_ER%2CPKS_DH%2BcMT|T%3Dany|F%3DThioesterase';
        window.history.replaceState({}, '', `${window.location.pathname}?query=${searchText}`);
        rebuild();
        $('.element-alternatives > .element').on('click', clickedElement);
    }

    buildQuery() {
        return {
            query: {
                return_type: 'json',
                search: 'cluster',
                terms: {
                    term_type: 'expr',
                    category: 'modulequery',
                    term: generateSearchText().replace("any", "?"),
                },
            },
        };
    }

    runSearch() {
        this.state = 'in-progress';
        $('.form').hide();
        fetch('/api/v1.0/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.buildQuery()),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Network request returned ${response.status}:${response.statusText}`);
            }
            return response.json();
        }).then((data) => {
            this.state = 'done';
            this.clusters = data.clusters;
            this.offset = data.offset;
            this.paginate = data.paginate;
            this.total = data.total;
        }).catch(error => {
            this.state = "invalid";
            this.error = error;
            console.error(error);

        });
    }

    loadMore() {
        let query = this.buildQuery();
        query.offset = this.offset + this.paginate;
        query.paginate = this.paginate;

        this.loading_more = true;
        fetch('/api/v1.0/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        }).then((response) => {
                return response.json();
        }).then((data) => {
                this.clusters = this.clusters.concat(data.clusters);
                this.offset = data.offset;
                this.paginate = data.paginate;
                this.total = data.total;
                this.loading_more = false;
        });
    }

    loadButtonHidden() {
        if (
            this.loading_more ||
            !this.clusters ||
            this.clusters.length >= this.total
        ) {
            return 'hidden';
        }
        return '';
    }

    getResultSummary() {
        if (this.total) {
            return html`<div>
                Your search gave <strong>${this.total}</strong> results, showing
                <strong>1</strong> to <strong>${this.clusters.length}</strong>.
            </div>`;
        }
        return html``;
    }

    clearResults() {
        this.offset = 0;
        this.paginate = 50;
        this.total = 0;
        this.loading_more = false;
        this.state = 'input';
        $('.form').show();
    }

    clearQuery() {
        reset();
    }

    download() {
        let query = {
            search_string: this.searchString,
            return_type: 'csv',
        };
        fetchDownload(query, 'csv');
    }

    firstUpdated(changedProperties) {
        start();
    }

    static get styles() {
        return css`
            .hidden {
                display: none;
            }
            .form {
                display: flex;
                flex-direction: column;
            }
            label {
                margin-left: 20%;
            }
            #search-field {
                margin-left: 20%;
                width: 60%;
            }
            .button-group {
                display: flex;
                justify-content: space-between;
                margin-top: 2em;
            }
            button {
                display: inline-block;
                touch-action: manipulation;
                cursor: pointer;
                border: 1px solid transparent;
                padding: 6px 12px;
                font-size: 14px;
                border-radius: 4px;
                background-image: linear-gradient(to bottom, #e8e8e8 0, #f5f5f5 100%);
                background-repeat: repeat-x;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05),
                    0 1px 0 rgba(255, 255, 255, 0.1);
            }
            button:hover {
                box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.05),
                    0 1px 0 rgba(255, 255, 255, 0.1);
            }
            button::-moz-focus-inner {
                padding: 0;
                border: 0;
            }
            .btn-primary {
                color: #fff;
                background-image: linear-gradient(to bottom, #810e15 0, #4a080c 100%);
                background-repeat: repeat-x;
                stroke: #fff;
                fill: #fff;
            }
            .btn-primary:hover {
                background-color: #4a080c;
            }
            .search {
                width: 25%;
            }
            .icon {
                width: 1em;
                height: 1em;
            }
        `;
    }

    render() {
        return html`
            <div class="${this.state != 'input' ? 'hidden' : ''}">
                <div class="form">
                    <div class="button-group">
                        <button class="clear" @click=${this.clearQuery}>Clear query</button>
                        <button class="search btn-primary" @click=${this.runSearch}>
                            Search
                        </button>
                        <button class="example" @click=${this.loadExample}>
                            Load example
                        </button>
                    </div>
                </div>
            </div>
            <div class="in-progress ${this.state != 'in-progress' ? 'hidden' : ''}">
                Running search, please wait...
            </div>
            <div class="results ${this.state != 'done' ? 'hidden' : ''}">
                <div class="button-group">
                    <button class="download btn-primary" @click=${this.download}>
                        <svg class="icon">
                            <use xlink:href="/images/icons.svg#download"></use>
                        </svg>
                        Download results
                    </button>
                    <button class="new-search" @click=${this.clearResults}>
                        New search
                    </button>
                </div>
                ${this.getResultSummary()}
                <asdb-results .clusters=${this.clusters}></asdb-results>
                <div class="more-results ${this.loadButtonHidden()}">
                    <button class="btn-primary" @click=${this.loadMore}>
                        <svg class="icon">
                            <use xlink:href="/images/icons.svg#plus"></use>
                        </svg>
                        Load more results
                    </button>
                </div>
                <div class="loading-more ${this.loading_more ? '' : 'hidden'}">
                    Loading more results, please wait...
                </div>
            </div>
            <div class="error ${this.state != 'error' ? 'hidden' : ''}">
                ${this.error}
            </div>
        `;
    }
}
