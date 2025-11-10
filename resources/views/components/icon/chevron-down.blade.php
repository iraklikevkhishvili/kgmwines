{{-- resources/views/components/icon/chevron-down.blade.php --}}
@props([
    'svgClass' => '',          // extra classes for the <svg>
    'strokeWidth' => 2,        // override stroke width if needed
    'decorative' => true,      // keep icon hidden from AT by default
])

<span {{ $attributes }}>
  <svg class="{{ $svgClass }}"
       style="fill: none;"
       xmlns="http://www.w3.org/2000/svg"
       viewBox="0 0 24 24"
       stroke="currentColor"
       stroke-width="{{ $strokeWidth }}"
       stroke-linecap="round"
       stroke-linejoin="round"
       @if($decorative) aria-hidden="true" role="presentation" focusable="false" @endif
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
</span>
