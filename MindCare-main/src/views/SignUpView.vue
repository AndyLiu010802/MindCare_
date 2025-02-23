<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />

    <div class="container">
      <div class="row">
        <div class="col form-container">
          <h1 style="font-size: 3rem">Welcome to the MindCare community</h1>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <div v-if="avatarPreview" class="avatar-preview">
                <img :src="avatarPreview" alt="Avatar Preview" />
              </div>
              <label for="avatar">Profile Image</label>
              <input
                type="file"
                class="form-control"
                id="avatar"
                @change="onFileChange"
              />
              <div v-if="errors.avatar" class="text-danger">
                {{ errors.avatar }}
              </div>
            </div>
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                class="form-control"
                id="username"
                v-model="formData.username"
                @blur="() => validateUsername(true)"
              />
              <div v-if="errors.username" class="text-danger">
                {{ errors.username }}
              </div>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="formData.email"
                @blur="() => validateEmail(true)"
              />
              <div v-if="errors.email" class="text-danger">
                {{ errors.email }}
              </div>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                @blur="() => validatePassword(true)"
              />
              <div v-if="errors.password" class="text-danger">
                {{ errors.password }}
              </div>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                class="form-control"
                id="confirmPassword"
                v-model="formData.confirmPassword"
                @blur="() => validateConfirmPassword(true)"
              />
              <div v-if="errors.confirmPassword" class="text-danger">
                {{ errors.confirmPassword }}
              </div>
            </div>
            <div class="form-group">
              <label for="accountType">Account Type</label>
              <select
                class="form-control"
                id="accountType"
                v-model="formData.accountType"
                @blur="() => validateAccountType(true)"
              >
                <option value="normal">Normal User</option>
                <option value="support">Mental Health Support</option>
              </select>
              <div v-if="errors.accountType" class="text-danger">
                {{ errors.accountType }}
              </div>
            </div>
            <div v-if="formData.accountType === 'support'" class="form-group">
              <label for="license">
                License
                <span
                  class="tooltip-icon"
                  data-tooltip="Ahpra registration number"
                  >?</span
                >
              </label>
              <input
                type="text"
                class="form-control"
                id="license"
                v-model="formData.license"
              />
            </div>
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner-border text-light" role="status">
                <span class="sr-only"></span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary my-4 btn-login">
              Sign Up
            </button>
          </form>
        </div>
        <div class="col sec-col">
          <img :src="SignUpImg" alt="MindCare" class="img-fluid ppl-img" />
        </div>
      </div>
    </div>
    <FooterComponent />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import axios from "axios";
import NavbarComponent from "@/components/NavbarComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import SignUpImg from "@/assets/images/SignUpImg.png";
import { auth, db, storage } from "@/firebase";
import { authState } from "@/store";

const router = useRouter();
const isLoading = ref(false);

const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  accountType: "normal",
  license: "",
});

const errors = ref({
  avatar: null,
  username: null,
  email: null,
  password: null,
  confirmPassword: null,
  accountType: null,
});

const selectedFile = ref(null);
const avatarPreview = ref(null);

// Validation functions
const validateAvatar = (blur) => {
  if (!selectedFile.value) {
    if (blur) errors.value.avatar = "Please select an Profile Image.";
  } else if (!selectedFile.value.type.startsWith("image/")) {
    errors.value.avatar = "Please select a valid image file.";
  } else {
    errors.value.avatar = null;
  }
};

const onFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  validateAvatar(true);

  if (selectedFile.value) {
    avatarPreview.value = URL.createObjectURL(selectedFile.value);
  } else {
    avatarPreview.value = null;
  }
};

// Existing validation functions
const validateEmail = (blur) => {
  if (!formData.value.email) {
    if (blur) errors.value.email = "Email cannot be empty";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = "Invalid email format";
  } else {
    errors.value.email = null;
  }
};

const validatePassword = (blur) => {
  const passwordValue = formData.value.password;
  const minLength = 6;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);
  const hasSpecialChar = /[!@#$%^&*()_+[\]{};':"\\|,.<>/?]+/.test(
    passwordValue
  );

  if (passwordValue.length < minLength) {
    if (blur)
      errors.value.password = `Password must be at least ${minLength} characters long.`;
  } else if (!hasUppercase) {
    if (blur)
      errors.value.password =
        "Password must contain at least one uppercase letter.";
  } else if (!hasLowercase) {
    if (blur)
      errors.value.password =
        "Password must contain at least one lowercase letter.";
  } else if (!hasNumber) {
    if (blur)
      errors.value.password = "Password must contain at least one number.";
  } else if (!hasSpecialChar) {
    if (blur)
      errors.value.password =
        "Password must contain at least one special character.";
  } else {
    errors.value.password = null;
  }
};

const validateConfirmPassword = (blur) => {
  if (!formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = "Confirm password cannot be empty";
  } else if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) errors.value.confirmPassword = "Passwords do not match";
  } else {
    errors.value.confirmPassword = null;
  }
};

const validateUsername = (blur) => {
  if (!formData.value.username) {
    if (blur) errors.value.username = "Username cannot be empty";
  } else {
    errors.value.username = null;
  }
};

const validateAccountType = (blur) => {
  if (!formData.value.accountType) {
    if (blur) errors.value.accountType = "Account type cannot be empty";
  } else {
    errors.value.accountType = null;
  }
};

const submitForm = async () => {
  validateAvatar(true);
  validateEmail(true);
  validatePassword(true);
  validateConfirmPassword(true);
  validateUsername(true);
  validateAccountType(true);

  if (
    !errors.value.avatar &&
    !errors.value.email &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    !errors.value.username &&
    !errors.value.accountType
  ) {
    try {
      isLoading.value = true;

      const signInMethods = await fetchSignInMethodsForEmail(
        auth,
        formData.value.email
      );
      if (signInMethods.length > 0) {
        alert("This email is already in use. Please use a different email.");
        return;
      }

      if (formData.value.accountType === "normal") {
        // Create the user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.value.email,
          formData.value.password
        );
        const user = userCredential.user;

        // Upload avatar image to Firebase Storage
        let avatarUrl = null;
        if (selectedFile.value) {
          const storageReference = storageRef(
            storage,
            `avatars/${user.uid}/${selectedFile.value.name}`
          );
          await uploadBytes(storageReference, selectedFile.value);
          avatarUrl = await getDownloadURL(storageReference);
        }

        // Store user data in Firestore
        await setDoc(doc(db, "Users", user.uid), {
          username: formData.value.username,
          email: formData.value.email,
          accountType: formData.value.accountType,
          avatarUrl: avatarUrl,
        });

        // Update authState and navigate to home
        authState.user = user;
        authState.isAuthenticated = true;
        authState.accountType = formData.value.accountType;
        clearForm();
        router.push({ name: "home" });
      } else {
        await checkLicense();
      }
    } catch (error) {
      alert("There was an error creating the account. Please try again.");
    } finally {
      isLoading.value = false;
    }
  }
};

const clearForm = () => {
  formData.value.username = "";
  formData.value.email = "";
  formData.value.password = "";
  formData.value.confirmPassword = "";
  formData.value.accountType = "normal";
  formData.value.license = "";
  selectedFile.value = null;
};

// Check if the license number is valid
const checkLicense = async () => {
  if (!formData.value.license) {
    alert("Please enter a license number.");
    return;
  }

  try {
    const soapRequest = `
      <soap:Envelope
        xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
        xmlns:ns="http://ns.ahpra.gov.au/pie/xsd/common/CommonCoreElements/2.0.0"
        xmlns:ns1="http://ns.ahpra.gov.au/pie/svc/frs/FindRegistration/2.0.0"
        xmlns:ns2="http://ns.ahpra.gov.au/pie/xsd/frs/FindRegistrationMessages/2.0.0"
      >
        <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
          <ns:LoginDetails>
            <ns:UserId>piews-prod@amgen.org.au</ns:UserId>
            <ns:Password>xC#36kF$4</ns:Password>
          </ns:LoginDetails>
          <wsa:Action>
            http://ns.ahpra.gov.au/pie/svc/frs/FindRegistration/2.0.0/FindRegistrationPortType/FindRegistrationsRequest
          </wsa:Action>
          <wsa:To>
            https://ws2.ahpra.gov.au/pie/svc/PractitionerRegistrationSearch/2.0.0/FindRegistrationService.svc
          </wsa:To>
        </soap:Header>
        <soap:Body>
          <ns1:FindRegistrations>
            <ns2:ProfessionNumber>${formData.value.license}</ns2:ProfessionNumber>
          </ns1:FindRegistrations>
        </soap:Body>
      </soap:Envelope>
    `;

    const response = await axios.post(
      "/api/pie/svc/PractitionerRegistrationSearch/2.0.0/FindRegistrationService.svc",
      soapRequest,
      {
        headers: {
          "Content-Type": "application/soap+xml; charset=utf-8",
        },
      }
    );

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");

    const professionElement = xmlDoc.getElementsByTagName("Profession")[0];
    const registrationToDateElement =
      xmlDoc.getElementsByTagName("RegistrationToDate")[0];

    if (!professionElement || !registrationToDateElement) {
      alert("Unable to retrieve necessary data from the response.");
      return;
    }

    const profession = professionElement.textContent;
    const registrationToDate = registrationToDateElement.textContent;
    const currentDate = new Date();
    const expiryDate = new Date(registrationToDate);

    if (profession.includes("Psychologist")) {
      if (expiryDate >= currentDate) {
        // Create the user account
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.value.email,
          formData.value.password
        );
        const user = userCredential.user;

        // Upload avatar image to Firebase Storage
        let avatarUrl = null;
        if (selectedFile.value) {
          const storageReference = storageRef(
            storage,
            `avatars/${user.uid}/${selectedFile.value.name}`
          );
          await uploadBytes(storageReference, selectedFile.value);
          avatarUrl = await getDownloadURL(storageReference);
        }

        // Store data in 'Psychologists' collection
        await setDoc(doc(db, "Psychologists", user.uid), {
          username: formData.value.username,
          email: formData.value.email,
          accountType: formData.value.accountType,
          license: formData.value.license,
          avatarUrl: avatarUrl,
        });

        // Also store data in 'Users' collection
        await setDoc(doc(db, "Users", user.uid), {
          username: formData.value.username,
          email: formData.value.email,
          accountType: "normal",
          avatarUrl: avatarUrl,
        });

        authState.user = user;
        authState.isAuthenticated = true;
        authState.accountType = formData.value.accountType;
        clearForm();
        router.push({ name: "home" });
      } else {
        alert(
          "The license is valid and the profession is Psychologist, but the registration has expired."
        );
      }
    } else {
      alert("The profession associated with this license is not Psychologist.");
    }
  } catch (error) {
    alert(
      "There was an error validating the license. Make sure the license number is correct and email is valid."
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.body {
  height: 100vh;
  overflow-x: hidden;
  background-color: #5e91ce;
}
.form-container {
  margin-top: 4rem;
  color: white;
}

.btn-login {
  background: linear-gradient(to top, #072209, #0e3c1e, #1c6638);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 10px 40px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgb(61, 61, 61, 0.1);
}

.ppl-img {
  width: 70vh;
  height: auto;
  top: 20%;
  left: 20%;
  display: block;
  position: absolute;
}

.sec-col {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.tooltip-icon {
  position: relative;
  display: inline-block;
  margin-left: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: bold;
}

.tooltip-icon::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 5px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  font-size: 0.9rem;
  transition: opacity 0.3s;
  pointer-events: none;
}

.tooltip-icon:hover::after {
  opacity: 1;
  visibility: visible;
}

@media (max-width: 768px) {
  .ppl-img {
    display: none;
  }
  h1 {
    font-size: 2rem !important;
  }
  .sec-col {
    display: none;
  }
  .container {
    padding: 30px;
  }
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
@media (max-width: 1199.8px) {
  .body {
    overflow-y: scroll;
  }
  .ppl-img {
    width: 30vh;
    left: 15%;
  }
}
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

.avatar-preview {
  margin-top: 10px;
}

.avatar-preview img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
}
</style>
