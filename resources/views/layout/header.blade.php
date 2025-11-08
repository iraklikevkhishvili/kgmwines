<header class="header">
    <button class="header__toggle-open">-</button>

    <div class="header-modal"></div>
    <nav class="header-nav"
         data-accordion="single"
         data-accordion-open-single="true">
        <button class="header__toggle-close">x</button>
        <ul class="header-nav__list">
            <li>
                <div>
                    <a>home</a>
                </div>
            </li>
            {{-- About Nav Item Start --}}
            <li class="header-nav__item"
                data-accordion-item>
                <div class="header-nav__item-parent">
                    <a href="#" class="header-nav__link">about</a>
                    <button class="header-nav__toggle"
                            data-accordion-trigger
                            type="button"
                            aria-expanded="false">
                        <svg class="header-nav__toggle-icon"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2"
                             stroke-linecap="round"
                             stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"></path>
                        </svg>
                    </button>
                </div>
                <ul class="header-nav__submenu header-nav__submenu--level1"
                    data-accordion="single"
                    data-accordion-content>
                    <li class="submenu-nav__submenu-item"
                        data-accordion-item>
                        <div class="header-nav__submenu-item-parent">
                            <a href="#" class="header-nav__link">about kgm</a>
                            <button class="header-nav__toggle"
                                    data-accordion-trigger
                                    type="button"
                                    aria-expanded="false">
                                <svg class="header-nav__toggle-icon"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </button>
                        </div>
                        <ul class="header-nav__submenu header-nav__submenu--level2"
                            data-accordion="single"
                            data-accordion-content>

                            <li>
                                <a href="">our story</a>
                            </li>
                            <li>
                                <a href="">our company</a>
                            </li>

                            <li>
                                <a href="">our team</a>
                            </li>

                            <li>
                                <a href="">export</a>
                            </li>

                        </ul>

                    </li>


                    <li class="submenu-nav__submenu-item"
                        data-accordion-item>
                        <div class="header-nav__submenu-item-parent">
                            <a href="#" class="header-nav__link">winemaking</a>
                            <button class="header-nav__toggle"
                                    data-accordion-trigger
                                    type="button"
                                    aria-expanded="false">
                                <svg class="header-nav__toggle-icon"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </button>
                        </div>
                        <ul class="header-nav__submenu header-nav__submenu--level2"
                            data-accordion="single"
                            data-accordion-content>

                            <li>
                                <a href="">our winery</a>
                            </li>
                            <li>
                                <a href="">our vineyards</a>
                            </li>

                            <li>
                                <a href="">awards</a>
                            </li>

                        </ul>
                    </li>

                    <li class="submenu-nav__submenu-item">
                        <div class="header-nav__submenu-item-parent">
                            <a>careers</a>
                        </div>
                    </li>
                </ul>
            </li>
            {{-- About Nav Item End --}}


            {{-- Products Nav Item Start --}}
            <li class="header-nav__item"
                data-accordion-item>
                <div class="header-nav__item-parent">
                    <a href="#" class="header-nav__link">products</a>
                    <button class="header-nav__toggle"
                            data-accordion-trigger
                            type="button"
                            aria-expanded="false">
                        <svg class="header-nav__toggle-icon"
                             xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 24 24"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2"
                             stroke-linecap="round"
                             stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"></path>
                        </svg>
                    </button>
                </div>
                <ul class="header-nav__submenu header-nav__submenu--level1"
                    data-accordion="single"
                    data-accordion-content>
                    <li class="submenu-nav__submenu-item"
                        data-accordion-item>
                        <div class="header-nav__submenu-item-parent">
                            <a href="#" class="header-nav__link">wines</a>
                            <button class="header-nav__toggle"
                                    data-accordion-trigger
                                    type="button"
                                    aria-expanded="false">
                                <svg class="header-nav__toggle-icon"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </button>
                        </div>
                        <ul class="header-nav__submenu header-nav__submenu--level2"
                            data-accordion="single"
                            data-accordion-content>

                            <li>
                                <a href="">classic wines</a>
                            </li>
                            <li>
                                <a href="">qvevri wines</a>
                            </li>

                            <li>
                                <a href="">ceramics</a>
                            </li>
                        </ul>

                    </li>

                    <li class="submenu-nav__submenu-item"
                        data-accordion-item>
                        <div class="header-nav__submenu-item-parent">
                            <a href="#" class="header-nav__link">lines</a>
                            <button class="header-nav__toggle"
                                    data-accordion-trigger
                                    type="button"
                                    aria-expanded="false">
                                <svg class="header-nav__toggle-icon"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </button>
                        </div>
                        <ul class="header-nav__submenu header-nav__submenu--level2"
                            data-accordion="single"
                            data-accordion-content>

                            <li>
                                <a href="">KGM</a>
                            </li>
                            <li>
                                <a href="">ANNATA</a>
                            </li>

                            <li>
                                <a href="">Ensemble</a>
                            </li>

                            <li>
                                <a href="">Mikho</a>
                            </li>

                            <li>
                                <a href="">7 Hands</a>
                            </li>

                            <li>
                                <a href="">King Erekle 1729</a>
                            </li>
                        </ul>
                    </li>

                    <li class="submenu-nav__submenu-item"
                        data-accordion-item>
                        <div class="header-nav__submenu-item-parent">
                            <a href="#" class="header-nav__link">spirits</a>
                            <button class="header-nav__toggle"
                                    data-accordion-trigger
                                    type="button"
                                    aria-expanded="false">
                                <svg class="header-nav__toggle-icon"
                                     xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor"
                                     stroke-width="2"
                                     stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"></path>
                                </svg>
                            </button>
                        </div>
                        <ul class="header-nav__submenu header-nav__submenu--level2"
                            data-accordion="single"
                            data-accordion-content>

                            <li>
                                <a href="">georgian brandy</a>
                            </li>
                            <li>
                                <a href="">chacha</a>
                            </li>

                        </ul>

                    </li>
                </ul>
            </li>
            {{-- Products Nav Item End --}}


        </ul>
    </nav>

</header>
