import { customElement, property, LitElement, html, css, internalProperty } from 'lit-element';

import './asdb-query-term';
import './asdb-results';
import { fetchDownload } from './downloader';
import { AsdbQueryOperand, AsdbQueryOperator } from './asdb-query-term';

@customElement('asdb-query-builder')
export class AsdbQueryBuilder extends LitElement {
    @property({type: Object, reflect: true, hasChanged: (newVal, oldVal) => {return JSON.stringify(newVal) !== JSON.stringify(oldVal)}})
    query = null;

    @property({type: Array})
    clusters = [];

    @internalProperty({type: String})
    state = "input";

    @property({type: String})
    error = "";

    @property({type: Number})
    offset = 0;

    @property({type: Number})
    paginate = 50;

    @property({type: Number})
    total = 0;

    @internalProperty({type: Boolean})
    loading_more = false;

    @internalProperty()
    compatibleReturnTypes = {
        cluster: new Set(['json', 'csv', 'fasta']),
        gene: new Set(['fasta', 'csv', 'fastaa']),
        domain: new Set(['fastaa', 'csv', 'fasta']),
    };

    @internalProperty()
    searchTypes = [
        {id: 'cluster', desc: 'Cluster'},
        {id: 'gene', desc: 'Gene'},
        {id: 'domain', desc: 'NRPS/PKS domain'},
    ];

    @internalProperty()
    returnTypes = [
        {id: 'json', desc: 'Graphical'},
        {id: 'csv', desc: 'CSV'},
        {id: 'fasta', desc: 'DNA FASTA'},
        {id: 'fastaa', desc: 'AA FASTA'},
    ];

    @internalProperty()
    downloadReturnTypes = new Set(['csv', 'fasta', 'fastaa']);

    @internalProperty({type: Boolean})
    show_text_mode = true;

    @internalProperty({type: Object})
    categories = {
        order: null,
        mappings: {},
    };


    static get styles() {
        return css`
        .hidden {
            display: none;
        }
        .form {
            display: flex;
            flex-direction: column;
        }
        .form-control {
            text-align: right;
            margin-bottom: 0;
            padding-top: 7px;
            padding-right: 0.5em;
            font-weight: bold;
        }
        #search-field {
            margin-left: 20%;
            width: 60%;
        }
        .pattern-list {
            margin: 1em 0;
            padding: 2em 1em;
            border-radius: 8px;
            border: 1px dashed #444;
        }
        .button-group {
            display: flex;
            justify-content: flex-end;
            margin-top: 2em;
        }
        button, .btn {
            display: inline-block;
            width: auto;
            touch-action: manipulation;
            cursor: pointer;
            border: 1px solid #ccc;
            padding: 6px 12px;
            font-size: 14px;
            border-radius: 4px;
            background-image: linear-gradient(to bottom, #ddd 0, #bebebe 100%);
            background-repeat: repeat-x;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:hover, .btn:hover {
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:active, .btn.active {
            background-color: #bebebe;
            background-position: 0 -15px;
            border-color: #b9b9b9;
            z-index: 2;
            background-image: none;
        }
        button::-moz-focus-inner {
            padding: 0;
            border: 0;
        }
        .btn-group {
            display: flex;
            justify-content: center;
        }
        .btn-group > .btn {
            border-radius: 4px;
        }
        .btn-group > .btn:first-child:not(:last-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        .btn-group > .btn:last-child:not(:first-child) {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        .btn-group > .btn:not(:first-child):not(:last-child) {
            border-radius: 0;
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
        .btn-info {
            color: #fff;
            background-image: linear-gradient(to bottom, #5bc0de 0, #2aabd2 100%);
            background-repeat: repeat-x;
            stroke: #fff;
            fill: #fff;
            border-color: #28a4c9;
        }
        .btn-info:hover {
            background-color: #2aabd2;
        }
        .btn-info.active {
            background-color: #2aabd2;
            background-position: 0 -15px;
            border-color: #28a4c9;
        }
        .search {
            width: 25%;
        }
        .example {
            margin-left: 25%;
        }
        .icon {
            width: 1em;
            height: 1em;
        }
        .query-options {
            display: flex;
            justify-content: space-between;
        }
        .search-options {
            display: flex;
            justify-content: center;
            flex-flow: row no-wrap;
            flex: 1 0 auto;
        }
        .return-options {
            display: flex;
            justify-content: center;
            flex-flow: row no-wrap;
            flex: 1 0 auto;
        }
        .pagination-options {
            display: flex;
            justify-content: space-around;
            flex-flow: row no-wrap;
            flex: 1 0 auto;
        }
        .text-mode-input {
            width: 80%;
        }
    `;
    }

    loadExample() {
        let left = new AsdbQueryOperand("type", 1, "nrps");
        let right = new AsdbQueryOperand("genus", 1, "streptomyces");
        this.query.terms = new AsdbQueryOperator("AND", left, right);
        this.searchChanged();
        this.requestUpdate();
    }

    runSearch() {
        let request = {
            query: this.query,
            paginate: this.paginate,
            offset: this.offset,
        };
        this.state = "in-progress";
        fetch("/api/v2.0/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Network request returned ${response.status}:${response.statusText}`);
            }
            return response.json();
        }).then((data) => {
            this.state = "done";
            this.clusters = data.clusters;
            this.offset = data.offset + data.paginate;
            this.paginate = data.paginate;
            this.total = data.total;
        }).catch(error => {
            this.state = "error";
            this.error = error;
            console.error(error);

        });
    }

    loadMore() {
        let query = {
            query: this.query,
            offset: this.offset,
            paginate: this.paginate,
        };
        this.loading_more = true;
        fetch("/api/v2.0/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(query),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            this.clusters = this.clusters.concat(data.clusters);
            this.offset = data.offset + data.paginate;
            this.paginate = data.paginate;
            this.total = data.total;
            this.loading_more = false;
        });
    }

    loadButtonHidden() {
        if (this.loading_more || !this.clusters || this.clusters.length >= this.total) {
            return "hidden";
        }
        return "";
    }

    getResultSummary() {
        if (this.total) {
            return html`<div>Your search gave <strong>${this.total}</strong> results, showing <strong>1</strong> to <strong>${this.clusters.length}</strong>.</div>`;
        }
        return html``;
    }

    clearResults() {
        this.offset = 0;
        this.paginate = 50;
        this.total = 0;
        this.loading_more = false;
        this.clusters = [];
        this.state = "input";
    }

    downloadAsCsv() {
        let request = {
            query: {
                terms: this.query.terms,
                search: this.query.search,
                return_type: 'csv',
            },
            paginate: 0,
            offset: 0,
        }
        fetchDownload(request, 'csv');
    }

    runDownload() {
        let request = {
            query: this.query,
            paginate: this.paginate,
            offset: this.offset,
        };
        this.state = "in-progress";
        let mime_type = this.query.return_type == 'csv' ? 'csv' : 'fasta';
        fetchDownload(request, mime_type)
        this.state = "downloaded";
    }

    termsChanged(ev) {
        this.query.terms = ev.detail.term;
        this.searchChanged();
        this.requestUpdate();
    }

    searchTypeChanged(newType) {
        this.query.search = newType;
        if (!this.compatibleReturnTypes[newType].has(this.query.return_type)) {
            this.query.return_type = [...this.compatibleReturnTypes[newType]][0];
        }
        this.searchChanged();
        this.requestUpdate();
    }

    returnTypeChanged(newType) {
        this.query.return_type = newType;
        this.searchChanged();
        this.requestUpdate();
    }

    searchChanged() {
        return; // TODO: Remove this once stringification is fixed
        if (history.pushState) {
            let search = `?terms=${encodeURIComponent(this.stringified_query)}&search_type=${this.query.search}&return_type=${this.query.return_type}&offset=${this.offset}&paginate=${this.paginate}`;
            let newURL = new URL(window.location.href);
            newURL.search = search;
            window.history.pushState({ path: newURL.href }, search, newURL.href);
        }
    }

    paginateChanged(ev) {
        this.paginate = ev.target.value;
    }

    offsetChanged(ev) {
        this.offset = ev.target.value;
    }

    toggleTextMode() {
        this.show_text_mode = !this.show_text_mode;
    }

    async textModeUpdated(ev) {
        let terms = ev.target.value;
        let convertUrl = new URL("/api/v1.0/convert", window.location);
        convertUrl.searchParams.set("search_string", terms);
        let response = await fetch(convertUrl);
        let query = await response.json();

        this.query = query;
        this.searchChanged();
        this.requestUpdate();
    }

    get _term() {
        return this.renderRoot?.querySelector("asdb-query-term") ?? null;
    }


    render() {
        return html`
        <div class="pattern-list ${this.state != 'input'?'hidden':''}">
            <div class="query-options">
                <div class="search-options">
                    <label class="form-control">Search:</label>
                    <div class="btn-group">
                        ${this.searchTypes.map(stype =>
                            html`<label @click="${() => this.searchTypeChanged(stype.id)}" class="btn btn-info${this.query && this.query.search == stype.id?" active":""}">${stype.desc}</label>`)}
                    </div>
                </div>
                <div class="return-options">
                    <label class="form-control">Return data in format:</label>
                    <div class="btn-group">
                        ${this.returnTypes.map(rtype => {
                            if (this.query && this.compatibleReturnTypes[this.query.search].has(rtype.id)) {
                                return html`<label @click="${() => this.returnTypeChanged(rtype.id)}" class="btn btn-info${this.query.return_type == rtype.id?" active":""}">${rtype.desc}</label>`;
                            }
                            return html``;
                        })}
                    </div>
                </div>

            </div>
            ${this.query?html`<asdb-query-term .terms="${this.query.terms}" @term-changed="${this.termsChanged}" .categories="${this.categories}"></asdb-query-term>`:html`Loading...`}
            <div class="${this.query && this.downloadReturnTypes.has(this.query.return_type) ? '': 'hidden'}">
                <div class="pagination-options">
                    <div class="paginate">
                        <label class="form-control" for="paginate-input">Limit results:</label>
                        <input id="paginate-input" type="number" .value="${this.paginate}" @change="${this.paginateChanged}"/>
                    </div>
                    <div class="offset">
                        <label class="form-control" for="offset-input">Offset:</label>
                        <input id="offset-input" type="number" .value="${this.offset}" @change="${this.offsetChanged}"/>
                    </div>
                </div>
            </div>
            <div>
                <span @click=${this.toggleTextMode}>
                    <svg class="icon ${this.show_text_mode ? '' : 'hidden'}"><use xlink:href="/images/icons.svg#chevron-down"></use></svg>
                    <svg class="icon ${this.show_text_mode ? 'hidden' : ''}"><use xlink:href="/images/icons.svg#chevron-right"></use></svg>
                    Text mode:
                </span>
                <div class="${this.show_text_mode ? '' : 'hidden'}">
                    <input class="text-mode-input" .value='${this.query?this.stringified_query:''}' @change="${this.textModeUpdated}">
                </div>
            </div>
            <div class="button-group">
                ${this.query && this.downloadReturnTypes.has(this.query.return_type) ?
                html`<button class="search btn-primary" @click=${this.runDownload}>Download</button>` :
                html`<button class="search btn-primary" @click=${this.runSearch}>Search</button>`}
                <button class="example" @click=${this.loadExample}>Load example</button>
            </div>
        </div>
        <div class="in-progress ${this.state != 'in-progress'?'hidden':''}">
            Running search, please wait...
        </div>
        <div class="results ${this.state != 'done'?'hidden':''}">
            <div class="button-group">
                <button class="download btn-primary" @click=${this.downloadAsCsv}><svg class="icon"><use xlink:href="/images/icons.svg#download"></use></svg> Download results</button>
                <button class="new-search" @click=${this.clearResults}>New search</button>
            </div>
            ${this.getResultSummary()}
            <asdb-results .clusters=${this.clusters}></asdb-results>
            <div class="more-results ${this.loadButtonHidden()}">
                <button class="btn-primary" @click=${this.loadMore}><svg class="icon"><use xlink:href="/images/icons.svg#plus"></use></svg> Load more results</button>
            </div>
            <div class="loading-more ${this.loading_more?'':'hidden'}">
                Loading more results, please wait...
            </div>
        </div>
        <div class="error ${this.state != 'downloaded'?'hidden':''}">
            <div class="button-group">
                <button class="new-search" @click=${this.clearResults}>New search</button>
            </div>
            Your download should begin shortly.
        </div>
        <div class="error ${this.state != 'error'?'hidden':''}">
            <div class="button-group">
                <button class="new-search" @click=${this.clearResults}>New search</button>
            </div>
            ${this.error}
        </div>
    `;
    }

    async firstUpdated() {
        const searchParams = new URL(window.location).searchParams;
        const terms = searchParams.get("terms");
        const search_type = searchParams.get("search_type");
        const return_type = searchParams.get("return_type");
        let offset = parseInt(searchParams.get("offset"));
        let paginate = parseInt(searchParams.get("paginate"));

        if (isNaN(offset)) {
            offset = this.offset;
        }
        if (isNaN(paginate)) {
            paginate = this.paginate;
        }

        let categoriesUrl = new URL("/api/v1.0/available_categories", window.location);
        let category_data = await fetch(categoriesUrl);
        this.categories.order = await category_data.json();
        for (let i in this.categories.order.options) {
            let option = this.categories.order.options[i];
            console.log("option", i, option);
            this.categories.mappings[option.value] = {type: option.type, filters: option.filters};
        }
        for (let i in this.categories.order.groups) {
            let group = this.categories.order.groups[i];
            for (let j in group.options) {
                let option = group.options[j];
                console.log("group", i, "option", j, option);
                this.categories.mappings[option.value] = {type: option.type, filters: option.filters};
            }
        }

        console.log(this.categories);

        if (terms) {
            let convertUrl = new URL("/api/v1.0/convert", window.location);
            convertUrl.searchParams.set("search_string", terms);
            if (search_type) {
                convertUrl.searchParams.set("search_type", search_type);
            }
            if (return_type) {
                convertUrl.searchParams.set("return_type", return_type);
            }

            let response = await fetch(convertUrl);
            let query = await response.json();

            this.query = query;

            this.paginate = paginate;
            this.offset = offset;
            //this.runSearch();

        } else {
            this.query = {
                terms: new AsdbQueryOperand(),
                search: 'cluster',
                return_type: 'json',
            };
            this.paginate = paginate;
            this.offset = offset;
        }
    }

    get stringified_query() {
        if (!this._term) {
            return "INVALID";
        }

        return this._term.stringify();
    }
}

function stringifyTerm(term) {
    if (!term) {
        return "INVALID";
    }

    if (term.term_type == "op") {
        let left_stringify = stringifyTerm(term.left);
        let right_stringify = stringifyTerm(term.right);
        if (!left_stringify) {
            return right_stringify;
        }

        if (!right_stringify) {
            return left_stringify;
        }

        return `( ${left_stringify} ${term.operation} ${right_stringify} )`;
    }

    let count_str = term.count > 1 ? `${term.count}x` : '';

    if (!term.category) {
        return "";
    }

    let stringified = `${count_str}[${term.category}]`;

    if (!term.term) {
        return stringified;
    }

    stringified += `{${term.term}}`;

    if (!term.filters) {
        return stringified;
    }

    term.filters.map(filter => {
        stringified += ` WITH [${filter.name}]{${filter.operator}${filter.operand}}`
    });

    return stringified;
}
