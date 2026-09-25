
if (!window._flixBypassContentLoaded) {
    window._flixBypassContentLoaded = true;

    const HOUSEHOLD_MODAL_TEXTS = [
        'household',
        'update your netflix household',
        'part of your netflix household',
        'tv isn\'t part of your netflix household',
        'device isn\'t part of your netflix household',
        'update netflix household',
        'confirm tv',
        'manage household',
        'temporary code',
        'i\'m traveling',
        'create account or sign in'
    ];

    function unlockPageScroll() {
        document.querySelectorAll('.nf-modal-background, [data-uia="nf-modal-background"], [class*="backdrop"], [class*="overlay"]').forEach(bg => {
            try { bg.remove(); } catch(e){}
        });

        if (document.body) {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'static';
            document.body.classList.remove('no-scroll', 'nflx-modal-open', 'modal-open');
        }
        if (document.documentElement) {
            document.documentElement.style.overflow = 'unset';
            document.documentElement.style.position = 'static';
            document.documentElement.classList.remove('no-scroll', 'nflx-modal-open', 'modal-open');
        }
    }

    function removeIfHousehold(element) {
        if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
        const text = (element.textContent || '').toLowerCase();
        const dataUia = (element.getAttribute && element.getAttribute('data-uia') || '').toLowerCase();
        const className = (element.className || '').toString().toLowerCase();

        const isHouseholdMatch =
            dataUia.includes('household') ||
            className.includes('household') ||
            HOUSEHOLD_MODAL_TEXTS.some(kw => text.includes(kw));

        if (isHouseholdMatch) {
            console.log('[FlixBypass] Removing household modal element', element);
            element.remove();
            unlockPageScroll();
        }
    }

    function checkAndRemoveModals() {
        const selectors = [
            '.nf-modal',
            '[data-uia*="household"]',
            '[data-uia*="interstitial"]',
            '.modal-household',
            'div[role="dialog"]'
        ];
        document.querySelectorAll(selectors.join(',')).forEach(removeIfHousehold);
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type !== 'childList') continue;
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                removeIfHousehold(node);
                if (node.querySelectorAll) {
                    node.querySelectorAll('.nf-modal, [data-uia*="household"], [data-uia*="interstitial"], .modal-household, div[role="dialog"]').forEach(removeIfHousehold);
                }
            }
        }
    });

    const initObserver = () => {
        if (document.body) {
            checkAndRemoveModals();
            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    if (document.body) {
        initObserver();
    } else {
        document.addEventListener('DOMContentLoaded', initObserver);
    }
}