<template>
  <div class="body">
    <NavbarComponent />
    <div class="outer-container" style="display: flex">
      <div class="personal-info">
        <div v-if="authState.isAuthenticated" class="container">
          <div>
            <img class="avatar-image" :src="avatarPreview" alt="Avatar Preview" />

            <p>Username: {{ username }}</p>
            <p>Email: {{ email }}</p>
            <p>Account Type: {{ authState.accountType }}</p>
          </div>
        </div>
        <div class="button-group">
          <button
            v-if="authState.isAuthenticated"
            type="button"
            class="btn btn-primary"
            @click="logout"
          >
            Log out
          </button>
          <button
            v-if="authState.isAuthenticated"
            type="button"
            class="btn btn-danger"
            @click="deleteAccount"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
    <div style="position: relative; top: 20%">
      <FooterComponent />
    </div>
  </div>
</template>

<script setup>
import FooterComponent from '@/components/FooterComponent.vue'
import NavbarComponent from '@/components/NavbarComponent.vue'
import { signOut, deleteUser } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { authState } from '@/store'
import { ref, onMounted } from 'vue'

const router = useRouter()
const username = ref('')
const email = ref('')
const avatarPreview = ref('')

const getUserDoc = async () => {
  if (authState.user) {
    email.value = authState.user.email

    if (authState.accountType === 'normal') {
      const userDocRef = doc(db, 'Users', authState.user.uid)
      try {
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          const data = userDocSnap.data()
          username.value = data.username || 'Anonymous'
          avatarPreview.value = data.avatarUrl || ''
        } else {
          console.error('User document does not exist!')
        }
      } catch (error) {
        console.error('Error fetching user document:', error)
      }
    } else if (authState.accountType === 'support') {
      const supDocRef = doc(db, 'Psychologists', authState.user.uid)
      try {
        const supDocSnap = await getDoc(supDocRef)
        if (supDocSnap.exists()) {
          const data = supDocSnap.data()
          username.value = data.username || 'Anonymous'
          avatarPreview.value = data.avatarUrl || ''
        } else {
          console.error('Psychologist document does not exist!')
        }
      } catch (error) {
        console.error('Error fetching psychologist document:', error)
      }
    }
  }
}

const logout = async () => {
  try {
    await signOut(auth)
    authState.user = null
    authState.isAuthenticated = false
    console.log('User signed out successfully')
    router.push({ name: 'home' })
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const deleteAccount = async () => {
  const user = auth.currentUser
  if (user) {
    try {
      await deleteUser(user)
      authState.user = null
      authState.isAuthenticated = false
      console.log('User account deleted successfully')
      router.push({ name: 'home' })
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        console.error('Error deleting account: Requires recent login')
        alert('Please log out and log back in, then try deleting your account again.')
      } else {
        console.error('Error deleting account:', error)
      }
    }
  }
}

onMounted(() => {
  getUserDoc()
})
</script>

<style scoped>
@media (min-width: 1200px) {
  .body {
    background-color: antiquewhite;
    height: 100vh;
    overflow: hidden;
  }
}

@media (max-width: 1199.8px) {
  .body {
    background-color: antiquewhite;
    height: 100vh;
    overflow-y: scroll;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.container {
  padding-top: 50px;
  padding-left: 30px;
}
.button-group {
  position: relative;
  display: flex;
  gap: 10px;
  padding-left: 30px;
  top: 35%;
}

.btn {
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger:hover {
  background-color: #c82333;
}

p {
  font-size: 1.5rem;
}

.avatar-image {
  width: 180px;
  height: 180px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  margin-bottom: 20px;
}
</style>
