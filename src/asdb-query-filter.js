import { customElement, LitElement, html, css } from 'lit-element';

@customElement('asdb-query-filter')
export class AsdbQueryFilter extends LitElement {
    static get properties() {
        return {
            idx: {type: Number},
            preload: {type: Object},
            typeMap: {type: Object},
            name: {attribute: false},
            operator: {attribute: false},
            value: {attribute: false},
            type: {state: true},
        };
    }

    constructor() {
        super();
        this.name = "";
        this.type = null;
        this.operator = ">=";
        this.value = null;
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.preload) {
            this.name = preload.name;
            this.type = this.typeMap[this.name];
            if (preload.operator) {
                this.operator = preload.operator;
            }
            this.value = preload.value;
        }
    }

    static get styles() {
        return css`
        .expression {
            width: 40%;
        }
        div.expression {
            display: inline-block;
            padding-left: 4px;
            padding-right: 4px;
        }
        button, .btn {
            display: inline-block;
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
            background-color: #bebebe;
            background-position: 0 -15px;
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        button:active, .btn.active {
            background-color: #bebebe;
            background-position: 0 -15px;
            border-color: #b9b9b9;
            background-image: none;
        }
        button::-moz-focus-inner {
            padding: 0;
            border: 0;
        }
        .filter-item {
            display: inline-block;
            padding: 6px 12px;
        }
        select {
            display: inline-block;
            width: auto;
            border: 1px solid #aaa;
            padding: 6px 20px 6px 12px;
            font-size: 14px;
            border-radius: 4px;
            -moz-appearance: none;
            -webkit-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23810e15%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'), linear-gradient(to bottom, #ddd 0, #bebebe 100%);
            background-repeat: no-repeat, repeat-x;
            background-position: right .5em top 50%, 0 0;
            background-size: .65em auto, 100%;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        select:hover {
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        .icon {
            width: 1em;
            height: 1em;
        }
        `;
    }

    render() {
        return html`
        <li>
            <div class="filter-item">WITH</div>
            <select .value="${this.name}" @change="${this.nameChanged}">
                <option label="Select filter" value=""></option>
                ${Object.entries(this.typeMap).map(([name, _]) => html`<option .label="${name}" .value="${name}">${name}</option>`)}
            </select>
            ${this.renderFilterValue()}
            <button class="remove" @click="${this.remove}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove filter</button>
        </li>
    `;
    }

    renderFilterValue() {
        switch(this.type) {
            case "numeric":
                return html`
                <select .value="${filter.operator}" @change="${this.operatorChanged}">
                    <option label="pick one" value=""></option>
                    <option label="greater than" value=">"></option>
                    <option label="greater than or equal to" value=">="></option>
                    <option label="equal to" value="="></option>
                    <option label="less than or equal to" value="<="></option>
                    <option label="less than" value="<">
                </select>
                ${this.renderNumericOperand()}
                `;
            case "text":
                return html`<input type="text" class="expression" .value="${this.value}" @change="${this.valueChanged}">`;
            default:
                return '';
        }
    }

    renderNumericOperand() {
        let labels = this.typeMap[this.name]?.labels;
        if (!labels) {
            return html`<input type="number" class="expression" .value="${this.value}" @change="${this.valueChanged}">`;
        }
        console.log(labels);
        return html`
            <select class="expression" .value="${this.value}" @change="${this.valueChanged}">
                <option label="pick one" value=""></option>
                ${Object.entries(labels).map(([name, val]) => html`<option .label="${name}" .value="${val}">${name}</option>`)}
            </select>
        `;
    }

    nameChanged(ev) {
        this.name = ev.target.value;
        this.type = this.typeMap[this.name];
        switch (this.type) {
            case "numeric":
                this.value = 0;
                break;
            case "text":
                this.value = "";
                break
            default:
                this.value = null;

        }
    }

    operatorChanged(ev) {
        this.operator = ev.target.operator;
        this.filterChanged();
    }

    valueChanged(ev) {
        this.value = ev.target.value;
        this.filterChanged();
    }

    filterChanged() {
        let filter = {
            name: this.name,
            value: this.value,
        };

        if (this.type === "numeric") {
            filter.operator = this.operator;
        }

        let event = new CustomEvent('filters-changed',{
            detail: {
                idx: this.idx,
                filter: filter,
            },
        });
        this.dispatchEvent(event);
    }

    remove(){
        let event = new CustomEvent("filter-removed", {
            detail: { idx: this.idx },
        });
        this.dispatchEvent(event);
    }
};
