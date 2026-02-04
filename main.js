/*
  main.js
  - sync header height -> set --header-height and set section scroll-margin-top
  - mobile menu open/close with aria toggles, focus trap, escape to close, scroll lock
  - modal for detailed description with focus trap and escape to close
  - wire up "View Detailed Description" buttons
*/

(function () {
    // Utilities
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    function trapFocus(container) {
        const focusables = Array.from(container.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
        if (!focusables.length) return () => {};
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const keyHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        container.addEventListener('keydown', keyHandler);
        first.focus();
        return () => container.removeEventListener('keydown', keyHandler);
    }

    // Header height sync
    function syncHeaderHeight() {
        const header = document.getElementById('site-header');
        if (!header) return;
        const h = header.offsetHeight + 'px';
        document.documentElement.style.setProperty('--header-height', h);

        // make sure anchored sections aren't hidden under sticky header
        document.querySelectorAll('section[id]').forEach(sec => {
            sec.style.scrollMarginTop = h;
        });

        // hero full viewport minus header
        const hero = document.getElementById('hero');
        if (hero) {
            hero.style.minHeight = `calc(100vh - ${h})`;
        }
    }
    window.addEventListener('load', syncHeaderHeight);
    window.addEventListener('resize', syncHeaderHeight);

    // Mobile menu behaviour
    const mobileBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    let releaseMobileTrap = null;

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('hidden');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        releaseMobileTrap = trapFocus(mobileMenu);
        document.addEventListener('keydown', mobileGlobalKeydown);
    }
    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('hidden');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (typeof releaseMobileTrap === 'function') releaseMobileTrap();
        document.removeEventListener('keydown', mobileGlobalKeydown);
        mobileBtn.focus();
    }
    function mobileGlobalKeydown(e) {
        if (e.key === 'Escape') closeMobileMenu();
    }

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
            if (expanded) closeMobileMenu();
            else openMobileMenu();
        });
    }
    if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenu);

    // close mobile menu when a mobile nav link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Modal behaviour for detailed descriptions
    const modal = document.getElementById('description-modal');
    const modalContent = modal ? modal.querySelector('.modal-content') : null;
    const modalTitle = document.getElementById('modal-project-title');
    const modalBody = document.getElementById('modal-description-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    let releaseModalTrap = null;

    function openModal(title, htmlContent) {
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (modalTitle) modalTitle.textContent = title || '';
        if (modalBody) modalBody.innerHTML = htmlContent || '';
        releaseModalTrap = trapFocus(modalContent || modal);
        document.addEventListener('keydown', modalGlobalKeydown);
    }
    function closeModal() {
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (typeof releaseModalTrap === 'function') releaseModalTrap();
        document.removeEventListener('keydown', modalGlobalKeydown);
        // return focus to last focused element could be improved if needed
    }
    function modalGlobalKeydown(e) {
        if (e.key === 'Escape') closeModal();
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(); // click outside content closes
    });

    // Wire up "View Detailed Description" buttons
    document.querySelectorAll('.generate-desc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = btn.closest('.p-6');
            if (!card) return;
            const titleEl = card.querySelector('h3') || card.querySelector('[id^="project-title"]');
            const descEl = card.querySelector('p') || card.querySelector('[id^="project-desc"]');
            const title = titleEl ? titleEl.textContent.trim() : 'Project';
            const desc = descEl ? descEl.outerHTML : '<p>No description available.</p>';
            openModal(title, desc);
        });
    });

    // Ensure anchor links don't get hidden by header (for keyboard + programmatic navigation)
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
        a.addEventListener('click', (e) => {
            // allow normal navigation to anchor; but ensure header height applied (already done by syncHeaderHeight)
            // small delay to ensure focus lands and scrollMarginTop applied
            setTimeout(() => {
                const id = (a.getAttribute('href') || '').split('#')[1];
                if (id) {
                    const target = document.getElementById(id);
                    if (target) target.focus({ preventScroll: true });
                }
            }, 100);
        });
    });

})();
