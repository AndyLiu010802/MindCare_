<template>
  <NavbarComponent class="sticky-top" />
  <div id="map" :style="{ width: '100%', height: '100vh' }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import NavbarComponent from '@/components/NavbarComponent.vue'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions'

const map = ref(null)
const geocoder = ref(null)

// Mapbox access token
mapboxgl.accessToken =
  'pk.eyJ1IjoiZm94d2hpdGUiLCJhIjoiY20yMXRwOHdwMDAxdzJqb2R6YXo0Y29mdCJ9.bht_4iCg4yf6rU9nW3SdTA'

onMounted(() => {
  // Initialize the map centered on Australia
  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [133.7751, -25.2744],
    zoom: 4
  })

  map.value.addControl(new mapboxgl.NavigationControl())

  initializeGeocoder()

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/cycling',
    alternatives: true,
    congestion: true
  })

  map.value.addControl(directions, 'top-left')

  directions.on('route', (e) => {
    console.log('Directions route:', e.route)
  })
})

onBeforeUnmount(() => {
  if (map.value) map.value.remove()
})

function initializeGeocoder() {
  if (geocoder.value) {
    map.value.removeControl(geocoder.value)
  }

  geocoder.value = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: true,
    placeholder: '     Search for places',
    proximity: { longitude: 133.7751, latitude: -25.2744 }
  })

  map.value.addControl(geocoder.value)

  geocoder.value.on('result', (e) => {
    console.log('Geocoder result:', e.result)
  })
}
</script>

<style>
@import 'mapbox-gl/dist/mapbox-gl.css';
@import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
@import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

#map {
  position: relative;
}

.mapboxgl-ctrl-geocoder {
  min-width: 300px;
}

@media (max-width: 768px) {
  .mapboxgl-ctrl-geocoder--input{
    display: none;
  }

  .mapboxgl-ctrl-geocoder--icon-search {
    display: none;
  }
}

</style>
