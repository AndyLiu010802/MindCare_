<template>
  <div class="card-container m-3" style="width: 20rem; height: 20rem">
    <div class="card-inner">
      <div class="card-front" :style="{ boxShadow: props.boxShadow }">
        <span
          class="color-bar d-flex justify-content-start card"
          :style="{ backgroundColor: props.color }"
        ></span>

        <div class="card-body p-3">
          <h5 class="card-title">{{ props.title }}</h5>
          <hr />
          <p class="card-text">
            {{ props.content }}
          </p>
        </div>
      </div>

      <div class="card-back" :style="{ boxShadow: props.boxShadow }">
        <a>
          <h1 class="card-link" :style="{ color: props.color }">{{ props.navTitle }}</h1>
          <img :src="image" alt="Card image" class="card-img" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import cardBackResource from '@/assets/cardBackResource.png'

// Define the props for the card component
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Default Title'
  },
  content: {
    type: String,
    required: true,
    default: 'Default content for the card.'
  },
  color: {
    type: String,
    required: false,
    default: '#f0ad4e'
  },
  image: {
    type: String,
    required: true,
    default: cardBackResource
  },
  navTitle: {
    type: String,
    required: true,
    default: 'MindCare'
  },
  boxShadow: {
    type: String,
    required: false,
    default: '0 4px 8px rgba(0, 0, 0, 0.1)'
  }
})
</script>

<style scoped>
.color-bar {
  width: 100%;
  height: 1.5rem;
  justify-self: flex-start;
  border-radius: 9px 9px 0 0;
}

.card-container {
  perspective: 1000px;
}

.card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  position: relative;
}

.card-container:hover .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
}

.card-front {
  background-color: #fff;
  z-index: 2;
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  background-color: #333;
}

.card-title {
  font-size: 1.5rem;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.card-link {
  font-size: 2.5rem;
  text-align: center;
  font-style: italic;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  text-shadow: 2px 2px 4px rgba(118, 118, 118, 0.5);
  cursor: pointer;
}
</style>
