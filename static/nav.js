const active = (o) => window.location.pathname.replace(/\/$/, '') === o.href.replace(/\/$/, '');

const rawLinks = [
    { label: 'Home', href: '/' },
    { label: 'System', href: '/system' },
    { label: 'Docs', href: '/docs' }
];

const links = rawLinks.map(link => ({
    ...link,
    active: active(link) 
}));

const logo = 'NAS';

class GlassNavbar extends HTMLElement {
  static get observedAttributes() {
    return ['logo', 'links', 'cta-label', 'cta-href'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._mobileOpen = false;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _emit(label, href) {
    this.dispatchEvent(new CustomEvent('nav-click', {
      bubbles: true, composed: true,
      detail: { label, href }
    }));
  }

  /* ── render ───────────────────────────────────────────────────────────── */

  _render() {
    const ctaLabel = this.getAttribute('cta-label') || '';
    const ctaHref  = this.getAttribute('cta-href')  || '#';

    const linkItems = links.map(({ label, href = '#', active }) => `
      <li>
        <a class="nav-link${active ? ' active' : ''}" href="${href}" data-label="${label}" data-href="${href}">
          ${label}
        </a>
      </li>`).join('');

    const ctaBtn = ctaLabel ? `
      <a class="cta-btn" id="cta-btn" href="${ctaHref}" data-label="${ctaLabel}" data-href="${ctaHref}">
        ${ctaLabel}
      </a>` : '';

    this.shadowRoot.innerHTML = `
      <style>
        /* ── host ── */
        :host {
          display: block;
          position: sticky;
          top: 0;
          z-index: 1000;
          /* inherit or override via CSS custom properties */
          --glass-bg:       rgba(255, 255, 255, 0.18);
          --glass-border:   rgba(255, 255, 255, 0.35);
          --glass-shadow:   0 4px 30px rgba(0, 0, 0, 0.12);
          --glass-blur:     18px;
          --text-color:     #1e272e;
          --link-color:     #1e272e;
          --link-active:    #0984e3;
          --link-hover-bg:  rgba(255, 255, 255, 0.28);
          --cta-bg:         #0984e3;
          --cta-hover:      #00a8ff;
          --cta-color:      #fff;
          --font:           'Segoe UI', sans-serif;
          --radius:         12px;
          --height:         64px;
        }

        /* ── wrapper ── */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--height);
          padding: 0 28px;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          font-family: var(--font);
          box-sizing: border-box;
          border-radius:10px;
        }

        /* ── logo ── */
        .logo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--link-active);
          text-decoration: none;
          letter-spacing: -0.3px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── link list ── */
        ul.nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          display: block;
          padding: 7px 14px;
          border-radius: 8px;
          color: var(--link-color);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.2s ease, color 0.2s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: var(--link-hover-bg);
        }

        .nav-link.active {
          color: var(--link-active);
          background: rgba(9, 132, 227, 0.10);
        }

        /* ── right section ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* ── CTA button ── */
        .cta-btn {
          display: inline-block;
          padding: 9px 20px;
          background: var(--cta-bg);
          color: var(--cta-color);
          border-radius: var(--radius);
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.2px;
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
          box-shadow: 0 2px 10px rgba(9, 132, 227, 0.35);
          white-space: nowrap;
        }

        .cta-btn:hover {
          background: var(--cta-hover);
          box-shadow: 0 4px 16px rgba(0, 168, 255, 0.45);
          transform: translateY(-1px);
        }

        .cta-btn:active { transform: translateY(0); }

        /* ── hamburger ── */
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 24px;
          height: 18px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background: var(--text-color);
          border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        /* open state */
        .hamburger.open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

        /* ── mobile menu ── */
        .mobile-menu {
          display: none;
          position: absolute;
          top: var(--height);
          left: 0;
          right: 0;
          background: var(--glass-bg);
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          padding: 12px 20px 16px;
          animation: slideDown 0.22s ease;
        }

        .mobile-menu.open { display: block; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-menu ul {
          list-style: none;
          margin: 0 0 12px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-menu .nav-link {
          font-size: 0.95rem;
          padding: 10px 12px;
        }

        .mobile-menu .cta-btn {
          display: block;
          text-align: center;
        }

        /* ── responsive ── */
        @media (max-width: 640px) {
          .nav-links, .nav-right { display: none; }
          .hamburger { display: flex; }
        }
      </style>

      <nav part="nav">
        <a class="logo" href="#">${logo}</a>

        <ul class="nav-links" part="links">
          ${linkItems}
        </ul>

        <div class="nav-right" part="right">
          ${ctaBtn}
        </div>

        <button class="hamburger" aria-label="Toggle menu" part="hamburger">
          <span></span><span></span><span></span>
        </button>
      </nav>

      <!-- mobile dropdown -->
      <div class="mobile-menu" part="mobile-menu">
        <ul>${linkItems}</ul>
        ${ctaBtn}
      </div>
    `;

   this._bindEvents();
  }

  /* ── event binding ────────────────────────────────────────────────────── */

  _bindEvents() {
    const root = this.shadowRoot;

    /* hamburger toggle */
    const ham   = root.querySelector('.hamburger');
    const menu  = root.querySelector('.mobile-menu');
    ham.addEventListener('click', () => this._setMobileOpen(!this._mobileOpen));

    /* close on outside click */
    const outsideClose = e => {
      if (this._mobileOpen && !this.contains(e.target)) this._setMobileOpen(false);
    };
    document.addEventListener('click', outsideClose, { once: false });
    /* store for cleanup if ever disconnected */
    this._outsideClose = outsideClose;
  }

  _setMobileOpen(val) {
    this._mobileOpen = val;
    const root = this.shadowRoot;
    root.querySelector('.hamburger').classList.toggle('open', val);
    root.querySelector('.mobile-menu').classList.toggle('open', val);
  }

  disconnectedCallback() {
    if (this._outsideClose) document.removeEventListener('click', this._outsideClose);
  }
}

customElements.define('nav-bar', GlassNavbar);