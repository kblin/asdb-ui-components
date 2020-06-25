import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('asdb-footer')
export class AsdbFooter extends LitElement {

    static get styles() {
        return css`
        a {
            text-decoration: none;
            color: #810e15;
        }
        .footer {
            border-top: 1px solid #810e15;
            width: 100%;
            height: 160px;
            padding-top: 0.25em;
            margin-top: 2em;
        }
        .container {
            margin-right: auto;
            margin-left: auto;
            padding-right: 15px;
            padding-left: 15px;
        }
        @media (min-width: 768px) {
            .container {
                width: 550px;
            }
        }
        @media (min-width: 992px) {
            .container {
                width: 750px;
            }
        }
        @media (min-width: 1200px) {
            .container {
                width: 970px;
            }
        }
        @media (min-width: 1600px) {
            .container {
                width: 1170px;
            }
        }
        .container {
            display: flex;
            align-items: center;
        }
        .asdb-logo {
            flex-grow: 1;
        }
        .cite-me {
            flex-grow: 3;
            padding: 19px;
            background-image: linear-gradient(to bottom, #e8e8e8 0, #f5f5f5 100%);
            background-repeat: repeat-x;
            border: 1px solid #dcdcdc;
            border-radius: 4px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.05),0 1px 0 rgba(255,255,255,0.1);
        }
        .org-logos {
            flex-grow: 1;
            padding-left: 15px;
            padding-right: 15px;
        }
    `;
    }

    render() {
        return html`
        <footer class="footer">
            <div class="container">
                <div class="asdb-logo">
                    <img src="/images/antismash_db_logo.svg" height="100px">
                </div>
                <div class="cite-me">
                    If you have found the antiSMASH database useful, please <a href="/about.html">cite us</a>.
                </div>
                <div class="org-logos">
                    <img src="/images/dtu_logo.svg" height="80px">
                </div>
                <div class="org-logos">
                    <img src="/images/cfb_logo.svg" height="80px">
                </div>
            </div>
        </footer>
    `;
    }
}
