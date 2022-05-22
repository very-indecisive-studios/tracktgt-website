import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { AuthInfo, checkUserVerification } from "auth";

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

export async function getUserId(request: Request): Promise<string|null> {
	let session = await getUserSession(request);
	let userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function getAuthInfo(request: Request): Promise<AuthInfo|null> {
	let session = await getUserSession(request);

	let userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;

	let expiresAt = session.get("expiresAt");
	let idToken = session.get("idToken");
	let refreshToken = session.get("refreshToken");
	
	return {
		userId: userId,
		expiresAt: expiresAt,
		idToken: idToken,
		refreshToken: refreshToken
	};
}

export async function requireUserId(request: Request) {
	let session = await getUserSession(request);
	let userId = session.get("userId");
	if (!userId || typeof userId !== "string") throw redirect("/account/login");
	return userId;
}

export async function requireAuthInfo(request: Request) {
	const authInfo = await getAuthInfo(request);
	if (!authInfo) throw redirect("/account/login");
	return authInfo;
}

export async function removeUserSession(request: Request) {
	let session = await getSession(request.headers.get("Cookie"));
	return redirect("/account/login", {
		headers: { "Set-Cookie": await destroySession(session) },
	});
}

export async function setUserSession(authInfo: AuthInfo) {
	let session = await getSession();
	session.set("userId", authInfo.userId);
	session.set("expiresAt", authInfo.expiresAt);
	session.set("idToken", authInfo.idToken);
	session.set("refreshToken", authInfo.refreshToken);
	return new Response(null, {
		headers: { "Set-Cookie": await commitSession(session) },
	});
}

export async function createUserSession(authInfo: AuthInfo, redirectTo: string) {
	let session = await getSession();
	session.set("userId", authInfo.userId);
	session.set("expiresAt", authInfo.expiresAt);
	session.set("idToken", authInfo.idToken);
	session.set("refreshToken", authInfo.refreshToken);
	return redirect(redirectTo, {
		headers: { "Set-Cookie": await commitSession(session) },
	});
}
