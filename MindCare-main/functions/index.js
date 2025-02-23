const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

const db = admin.firestore();
const {Storage} = require("@google-cloud/storage");
const storage = new Storage();

exports.fetchPsychologists = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const psychologistsRef = db.collection("Psychologists");
      const snapshot = await psychologistsRef.get();

      if (snapshot.empty) {
        res.status(404).send("No psychologists found.");
        return;
      }

      const psychologists = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({psychologists});
    } catch (error) {
      console.error("Error fetching psychologists:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

exports.fetchRatings = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {title} = req.query;

    if (!title) {
      return res.status(400).send("Error: title cannot be fetched.");
    }

    try {
      const docRef = db.collection("Rating").doc(title);
      const subCollectionRef = docRef.collection(title);
      const subCollectionSnapshot = await subCollectionRef.get();

      if (subCollectionSnapshot.empty) {
        return res.status(404).send("No ratings found.");
      }

      const fetchedRatings = [];

      for (const docSnap of subCollectionSnapshot.docs) {
        const ratingData = docSnap.data();
        let avatarUrl = "";

        if (ratingData.userId) {
          let userDocRef = db.collection("Users").doc(ratingData.userId);
          const userDoc = await userDocRef.get();

          if (!userDoc.exists) {
            userDocRef = db.collection("Psychologists").doc(ratingData.userId);
            const psychDoc = await userDocRef.get();
            if (psychDoc.exists) {
              avatarUrl = psychDoc.data().avatarUrl || "";
            }
          } else {
            avatarUrl = userDoc.data().avatarUrl || "";
          }
        }

        fetchedRatings.push({...ratingData, avatarUrl});
      }

      res.status(200).json({ratings: fetchedRatings});
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});

exports.submitRating = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {title, relatedLink, rating, username, comment, userId} = req.body;

    if (!title || !relatedLink || !rating || !username || !comment || !userId) {
      return res.status(400).send("Missing required fields.");
    }

    try {
      const docRef = db.collection("Rating").doc(title);
      const subCollectionRef = docRef.collection(title);
      const newDocRef = subCollectionRef.doc();

      await docRef.set({
        title,
      });
      await newDocRef.set({
        link: relatedLink,
        rating,
        username,
        comment,
        date: new Date().toISOString(),
        userId,
      });

      res.status(200).send("Rating submitted successfully.");
    } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).send("Internal Server Error");
    }
  });
});


exports.deleteUploadsFolder = functions.pubsub.schedule("every 168 hours")
    .onRun(async (context) => {
      const bucketName = process.env.FIREBASE_CONFIG.storageBucket;
      const bucket = storage.bucket(bucketName);
      const prefix = "upload/";

      try {
        const [files] = await bucket.getFiles({prefix});

        if (files.length === 0) {
          console.log("No files found to delete.");
          return null;
        }

        await Promise.all(files.map((file) => file.delete()));
        console.log("All files in /upload folder deleted successfully.");
      } catch (error) {
        console.error("Error deleting files:", error);
      }

      return null;
    });
