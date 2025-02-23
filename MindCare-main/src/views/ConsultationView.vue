<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />
    <h1 class="text-center mt-5">Consultation Team</h1>

    <div class="search-container">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search..."
        class="form-control"
      />
    </div>

    <table class="table">
      <thead>
        <tr>
          <th style="width: 50px"></th>
          <th></th>
          <th style="width: 50px"></th>
          <th @click="sortBy('username')">
            Name
            <span v-if="sortKey === 'username'">
              <i v-if="sortOrder === 'asc'">▲</i>
              <i v-else>▼</i>
            </span>
          </th>
          <th style="width: 50px"></th>
          <th class="email-vis">Email</th>
          <th style="width: 50px"></th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="psychologist in paginatedPsychologists"
          :key="psychologist.id"
        >
          <td style="width: 50px"></td>
          <td>
            <img
              :src="psychologist.avatarUrl"
              alt="Avatar"
              class="avatar-img"
            />
          </td>
          <td style="width: 50px"></td>
          <td>{{ psychologist.username }}</td>
          <td style="width: 50px"></td>
          <td class="email-vis">{{ psychologist.email }}</td>

          <td style="width: 550px"></td>

          <td>
            <button
              class="btn btn-primary btn-blue"
              @click="openCalendar(psychologist)"
            >
              Make an Appointment
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">
        Next
      </button>
    </div>

    <div v-if="showCalendar" class="modal">
      <div class="modal-content p-5">
        <span class="close" @click="closeCalendar">&times;</span>
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import NavbarComponent from "@/components/NavbarComponent.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


const psychologists = ref([]);
const searchTerm = ref("");
const sortKey = ref("username");
const sortOrder = ref("asc");
const currentPage = ref(1);
const pageItems = 10;

// Calendar
const showCalendar = ref(false);
const selectedPsychologist = ref(null);
const now = new Date();

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  weekends: true,
  events: [],
  selectable: true,
  select: handleSelect,
  slotDuration: "01:00:00",
  slotLabelInterval: "01:00",
  slotMinTime: "08:00:00",
  slotMaxTime: "18:00:00",
  allDaySlot: false,
  validRange: {
    start: now,
  },
  selectAllow: function (selectInfo) {
    return selectInfo.start >= now;
  },
});

const fetchPsychologists = async () => {
  try {
    const response = await fetch(
      "https://us-central1-mindcare-4e1aa.cloudfunctions.net/fetchPsychologists"
    );
    const data = await response.json();

    psychologists.value = data.psychologists;
    console.log(psychologists.value);
  } catch (error) {
    console.error("Error fetching psychologists:", error);
  }
};

const openCalendar = async (psychologist) => {
  selectedPsychologist.value = psychologist;
  showCalendar.value = true;
  await fetchAppointments();
};

const closeCalendar = () => {
  showCalendar.value = false;
  calendarOptions.value.events = [];
};

const fetchAppointments = async () => {
  if (!selectedPsychologist.value) return;
  const psychologistUid = selectedPsychologist.value.id;
  const docRef = doc(db, "consultation", psychologistUid);

  let appointments = [];

  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      appointments = data.appointments || [];
    } else {
      await setDoc(docRef, { appointments: [] });
    }

    calendarOptions.value.events = appointments
      .map((appointment) => {
        if (appointment && appointment.start && appointment.end) {
          return {
            title: "Booked",
            start: appointment.start.toDate(),
            end: appointment.end.toDate(),
            allDay: false,
          };
        } else if (appointment && appointment.toDate) {
          const start = appointment.toDate();
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          return {
            title: "Booked",
            start: start,
            end: end,
            allDay: false,
          };
        } else {
          console.error("Invalid appointment data:", appointment);
          return null;
        }
      })
      .filter((event) => event !== null);
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
};

const fetchCurrentUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No authenticated user found.");
    return null;
  }
  const docRef = doc(db, "Users", user.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.error("No such document for user:", user.uid);
    return null;
  }
};

async function handleSelect(selectionInfo) {
  if (!selectedPsychologist.value) return;

  const startDate = selectionInfo.start;
  const endDate = selectionInfo.end;
  const now = new Date(); 

  if (startDate < now) {
    alert("Cannot select a past time.");
    return;
  }

  const psychologistUid = selectedPsychologist.value.id;
  const docRef = doc(db, "consultation", psychologistUid);

  try {
    const docSnap = await getDoc(docRef);
    let appointments = [];

    if (docSnap.exists()) {
      const data = docSnap.data();
      appointments = data.appointments || [];
    } else {
      await setDoc(docRef, { appointments: [] });
    }

    const isOverlapping = appointments.some((appointment) => {
      let appointmentStart, appointmentEnd;

      if (appointment.start && appointment.end) {
        appointmentStart = appointment.start.toDate();
        appointmentEnd = appointment.end.toDate();
      } else if (appointment.toDate) {
        appointmentStart = appointment.toDate();
        appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000); // Default to 1-hour appointments
      } else {
        return false;
      }

      return (
        (startDate >= appointmentStart && startDate < appointmentEnd) ||
        (endDate > appointmentStart && endDate <= appointmentEnd) ||
        (startDate <= appointmentStart && endDate >= appointmentEnd)
      );
    });

    if (isOverlapping) {
      alert("This time slot overlaps with an existing appointment. Please choose another time.");
    } else {
      const userData = await fetchCurrentUserData();

      if (!userData) {
        alert("Error fetching user data. Please try again.");
        return;
      }

      const newAppointment = {
        username: userData.username,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
      };

      await updateDoc(docRef, {
        appointments: arrayUnion(newAppointment),
      });

      calendarOptions.value.events.push({
        title: "Booked",
        start: startDate,
        end: endDate,
        allDay: false,
      });

      alert("Appointment booked successfully!");
    }
  } catch (error) {
    console.error("Error handling appointment:", error);
    alert("An error occurred while booking the appointment. Please try again.");
  }
}



const filteredPsychologists = computed(() => {
  if (!searchTerm.value) {
    return psychologists.value;
  }
  return psychologists.value.filter((psychologist) => {
    return psychologist.username
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase());
  });
});

const sortedPsychologists = computed(() => {
  const psychologistsToSort = filteredPsychologists.value.slice();
  psychologistsToSort.sort((a, b) => {
    let modifier = 1;
    if (sortOrder.value === "desc") modifier = -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });
  return psychologistsToSort;
});

const totalPages = computed(() => {
  return Math.ceil(sortedPsychologists.value.length / pageItems);
});

const paginatedPsychologists = computed(() => {
  const start = (currentPage.value - 1) * pageItems;
  const end = start + pageItems;
  return sortedPsychologists.value.slice(start, end);
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchPsychologists();
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
  overflow-x: hidden;
  background-color: antiquewhite;
}

.search-container {
  margin-bottom: 15px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination button {
  margin: 0 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  position: relative;
  width: 80%;
  max-width: 800px;
}

.close {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem !important;
  }

  .container {
    padding: 30px;
  }

  .btn {
    color: #fff;
    border: none;
    border-radius: 50px;
    padding: 10px 40px;
    margin: 5px;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(61, 61, 61, 0.1);
  }

  .email-vis {
    display: none;
  }
}

@media (max-width: 1199.8px) {
  .body {
    overflow-y: scroll;
  }
}

.btn {
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 10px 40px;
  margin: 5px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(61, 61, 61, 0.1);
}

.btn-blue {
  background: cornflowerblue;
}

.btn-green {
  background: lightseagreen;
}
</style>
