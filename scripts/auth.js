import { app } from "./firebase.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const auth = getAuth(app);
const prrovider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    return await signInWithPopup(auth, prrovider);
}

export async function signOutUser() {
    return await signOut(auth);
}

export function watchAuthState(onChange) {
    return onAuthStateChanged(auth, onChange);
}
