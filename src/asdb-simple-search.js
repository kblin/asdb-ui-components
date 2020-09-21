import { customElement, property, LitElement, html, css } from 'lit-element';

import './asdb-results';
import { fetchDownload } from './downloader';

@customElement('asdb-simple-search')
export class AsdbSimpleSearch extends LitElement {
    @property({type: String, reflect: true})
    searchString = "";

    @property({type: Array})
    clusters = [];

    @property({type: String})
    state = "input";

    @property({type: Number})
    offset = 0;

    @property({type: Number})
    paginate = 50;

    @property({type: Number})
    total = 0;

    @property({type: Boolean})
    loading_more = false;

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
            justify-content: flex-end;
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
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:hover {
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
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
        .example {
            margin-left: 25%;
        }
        .icon {
            width: 1em;
            height: 1em;
        }
    `;
    }

    onInput() {
        this.searchString = this.shadowRoot.getElementById("search-field").value;
    }

    searchOnEnter(ev) {
        if (ev && ev.keyCode == 13) {
            this.runSearch();
        }
    }

    loadExample() {
        this.searchString = "lanthipeptide Streptomyces";
    }

    runSearch() {
        let query = {
            search_string: this.searchString,
        };
        this.state = "in-progress";
        if (history.pushState) {
            let search = `?q=${this.searchString}`;
            let newURL = new URL(window.location.href);
            newURL.search = search;
            window.history.pushState({ path: newURL.href }, search, newURL.href);
        }
        fetch("/api/v1.0/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(query),
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
            search_string: this.searchString,
            offset: this.offset + this.paginate,
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
        let query = {
            search_string: this.searchString,
            return_type: 'csv',
        };
        fetchDownload(query, 'csv');
    }

    render() {
        return html`
        <div class="${this.state != 'input'?'hidden':''}">
            <div class="form">
                <label for="search-field">Enter your search term:</label>
                <input id="search-field" type="text" placeholder="e.g. lanthipeptide Streptomyces" @input=${this.onInput} @keydown=${this.searchOnEnter} .value=${this.searchString}>
                <div class="button-group">
                    <button class="search btn-primary" @click=${this.runSearch}>Search</button><button class="example" @click=${this.loadExample}>Load example</button>
                </div>
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

    firstUpdated() {
        const query = new URL(window.location).searchParams.get("q");
        if (query) {
            this.searchString = query;
            this.runSearch();
        }
    }
}

