import * as firebaseClient from "firebase/app";
import * as firebaseClientAuth from "firebase/auth";
import * as firebaseAdmin from "firebase-admin/app";
import * as firebaseAdminAuth from "firebase-admin/auth";

function lazyInitializeClient() {
    try {
        firebaseClient.getApp()
    } catch {
        const serviceConfig = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG as string
        );
        
        // Initialize Firebase client
        firebaseClient.initializeApp(serviceConfig);
    }
}

function lazyInitializeAdmin() {
    if (firebaseAdmin.getApps().length === 0) {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
        );
        
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
    }
}

export interface AuthResult {
    userId?: string;
    error?: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
    lazyInitializeClient();

    try {
        const userCredentials = await firebaseClientAuth.signInWithEmailAndPassword(firebaseClientAuth.getAuth(), email, password);

        return { userId: userCredentials.user.uid};
    } catch(err: any) {
        const code = (err as firebaseClient.FirebaseError).code;
        
        let error = "Something went wrong. Try again later."
        
        let credentialsInvalidCodes = ["auth/user-not-found", "auth/wrong-password"];
        if (credentialsInvalidCodes.includes(code)) {
            error = "Email or password is incorrect!";
        }
        
        return { error: error }
    }
}

export async function register(email: string, password: string): Promise<AuthResult> {
    lazyInitializeClient();

    try {
        const userCredentials = await firebaseClientAuth.createUserWithEmailAndPassword(firebaseClientAuth.getAuth(), email, password);
        
        await firebaseClientAuth.sendEmailVerification(userCredentials.user);
        
        return { userId: userCredentials.user.uid};
    } catch(err: any) {
        let error = "Something went wrong. Try again later."
        
        return { error: error }
    }
}

export async function passwordReset(email: string): Promise<boolean> {
    lazyInitializeClient();

    try {
        await firebaseClientAuth.sendPasswordResetEmail(firebaseClientAuth.getAuth(), email);
        
        return true;
    } catch (err: any) {
        return false;
    }
}

export async function checkUserVerification(userId: string): Promise<boolean> {
    lazyInitializeAdmin();
    
    try {
        const userRecord = await firebaseAdminAuth.getAuth().getUser(userId);
        
        return userRecord.emailVerified;
    } catch (err: any) {
        return false;
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
