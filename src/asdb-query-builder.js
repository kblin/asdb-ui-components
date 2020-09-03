import { customElement, property, LitElement, html, css, internalProperty } from 'lit-element';

import './asdb-query-term';
import './asdb-results';
import { fetchDownload } from './downloader';

@customElement('asdb-query-builder')
export class AsdbQueryBuilder extends LitElement {
    @property({type: Object, reflect: true, hasChanged: (newVal, oldVal) => {return JSON.stringify(newVal) !== JSON.stringify(oldVal)}})
    query = null;

    @property({type: Array})
    clusters = [];

    @internalProperty({type: String})
    state = "input";

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
    `;
    }

    loadExample() {
        this.query.terms = {
            term_type: "op",
            operation: "AND",
            left: {
                term_type: "expr",
                category: "type",
                term: "nrps",
            },
            right: {
                term_type: "expr",
                category: "genus",
                term: "streptomyces",
            },
        };
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
        fetch("/api/v1.0/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }).then((response) => {
            return response.json();
        }).then((data) => {
            this.state = "done";
            this.clusters = data.clusters;
            this.offset = data.offset;
            this.paginate = data.paginate;
            this.total = data.total;
        });
    }

    loadMore() {
        let query = {
            query: this.query,
            offset: this.offset,
            paginate: this.paginate,
        };
        this.loading_more = true;
        fetch("/api/v1.0/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
        this.paginate = 0;
        this.total = 0;
        this.loading_more = false;
        this.state = "input";
    }

    download() {
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
        if (history.pushState) {
            let search = `?terms=${encodeURIComponent(stringifyTerm(this.query.terms))}&search_type=${this.query.search}&return_type=${this.query.return_type}`;
            let newURL = new URL(window.location.href);
            newURL.search = search;
            window.history.pushState({ path: newURL.href }, search, newURL.href);
        }
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
            ${this.query?html`<asdb-query-term .terms="${this.query.terms}" @term-changed="${this.termsChanged}"></asdb-query-term>`:html`Loading...`}
            <div class="button-group">
                <button class="search btn-primary" @click=${this.runSearch}>Search</button><button class="example" @click=${this.loadExample}>Load example</button>
            </div>
        </div>
        <div class="in-progress ${this.state != 'in-progress'?'hidden':''}">
            Running search, please wait...
        </div>
        <div class="results ${this.state != 'done'?'hidden':''}">
            <div class="button-group">
                <button class="download btn-primary" @click=${this.download}><svg class="icon"><use xlink:href="/images/icons.svg#download"></use></svg> Download results</button>
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
    `;
    }

    async firstUpdated() {
        const searchParams = new URL(window.location).searchParams;
        const terms = searchParams.get("terms");
        const search_type = searchParams.get("search_type");
        const return_type = searchParams.get("return_type");

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

            // TODO: Also encode this in the URL?
            this.paginate = 50;
            this.offset = 0;
            this.runSearch();

        } else {
            this.query = {
                terms: {
                    term_type: "expr",
                    category: "",
                    term: "",
                },
                search: 'cluster',
                return_type: 'json',
            };
            this.paginate = 50;
            this.offset = 0;
        }
    }
}

function stringifyTerm(term) {
    if (!term) {
        return "INVALID";
    }
    if (term.term_type == "expr") {
        return `[${term.category}]${term.term}`;
    }
    return `( ${stringifyTerm(term.left)} ${term.operation} ${stringifyTerm(term.right)} )`;
}
