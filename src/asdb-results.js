import { customElement, property, LitElement, html, css } from 'lit-element';
import { secmet_styles } from './secmet-styles';

@customElement('asdb-results')
export class AsdbResults extends LitElement {
    @property({type: Array})
    clusters = [];

    static get styles() {
        return [css`
        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            max-width: 100%;
            margin-bottom: 20px;
        }
        table > thead > tr > th {
            padding: 8px;
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
        .badge {
            display: inline-block;
            min-width: 10px;
            padding: 3px 7px;
            font-weight: bold;
            vertical-align: middle;
            text-align: center;
            whitespace: nowrap;
            border-radius: 10px;
            background-color: #bbb;
        }
    `, secmet_styles];
    }

    showRegion(region) {
        window.open(`/output/${region.assembly_id}/index.html#r${region.record_number}c${region.region_number}`, '_blank');
    }

    generateClusterBlastHits(region) {
        if (region.cbh_acc) {
            let color = "rgba(205, 92, 92, 0.3)";

            if (region.similarity > 75) {
                color = "rgba(0, 100, 0, 0.3)";
            } else if(region.similarity > 50) {
                color = "rgba(210, 105, 30, 0.3)";
            }

            return html`
                <td>${region.cbh_description}</td>
                <td class="digits similarity-text" style="background-image: linear-gradient(to left, ${color}, ${color} ${region.similarity}%, #ffffff00 ${region.similarity}%)">${region.similarity}</td>
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
                <td><span class="badge ${region.term}">${region.region_number}</span></td>
                <td>${region.description}</td>
                <td class="digits">${region.start_pos}</td>
                <td class="digits">${region.end_pos}</td>
                <td>${region.edge?'Yes':'No'}</td>
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
                        <th>Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Edge</th>
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

