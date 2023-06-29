import { customElement, LitElement, html, css, internalProperty } from 'lit-element';

import autocomplete from 'autocompleter';
import 'autocompleter/autocomplete.css';

import './asdb-query-filter';


export class AsdbQueryFilter {
    constructor(name = "", value = "", operator = "") {
        this.name = name;
        this.operand = value;
        this.operator = operator;
    }

    stringify() {
        return `WITH [${this.name}](${this.operator} ${this.operand})`;
    }
}


export class AsdbQueryBase {
    constructor(termType) {
        this.termType = termType;
        this.isRealClass = true;
    }

    stringify() {
        1();
    }
}

export class AsdbQueryOperator extends AsdbQueryBase {
    constructor(kind, left, right) {
        super("op");
        this.kind = kind;
        this.left = left;
        this.right = right;
    }

    swap() {
        let tmp = this.left;
        this.left = this.right;
        this.right = tmp;
    }

    stringify() {
        return `( ${this.left.stringify()} ${this.kind} ${this.right.stringify()} )`;
    }
}

export class AsdbQueryOperand extends AsdbQueryBase {
    constructor(category = "", count = 1, value = "", filters = []) {
        super("expr");
        this.category = category;
        this.value = value;
        this.filters = filters;
        this.count = count;
    }

    stringify() {
        return `${this.count > 1 ? this.count : ""}[${this.category}]{${this.value} ${this.filters.map(filter => filter.stringify()).join(" ")}}`;
    }
}


@customElement('asdb-query-term')
export class AsdbQueryTermView extends LitElement {
    static get properties() {
        return {
            terms: {
                type: Object,
                reflect: true,
                hasChanged: (newVal, oldVal) => {
                    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
                },
            },
            categories: {
                type: Object,
                reflect: true,
                hasChanged: (newVal, oldVal) => {
                    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
                },
            }
        };
    }

    @internalProperty({type: Boolean})
    apply_filters = false;

    constructor() {
        super();
        this.terms = new AsdbQueryOperand();
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
        .button-group {
            display: flex;
            justify-content: flex-end;
        }
        .button-group > .btn {
            border-radius: 4px;
        }
        .button-group > .btn:first-child:not(:last-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
        .button-group > .btn:last-child:not(:first-child) {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
        .button-group > .btn:not(:first-child):not(:last-child) {
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
        ul {
            list-style: none;
            border: 1px solid #aaa;
            border-radius: 5px;
            padding: 1em 0.25em;
        }
        li {
            display: flex;
            border: 1px solid #ddd;
            padding: 10px 15px;
        }
        li:first-child {
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
        }
        li:last-child {
            margin-bottom: 0;
            radius: 4px;
        }
        .term {
            justify-content: space-between;
        }
        .operation {
            justify-content: space-around;
            background-color: #eee;
            border-radius: 2px;
        }
        asdb-query-term {
            width: 80%;
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

    swap() {
        this.terms.swap();
        this.termChanged();
        this.requestUpdate();
    }

    formCategoryChanged(ev) {
        this.terms.category = ev.target.value;
        this.termChanged();
        this.requestUpdate();
    }

    formTermChanged(ev) {
        this.terms.value = ev.target.value;
        this.termChanged();
        this.requestUpdate();
    }

    addTerm() {
        this.terms = new AsdbQueryOperator("AND", this.terms, new AsdbQueryOperand());
        this.termChanged();
        this.requestUpdate();
    }

    toggleFilters() {
        this.apply_filters = !this.apply_filters;
    }

    addFilter() {
        this.terms.filters = [...this.terms.filters, new AsdbQueryFilter()];
        this.termChanged();
        this.requestUpdate();
    }

    filterChanged(idx, value) {
        console.log("filter changed", value);
        this.terms.filters = this.terms.filters.map((filter, i) => {
            if (i == idx) {
                filter.name = value;
            }
            return filter;
        });
        this.termChanged();
        this.requestUpdate();
    }

    removeFilter(idx) {
        this.terms.filters = this.terms.filters.filter((_, i) => i !== idx);
        this.termChanged();
        this.requestUpdate();
    }

    operatorChanged(idx, value) {
        console.log("op changed", value);
        this.terms.filters = this.terms.filters.map((filter, i) => {
            if (i == idx) {
                filter.operator = value;
            }
            return filter;
        });
        this.termChanged();
        this.requestUpdate();
    }


    operandChanged(idx, value) {
        console.log("value changed", value);
        this.terms.filters = this.terms.filters.map((filter, i) => {
            if (i == idx) {
                filter.operand = value;
            }
            return filter;
        });
        this.termChanged();
        this.requestUpdate();
    }

    removeLeft() {
        this.terms = this.terms.right;
        this.termChanged();
        this.requestUpdate();
    }

    removeRight() {
        this.terms = this.terms.left;
        this.termChanged();
        this.requestUpdate();
    }

    changeOperation(newOp) {
        this.terms.operation = newOp;
        this.termChanged();
        this.requestUpdate();
    }

    termChanged() {
        let event = new CustomEvent('term-changed',{
            detail: {
                term: this.terms,
            },
        });
        this.dispatchEvent(event);
    }

    changedTermLeft(ev) {
        this.terms.left = ev.detail.term;
        this.termChanged();
        this.requestUpdate();
    }

    changedTermRight(ev) {
        this.terms.right = ev.detail.term;
        this.termChanged();
        this.requestUpdate();
    }

    renderType() {
        return html`
        <select .value="${this.terms.category}" @change=${this.formCategoryChanged}>
            <option label="--- Select a category ---" value="">--- Select a category</option>
            ${this.renderPlainOptions(this.categories.order)}
            ${this.renderOptionGroups()}
        </select>`;

    }

    renderOption(option) {
        return html`<option .label="${option.label}" .value="${option.value}" ?selected=${option.value == this.terms.category}>${option.label}</option>`;
    }

    renderPlainOptions(group) {
        if (!group) {
            return html``;
        }
        return html`${group.options.map((option) =>
            this.renderOption(option)
        )}`;
    }

    renderOptionGroups() {
        if (!this.categories) {
            return html``;
        }
        return html`${this.categories.order.groups.map((group) =>
            html`<optgroup label="${group.header}">${this.renderPlainOptions(group)}</optgroup>`
        )}`
    }

    renderTerm() {
        let termType = this.categories.mappings[this.terms.category];
        switch(termType?.type) {
            case "bool":
                return html`<div class="expression">is true</div>`;
            case "text":
                return html`<input type="text" class="expression" placeholder="Please enter value" .value="${this.terms.value}" @change=${this.formTermChanged}>`;
            case "numeric":
                return html`<input type="number" class="expression" .value="${this.terms.value}" @change=${this.formTermChanged}>`;
            default:
                return html`<input type="text" class="expression" placeholder="Select a category first" disabled>`;
        }
    }

    filtersForCategory() {
        let termType = this.categories.mappings[this.terms.category];
        if (!termType || !termType.filters) {
            return [];
        }
        return termType.filters;
    }

    renderFilterButton() {
        if (this.filtersForCategory().length == 0) {
            return '';
        }
        return html`
            <label @click="${() => this.toggleFilters()}" class="btn ${this.apply_filters ?"active":""}"><svg class="icon"><use xlink:href="/images/icons.svg#filter"></use></svg>Filters</label>
        `;
    }

    renderFilters() {
        if (!this.apply_filters) {
            return '';
        }

        let available = this.filtersForCategory();
        let type_map = {};
        available.map((opt) => type_map[opt.name] = {type: opt.type, labels: opt.labels});

        return html`
            <ul>
                ${this.terms.filters.map((filter, idx) => html`
                    ${this.renderFilter(idx)}
                `)}
                <li @click="${this.addFilter}">Add filter</li>
            </ul>
        `;
    }

    renderFilter(idx) {
        let available = this.filtersForCategory();
        console.log("render filter before map", available);
        let type_map = {};
        available.map((opt) => type_map[opt.value] = {type: opt.type, labels: opt.choices});
        return html`
            <li>
                <div class="filter-item">WITH</div>
                <select .value="${this.terms.filters[idx].value}" @change="${(ev) => this.filterChanged(idx, ev.target.value)}">
                    <option label="Select filter" value=""></option>
                    ${available.map((opt) => html`<option .label="${opt.label}" .value="${opt.value}">${opt.label}</option>`)}
                </select>
                ${this.renderFilterValue(idx, type_map)}
                <button class="remove" @click="${() => this.removeFilter(idx)}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove filter</button>
            </li>
        `;

    }

    renderFilterValue(idx, type_map) {
        let filter = this.terms.filters[idx];
        console.log("rendering", filter, idx, type_map);
        switch(type_map[filter.name]?.type) {
            case "numeric":
                return html`
                <select .value="${filter.operator}" @change="${(ev) => this.operatorChanged(idx, ev.target.value)}">
                    <option label="pick one" value=""></option>
                    <option label="greater than" value=">"></option>
                    <option label="greater than or equal to" value=">="></option>
                    <option label="equal to" value="="></option>
                    <option label="less than or equal to" value="<="></option>
                    <option label="less than" value="<">
                </select>
                ${this.renderNumericOperand(idx, type_map)}
                `;
            case "text":
                return html`<input type="text" class="expression" .value="${filter.operand}" @change="${(ev) => this.operandChanged(idx, ev.target.value)}">`;
            default:
                return '';
        }
    }

    renderNumericOperand(idx, type_map) {
        let filter = this.terms.filters[idx];
        console.log("render numeric operand", filter, idx, type_map);
        let labels = type_map[filter.name]?.labels;
        if (!labels) {
            return html`<input type="number" class="expression" .value="${filter.operand}" @change="${(ev) => this.operandChanged(idx, ev.target.value)}">`;
        }
        console.log("labels", labels);
        return html`
            <select class="expression" .value="${filter.operand}" @change="${(ev) => this.operandChanged(idx, ev.target.value)}">
                <option label="pick one" value=""></option>
                ${Object.entries(labels).map((it) => html`<option .label="${it[0]}" .value="${it[1]}">${it[0]}</option>`)}
            </select>
        `;
    }

    renderExpression() {
        return html`
            <div>
                ${this.renderType()} ${this.renderTerm()}
                 <button @click=${this.addTerm}><svg class="icon"><use xlink:href="/images/icons.svg#plus"></use></svg> Add term</button>
                ${this.renderFilterButton()} ${this.renderFilters()}
            </div>
            `;
    }

    renderOp() {
        return html`
        <ul class="operation-group">
            <li class="term"><asdb-query-term .terms="${this.terms.left}" @term-changed="${this.changedTermLeft}" .categories="${this.categories}"></asdb-query-term> ${this.terms.left.termType == "expr"?html`<button class="remove" @click="${this.removeLeft}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove term</button>`:html``}</li>
            <li class="operation">
                <div class="button-group">
                    <label @click="${() => this.changeOperation("AND")}" class="btn ${this.terms.kind.toLowerCase() == "and"?"active":""}">AND</label>
                    <label @click="${() => this.changeOperation("OR")}" class="btn ${this.terms.kind.toLowerCase() == "or"?"active":""}">OR</label>
                    <label @click="${() => this.changeOperation("EXCEPT")}" class="btn ${this.terms.kind.toLowerCase() == "except"?"active":""}">EXCEPT</label>
                </div>
                <button @click="${this.swap}"><svg class="icon"><use xlink:href="/images/icons.svg#exchange"></use></svg> Swap terms</button>
            </li>
            <li class="term"><asdb-query-term .terms="${this.terms.right}" @term-changed="${this.changedTermRight}" .categories="${this.categories}"></asdb-query-term>${this.terms.right.termType == "expr"?html`<button class="remove" @click="${this.removeRight}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove term</button>`:html``}</li>
        </ul>
        `;
    }

    render() {
        console.log("render", this.terms);
        return html`
            <div>
                ${this.terms?
                    this.terms.termType == "expr"?
                    this.renderExpression():
                    this.renderOp()
                  :html`Loading...`}
            </div>
            `;
    }

    stringify() {
        console.log("stringinginging", this.terms);
        return this.terms.stringify();
    }

    firstUpdated() {
        const inputs = this.shadowRoot.querySelectorAll(".expression");
        inputs.forEach(input => {
            autocomplete({
                input: input,
                fetch: (text, update) => {
                    console.log(text);
                    text = text.toLowerCase();
                    fetch(`/api/v1.0/available/${this.terms.category}/${text}`).then(response => {
                        return response.json();
                    }).then(data => {
                        let options = data.map(x => { return {value: x.val, label: x.desc?`${x.desc} (${x.val})`:x.val}; });
                        update(options);
                    });
                },
                onSelect: item => {
                    input.value = item.value;
                }
            });
        });
    }
}
