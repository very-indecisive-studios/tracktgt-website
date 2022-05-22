import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    
    const mode = url.searchParams.get("mode");
    const oobCode = url.searchParams.get("oobCode");
    
    if (mode === "verifyEmail") {
        return redirect(`/account/verify/${oobCode}`);
    } else if (mode === "resetPassword") {
        return redirect(`/account/passwordReset/${oobCode}`);
    } else {
        return redirect("/account/login");
    }
}
