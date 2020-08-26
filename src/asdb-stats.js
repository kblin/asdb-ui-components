import { customElement, property, LitElement, html, css } from 'lit-element';
import { secmet_styles } from './secmet-styles';

@customElement('asdb-stats')
export class AsdbStats extends LitElement {
    @property({type: Number})
    num_clusters = 0;

    @property({type: Number})
    num_genomes = 0;

    @property({type: Number})
    num_sequences = 0;

    @property({type: String})
    top_secmet_assembly_id = "loading...";

    @property({type: String})
    top_secmet_species = "loading...";

    @property({type: Number})
    top_secmet_taxon = 0;

    @property({type: Number})
    top_secmet_taxon_count = 0;

    @property({type: String})
    top_seq_species = "loading...";

    @property({type: Number})
    top_seq_taxon = 0;

    @property({type: Number})
    top_seq_taxon_count = 0;


    @property({type: Array})
    clusterStats = [];

    static get styles() {
        return [css`
        h3 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 24px;
            font-weight: 500;
            line-height: 1.1;
        }
        h3 small {
            font-size: 65%;
            font-weight: normal;
            line-height: 1;
            color: #bbb;
        }
        .icon {
            width: 1em;
            height: 1em;
            gl}
        .badge {
            display: inline-block;
            float: right;
            min-width: 10px;
            padding: 3px 7px;
            font-weight: bold;
            font-size: 12px;
            vertical-align: middle;
            text-align: center;
            whitespace: nowrap;
            border-radius: 10px;
            background-color: #bbb;
        }
        .list-group {
            width: 100%;
            list-style: none;
            padding-left: 0;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.075);
            margin-bottom: 20px;
        }
        .list-group-item {
            float: left;
            display: inline;
            padding: 10px 15px;
            background-color: #fff;
            border: 1px solid #ddd;
            width: 47%;
            margin: 0;
        }
        .list-group-item-top {
            float: left;
            display: inline;
            padding: 10px 15px;
            background-color: #eee;
            border: 1px solid #ddd;
            width: 97%;
        }
        .list-group-item a {
            text-decoration: none;
            color: #810e15;
        }
        .list-group-item a:hover {
            text-decoration: underline;
        }
        .list-group-item a:visited {
            color: #810e15;
        }
        .stats-def {
            font-weight: bold;
        }
        .stats-data {
            float: right;
            font-weight: bold;
            color: #31708f;
        }
        .row:after {
            display: table;
            content: "";
            clear: both;
        }
    `, secmet_styles];
    }

    clusterStatEntry(stat) {
        return html`<li class="list-group-item"><a href="/query.html?q=[type]${stat.name}">${stat.description}</a><span class="badge ${stat.name}">${stat.count}</span></li>`;
    }

    render() {
        return html`
        <div class="row general-stats">
            <h3>General statistics <small>database contains</small></h3>
            <ul class="list-group">
                <li class="list-group-item-top"><span class="stats-def">Total Secondary Metabolites Clusters:</span> <span class="stats-data">${this.num_clusters}</span></li>
                <li class="list-group-item">
                    <span class="stats-def">Most clusters:</span>
                    <span class="stats-data"><a href="/go/${this.top_secmet_assembly_id}">${this.top_secmet_species}</a></span>
                </li>
                <li class="list-group-item"><span class="stats-def">Clusters in top taxon:</span> <span class="stats-data">${this.top_secmet_taxon_count}</span></li>
                <li class="list-group-item"><span class="stats-def">Unique species/strains:</span> <span class="stats-data">${this.num_genomes}</span></li>
                <li class="list-group-item"><span class="stats-def">Unique sequences:</span> <span class="stats-data">${this.num_sequences}</span></li>
                <li class="list-group-item"><span class="stats-def">Species with most sequences:</span> <span class="stats-data">${this.top_seq_species}</span></li>
                <li class="list-group-item"><span class="stats-def">Sequences in top taxon:</span> <span class="stats-data">${this.top_seq_taxon_count}</span></li>
            </ul>
        </div>
        <div class="row stats-cluster-count">
            <h3>Secondary metabolite cluster counts <small>by type</small></h3>
            <ul class="list-group">
            ${this.clusterStats.map(stat => this.clusterStatEntry(stat))}
            </ul>
        </div>
    `;
    }

    firstUpdated(changedProperties) {
        fetch("/api/v2.0/stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            return response.json();
        }).then((data) => {
            this.clusterStats = data.clusters;
            this.num_clusters = data.num_clusters;
            this.top_secmet_species = data.top_secmet_species;
            this.top_secmet_taxon_count = data.top_secmet_taxon_count;
            this.top_secmet_assembly_id = data.top_secmet_assembly_id;
            this.num_genomes = data.num_genomes;
            this.num_sequences = data.num_sequences;
            this.top_seq_species = data.top_seq_species;
            this.top_seq_taxon_count = data.top_seq_taxon_count;
        });
    }
}

