import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";
import { AuthInfo } from "auth";
import dayjs from "dayjs";

let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

let { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        name: "tracktgt_session",
        secure: true,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

export function getUserSession(request: Request) {
    return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request): Promise<string | null> {
    let session = await getUserSession(request);
    let userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function requireUserId(request: Request): Promise<string> {
    let userId = await getUserId(request);
    if (!userId) throw redirect("/account/login");
    return userId;
}

export async function getAuthInfo(request: Request): Promise<AuthInfo | null> {
    let session = await getUserSession(request);

    let userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;

    let expiresAt = session.get("expiresAt");
    let idToken = session.get("idToken");
    let refreshToken = session.get("refreshToken");
    let isVerified = Boolean(JSON.parse(session.get("isVerified")));

    return {
        userId: userId,
        expiresAt: expiresAt,
        idToken: idToken,
        refreshToken: refreshToken,
        isVerified: isVerified
    };
}

export async function requireAuthInfo(request: Request): Promise<AuthInfo> {
    const authInfo = await getAuthInfo(request);
    if (!authInfo) throw redirect("/account/login");
    return authInfo;
}

export async function hasValidAuthInfo(request: Request): Promise<boolean> {
    const authInfo = await requireAuthInfo(request);

    return dayjs().isBefore(dayjs(authInfo.expiresAt));
}

async function setUserSession(authInfo: AuthInfo): Promise<Session> {
    const session = await getSession();
    session.set("userId", authInfo.userId);
    session.set("expiresAt", authInfo.expiresAt);
    session.set("idToken", authInfo.idToken);
    session.set("refreshToken", authInfo.refreshToken);
    session.set("isVerified", authInfo.isVerified);

    return session;
}

export async function okWithUserSession(authInfo: AuthInfo) {
    const session = await setUserSession(authInfo);

    return new Response(null, {
        headers: {
            "Set-Cookie": await commitSession(session)
        },
    });
}

export async function jsonWithUserSession<T>(authInfo: AuthInfo, body: T | null) {
    const session = await setUserSession(authInfo);

    return new Response(JSON.stringify(body), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Set-Cookie": await commitSession(session)
        },
    });
}

export async function redirectWithUserSession(authInfo: AuthInfo, redirectTo: string) {
    const session = await setUserSession(authInfo);

    return redirect(redirectTo, {
        headers: { "Set-Cookie": await commitSession(session) },
    });
}

export async function removeUserSession(request: Request) {
    let session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
        headers: { "Set-Cookie": await destroySession(session) },
    });
}
