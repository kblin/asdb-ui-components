import { customElement, property, LitElement, html, css } from 'lit-element';

import './asdb-results';

@customElement('asdb-area')
export class AsdbArea extends LitElement {
    @property({type: String, reflect: true})
    record = "";

    @property({type: Array})
    clusters = [];

    @property({type: Number, reflect: true})
    start = 0;

    @property({type: Number, reflect: true})
    end = 50;

    @property({type: String})
    state = "invalid";

    @property({type: String})
    error = "";

    static get styles() {
        return css`
        .hidden {
            display: none;
        }
        .icon {
            width: 1em;
            height: 1em;
        }
    `;
    }

    runSearch() {
        this.state = "in-progress";
        fetch(`/api/v1.0/area/${this.record}/${this.start}-${this.end}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`Network request returned ${response.status}:${response.statusText}`);
            }
            return response.json();
        }).then((data) => {
            this.state = "done";
            this.clusters = data.clusters;

            if (this.clusters.length == 1) {
                // Only one result, let's redirect to the result page instead.
                const cluster = this.clusters[0];
                const url = `/output/${cluster.assembly_id}/index.html#r${cluster.record_number}c${cluster.region_number}`;
                window.location = url;
            }

        }).catch(error => {
            this.state = "invalid";
            this.error = error;
            console.error(error);

        });
    }

    render() {
        return html`
        <div class="invalid ${this.state != 'invalid'?'hidden':''}">
            Invalid request: ${this.error}.
        </div>
        <div class="in-progress ${this.state != 'in-progress'?'hidden':''}">
            Fetching clusters, please wait...
        </div>
        <div class="results ${this.state != 'done'?'hidden':''}">
            <asdb-results .clusters=${this.clusters}></asdb-results>
        </div>
    `;
    }

    firstUpdated() {
        const params = new URL(window.location).searchParams;
        this.record = params.get("record");
        if (!this.record) {
            this.record = params.get("acc");
        }
        this.start = params.get("start");
        this.end = params.get("end");
        this.runSearch();
    }
}

