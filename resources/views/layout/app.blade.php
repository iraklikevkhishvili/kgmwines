<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>

    {{-- Meta Start --}}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    {{-- Meta End --}}


    {{-- Favicon Start --}}
    <link rel="icon" type="image/png" href="/static/favicon/favicon-96x96.png" sizes="96x96"/>
    <link rel="icon" type="image/svg+xml" href="/static/favicon/favicon.svg"/>
    <link rel="shortcut icon" href="/static/favicon/favicon.ico"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/apple-touch-icon.png"/>
    <link rel="manifest" href="/static/favicon/site.webmanifest"/>
    {{-- Favicon End}}


    {{-- Fonts Start --}}
    <link rel="preload" href="/static/fonts/asul-v21-latin-700.woff2" as="font" type="font/woff2"
          crossorigin="anonymous"/>
    <link rel="preload" href="/static/fonts/roboto-v47-latin-regular.woff2" as="font" type="font/woff2"
          crossorigin="anonymous"/>
    <link rel="preload" href="/static/fonts/roboto-v47-latin-600.woff2" as="font" type="font/woff2"
          crossorigin="anonymous"/>
    {{-- Fonts End --}}


    {{-- Title Start --}}
    <title>@yield('title') | {{ config('app.name', 'KGM Wines') }}</title>
    {{-- Title End --}}


    {{-- Styles Start --}}
    @vite(['resources/css/app.css', 'resources/scss/app.scss'])
    @stack('styles')
    {{-- Styles End --}}

</head>
<body>

<a href="#main" class="u-skip-link">Skip to main content</a>

{{--Header Start --}}
@includeif('layout.header')
{{-- Header End --}}


{{-- Main Content Start --}}
<main id="main" class="main">
    @yield('content')
</main>
{{-- Main Content End --}}


{{-- Footer Start --}}
@includeif('layout.footer')
{{-- Footer End --}}


{{-- Scripts Start --}}
@vite(['resources/js/app.js'])
@stack('scripts')
{{-- Scripts End --}}

</body>
</html>
