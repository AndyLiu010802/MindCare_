import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ResourcesView from "../views/ResourcesView.vue";
import ConsultationView from "../views/ConsultationView.vue";
import ProfileView from "../views/ProfileView.vue";
import ChatView from "../views/ChatView.vue";
import MapView from "../views/MapView.vue";
import ResourceDetailsView from "../views/ResourceDetailsView.vue";
import SignUpView from "../views/SignUpView.vue";
import ManagementView from "../views/ManagementView.vue";
import { authState } from "@/store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/resources", name: "resources", component: ResourcesView },
    {
      path: "/resource/:title",
      name: "ResourceDetails",
      component: ResourceDetailsView,
    },
    {
      path: "/consultation",
      name: "consultation",
      component: ConsultationView,
    },
    { path: "/profile", name: "profile", component: ProfileView },
    { path: "/chat", name: "chat", component: ChatView },
    { path: "/map", name: "map", component: MapView },
    { path: "/signup", name: "signup", component: SignUpView },
    { path: "/management", name: "management", component: ManagementView },
  ],
});

router.beforeEach((to, from, next) => {
  const protectedRoutes = [
    "profile",
    "chat",
    "appointment",
    "map",
    "consultation",
  ];
  const supportRoutes = ["management"];
  const normalRoutes = ["consultation", "map", "appointment"];

  if (protectedRoutes.includes(to.name) && !authState.isAuthenticated) {
    // Redirect to the login page
    next({ name: "signup" });
  } else if (
    supportRoutes.includes(to.name) &&
    authState.accountType !== "support"
  ) {
    next({ name: "home" });
  } else if (
    normalRoutes.includes(to.name) &&
    authState.accountType === "support"
  ) {
    next({ name: "home" });
  } else {
    next();
  }
});

// Keyboard navigation logic
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key >= 1 && event.key <= 9) {
    const routeMap = {
      1: "home",
      2: "resources",
      3: "consultation",
      4: "profile",
      5: "chat",
      6: "library",
      7: "map",
      8: "signup",
      9: "management",
    };


    const routeName = routeMap[event.key];

    if (routeName) {
      if (
        (authState.accountType === "normal" && routeName === "management") ||
        (authState.accountType === "support" &&
          (routeName === "consultation" || routeName === "map"))
      ) {
        return;
        } else {
        router.push({ name: routeName });
      }
    }
  }
});

export default router;