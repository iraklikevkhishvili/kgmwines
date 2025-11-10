<div class="header-modal"></div>

<div class="header-nav-wrapper"
     id="header-nav-menu">

    <div class="header__menu-toggle">
        <button
            class="header__toggle-close"
            id="header-menu-toggle-close"
            type="button"
            aria-label="Menu Toggle"
        >
                <span class="header__menu-toggle-open-icon-wrapper">
                    <span class="header__menu-toggle-open-icon"></span>
                </span>
        </button>
    </div>
    <nav class="header-nav"
         data-navigation
         aria-label="Header Navigation">

        <ul class="header-nav__list"
            data-accordion="single">


            {{-- Home Menu Start --}}
            <li class="header-nav__item">
                <div class="header-nav__parent">
                    <a class="header-nav__link"
                       href="">
                        Home
                    </a>
                </div>
            </li>
            {{-- Home Menu Start --}}


            {{-- About Menu Start --}}
            <li class="header-nav__item"
                data-accordion-item>
                <div class="header-nav__parent"
                     data-accordion-header>
                    <a class="header-nav__link"
                       href="">
                        About
                    </a>


                    {{-- Toggle Start --}}
                    <button class="header-nav__toggle"
                            id="about-submenu-trigger"
                            type="button"
                            aria-expanded="false"
                            aria-controls="about-submenu"
                            data-accordion-trigger>
                        <x-icon.chevron-down class="header-nav__toggle-icon" svg-class="header-nav__toggle-svg"/>
                    </button>
                    {{-- Toggle End --}}
                </div>

                {{-- Submenu Start --}}
                <div class="header-nav__submenu"
                     id="about-submenu"
                     data-accordion-content
                     aria-labelledby="about-submenu-trigger"
                     aria-hidden="true">
                    <ul class="header-nav__submenu--level1"
                        data-accordion="single">

                        <li class="header-nav__submenu-item"
                            data-accordion-item>
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    About KGM
                                </a>


                                {{-- Toggle Start --}}
                                <button class="header-nav__toggle"
                                        id="about-kgm-submenu-trigger"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="about-kgm-submenu"
                                        data-accordion-trigger>
                                    <x-icon.chevron-down class="header-nav__toggle-icon"
                                                         svg-class="header-nav__toggle-svg"/>

                                </button>
                                {{-- Toggle End --}}
                            </div>


                            {{-- Submenu Start --}}
                            <div class="header-nav__submenu"
                                 id="about-kgm-submenu"
                                 data-accordion-content
                                 aria-labelledby="about-kgm-submenu-trigger"
                                 aria-hidden="true">

                                <ul class="header-nav__submenu--level2">

                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Our Story
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Our Company
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Our Team
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Careers
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {{-- Submenu End --}}
                        </li>


                        <li class="header-nav__submenu-item"
                            data-accordion-item>
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    Winemaking
                                </a>


                                {{-- Toggle Start --}}
                                <button class="header-nav__toggle"
                                        id="winemaking-submenu-trigger"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="winemaking-submenu"
                                        data-accordion-trigger>
                                    <x-icon.chevron-down class="header-nav__toggle-icon"
                                                         svg-class="header-nav__toggle-svg"/>
                                </button>
                                {{-- Toggle End --}}
                            </div>


                            {{-- Submenu Start --}}
                            <div class="header-nav__submenu"
                                 id="winemaking-submenu"
                                 data-accordion-content
                                 aria-labelledby="winemaking-submenu-trigger"
                                 aria-hidden="true">

                                <ul class="header-nav__submenu--level2">

                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Our Winery
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Our Vineyards
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Awards
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {{-- Submenu End --}}
                        </li>

                        <li class="header-nav__submenu-item">
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    Careers
                                </a>
                            </div>
                        </li>

                    </ul>
                </div>
                {{-- Submenu End--}}


            </li>
            {{-- About Menu End --}}



            {{-- Products Menu Start --}}
            <li class="header-nav__item"
                data-accordion-item>
                <div class="header-nav__parent"
                     data-accordion-header>
                    <a class="header-nav__link"
                       href="">
                        Products
                    </a>


                    {{-- Toggle Start --}}
                    <button class="header-nav__toggle"
                            id="products-submenu-trigger"
                            type="button"
                            aria-expanded="false"
                            aria-controls="products-submenu"
                            data-accordion-trigger>
                        <x-icon.chevron-down class="header-nav__toggle-icon" svg-class="header-nav__toggle-svg"/>
                    </button>
                    {{-- Toggle End --}}
                </div>

                {{-- Submenu Start --}}
                <div class="header-nav__submenu"
                     id="products-submenu"
                     data-accordion-content
                     aria-labelledby="products-submenu-trigger"
                     aria-hidden="true">
                    <ul class="header-nav__submenu--level1"
                        data-accordion="single">

                        <li class="header-nav__submenu-item"
                            data-accordion-item>
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    Wines
                                </a>


                                {{-- Toggle Start --}}
                                <button class="header-nav__toggle"
                                        id="wines-submenu-trigger"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="wines-submenu"
                                        data-accordion-trigger>
                                    <x-icon.chevron-down class="header-nav__toggle-icon"
                                                         svg-class="header-nav__toggle-svg"/>
                                </button>
                                {{-- Toggle End --}}
                            </div>


                            {{-- Submenu Start --}}
                            <div class="header-nav__submenu"
                                 id="wines-submenu"
                                 data-accordion-content
                                 aria-labelledby="wines-submenu-trigger"
                                 aria-hidden="true">

                                <ul class="header-nav__submenu--level2">

                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Classic Wines
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Qvevri Wines
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Ceramics
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {{-- Submenu End --}}
                        </li>


                        <li class="header-nav__submenu-item"
                            data-accordion-item>
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    Lines
                                </a>


                                {{-- Toggle Start --}}
                                <button class="header-nav__toggle"
                                        id="lines-submenu-trigger"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="lines-submenu"
                                        data-accordion-trigger>
                                    <x-icon.chevron-down class="header-nav__toggle-icon"
                                                         svg-class="header-nav__toggle-svg"/>
                                </button>
                                {{-- Toggle End --}}
                            </div>


                            {{-- Submenu Start --}}
                            <div class="header-nav__submenu"
                                 id="lines-submenu"
                                 data-accordion-content
                                 aria-labelledby="lines-submenu-trigger"
                                 aria-hidden="true">

                                <ul class="header-nav__submenu--level2">

                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            KGM
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            ANNATA
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Enslemble
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            7 Hands
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Mikho
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            King Erekle 1729
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {{-- Submenu End --}}
                        </li>


                        <li class="header-nav__submenu-item"
                            data-accordion-item>
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    Spirits
                                </a>


                                {{-- Toggle Start --}}
                                <button class="header-nav__toggle"
                                        id="spirits-submenu-trigger"
                                        type="button"
                                        aria-expanded="false"
                                        aria-controls="spirits-submenu"
                                        data-accordion-trigger>
                                    <x-icon.chevron-down class="header-nav__toggle-icon"
                                                         svg-class="header-nav__toggle-svg"/>
                                </button>
                                {{-- Toggle End --}}
                            </div>


                            {{-- Submenu Start --}}
                            <div class="header-nav__submenu"
                                 id="spirits-submenu"
                                 data-accordion-content
                                 aria-labelledby="spirits-submenu-trigger"
                                 aria-hidden="true">

                                <ul class="header-nav__submenu--level2">

                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Georgian Brandy
                                        </a>
                                    </li>
                                    <li>
                                        <a class="header-nav__submenu-link"
                                           href="">
                                            Chacha
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            {{-- Submenu End --}}
                        </li>

                    </ul>
                </div>
                {{-- Submenu End--}}


            </li>
            {{-- Products Menu End --}}


            {{-- News Menu Start --}}
            <li class="header-nav__item">
                <div class="header-nav__parent">
                    <a class="header-nav__link"
                       href="">
                        News
                    </a>
                </div>
            </li>
            {{-- News Menu Start --}}


            {{-- Contact Menu Start --}}
            <li class="header-nav__item"
                data-accordion-item>
                <div class="header-nav__parent"
                     data-accordion-header>
                    <a class="header-nav__link"
                       href="">
                        Contact
                    </a>


                    {{-- Toggle Start --}}
                    <button class="header-nav__toggle"
                            id="contact-submenu-trigger"
                            type="button"
                            aria-expanded="false"
                            aria-controls="contact-submenu"
                            data-accordion-trigger>
                        <x-icon.chevron-down class="header-nav__toggle-icon" svg-class="header-nav__toggle-svg"/>
                    </button>
                    {{-- Toggle End --}}
                </div>

                {{-- Submenu Start --}}
                <div class="header-nav__submenu"
                     id="contact-submenu"
                     data-accordion-content
                     aria-labelledby="contact-submenu-trigger"
                     aria-hidden="true">
                    <ul class="header-nav__submenu--level1"
                        data-accordion="single">

                        <li class="header-nav__submenu-item">
                            <div class="header-nav__submenu-parent">
                                <a class="header-nav__submenu-link"
                                   href="">
                                    FAQs
                                </a>
                            </div>
                        </li>

                    </ul>
                </div>
                {{-- Submenu End--}}


            </li>
            {{-- Contact Menu Start --}}

        </ul>
    </nav>
</div>


