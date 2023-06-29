import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('asdb-query-options')
export class AsdbQueryOptions extends LitElement {
    @property({type: String, reflect: true})
    active = "simple";

    static get styles() {
        return css`
        a {
            text-decoration: none;
            color: #810e15;
        }
        ul {
            list-style: none;
            display: flex;
        }
        li {
            flex-grow: 1;
            display: flex;
            justify-content: center;
        }
        li a {
            flex-grow: 1;
            text-align: center;
            padding: 10px 15px;
            border-radius: 4px;
        }
        .active {
            background-color: #810e15;
            color: #fff;
        }
    `;
    }

    isActive(item) {
        if (item == this.active) {
            return "active";
        }
        return "";
    }

    render() {
        return html`
        <ul>
            <li><a class="${this.isActive('builder')}" href="/query.html">Build a query</a></li>
            <li><a class="${this.isActive('module')}" href="/query_module.html">NRPS/PKS module query</a></li>
        </ul>
    `;
    }
}
