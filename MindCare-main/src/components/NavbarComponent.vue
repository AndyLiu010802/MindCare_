<script setup>
import logo from "@/assets/logo.png";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { authState } from "@/store";


const isNavCollapsed = ref(true);
const route = useRoute();

const toggleNavbar = () => {
  isNavCollapsed.value = !isNavCollapsed.value;
};

const isActive = (path) => {
  return route.path === path ? "active" : "";
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand px-4" href="/">
      <img
        :src="logo"
        alt="Mind Care Logo"
        class="img-fluid"
        style="max-width: 100px; height: auto"
      />
    </a>
    <button
      class="navbar-toggler"
      type="button"
      @click="toggleNavbar"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div
      class="collapse navbar-collapse"
      :class="{ show: !isNavCollapsed }"
      id="navbarSupportedContent"
    >
      <ul class="navbar-nav d-flex justify-content-between w-100">
        <li class="nav-item w-50 d-none d-lg-block">
          <form class="form-inline my-2 my-lg-0 d-flex">
            <input
              class="form-control w-200"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button class="btn btn-outline-success ml-2" type="submit">
              Search
            </button>
          </form>
        </li>
        <div
          class="navbar-nav d-flex justify-content-between px-5 w-50 w-lg-50"
        >
          <li class="nav-item">
            <a :class="['nav-link', isActive('/resources')]" href="/resources"
              >Resources</a
            >
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="dropdownMenuButton"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Consultation
            </a>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a
                class="dropdown-item"
                href="/consultation"
                v-if="authState.accountType == 'normal'"
                >Therapists</a
              >
             
              <a
                v-if="authState.accountType == 'support'"
                class="dropdown-item"
                href="/management"
                >Management</a
              >
              <div
                class="dropdown-divider"
                v-if="authState.accountType == 'normal'"
              ></div>
              <a
                v-if="authState.accountType == 'normal'"
                class="dropdown-item"
                href="/map"
                >Map</a
              >
              <div v-if="authState.accountType == 'normal' || 'support'" class="dropdown-divider"></div>
              <a v-if="authState.accountType == 'normal' || 'support'" class="dropdown-item" href="/chat">Email</a>
            </div>
          </li>

          <li class="nav-item">
            <a :class="['nav-link', isActive('/profile')]" href="/profile"
              >Profile</a
            >
          </li>
        </div>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #caeaff !important;
}

.dropdown-menu {
  background-color: #eeffef !important;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 0;
}

.dropdown-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background-color: #d4edda;
  color: #000;
}

.nav-link,
.dropdown-toggle {
  color: #333 !important;
}

.nav-link:hover,
.dropdown-toggle:hover {
  color: #000 !important;
}

.active {
  text-decoration: underline;
  font-weight: bold;
  color: #2a412b !important;
}

.dropdown-toggle::after {
  margin-left: 0.25rem;
}
</style>
