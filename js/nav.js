/**
 * TruthStamp Mobile Navigation
 * Injects hamburger button + slide drawer into every page.
 * Reads auth state from window.tsDB (loaded by supabase-client.js).
 * Safe to include on all pages — no-op if nav not found.
 */
(function () {
  // ── Styles ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Hamburger button — shown only on mobile */
    .ts-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 5px;
      width: 36px; height: 36px;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
    }    .ts-hamburger span {
      display: block;
      width: 18px; height: 2px;
      background: var(--color-text);
      border-radius: 2px;
      transition: all 0.25s ease;
    }
    .ts-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .ts-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .ts-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Overlay */
    .ts-drawer-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 998;
      backdrop-filter: blur(2px);
    }
    .ts-drawer-overlay.show { display: block; }

    /* Drawer */
    .ts-drawer {
      position: fixed;
      top: 0; right: 0;
      width: min(300px, 85vw);
      height: 100dvh;
      background: var(--color-surface);
      border-left: 1px solid var(--color-border);
      z-index: 999;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }
    .ts-drawer.open { transform: translateX(0); }

    /* Drawer header */
    .ts-drawer-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--color-border);
    }
    .ts-drawer-user {
      display: flex; align-items: center; gap: 12px;
    }
    .ts-drawer-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--brand-accent-light);
      color: var(--brand-accent);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; flex-shrink: 0;
    }
    .ts-drawer-user-info { flex: 1; min-width: 0; }
    .ts-drawer-user-name {
      font-size: 14px; font-weight: 600;
      color: var(--color-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ts-drawer-credits {
      font-size: 11px; color: var(--color-text-muted);
      margin-top: 2px;
    }
    .ts-drawer-credits span {
      color: var(--brand-primary); font-weight: 600;
    }

    /* Drawer sections */
    .ts-drawer-section {
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .ts-drawer-section:last-child { border-bottom: none; }
    .ts-drawer-section-label {
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--color-text-muted);
      padding: 8px 20px 4px;
    }
    .ts-drawer-link {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 20px;
      font-size: 14px; font-weight: 500;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 0.15s;
      border-radius: 0;
    }
    .ts-drawer-link:hover,
    .ts-drawer-link.active {
      background: var(--color-surface-alt);
      color: var(--color-text);
    }
    .ts-drawer-link.active { color: var(--brand-primary); }
    .ts-drawer-link svg {
      width: 16px; height: 16px; flex-shrink: 0;
      color: var(--color-text-muted);
    }
    .ts-drawer-link.active svg,
    .ts-drawer-link:hover svg { color: inherit; }

    /* Signout button */
    .ts-drawer-signout {
      margin: 8px 16px 16px;
      padding: 10px;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
      font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit;
      width: calc(100% - 32px);
      transition: all 0.15s;
    }
    .ts-drawer-signout:hover {
      border-color: #EF4444; color: #EF4444;
    }

    /* Network badge */
    .ts-drawer-network {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      font-size: 12px; color: var(--color-text-muted);
    }
    .ts-drawer-network-dot {
      width: 7px; height: 7px;
      border-radius: 50%; background: #10B981; flex-shrink: 0;
    }

    /* Only show hamburger on mobile */
    @media (max-width: 768px) {
      .ts-hamburger { display: flex; }
      /* Hide text nav links but keep account wrap visible */
      .nav-links > a { display: none !important; }
      .nav-links > span { display: none !important; }
      .nav-links > .btn { display: none !important; }
      /* Keep ts-account-wrap hidden on mobile — hamburger handles it */
      #ts-account-wrap { display: none !important; }
    }
    @media (min-width: 769px) {
      .ts-drawer { display: none !important; }
      .ts-drawer-overlay { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  // ── Wait for DOM ────────────────────────────────────────────────────────
  function init() {
    const navInner = document.querySelector('.nav-inner');
    if (!navInner) return;

    // Current page for active link detection
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // ── Hamburger button ────────────────────────────────────────────────
    const hamburger = document.createElement('button');
    hamburger.className = 'ts-hamburger';
    hamburger.setAttribute('aria-label', 'Open menu');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    navInner.appendChild(hamburger);

    // ── Overlay ─────────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'ts-drawer-overlay';
    document.body.appendChild(overlay);

    // ── Drawer ──────────────────────────────────────────────────────────
    const drawer = document.createElement('nav');
    drawer.className = 'ts-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');

    drawer.innerHTML = `
      <div class="ts-drawer-header">
        <div class="ts-drawer-user" id="ts-drawer-user">
          <div class="ts-drawer-avatar" id="ts-drawer-avatar">?</div>
          <div class="ts-drawer-user-info">
            <p class="ts-drawer-user-name" id="ts-drawer-name">Loading...</p>
            <p class="ts-drawer-credits" id="ts-drawer-credits">
              <span id="ts-drawer-credit-count">—</span> credits remaining
            </p>
          </div>
        </div>
      </div>

      <div class="ts-drawer-section">
        <p class="ts-drawer-section-label">Create</p>
        <a href="stamp.html" class="ts-drawer-link ${currentPage==='stamp.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          New Stamp
        </a>
      </div>

      <div class="ts-drawer-section">
        <p class="ts-drawer-section-label">Explore</p>
        <a href="explorer.html" class="ts-drawer-link ${currentPage==='explorer.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Explorer
        </a>
        <a href="verify.html" class="ts-drawer-link ${currentPage==='verify.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          Verify a Stamp
        </a>
        <a href="trust.html" class="ts-drawer-link ${currentPage==='trust.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Trust
        </a>
      </div>

      <div class="ts-drawer-section">
        <p class="ts-drawer-section-label">My Account</p>
        <a href="dashboard.html" class="ts-drawer-link ${currentPage==='dashboard.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a href="arweave-index.html" class="ts-drawer-link ${currentPage==='arweave-index.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"/></svg>
          Arweave Index
        </a>
        <a href="pricing.html" class="ts-drawer-link ${currentPage==='pricing.html'?'active':''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Buy Credits
        </a>
      </div>

      <div class="ts-drawer-section">
        <div class="ts-drawer-network">
          <div class="ts-drawer-network-dot"></div>
          <span>MegaETH Testnet · Connected</span>
        </div>
      </div>

      <button class="ts-drawer-signout" id="ts-drawer-signout">Sign out</button>
    `;
    document.body.appendChild(drawer);

    // ── Toggle drawer ───────────────────────────────────────────────────
    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('show');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      drawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('.ts-drawer-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });

  // ── Desktop account dropdown ──────────────────────────────────────────
  // Inject into nav-links on pages that don't have their own (non-dashboard pages)
  const navLinks = document.querySelector('.nav-links');
  const hasDashboardMenu = !!document.getElementById('user-avatar');

  if (navLinks && !hasDashboardMenu && !document.getElementById('ts-account-menu')) {
    const accountWrap = document.createElement('div');
    accountWrap.id    = 'ts-account-wrap';
    accountWrap.style.cssText = 'position:relative; display:inline-block;';
    accountWrap.innerHTML = `
      <button id="ts-avatar-btn"
        style="width:30px;height:30px;border-radius:50%;background:var(--brand-accent-light);color:var(--brand-accent);border:1px solid var(--color-border);cursor:pointer;font-size:12px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">··</button>
      <div id="ts-account-menu" style="display:none;position:absolute;right:0;top:38px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);box-shadow:0 4px 16px rgba(0,0,0,0.12);min-width:210px;z-index:200;padding:var(--space-2) 0;">
        <div style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);">
          <p style="font-size:var(--text-xs);color:var(--color-text-muted);margin:0 0 2px;">Signed in as</p>
          <p id="ts-menu-identity" style="font-size:var(--text-sm);font-weight:600;margin:0;word-break:break-all;">—</p>
          <p id="ts-menu-credits" style="font-size:var(--text-xs);color:var(--brand-primary);margin:2px 0 0;font-weight:500;">— credits remaining</p>
        </div>
        <a href="buy-credits.html" style="display:flex;align-items:center;gap:8px;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text);text-decoration:none;" onmouseover="this.style.background='var(--color-surface-alt)'" onmouseout="this.style.background=''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Buy credits
        </a>
        <a href="dashboard.html" style="display:flex;align-items:center;gap:8px;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text);text-decoration:none;" onmouseover="this.style.background='var(--color-surface-alt)'" onmouseout="this.style.background=''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Dashboard
        </a>
        <a id="ts-switch-btn" href="auth.html" style="display:flex;align-items:center;gap:8px;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--color-text);text-decoration:none;" onmouseover="this.style.background='var(--color-surface-alt)'" onmouseout="this.style.background=''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4-4-4M7 8l-4 4 4 4"/></svg>Switch account
        </a>
        <div style="border-top:1px solid var(--color-border);margin:var(--space-1) 0;"></div>
        <a id="ts-signout-btn" href="#" style="display:flex;align-items:center;gap:8px;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:#DC2626;text-decoration:none;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background=''">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>Sign out
        </a>
      </div>`;

    navLinks.appendChild(accountWrap);

    // Toggle dropdown
    document.getElementById('ts-avatar-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('ts-account-menu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
      const menu = document.getElementById('ts-account-menu');
      if (menu) menu.style.display = 'none';
    });

    // Sign out
    document.getElementById('ts-signout-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      try { if (window.tsDB) await window.tsDB.auth.signOut(); } catch {}
      window.location.href = 'auth.html';
    });

    // Switch account
    document.getElementById('ts-switch-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      try { if (window.tsDB) await window.tsDB.auth.signOut(); } catch {}
      window.location.href = 'auth.html';
    });
  }
    async function loadUserData() {
      try {
        if (!window.tsDB) return;
        const { data: { user } } = await window.tsDB.auth.getUser();
        if (!user) {
          document.getElementById('ts-drawer-user').innerHTML = `
            <div class="ts-drawer-avatar">?</div>
            <div class="ts-drawer-user-info">
              <p class="ts-drawer-user-name">Not signed in</p>
              <a href="auth.html" style="font-size:12px; color:var(--brand-primary);">Sign in →</a>
            </div>`;
          document.getElementById('ts-drawer-signout').style.display = 'none';
          return;
        }

        const { data: profile } = await window.tsDB
          .from('profiles')
          .select('display_name, credits_balance, wallet_address, auth_method')
          .eq('id', user.id)
          .maybeSingle();

        const name     = profile?.display_name || user.email || user.id.slice(0,8) + '…';
        const credits  = profile?.credits_balance ?? 0;
        const initials = name.replace(/[^A-Za-z]/g,'').slice(0,2).toUpperCase() || '??';
        const identity = (profile?.auth_method === 'wallet' && profile?.wallet_address)
          ? profile.wallet_address.slice(0,6) + '…' + profile.wallet_address.slice(-4)
          : user.email ?? name;

        // Mobile drawer
        document.getElementById('ts-drawer-avatar').textContent       = initials;
        document.getElementById('ts-drawer-name').textContent         = name;
        document.getElementById('ts-drawer-credit-count').textContent = credits;
        if (profile?.auth_method === 'wallet' && profile?.wallet_address) {
          document.getElementById('ts-drawer-credits').innerHTML =
            `<span>${credits}</span> credits · ${identity}`;
        }

        // Desktop dropdown (injected by nav.js — not present on dashboard which has its own)
        const avatarBtn  = document.getElementById('ts-avatar-btn');
        const menuIdent  = document.getElementById('ts-menu-identity');
        const menuCredit = document.getElementById('ts-menu-credits');
        if (avatarBtn)  avatarBtn.textContent  = initials;
        if (menuIdent)  menuIdent.textContent  = identity;
        if (menuCredit) menuCredit.textContent = `${credits} credits remaining`;

      } catch(e) {
        console.warn('[TruthStamp nav] Could not load user data:', e);
      }
    }

    loadUserData();

    // ── Sign out ────────────────────────────────────────────────────────
    document.getElementById('ts-drawer-signout').addEventListener('click', async () => {
      try {
        if (window.tsDB) await window.tsDB.auth.signOut();
        window.location.href = 'auth.html';
      } catch(e) {
        window.location.href = 'auth.html';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
