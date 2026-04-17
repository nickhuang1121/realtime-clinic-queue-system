import { app } from "./firebase.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export const db = getFirestore(app);
