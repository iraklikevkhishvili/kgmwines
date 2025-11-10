@extends('layout.app')

@section('title')
    Test Page
@endsection

@push('styles')
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css"
    />
@endpush
@section('content')

    <section class="section">
        <div class="section__inner">
            @include('components.accordion')
        </div>
    </section>



    {{-- Swiper Start --}}
    <section class="section">
        <div class="section__inner">

            <div class="swiper-container-wrapper">
                <div class="swiper">
                    <!-- Additional required wrapper -->
                    <div class="swiper-wrapper swiper-wrapper1">
                        <!-- Slides -->
                        <div style="overflow: hidden" class="swiper-slide">Slide 1
                            <img
                                src="https://kgmwines.com/wp-content/uploads/Our-Vineyards-Grgich-Hills-Estate-Best-Vineyards-in-Napa.jpg"
                                alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 2
                            <img src="https://kgmwines.com/wp-content/uploads/Untitled_Artwork-5.webp" alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 3
                            <img src="https://picsum.photos/id/1000/1000/1000" alt="">
                        </div>
                    </div>

                    <div class="swiper-wrapper">
                        <!-- Slides -->
                        <div style="overflow: hidden" class="swiper-slide">Slide 1
                            <img
                                src="https://kgmwines.com/wp-content/uploads/Our-Vineyards-Grgich-Hills-Estate-Best-Vineyards-in-Napa.jpg"
                                alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 2
                            <img src="https://kgmwines.com/wp-content/uploads/Untitled_Artwork-5.webp" alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 3
                            <img src="https://picsum.photos/id/1000/1000/1000" alt="">
                        </div>
                    </div>

                    <div class="swiper-wrapper swiper-wrapper2">
                        <!-- Slides -->
                        <div style="overflow: hidden" class="swiper-slide">Slide 1
                            <img
                                src="https://kgmwines.com/wp-content/uploads/Our-Vineyards-Grgich-Hills-Estate-Best-Vineyards-in-Napa.jpg"
                                alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 2
                            <img src="https://kgmwines.com/wp-content/uploads/Untitled_Artwork-5.webp" alt=""></div>
                        <div style="overflow: hidden" class="swiper-slide">Slide 3
                            <img src="https://picsum.photos/id/1000/1000/1000" alt="">
                        </div>
                    </div>
                    <!-- If we need pagination -->
                    <div class="swiper-pagination"></div>

                    <!-- If we need navigation buttons -->
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>

                    <!-- If we need scrollbar -->
                    <div class="swiper-scrollbar"></div>
                </div>
            </div>

        </div>
    </section>
    {{-- Swiper End --}}


@endsection


@push('scripts')
    <script src="https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js"></script>
@endpush
