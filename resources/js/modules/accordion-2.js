(() => {
    "use strict";

    // ===== config (keep as-is, but consider moving shared helpers here)
    const SEL = Object.freeze({
        header: "#header",
        navRoot: ".nav--header",
        panel: "#header-nav-menu",
        toggle: "#header-menu-toggle",
        submenuItem: ".nav__item--has-submenu, .submenu__item--has-submenu",
        caretBtn: ".nav__toggle",
        topLink: ".nav__link",
        subLink: ".submenu__link",
        langWrap: ".lang",
        langToggle: "#header-lang-toggle-btn",
        langPanel: "#header-language",
    });
    const CLS = Object.freeze({
        open: "is-open",
        headerShow: "active",
        headerHide: "hide",
        scrollLocked: "u-no-scroll",
        toggleOpen: "open",
    });
    const DATA = Object.freeze({
        menuOpen: "menuOpen", // #header.dataset.menuOpen = "true"/"false"
        langOpen: "langOpen", // #header.dataset.langOpen
        submenuOpen: "submenuOpen", // #header.dataset.submenuOpen
    });
    const FOCUSABLE = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
        "[contenteditable='true']:not([tabindex='-1'])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const MQ = Object.freeze({ mobile: "(max-width: 1024px)" });
    const mqMobile = window.matchMedia(MQ.mobile);
    const isMobile = () => mqMobile.matches;

    // ===== a11y helpers (pure functions, no shared mutable state)
    const ariaBool = (b) => (b ? "true" : "false");
    const setExpanded = (el, expanded) =>
        el?.setAttribute("aria-expanded", ariaBool(!!expanded));
    const isExpanded = (el) => el?.getAttribute("aria-expanded") === "true";
    const getControlledPanel = (controlEl) =>
        controlEl
            ? document.getElementById(
                controlEl.getAttribute("aria-controls") || ""
            )
            : null;
    const show = (el) => el?.removeAttribute("hidden");
    const hide = (el) => el?.setAttribute("hidden", "");
    const setDisclosure = (controlEl, panelEl, open) => {
        setExpanded(controlEl, open);
        open ? show(panelEl) : hide(panelEl);
    };
    const isVisible = (el) =>
        !!(el && !el.hasAttribute("hidden") && el.getClientRects?.().length);
    const firstFocusable = (root) =>
        root
            ? Array.from(root.querySelectorAll(FOCUSABLE)).find(isVisible) ||
            null
            : null;
    const focusFirst = (root, { fallbackToRoot = false } = {}) => {
        const el = firstFocusable(root);
        if (el) {
            el.focus();
            return el;
        }
        if (fallbackToRoot && root?.focus) {
            // Make root programmatically focusable just-in-time
            const hadTabindex = root.hasAttribute("tabindex");
            if (!hadTabindex) root.setAttribute("tabindex", "-1");
            root.focus();
            if (!hadTabindex) root.removeAttribute("tabindex");
            return root;
        }
        return null;
    };
    const snapshotActiveElement = () =>
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
    const restoreFocus = (el) => !!(el && el.focus && (el.focus(), true));
    const isOutside = (root, target) =>
        root && target ? !root.contains(target) : true;

    function setSiblingsInert(el, inert) {
        const parent = document.body;
        [...parent.children].forEach((child) => {
            if (child !== el) setInert(child, inert);
        });
    }

    // ===== state (pure helpers)
    const headerEl = () => document.querySelector(SEL.header);
    const setDataBool = (key, val) => {
        const h = headerEl();
        if (h) h.dataset[key] = String(!!val);
    };
    const getDataBool = (key) => headerEl()?.dataset?.[key] === "true";
    const setMenuOpen = (val) => {
        setDataBool(DATA.menuOpen, val);
        window.__kgmMenuOpen = !!val;
    };
    const isMenuOpen = () => getDataBool(DATA.menuOpen);
    const setLangOpen = (val) => setDataBool(DATA.langOpen, val);
    const setAnySubmenuOpen = (val) => setDataBool(DATA.submenuOpen, val);
    const clearHeaderState = () => {
        const h = headerEl();
        if (!h) return;
        delete h.dataset[DATA.menuOpen];
        delete h.dataset[DATA.langOpen];
        delete h.dataset[DATA.submenuOpen];
        window.__kgmMenuOpen = false;
    };
    function setInert(root, inert) {
        if (!root) return;
        // modern browsers
        if ("inert" in root) {
            root.inert = !!inert;
        } else {
            // fallback: strip from a11y tree + tab order
            root.setAttribute("aria-hidden", inert ? "true" : "false");
            const nodes = root.querySelectorAll(FOCUSABLE);
            nodes.forEach((n) => {
                if (inert) {
                    if (
                        !n.hasAttribute("data-prev-tabindex") &&
                        n.hasAttribute("tabindex")
                    ) {
                        n.setAttribute(
                            "data-prev-tabindex",
                            n.getAttribute("tabindex")
                        );
                    }
                    n.setAttribute("tabindex", "-1");
                } else {
                    if (n.hasAttribute("data-prev-tabindex")) {
                        n.setAttribute(
                            "tabindex",
                            n.getAttribute("data-prev-tabindex")
                        );
                        n.removeAttribute("data-prev-tabindex");
                    } else if (n.getAttribute("tabindex") === "-1") {
                        n.removeAttribute("tabindex");
                    }
                }
            });
        }
    }
    // ===== submenu module
    const submenu = (() => {
        let nav = null;
        let header = null;
        let cleanup = () => {};

        const owningItem = (el) =>
            el?.closest(".nav__item--has-submenu, .submenu__item--has-submenu");
        const anyOpen = () =>
            !!nav?.querySelector(`${SEL.caretBtn}[aria-expanded="true"]`);
        const openItem = (li, btn, panel, { moveFocus = true } = {}) => {
            li.classList.add(CLS.open);
            setDisclosure(btn, panel, true);
            if (moveFocus) focusFirst(panel);
        };
        const closeItem = (li, btn, panel) => {
            closeDescendants(li);
            li.classList.remove(CLS.open);
            setDisclosure(btn, panel, false);
        };

        const closeSiblings = (li) => {
            const parentList = li?.parentElement;
            if (!parentList) return;
            parentList
                .querySelectorAll(
                    ":scope > .nav__item--has-submenu.is-open, :scope > .submenu__item--has-submenu.is-open"
                )
                .forEach((sib) => {
                    if (sib === li) return;
                    const btn = sib.querySelector(SEL.caretBtn);
                    const panel = btn ? getControlledPanel(btn) : null;
                    if (btn && panel) closeItem(sib, btn, panel);
                });
        };
        // helper: close all open descendants of a given LI
        const closeDescendants = (li) => {
            if (!li) return;
            li.querySelectorAll(
                ".nav__item--has-submenu.is-open, .submenu__item--has-submenu.is-open"
            ).forEach((openLi) => {
                const btn = openLi.querySelector(SEL.caretBtn);
                const panel = btn ? getControlledPanel(btn) : null;
                if (btn && panel) {
                    // collapse branch node
                    openLi.classList.remove(CLS.open);
                    setDisclosure(btn, panel, false);
                }
            });
        };

        const closeAll = () => {
            nav?.querySelectorAll(
                `${SEL.caretBtn}[aria-expanded="true"], .${CLS.open} ${SEL.caretBtn}`
            ).forEach((btn) => {
                const li = owningItem(btn);
                const panel = getControlledPanel(btn);
                if (li && panel) closeItem(li, btn, panel);
            });
            setAnySubmenuOpen(false);
        };

        const deepestOpenButton = () => {
            const openBtns = [
                ...nav.querySelectorAll(
                    `${SEL.caretBtn}[aria-expanded="true"]`
                ),
            ];
            if (!openBtns.length) return null;
            // compute nesting depth by walking up DOM:
            const depth = (btn) => {
                let d = 0,
                    n = btn;
                while ((n = n.closest("ul")) && nav.contains(n)) d++;
                return d;
            };
            return openBtns.sort((a, b) => depth(b) - depth(a))[0];
        };

        function onNavClick(e) {
            const btn = e.target.closest(SEL.caretBtn);
            if (btn && nav.contains(btn)) {
                e.preventDefault();
                const li = owningItem(btn);
                const panel = getControlledPanel(btn);
                if (!li || !panel) return;

                const willOpen = btn.getAttribute("aria-expanded") !== "true";
                if (willOpen) closeSiblings(li);
                willOpen ? openItem(li, btn, panel) : closeItem(li, btn, panel);

                setAnySubmenuOpen(anyOpen());
                return;
            }

            // First-click-to-open on mobile when clicking a link that owns a submenu
            const link = e.target.closest("a");
            if (!link || !nav.contains(link) || !mqMobile.matches) return;

            const li = owningItem(link);
            if (!li) return;

            const ownBtn = li.querySelector(SEL.caretBtn);
            const ownPanel = ownBtn ? getControlledPanel(ownBtn) : null;
            if (!ownBtn || !ownPanel) return; // link that doesn't own a submenu

            const isOpen = ownBtn.getAttribute("aria-expanded") === "true";
            if (!isOpen) {
                // prevent navigation; open instead
                e.preventDefault();
                closeSiblings(li);
                openItem(li, ownBtn, ownPanel, { moveFocus: true });
                setAnySubmenuOpen(true);
            }
        }
        function onKeydown(e) {
            if (!nav) return;

            // Space/Enter on caret behaves like click
            const btn = e.target.closest(SEL.caretBtn);
            if (
                btn &&
                nav.contains(btn) &&
                (e.key === "Enter" || e.key === " ")
            ) {
                e.preventDefault();
                btn.click();
                return;
            }

            // Esc closes the deepest open submenu and returns focus to its control
            if (e.key === "Escape" || e.key === "Esc") {
                const openBtn = deepestOpenButton();
                if (openBtn) {
                    e.preventDefault();
                    const li = owningItem(openBtn);
                    const panel = getControlledPanel(openBtn);
                    closeItem(li, openBtn, panel);
                    setAnySubmenuOpen(anyOpen());
                    openBtn.focus();
                }
            }
        }
        function onDocClick(e) {
            if (nav && isOutside(nav, e.target) && anyOpen()) closeAll();
        }

        function init(root = document.querySelector(SEL.header)) {
            header = root || document.querySelector(SEL.header);
            nav = header?.querySelector(SEL.navRoot);
            if (!nav) return;

            // nav.querySelectorAll(SEL.caretBtn).forEach((b) => {
            // const panel = getControlledPanel(b);
            // if (!panel) return;
            // isExpanded(b) ? show(panel) : hide(panel);
            // });

            // Hard reset: ensure ALL submenus start closed, regardless of markup
            nav.querySelectorAll(SEL.caretBtn).forEach((b) => {
                const panel = getControlledPanel(b);
                if (!panel) return;
                setDisclosure(b, panel, false); // aria-expanded="false" + hidden
                const li = b.closest(SEL.submenuItem);
                li && li.classList.remove(CLS.open);
            });

            nav.addEventListener("click", onNavClick);
            nav.addEventListener("keydown", onKeydown);
            document.addEventListener("click", onDocClick);

            cleanup = () => {
                nav.removeEventListener("click", onNavClick);
                nav.removeEventListener("keydown", onKeydown);
                document.removeEventListener("click", onDocClick);
                cleanup = () => {};
            };
        }

        function destroy() {
            cleanup();
            nav = null;
            header = null;
        }

        return { init, destroy, collapseAll: closeAll };
    })();

    // ===== mobile module
    const mobile = (() => {
        let header = null,
            panel = null,
            toggle = null;
        let bound = false;
        let lastFocus = null;
        let cleanup = () => {};
        let locked = false; // <-- add
        let savedScrollY = 0; // <-- add

        const isOpen = () => toggle?.getAttribute("aria-expanded") === "true";
        const lockBodyScroll = () => {
            if (locked) return;
            savedScrollY = window.scrollY || 0;
            document.body.dataset.scrollY = String(savedScrollY);

            // compensate for scrollbar
            const sbw =
                window.innerWidth - document.documentElement.clientWidth;
            if (sbw > 0)
                document.documentElement.style.paddingRight = `${sbw}px`;

            document.documentElement.classList.add(CLS.scrollLocked);
            document.body.classList.add(CLS.scrollLocked);

            // prevent scroll-jump on iOS/desktop
            document.body.style.position = "fixed";
            document.body.style.top = `-${savedScrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";

            locked = true;
        };
        const unlockBodyScroll = () => {
            if (!locked) return;

            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            delete document.body.dataset.scrollY;

            document.documentElement.classList.remove(CLS.scrollLocked);
            document.body.classList.remove(CLS.scrollLocked);
            document.documentElement.style.paddingRight = "";

            // restore scroll position without smooth behavior
            const prev = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, savedScrollY);
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = prev || "";
            }, 0);

            locked = false;
        };

        function openMenu() {
            if (!toggle || !panel) return;
            lastFocus = snapshotActiveElement();

            toggle.classList.add(CLS.toggleOpen);
            panel.classList.add(CLS.open);

            setExpanded(toggle, true);
            show(panel);
            setMenuOpen(true);
            lockBodyScroll();
            focusFirst(panel, { fallbackToRoot: true });
            setSiblingsInert(header, true);

            // Move focus into the menu
            focusFirst(panel, { fallbackToRoot: true });
        }
        function closeMenu({ returnFocus = true } = {}) {
            if (!toggle || !panel) return;

            const wasOpen = isOpen();

            toggle.classList.remove(CLS.toggleOpen);
            panel.classList.remove(CLS.open);

            setExpanded(toggle, false);
            hide(panel);
            setMenuOpen(false);
            unlockBodyScroll();
            setSiblingsInert(header, false);

            if (wasOpen && returnFocus) {
                // prefer returning to toggle; fall back to last active if needed
                if (!restoreFocus(toggle)) restoreFocus(lastFocus);
            }
        }
        function toggleMenu(e) {
            e?.preventDefault?.();
            isOpen() ? closeMenu({ returnFocus: true }) : openMenu();
        }

        function bindHandlers() {
            const onDocClick = (e) => {
                if (!isOpen()) return;
                // close if click happens outside both toggle and panel
                if (isOutside(panel, e.target) && isOutside(toggle, e.target)) {
                    closeMenu({ returnFocus: false });
                }
            };

            const onKeydown = (e) => {
                if (!isOpen()) return;
                if (e.key === "Escape" || e.key === "Esc") {
                    e.preventDefault();
                    closeMenu({ returnFocus: true });
                }
            };

            toggle.addEventListener("click", toggleMenu);
            document.addEventListener("click", onDocClick);
            document.addEventListener("keydown", onKeydown);

            cleanup = () => {
                toggle.removeEventListener("click", toggleMenu);
                document.removeEventListener("click", onDocClick);
                document.removeEventListener("keydown", onKeydown);
                cleanup = () => {};
            };
        }

        function enable() {
            if (bound) return;
            header = document.querySelector(SEL.header);
            panel = document.querySelector(SEL.panel);
            toggle = document.querySelector(SEL.toggle);
            if (!header || !panel || !toggle) return;

            setExpanded(toggle, false);
            hide(panel);

            bindHandlers();
            bound = true;
        }

        function disable() {
            if (!bound) {
                document.querySelector(SEL.panel)?.removeAttribute("hidden");
                return;
            }
            if (isOpen()) closeMenu({ returnFocus: false });
            panel && show(panel);
            cleanup();
            bound = false;
            unlockBodyScroll();
        }

        function destroy() {
            disable();
            header = panel = toggle = lastFocus = null;
        }

        return { enable, disable, destroy };
    })();

    // ===== language module
    const language = (() => {
        let wrap = null,
            btn = null,
            panel = null;
        let lastFocus = null;
        let bound = false;
        let cleanup = () => {};

        const isOpen = () => btn?.getAttribute("aria-expanded") === "true";

        function openLang({ moveFocus = true } = {}) {
            if (!wrap || !btn || !panel) return;
            lastFocus = snapshotActiveElement();

            wrap.classList.add(CLS.open);
            setDisclosure(btn, panel, true); // aria-expanded + hidden
            setLangOpen(true);
            //setInert(panel, false);

            if (moveFocus) focusFirst(panel, { fallbackToRoot: true });
        }
        function closeLang({ returnFocus = true } = {}) {
            if (!wrap || !btn || !panel) return;

            wrap.classList.remove(CLS.open);
            setDisclosure(btn, panel, false);
            setLangOpen(false);
            //setInert(panel, true);

            if (returnFocus) {
                if (!restoreFocus(btn)) restoreFocus(lastFocus);
            }
        }

        function bind() {
            const onDocClick = (e) => {
                if (!wrap) return;
                if (isOpen() && isOutside(wrap, e.target)) {
                    closeLang({ returnFocus: false });
                }
            };
            const onKeydown = (e) => {
                if (!isOpen()) return;
                if (e.key === "Escape" || e.key === "Esc") {
                    e.preventDefault();
                    closeLang({ returnFocus: true });
                }
            };

            btn.addEventListener("click", onToggleClick);
            document.addEventListener("click", onDocClick);
            document.addEventListener("keydown", onKeydown);

            cleanup = () => {
                btn.removeEventListener("click", onToggleClick);
                document.removeEventListener("click", onDocClick);
                document.removeEventListener("keydown", onKeydown);
                cleanup = () => {};
            };
        }

        function onToggleClick(e) {
            e.preventDefault();
            e.stopPropagation();
            isOpen()
                ? closeLang({ returnFocus: true })
                : openLang({ moveFocus: true });
        }

        function init(root = document) {
            if (bound) return;
            wrap = root.querySelector(SEL.langWrap);
            if (!wrap) return;
            btn = wrap.querySelector(SEL.langToggle);
            panel =
                wrap.querySelector(SEL.langPanel) ||
                document.querySelector(SEL.langPanel);
            if (!btn || !panel) return;

            setExpanded(btn, false);
            hide(panel);
            //setInert(panel, true);
            wrap.classList.remove(CLS.open);
            setLangOpen(false);

            bind();
            bound = true;
        }

        function destroy() {
            if (!bound) return;
            cleanup();
            hide(panel);
            wrap = btn = panel = null;
            bound = false;
        }

        return { init, destroy };
    })();

    // ===== current path expansion
    const currentPath = (() => {
        const partsForItem = (li) => {
            const btn = li.querySelector(SEL.caretBtn);
            const panel = btn ? getControlledPanel(btn) : null;
            return { btn, panel };
        };

        function openAncestors(link, root) {
            let li = link.closest(
                ".submenu__item--has-submenu, .nav__item--has-submenu"
            );
            let opened = false;
            while (li && root.contains(li)) {
                const { btn, panel } = partsForItem(li);
                if (btn && panel) {
                    li.classList.add(CLS.open);
                    setDisclosure(btn, panel, true);
                    show(panel);
                    opened = true;
                }
                const parentList = li.parentElement;
                li =
                    parentList?.closest(
                        ".submenu__item--has-submenu, .nav__item--has-submenu"
                    ) || null;
            }
            if (opened) setAnySubmenuOpen(true);
        }

        function expand(root = document.querySelector(SEL.header)) {
            const nav = root?.querySelector(SEL.navRoot);
            if (!nav) return;
            const active =
                nav.querySelector('a[aria-current="page"]') ||
                nav.querySelector('a[aria-current="true"]');
            if (!active) return;
            openAncestors(active, nav);
        }

        return { expand };
    })();

    // ===== header init / teardown
    function initHeaderScroll(header) {
        let lastY = window.scrollY || 0;

        const TOP_EPS = 6; // treat as "at top"
        const DIR_EPS = 10; // ignore tiny deltas (bounce/jitter)

        const onScroll = () => {
            if (!header) return;

            // If menu is open, always show header
            if (isMenuOpen()) {
                header.classList.add(CLS.headerShow);
                header.classList.remove(CLS.headerHide);
                return;
            }

            const y = Math.max(window.scrollY || 0, 0);
            const dy = y - lastY;

            if (mqMobile.matches) {
                // Always show when effectively at the very top; reset baseline
                if (y <= TOP_EPS) {
                    header.classList.add(CLS.headerShow);
                    header.classList.remove(CLS.headerHide);
                    lastY = 0;
                    return;
                }

                // Ignore micro movements to prevent flicker from rubber-band/address bar
                if (Math.abs(dy) < DIR_EPS) return;

                // Mobile: hide on scroll down, show on scroll up
                if (dy < 0) {
                    header.classList.add(CLS.headerShow);
                    header.classList.remove(CLS.headerHide);
                } else {
                    header.classList.remove(CLS.headerShow);
                    header.classList.add(CLS.headerHide);
                }

                lastY = y;
                return;
            }

            // Desktop behavior: show when not at top; never "hide" class
            if (y > 0) header.classList.add(CLS.headerShow);
            else header.classList.remove(CLS.headerShow);
            header.classList.remove(CLS.headerHide);

            lastY = y;
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }

    function applyMode() {
        isMobile() ? mobile.enable() : mobile.disable();
    }

    function initSiteHeader(root = document.querySelector(SEL.header)) {
        const header = root || document.querySelector(SEL.header);
        if (!header) return;
        submenu.init(header);
        language.init(header);
        //currentPath.expand(header);
        applyMode();
        const unbindScroll = initHeaderScroll(header);
        const onMqChange = () => applyMode();
        mqMobile.addEventListener("change", onMqChange);
        return () => {
            mqMobile.removeEventListener("change", onMqChange);
            unbindScroll?.();
            submenu.destroy();
            language.destroy();
            mobile.destroy();
            header.classList.remove(CLS.headerShow, CLS.headerHide);
            clearHeaderState();
        };
    }

    // actually initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initSiteHeader());
    } else {
        initSiteHeader();
    }
})();
