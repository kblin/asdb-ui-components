import { customElement, property, LitElement, html, css } from 'lit-element';

@customElement('asdb-nav')
export class AsdbNav extends LitElement {

    static get styles() {
        return css`
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #dcdcdc;
            background-image: linear-gradient(to bottom, #5e5e5e 0, #444 100%);
            background-repeat: repeat-x;
            border-bottom: 4px solid #810e15;
        }
        .nav-title {
            margin-left: 1em;
        }
        .nav-title a {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: #dcdcdc;
        }
        .title-text {
            font-weight: bold;
            margin-left: 1em;
        }
        .nav {
            padding-left: 0;
            list-style: none;
            margin-left: auto;
            margin-right: 1em;

            display: flex;
            justify-content: flex-end;
        }
        .nav li {
            margin-left: 2em;
        }
        .nav li a {
            text-decoration: none;
            color: #dcdcdc;
        }
        .icon {
            height: 1em;
            width: 1em;
            stroke: #dcdcdc;
            fill: #dcdcdc;
        }
    `;
    }

    render() {
        return html`
            <nav class="navbar">
                <div class="nav-title">
                    <a href="/">
                    <img src="/images/antismash_db_logo.svg" alt="antiSMASH logo" height="30px">
                    <span class="title-text">antiSMASH database</span>
                    </a>
                </div>
                <ul class="nav">
                    <li><a href="/stats.html"><svg class="icon"><use xlink:href="/images/icons.svg#chart-bar"></use></svg> Statistics</li>
                    <li><a href="/query.html"><svg class="icon"><use xlink:href="/images/icons.svg#drafting-compass"></use></svg> Query</li>
                    <li><a href="/search.html"><svg class="icon"><use xlink:href="/images/icons.svg#search"></use></svg> Search</li>
                    <li><a href="/browse.html"><svg class="icon"><use xlink:href="/images/icons.svg#compass"></use></svg> Browse</li>
                    <li><a href="/about.html"><svg class="icon"><use xlink:href="/images/icons.svg#exclamation"></use></svg> About</li>
                    <li><a href="/help.html"><svg class="icon"><use xlink:href="/images/icons.svg#question"></use></svg> Help</li>
                </ul>
            </nav>
    `;
    }
}
