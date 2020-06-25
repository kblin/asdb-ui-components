import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('asdb-results')
export class AsdbResults extends LitElement {
    @property({type: Array})
    clusters = [];

    static get styles() {
        return css`
        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            max-width: 100%;
            margin-bottom: 20px;
        }
        table > thead > tr > th {
            vertical-align: bottom;
            border-bottom: 2px solid #ddd;
            text-align: left;
        }
        tbody > tr:nth-of-type(2n+1) {
            background-color: #f9f9f9;
        }
        tbody > tr > td {
            padding: 8px;
            vertical-align: top;
            border-top: 1px solid #ddd;
        }
        .cluster-list {
            cursor: pointer;
        }
        a {
            color: #810e15;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .link-external::after {
            display: inline-block;
            content: ' ';
            background: url("/images/link.svg") no-repeat;
            width: 1em;
            height: 1em;
            margin-left: 5px;
        }
        .digits {
            text-align: right;
        }
    `;
    }

    showRegion(region) {
        window.open(`/output/${region.assembly_id}/index.html#r${region.record_number}c${region.region_number}`, '_blank');
    }

    generateClusterBlastHits(region) {
        if (region.cbh_acc) {
            return html`
                <td>${region.cbh_description}</td>
                <td>${region.similarity}</td>
                <td><a class="link-external" href="https://mibig.secondarymetabolites.org/go/${region.cbh_acc}">${region.cbh_acc}</a></td>
                `;
        }
        return html`
            <td></td>
            <td></td>
            <td></td>
            `;
    }

    generateRow(region) {
        return html`
            <tr class="cluster-list" @click=${() => this.showRegion(region)}>
                <td><a class="link-external" href="https://www.ncbi.nlm.nih.gov/genome/?term=${region.acc}">${region.genus} ${region.species} ${region.strain}</a></td>
                <td>${region.region_number}</td>
                <td>${region.edge?'Yes':'No'}</td>
                <td>${region.description}</td>
                <td class="digits">${region.start_pos}</td>
                <td class="digits">${region.end_pos}</td>
                ${this.generateClusterBlastHits(region)}
            </tr>
        `;
    }

    render() {
        if (this.clusters.length) {
            return html`
            <table>
                <thead>
                    <tr>
                        <th>Species</th>
                        <th>Region</th>
                        <th>Edge</th>
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Most similar MIBiG cluser</th>
                        <th>Similarity</th>
                        <th>MIBiG BGC-ID</th>
                    </tr>
                </thead>
                <tbody>
                ${this.clusters.map(cluster => this.generateRow(cluster))}
                </tbody>
            </table>
        `;
        }
        return html`Your search gave no results. Please change your search terms and try again.`;
    }
}

