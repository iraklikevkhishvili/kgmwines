@extends('layout.app')


{{-- Title Start --}}
@section('title')
    Main
@endsection
{{-- Title End --}}


{{-- Styles Start --}}
@push('styles')
    @vite(['resources/scss/pages/home.scss'])
@endpush
{{-- Styles End --}}


{{-- Main Content Start --}}
@section('content')

    <section class="section section--hero">
        <div class="hero__inner">
            <div class="hero__media">
                <img src="{{ config('app.url', 'http://localhost:8080') }}/static/media/images/jpg.avif"
                     alt="hero image"
                     class="hero__image">
            </div>
            <div class="hero__content">
                <h1 class="hero__title u-h1">
                    awards
                </h1>
                <h2 class="hero__subtitle u-h4">
                    Celebrating Excellence in Every Bottle
                </h2>
                <p class="hero__paragraph u-p">
                    Our awards reflect a dedication to tradition, innovation, and quality winemaking. Each accolade
                    honors the passion behind every vintage. Explore our journey of excellence and discover the
                    recognition our wines have earned around the world.
                </p>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="section__inner">
            <div class="accordion" data-accordion="single" style="margin-bottom: 100px;">
                <details class="accordion__item">
                    <summary class="accordion__header" id="acc-sum-1">
                        <span class="accordion__title u-h6">Title 1</span>
                        <span class="accordion__chevron" aria-hidden="true"></span>
                    </summary>

                    <div class="accordion__content" role="region" aria-labelledby="acc-sum-1">
                        <div class="accordion__content-inner">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, quibusdam.</p>
                        </div>
                    </div>
                </details>
                <details class="accordion__item">
                    <summary class="accordion__header" id="acc-sum-1">
                        <span class="accordion__title u-h6">Title 1</span>
                        <span class="accordion__chevron" aria-hidden="true"></span>
                    </summary>

                    <div class="accordion__content" role="region" aria-labelledby="acc-sum-1">
                        <div class="accordion__content-inner">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat, quibusdam.</p>
                        </div>
                    </div>
                </details>

            </div>


            @include('components.accordion')


            {{-- Accordion Start --}}
            <div class="accordion"
                 data-accordion="single"
                 role="group"
                 aria-label="Accordion"
                 style="margin-top: 100px;">

                {{-- Acordion Item Start --}}
                <div class="accordion__item" data-accordion-item>
                    <div class="accordion__header"
                         role="heading"
                         aria-level="3">
                        <button class="accordion__header-button"
                                id="accordion-button-1"
                                type="button"
                                aria-expanded="false"
                                aria-controls="accordion-content-1"
                                data-accordion-trigger>
                            <span class="accordion__title u-h6">
                                Title 1
                            </span>
                        </button>
                    </div>
                    <div class="accordion__content"
                         id="accordion-content-1"
                         role="region"
                         aria-labelledby="accordion-button-1"
                         aria-hidden="true"
                         data-accordion-content>
                        <div class="accordion__content-inner">
                            <p>
                                Dark ruby with a captivating depth, hinting at the wine’s rich, layered character.
                            </p>
                            <div>
                                <img src="https://kgmwines.com/wp-content/uploads/elegant-wine-spill-stockcake.jpg">
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Acordion Item End --}}

                {{-- Acordion Item Start --}}
                <div class="accordion__item" data-accordion-item>
                    <div class="accordion__header"
                         role="heading"
                         aria-level="3">
                        <button class="accordion__header-button"
                                id="accordion-button-2"
                                type="button"
                                aria-expanded="false"
                                aria-controls="accordion-content-2"
                                data-accordion-trigger>
                            <span class="accordion__title u-h6">
                                Title 2
                            </span>
                        </button>
                    </div>
                    <div class="accordion__content"
                         id="accordion-content-2"
                         role="region"
                         aria-labelledby="accordion-button-2"
                         aria-hidden="true"
                         data-accordion-content>
                        <div class="accordion__content-inner">
                            <p>
                                Dark ruby with a captivating depth, hinting at the wine’s rich, layered character.
                            </p>
                            <div>
                                <img src="https://kgmwines.com/wp-content/uploads/elegant-wine-spill-stockcake.jpg">
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Acordion Item End --}}

                {{-- Acordion Item Start --}}
                <div class="accordion__item" data-accordion-item>
                    <div class="accordion__header"
                         role="heading"
                         aria-level="3">
                        <button class="accordion__header-button"
                                id="accordion-button-3"
                                type="button"
                                aria-expanded="false"
                                aria-controls="accordion-content-3"
                                data-accordion-trigger>
                            <span class="accordion__title u-h6">
                                Title 3
                            </span>
                        </button>
                    </div>
                    <div class="accordion__content"
                         id="accordion-content-3"
                         role="region"
                         aria-labelledby="accordion-button-3"
                         aria-hidden="true"
                         data-accordion-content>
                        <div class="accordion__content-inner">
                            <p>
                                Dark ruby with a captivating depth, hinting at the wine’s rich, layered character.
                            </p>
                            <div>
                                <img src="https://kgmwines.com/wp-content/uploads/elegant-wine-spill-stockcake.jpg">
                            </div>
                        </div>
                    </div>
                </div>
                {{-- Acordion Item End --}}
            </div>
            {{-- Accordion End --}}
        </div>
    </section>
@endsection
{{-- Main Content End --}}


{{-- Scripts Start --}}
@push('scripts')
    @vite(['resources/js/pages/home.js'])
@endpush
{{-- Scripts End --}}
