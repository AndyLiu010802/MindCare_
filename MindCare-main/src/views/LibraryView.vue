<template>
  <div class="container">
    <div
      v-if="isLoading"
      class="d-flex justify-content-center align-items-center"
      style="height: 80vh"
    >
      <div class="spinner-border" role="status">
        <span class="sr-only loading-indicator"></span>
      </div>
    </div>

    <div v-else>
      <div class="row mb-4">
        <div class="col-12">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: searchType === 'title' }"
                @click="searchType = 'title'"
                >Search by Title</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: searchType === 'author' }"
                @click="searchType = 'author'"
                >Search by Author</a
              >
            </li>
          </ul>

          <input
            type="text"
            class="form-control mt-2"
            v-model="searchQuery"
            placeholder="Search..."
          />
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex">
            <div class="form-group mr-2">
              <label for="sortField">Sort By:</label>
              <select id="sortField" class="form-control" v-model="sortField">
                <option value="title">Title</option>
                <option value="first_publish_year">Publish Year</option>
              </select>
            </div>
            <div class="form-group">
              <label for="sortOrder">Order:</label>
              <select id="sortOrder" class="form-control" v-model="sortOrder">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="row align-items-stretch">
        <div v-for="book in sortedBooks" :key="book.key" class="col-12 col-sm-6 col-md-4 mb-4">
          <div class="card h-100">
            <img
              :src="
                book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                  : bookPlaceholder
              "
              class="card-img-top"
              alt="Book Cover"
            />
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ book.title }}</h5>
              <p class="card-text">
                <strong>Author:</strong>
                {{ book.author_name ? book.author_name.join(', ') : 'Unknown' }}<br />
                <strong>First Published:</strong>
                {{ book.first_publish_year || 'Unknown' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import bookPlaceholder from '@/assets/images/bookPlaceholder.png'

const books = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const searchType = ref('title')
const sortField = ref('title')
const sortOrder = ref('asc')

const query = 'psychology'
const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`

onMounted(async () => {
  try {
    isLoading.value = true
    const response = await fetch(url)
    const data = await response.json()
    books.value = data.docs
  } catch (error) {
    console.error('Error fetching books:', error)
  } finally {
    isLoading.value = false
  }
})

const filteredBooks = computed(() => {
  if (!searchQuery.value) {
    return books.value
  }
  return books.value.filter((book) => {
    if (searchType.value === 'title') {
      return book.title && book.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    } else if (searchType.value === 'author') {
      return (
        book.author_name &&
        book.author_name.some((author) =>
          author.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      )
    }
    return true
  })
})

// sorting the filtered books
const sortedBooks = computed(() => {
  let sorted = [...filteredBooks.value]
  sorted.sort((a, b) => {
    let fieldA = a[sortField.value]
    let fieldB = b[sortField.value]

    if (sortField.value === 'title') {
      fieldA = fieldA ? fieldA.toLowerCase() : ''
      fieldB = fieldB ? fieldB.toLowerCase() : ''
    } else if (sortField.value === 'first_publish_year') {
      fieldA = fieldA || 0
      fieldB = fieldB || 0
    }

    if (fieldA < fieldB) return sortOrder.value === 'asc' ? -1 : 1
    if (fieldA > fieldB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  return sorted
})
</script>
<style scoped>

.card-img-top {
  height: 200px;
  width: 100%;
  object-fit: cover;
}

* {
  font-weight: 500;
}

.nav-link {
  cursor: pointer;
}
</style>
