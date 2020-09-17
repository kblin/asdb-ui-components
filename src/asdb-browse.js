import { customElement, property, LitElement, html, css } from 'lit-element';
import jQuery from 'jquery';
import './asdb-results';
import 'jstree';
import 'jstree/dist/themes/default/style.min.css';
import 'jstree/dist/themes/default/32px.png';
import 'jstree/dist/themes/default/throbber.gif';
import { fetchDownload } from './downloader';

function start(element) {

}

@customElement('asdb-browse')
export class AsdbBrowse extends LitElement {
    @property({ type: Array })
    clusters = [];

    @property({ type: String })
    state = 'input';

    static get styles() {
        return css`
            .hidden {
                display: none;
            }
            .jstree-container {
                border: 1px solid #aaa;
                border-radius: 5px;
                padding-right: 2em;
            }
            `;
    }

    render() {
        return html`
            <link rel="stylesheet" href="./web_modules/jstree/dist/themes/default/style.min.css">
            <div>
              <h3>Browse by taxa</h3>
            <div>
            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                <div id="jstree-container" class="jstree-container">
                </div>
                <div class="${this.state != 'input' ? 'hidden' : ''}">
                    Select a genome to show.
                </div>
                <div class="${this.state != 'loading' ? 'hidden' : ''}">
                    Loading genome regions...
                </div>
                <div class="results ${this.state != 'done' ? 'hidden' : ''}">
                    <asdb-results .clusters=${this.clusters}></asdb-results>
                </div>
            </div>
        `;
    }

    firstUpdated(changedProperties) {
        const parent = this;
        $(this.shadowRoot.getElementById('jstree-container')).jstree({
            core: {
                themes: {
                    name: 'default'
                },
                'data' : {
                    'url' : "/api/v1.0/tree/taxa",
                    'data' : function (node) {
                        return { 'id' : node.id === "#" ? 1 : node.id};
                    }
                }
            },
            types: {
                default: {
                    icon: "./images/code-branch-solid.svg"
                },
                strain: {
                    icon: "./images/file-alt-regular.svg"
                }
            },
            plugins: ["wholerow", "types"]
        }).on("click", ".jstree-node", function(e, data) {
            $(this).jstree(true).toggle_node(e.target);
            const assembly = $(this).attr("data-assembly");
            if (!assembly) {
                return;
            }
            parent.state = "loading";
            $.ajax({
                method: 'get',
                url: `/api/v1.0/assembly/${assembly}`,
                dataType: 'json',
                contentType: 'application/json',
                processData: false,
                async: true,
                success: function (data, status, req) {
                    parent.clusters = data;
                    parent.state = "done"
                }
            });
        });
    }
}
