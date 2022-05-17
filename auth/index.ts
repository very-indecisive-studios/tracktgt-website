import { initializeApp, getApp, FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";

function lazyInitialize() {
    try {
        getApp()
    } catch {
        const firebaseConfig = {
            apiKey: "AIzaSyC95uMd-vIbnYZyE8hYN76PwbR_xaoOaxM",
            authDomain: "vis-tracktgt.firebaseapp.com",
            projectId: "vis-tracktgt",
            storageBucket: "vis-tracktgt.appspot.com",
            messagingSenderId: "1053065189777",
            appId: "1:1053065189777:web:7542d160a0426324fe2230"
        };

        // Initialize Firebase
        initializeApp(firebaseConfig);
    }
}

export interface AuthResult {
    userId?: string;
    error?: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
    lazyInitialize();

    try {
        const userCredentials = await signInWithEmailAndPassword(getAuth(), email, password);

        return { userId: userCredentials.user.uid};
    } catch(err: any) {
        const code = (err as FirebaseError).code;
        
        let error = "Something went wrong. Try again later."
        
        let credentialsInvalidCodes = ["auth/user-not-found", "auth/wrong-password"];
        if (credentialsInvalidCodes.includes(code)) {
            error = "Email or password is incorrect!";
        }
        
        return { error: error }
    }
}

export async function register(email: string, password: string): Promise<AuthResult> {
    lazyInitialize();

    try {
        const userCredentials = await createUserWithEmailAndPassword(getAuth(), email, password);
        
        return { userId: userCredentials.user.uid};
    } catch(err: any) {
        let error = "Something went wrong. Try again later."
        
        return { error: error }
    }
}

export async function verifyHuman(captcha: string): Promise<boolean> {
    const response = await fetch("https://hcaptcha.com/siteverify", {
        method: "POST",
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            response: captcha,
            secret: process.env.HCAPTCHA_SECRET ?? ""
        })
    });
    
    const {success} = JSON.parse(await response.text());
    return success;
}
