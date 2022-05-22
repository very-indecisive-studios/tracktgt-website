import dayjs from "dayjs";

const serviceConfig = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG as string
);

export interface AuthInfo {
    userId: string;
    idToken: string;
    expiresAt: string;
    refreshToken: string;
}

export interface AuthResult {
    authInfo?: AuthInfo;
    error?: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
        })
    });
    
    const responseBody = JSON.parse(await response.text())
    if (responseBody.error) {
        let error = "Something went wrong. Try again later.";
        
        if (["EMAIL_NOT_FOUND", "INVALID_PASSWORD"].includes(responseBody.error.message)) {
            error = "Email or password is incorrect ";
        }
        return { error: error};
    }
    
    return {
        authInfo: {
            userId: responseBody.localId,
            idToken: responseBody.idToken,
            expiresAt: dayjs().add(responseBody.expiresIn, "seconds").toISOString(),
            refreshToken: responseBody.refreshToken,
        }
    };
}

export async function register(email: string, password: string): Promise<AuthResult> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
        })
    });

    const responseBody = JSON.parse(await response.text())
    if (responseBody.error) {
        let error = "Something went wrong. Try again later.";
        
        return { error: error};
    }

    return {
        authInfo: {
            userId: responseBody.localId,
            idToken: responseBody.idToken,
            expiresAt: dayjs().add(responseBody.expiresIn, "seconds").toISOString(),
            refreshToken: responseBody.refreshToken,
        }
    };  
}

export async function refreshIdToken(refreshToken: string): Promise<AuthResult> {
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        })
    });

    const responseBody = JSON.parse(await response.text())
    if (responseBody.error) {
        return { error: "Sign in again."};
    }

    return {
        authInfo: {
            userId: responseBody.user_id,
            idToken: responseBody.id_token,
            expiresAt: dayjs().add(responseBody.expires_in, "seconds").toISOString(),
            refreshToken: responseBody.refresh_token,
        }
    };
}

export async function sendPasswordResetEmail(email: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: email
        })
    });

    return response.ok;
}

export async function checkPasswordResetCode(code: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oobCode: code
        })
    });

    const responseBody = JSON.parse(await response.text())
    return !responseBody.error;
}

export async function setPasswordReset(code: string, newPassword: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oobCode: code,
            newPassword: newPassword
        })
    });

    const responseBody = JSON.parse(await response.text())
    return !responseBody.error;
}

export async function checkUserVerification(idToken: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            idToken: idToken
        })
    });

    const responseBody = JSON.parse(await response.text())
    if (responseBody.error) {
        return false;
    }

    return responseBody.users[0].emailVerified;
}

export async function sendUserVerificationEmail(idToken: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken: idToken
        })
    });

    const responseBody = JSON.parse(await response.text())
   console.log(responseBody)

    return response.ok;
}

export async function setUserVerification(code: string): Promise<boolean> {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${serviceConfig.apiKey}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oobCode: code
        })
    });

    const responseBody = JSON.parse(await response.text())
    return !responseBody.error;
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
