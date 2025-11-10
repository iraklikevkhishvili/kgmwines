<header class="header">
    <div class="header__inner">


        {{-- Menu Toggle Start --}}
        <div class="header__menu-toggle">
            <button
            class="header__toggle-open"
            id="header-menu-toggle-open"
            type="button"
            aria-label="Menu Toggle"
            >
                <span class="header__menu-toggle-open-icon-wrapper">
                    <span class="header__menu-toggle-open-icon"></span>
                </span>
            </button>
        </div>
        {{-- Menu Toggle End --}}


        @includeIf('layout.header.menu-toggle')
        @include('layout.header.logo')
        @include('layout.header.navigation')
        @include('layout.header.search')
    </div>
</header>
