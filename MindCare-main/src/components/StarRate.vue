<template>
  <div class="form-group d-flex align-items-center">
    <label for="rating">Rate:</label>
    <div id="rating" class="star-rating p-2">
      <span
        v-for="star in stars"
        :key="star"
        class="star"
        :class="{ selected: star <= selectedRating }"
        @click="setRating(star)"
      >
        &#9733;
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    initialRating: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      selectedRating: this.initialRating,
      stars: [5, 4, 3, 2, 1]
    }
  },
  watch: {
    initialRating(newValue) {
      this.selectedRating = newValue
    }
  },
  methods: {
    setRating(star) {
      this.selectedRating = star
      this.$emit('rating-selected', star)
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.star {
  font-size: 2rem;
  color: lightgray;
  cursor: pointer;
  transition: color 0.2s;
}

.star:hover,
.star:hover ~ .star,
.star.selected,
.star.selected ~ .star {
  color: rgb(28, 152, 235);
}
</style>
