<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />
    <div class="d-flex justify-content-between align-items-center mt-5">
      <h1 class="text-center" style="margin-left: 30px;">Consultation Appointments</h1>
      <div class="button-container">
        <button @click="exportToCSV" class="btn btn-primary me-2">Export to CSV</button>
        
        <button v-if="selectedAppointments.length > 0" @click="sendBulkEmail" class="btn btn-secondary">Send Email</button>
      </div>
    </div>

    <div class="appointments-list-container">
      <div class="controls">
        <input v-model="searchTerm" type="text" placeholder="Search by username or email" class="form-control mb-3" />
        <select v-model="sortKey" class="form-select mb-3">
          <option value="username">Sort by Username</option>
          <option value="email">Sort by Email</option>
        </select>
      </div>

      <ul v-if="filteredAppointments.length > 0" class="list-group">
        <li v-for="(appointment, index) in paginatedAppointments" :key="index" class="list-group-item">
          <div class="d-flex align-items-center">
            <input type="checkbox" v-model="selectedAppointments" :value="appointment" class="form-check-input me-2" />
            <img :src="appointment.avatarUrl" alt="Avatar" class="avatar-img" />
            <div class="ms-3">
              <h5>{{ appointment.username }}</h5>
              <p>{{ appointment.email }}</p>
              <p>
                Start: {{ formatDate(appointment.start) }} <br />
                End: {{ formatDate(appointment.end) }}
              </p>
            </div>
          </div>
        </li>
      </ul>
      <p v-else>No appointments found.</p>

      <!-- Page Controls -->
      <div class="pagination-controls">
        <button @click="previousPage" :disabled="currentPage === 1" class="btn btn-secondary">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-secondary">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { doc, getDoc } from "firebase/firestore";
import NavbarComponent from "@/components/NavbarComponent.vue";
import { db } from "../firebase";
import { authState } from "@/store";
import Papa from "papaparse";
import emailjs from "emailjs-com";

const appointments = ref([]);
const searchTerm = ref("");
const sortKey = ref("username");
const currentPage = ref(1);
const itemsPerPage = 10;
const selectedAppointments = ref([]); // To track selected appointments

const formatDate = (timestamp) => {
  return timestamp.toDate().toLocaleString();
};

const fetchAppointments = async () => {
  const currentUser = authState.user;
  console.log("Current User:", currentUser);
  if (!currentUser) {
    console.error("No user found");
    return;
  }

  const docRef = doc(db, "consultation", currentUser.uid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      appointments.value = data.appointments || [];
    } else {
      console.log("No appointments found.");
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

const filteredAppointments = computed(() => {
  return appointments.value.filter((appointment) =>
    appointment.username.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    appointment.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const sortedAppointments = computed(() => {
  return [...filteredAppointments.value].sort((a, b) => {
    if (sortKey.value === "start" || sortKey.value === "end") {
      return new Date(a[sortKey.value]) - new Date(b[sortKey.value]);
    }
    return a[sortKey.value].localeCompare(b[sortKey.value]);
  });
});

const totalPages = computed(() => {
  return Math.ceil(sortedAppointments.value.length / itemsPerPage);
});

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedAppointments.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Export to CSV function
const exportToCSV = () => {
  const csvData = appointments.value.map(appointment => ({
    Username: appointment.username,
    Email: appointment.email,
    Start: formatDate(appointment.start),
    End: formatDate(appointment.end),
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "appointments.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Send Bulk Email function using EmailJS
const sendBulkEmail = () => {
  selectedAppointments.value.forEach(appointment => {
    const templateParams = {
      to_name: appointment.username,
      to_email: appointment.email,
      message: `This is a reminder for your consultation appointment starting at ${formatDate(appointment.start)} and ending at ${formatDate(appointment.end)}.`
    };

    emailjs.send('service_uur4q0o', 'template_w42uyxq', templateParams, 'AvP0neM1CNskMJv29')
      .then(response => {
        console.log('SUCCESS!', response.status, response.text);
      })
      .catch(error => {
        console.error('FAILED...', error);
      });
  });
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.body {
  height: 100vh;
  background-color: antiquewhite;
  overflow-x: hidden;
}

.appointments-list-container {
  padding: 20px;
}

.list-group-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-controls button {
  margin: 0 10px;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
