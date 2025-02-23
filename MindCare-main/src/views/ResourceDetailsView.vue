<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />
    <div class="row">
      <div class="col-md-2 col-sm-6 col-xs-12 menu-container">
        <div class="link-container mt-5 ps-3">
          <a class="return-a" @click="navigateToResource">Go back</a>
        </div>
        <div class="vertical-line"></div>
      </div>
      <div class="col-md-9 col-sm-6 col-xs-12 mb-2 resource-details">
        <h1>{{ title }}</h1>
        <p>{{ explaination[title] }}</p>
        <div v-if="loading">
          <p>Loading...</p>
        </div>
        <div v-else>
          <div v-if="relatedLink">
            <div class="d-flex justify-content-between">
              <div class="sub-title">View the recommended website:</div>
              <button @click="fetchOtherLink" class="btn btn-primary btn-refresh">
                Get a new link
              </button>
            </div>
            <a :href="relatedLink" class="mr-5" target="_blank">{{ relatedLink }}</a>
            <div id="averageRating"></div>
          </div>
          <div v-else>
            <p>Could not load the website. Please try again later.</p>
          </div>
          <div class="divider"></div>
          <div
            v-if="authState.isAuthenticated"
            class="d-flex justify-content-between px-4 align-items-center send-rating"
          >
            <div class="d-flex align-items-center">
              <img :src="userAvatarUrl" alt="Avatar" class="avatar-image" />
              <div>{{ userName }}</div>
            </div>
            <div>
              <StarRate :initialRating="resetRatingValue" @rating-selected="onRatingSelected" />
            </div>
            <div class="form-group d-flex align-items-center">
              <label for="comment">Comment:</label>
              <textarea class="form-control m-2" id="comment" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-refresh" @click="submitRating">
              Submit
            </button>
          </div>
          <div v-if="authState.isAuthenticated" class="divider"></div>

          <div v-for="(rating, index) in ratings" :key="index" class="rating-item mt-4">
            <div>
              <div id="rating" class="star-rating d-flex justify-content-end p-2">
                <span v-for="star in 5" :key="star" class="star">
                  <span
                    v-if="star <= rating.rating"
                    :style="{
                      color: star <= rating.rating ? 'rgb(28, 152, 235)' : 'lightgray',
                      fontSize: '1.5rem'
                    }"
                    >&#9733;</span
                  >

                  <span
                    v-else
                    :style="{
                      fontSize: '1.5rem'
                    }"
                    >&#9734;</span
                  >
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <img :src="rating.avatarUrl" alt="Avatar" class="avatar-image" />
                  <strong>{{ rating.username }}</strong>
                </div>

                <a :href="rating.link" target="_blank" rel="noopener noreferrer">
                  <button class="btn btn-primary btn-refresh">Open Link</button>
                </a>
              </div>
              <div>{{ rating.comment }}</div>
              <div class="text-secondary">{{ rating.date }}</div>
              <div class="text-secondary">{{ rating.link }}</div>
              <div class="divider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavbarComponent from '@/components/NavbarComponent.vue'
import { authState } from '@/store'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import StarRate from '@/components/StarRate.vue'
import explaination from '@/assets/explaination.json'
const route = useRoute()
const title = ref(route.params.title)
const relatedLink = ref('')
const loading = ref(true)
const router = useRouter()
const userName = ref('')
const rating = ref(0)
const resetRatingValue = ref(0)
const ratings = ref([])
const userAvatarUrl = ref('')

const navigateToResource = () => {
  router.push({ name: 'resources' })
}

async function getCurrentUserName() {
  if (authState.user) {
    let userDocRef
    if (authState.accountType === 'normal') {
      userDocRef = doc(db, 'Users', authState.user.uid)
    } else if (authState.accountType === 'support') {
      userDocRef = doc(db, 'Psychologists', authState.user.uid)
    }

    if (userDocRef) {
      try {
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          const userData = userDoc.data()
          userName.value = userData.username || 'Anonymous'
          userAvatarUrl.value = userData.avatarUrl || ''
        }
      } catch (error) {
        console.error('Error fetching user document:', error)
      }
    }
  }
}

const fetchGoogleSearchLink = async (query) => {
  const url = `https://google-search74.p.rapidapi.com/?query=${encodeURIComponent(query)}&limit=10&related_keywords=true`
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '41a6fc23dcmsh243b757ae06a351p17d0fbjsn55ac9d37ee0a',
      'x-rapidapi-host': 'google-search74.p.rapidapi.com'
    }
  }

  try {
    const response = await fetch(url, options)
    const result = await response.json()
    console.log('Google Search API Response:', result)

    if (result && result.results && result.results.length > 0) {
      const randomIndex = Math.floor(Math.random() * result.results.length)
      return result.results[randomIndex].url
    } else {
      console.error('No search results found.')
      return null
    }
  } catch (error) {
    console.error('Error fetching Google search link:', error)
    return null
  }
}

const fetchOtherLink = async () => {
  relatedLink.value = await fetchGoogleSearchLink(title.value + ' mental health')
  fetchAverageRating(relatedLink.value)
}

const fetchAverageRating = async (link) => {
  await fetchRatings()

  const matchedRatings = ratings.value.filter((rating) => rating.link === link)
  if (matchedRatings.length > 0) {
    const totalScore = matchedRatings.reduce((sum, rating) => sum + rating.rating, 0)
    const averageRating = totalScore / matchedRatings.length

    document.getElementById('averageRating').textContent =
      `Average Rating: ${averageRating.toFixed(2)}`
  } else {
    document.getElementById('averageRating').textContent = 'No ratings found for this link'
  }
}


const fetchRatings = async () => {
  if (!title.value) {
    console.error('Error: title.value is undefined or empty.');
    return;
  }

  try {
    const response = await fetch(`https://us-central1-mindcare-4e1aa.cloudfunctions.net/fetchRatings?title=${title.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ratings.');
    }

    const data = await response.json();
    ratings.value = data.ratings || [];
  } catch (error) {
    console.error('Error fetching ratings:', error);
  }
};

const submitRating = async () => {
  try {
    const response = await fetch(`https://us-central1-mindcare-4e1aa.cloudfunctions.net/submitRating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.value,
        relatedLink: relatedLink.value,
        rating: rating.value,
        username: userName.value,
        comment: document.getElementById('comment').value,
        userId: authState.user.uid,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit rating.');
    }

    // Clear the input field
    document.getElementById('comment').value = '';
    resetRatingValue.value = 0;

    // Fetch updated ratings and average rating
    await fetchRatings();
    await fetchAverageRating(relatedLink.value);
  } catch (error) {
    console.error('Error submitting rating:', error);
  }
};


const onRatingSelected = (value) => {
  rating.value = value
}

onMounted(async () => {
  relatedLink.value = await fetchGoogleSearchLink(title.value + ' mental health')
  await getCurrentUserName()
  await fetchRatings()
  loading.value = false

  fetchAverageRating(relatedLink.value)
})
</script>

<style scoped>
.body {
  height: 100vh;
  background-color: antiquewhite;
  overflow: hidden;
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.sub-title {
  font-size: 1.2rem;
  color: #5e91ce;
}
.menu-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
}

.link-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-style: italic;
  font-size: 1.5rem;
}

.return-a {
  color: #5e91ce;
  text-decoration: none;
  cursor: pointer;
}

.vertical-line {
  width: 1px;
  height: 100vh;
  background-color: #5e91ce;
  margin: 0 auto;
}

.resource-details {
  padding: 20px;
  overflow-y: scroll;
  height: 80vh;
}

.btn-refresh {
  background: linear-gradient(to top, #104a4e, #2a9ca7, #92dae8);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgb(61, 61, 61, 0.1);
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #5e91ce;
  margin-top: 20px;
}

@media (max-width: 1199.8px) {
  .vertical-line {
    display: none;
  }

  .body {
    height: 100vh;
    background-color: antiquewhite;
  }

  .link-container {
    font-size: 1.2rem;
  }

  .menu-container {
    display: flex;
    height: auto;
    justify-content: space-between;
  }

  .send-rating {
    flex-direction: column;
    align-items: center;
  }

  .btn-refresh {
    background: linear-gradient(to top, #104a4e, #2a9ca7, #92dae8);
    color: #fff;
    border: none;
    border-radius: 50px;
    font-size: 0.7rem;
    cursor: pointer;
    box-shadow: 0 4px 8px rgb(61, 61, 61, 0.1);
  }
}
</style>
