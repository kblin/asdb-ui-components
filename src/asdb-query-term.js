import { customElement, LitElement, html, css } from 'lit-element';

import autocomplete from 'autocompleter';
import 'autocompleter/autocomplete.css';

@customElement('asdb-query-term')
export class AsdbQueryTerm extends LitElement {
    static get properties() {
        return {
            terms: {
                type: Object,
                reflect: true,
                hasChanged: (newVal, oldVal) => {
                    return JSON.stringify(newVal) !== JSON.stringify(oldVal);
                },
            },
        };
    }

    constructor() {
        super();
        this.terms = {
            term_type: "expr",
            category: "",
            term: "",
        };
    }

    static get styles() {
        return css`
        .expression {
            width: 40%;
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
            border-bottom-right-radius: 4px;
            border-bottom-left-radius: 4px;
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
        select {
            display: inline-block;
            width: auto;
            border: 1px solid #aaa;
            padding: 6px 12px;
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
            background-color: #bebebe;
            background-position: right .5em top 50%, 0 -15px;
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        .icon {
            width: 1em;
            height: 1em;
        }
        `;
    }

    swap() {
        let tmp = this.terms.left;
        this.terms.left = this.terms.right;
        this.terms.right = tmp;
        this.termChanged();
        this.requestUpdate();
    }

    formCategoryChanged(ev) {
        this.terms.category = ev.target.value;
        this.termChanged();
        this.requestUpdate();
    }

    formTermChanged(ev) {
        this.terms.term = ev.target.value;
        this.termChanged();
        this.requestUpdate();
    }

    addTerm() {
        this.terms = {
            term_type: "op",
            operation: "AND",
            left: this.terms,
            right: {
                term_type: "expr",
                category: "",
                term: "",
            },
        };
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
            <option label="--- Select a category ---" value="" selected="selected">--- Select a category</option>
            <option label="NCBI RefSeq Accession" value="acc">NCBI RefSeq Accession</option>
            <option label="NCBI assembly ID" value="assembly">NCBI assembly ID</option>
            <optgroup label="antiSMASH predictions">
                <option label="BGC type" value="type">BGC type</option>
                <option label="Monomer" value="monomer">Monomer</option>
                <option label="Biosynthetic profile" value="profile">Biosynthetic profile</option>
                <option label="NRPS/PKS domain" value="asdomain">NRPS/PKS domain</option>
                <option label="smCoG hit" value="smcog">smCoG hit</option>
            </optgroup>
            <optgroup label="Compound properties">
                <option label="Compound sequence" value="compoundseq">Compound sequence</option>
                <option label="RiPP Compound class" value="compoundclass">RiPP Compound class</option>
            </optgroup>
            <optgroup label="Quality filters">
                <option label="Cluster on contig edge" value="contigedge">Cluster on contig edge</option>
                <option label="Cluster with minimal predictions" value="minimal">Cluster with minimal predictions</option>
            </optgroup>
            <optgroup label="Taxonomy">
                <option label="Strain" value="strain">Strain</option>
                <option label="Species" value="species">Species</option>
                <option label="Genus" value="genus">Genus</option>
                <option label="Family" value="family">Family</option>
                <option label="Order" value="order">Order</option>
                <option label="Class" value="class">Class</option>
                <option label="Phylum" value="phylum">Phylum</option>
                <option label="Superkingdom" value="superkingdom">Superkingdom</option>
            </optgroup>
            <optgroup label="Similar clusters">
                <option label="ClusterBlast hit" value="clusterblast">ClusterBlast hit</option>
                <option label="KnownClusterBlast hit" value="knowncluster">KnownClusterBlast hit</option>
                <option label="SubClusterBlast hit" value="subcluster">SubClusterBlast hit</option>
            </optgroup>
        </select>`;
    }

    renderTerm() {
        return html`<input type="text" class="expression" placeholder="${this.terms.category == ""?"Select placeholder":""}" ?disabled="${this.terms.category == ""}" .value="${this.terms.term}" @change=${this.formTermChanged}>`;
    }

    renderExpression() {
        return html`
            <div>
                ${this.renderType()} ${this.renderTerm()}
                 <button @click=${this.addTerm}><svg class="icon"><use xlink:href="/images/icons.svg#plus"></use></svg> Add term</button>
            </div>
            `
    }

    renderOp() {
        return html`
        <ul class="operation-group">
            <li class="term"><asdb-query-term .terms="${this.terms.left}" @term-changed="${this.changedTermLeft}"></asdb-query-term> ${this.terms.left.term_type == "expr"?html`<button class="remove" @click="${this.removeLeft}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove term</button>`:html``}</li>
            <li class="operation">
                <div class="button-group">
                    <label @click="${() => this.changeOperation("AND")}" class="btn ${this.terms.operation == "AND"?"active":""}">AND</label>
                    <label @click="${() => this.changeOperation("OR")}" class="btn ${this.terms.operation == "OR"?"active":""}">OR</label>
                    <label @click="${() => this.changeOperation("EXCEPT")}" class="btn ${this.terms.operation == "EXCEPT"?"active":""}">EXCEPT</btn></div>
                <button @click="${this.swap}"><svg class="icon"><use xlink:href="/images/icons.svg#exchange"></use></svg> Swap terms</button>
            </li>
            <li class="term"><asdb-query-term .terms="${this.terms.right}" @term-changed="${this.changedTermRight}"></asdb-query-term>${this.terms.right.term_type == "expr"?html`<button class="remove" @click="${this.removeRight}"><svg class="icon"><use xlink:href="/images/icons.svg#trash"></use></svg> Remove term</button>`:html``}</li>
        </ul>
        `;
    }

    render() {
        return html`
            <div>
                ${this.terms?
                    this.terms.term_type == "expr"?
                    this.renderExpression():
                    this.renderOp()
                  :html`Loading...`}
            </div>
            `;
    }

    firstUpdated() {
        const inputs = this.shadowRoot.querySelectorAll(".expression");
        inputs.forEach(input => {
            autocomplete({
                input: input,
                fetch: (text, update) => {
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
