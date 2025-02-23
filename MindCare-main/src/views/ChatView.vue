<template>
  <div class="body">
    <NavbarComponent class="sticky-top" />
    <div class="email-form">
      <h1 v-if="authState.accountType == 'normal'" style="font-weight: 600; font-size: 2.5rem">
        Send an Email to Your Psychologist
      </h1>
      <h1 v-if="authState.accountType == 'support'" style="font-weight: 600; font-size: 2.5rem">
        Send an Email to Your Client
      </h1>
      <form @submit.prevent="sendEmail">
        <div class="form-group">
          <label for="from_name">Your Name:</label>
          <input
            type="text"
            id="from_name"
            v-model="emailData.from_name"
            placeholder="Enter your name"
            required
          />
        </div>
        <div class="form-group">
          <label for="to_name">Recipient Name:</label>
          <input
            type="text"
            id="to_name"
            v-model="emailData.to_name"
            placeholder="Enter recipient's name"
            required
          />
        </div>
        <div class="form-group">
          <label for="to_email">Recipient Email:</label>
          <input
            type="email"
            id="to_email"
            v-model="emailData.to_email"
            placeholder="Enter recipient's email"
            required
          />
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea
            id="message"
            v-model="emailData.message"
            placeholder="Enter your message"
            required
          ></textarea>
        </div>
        <div>
          <input type="file" @change="handleFileUpload" />
          <progress
            v-if="uploadProgress > 0"
            :value="uploadProgress"
            max="100"
          ></progress>
        </div>
        <button class="btn-send" type="submit" style="margin-top: 20px">
          Send Email
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { getAuth } from "firebase/auth";
import emailjs from "emailjs-com";
import { storage, db } from "../firebase";
import NavbarComponent from "@/components/NavbarComponent.vue";
import { authState } from "@/store";

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const selectedFile = ref(null);
const uploadProgress = ref(0);
const fileURL = ref("");

const emailData = reactive({
  from_name: "",
  from_email: "",
  to_name: "",
  to_email: "",
  message: "",
});

const auth = getAuth();
const user = auth.currentUser;
if (user) {
  emailData.from_email = user.email;
}

const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadFile = () => {
  return new Promise((resolve, reject) => {
    if (!selectedFile.value) {
      reject("No file selected!");
      return;
    }

    const fileRef = storageRef(storage, `uploads/${selectedFile.value.name}`);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile.value);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        uploadProgress.value =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        fileURL.value = url;

        try {
          await addDoc(collection(db, "files"), {
            name: selectedFile.value.name,
            url: fileURL.value,
            createdAt: new Date(),
          });
          resolve(url);
        } catch (error) {
          console.error("Error saving file metadata:", error);
          reject(error);
        }
      }
    );
  });
};

const sendEmail = async () => {
  try {
    let fileUrl = "";

    if (selectedFile.value) {
      fileUrl = await uploadFile();
      emailData.message += `\n\nAttachment: ${fileUrl}`;
    }

    const templateParams = {
      from_name: emailData.from_name,
      from_email: emailData.from_email,
      to_name: emailData.to_name,
      to_email: emailData.to_email,
      message: emailData.message,
      attachment_url: fileUrl,
    };

    await emailjs.send(
      "service_uur4q0o",
      "template_w42uyxq",
      templateParams,
      "AvP0neM1CNskMJv29"
    );
    emailData.from_name = "";
    emailData.to_name = "";
    emailData.message = "";
    selectedFile.value = null;
    uploadProgress.value = 0;
    fileURL.value = "";

    alert("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email or upload file:", error);
    alert("Failed to send email or upload file.");
  }
};
</script>

<style scoped>
.body {
  height: 100vh;
  overflow: hidden;
  background-color: antiquewhite;
}

.email-form {
  position: relative;
  height: 100vh;

  padding: 20px;
  background-color: #a4b0f4;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}

progress {
  width: 100%;
  height: 10px;

  margin-top: 10px;

  background-color: #7c7373;
}

.btn-send {
  background: linear-gradient(to top, #072209, #0e3c1e, #1c6638);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
}
</style>
