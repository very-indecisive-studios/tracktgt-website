import { Button, Center, Container, Group, Stack, Text, Title } from "@mantine/core";
import { Form, useActionData, useSubmit, useTransition } from "@remix-run/react";
import { UserCheck } from "tabler-icons-react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
    hasValidAuthInfo,
    jsonWithUserSession,
    okWithUserSession,
    redirectWithUserSession,
    removeUserSession,
    requireAuthInfo
} from "~/utils/session.server";
import { checkUserVerification, refresh, sendUserVerificationEmail } from "auth";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
    let authInfo = await requireAuthInfo(request);

    const isAuthInfoValid = await hasValidAuthInfo(request);
    if (!isAuthInfoValid) {
        const authResult = await refresh(authInfo.refreshToken);

        if (!authResult.authInfo || authResult.error) {
            return await removeUserSession(request);
        }

        authInfo = authResult.authInfo;
    }

    if (authInfo.isVerified) {
        return redirectWithUserSession(authInfo, "/home");
    }

    return await okWithUserSession(authInfo);
}

interface ActionData {
    isVerified?: boolean;
    isResend?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
    let formData = Object.fromEntries(await request.formData());

    // Validate form.
    const formDataSchema = z
        .object({
            type: z.string().optional()
        });

    const parsedFormData = formDataSchema.safeParse(formData)
    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    let authInfo = await requireAuthInfo(request);

    const isAuthInfoValid = await hasValidAuthInfo(request);
    if (!isAuthInfoValid) {
        const authResult = await refresh(authInfo.refreshToken);

        if (!authResult.authInfo || authResult.error) {
            return await removeUserSession(request);
        }

        authInfo = authResult.authInfo;
    }

    const { type } = parsedFormData.data;
    if (type === "resend") {
        const isResend = await sendUserVerificationEmail(authInfo.idToken);

        return jsonWithUserSession<ActionData>(authInfo, { isResend: isResend });
    }

    const hasUserVerified = await checkUserVerification(authInfo.idToken);

    if (hasUserVerified) {
        const authResult = await refresh(authInfo.refreshToken);

        if (!authResult.authInfo || authResult.error) {
            return await removeUserSession(request);
        }

        authInfo = authResult.authInfo;

        return redirectWithUserSession(authInfo, "/home");
    }

    return await jsonWithUserSession<ActionData>(authInfo, { isVerified: false });
}

export default function Verify() {
    const actionData = useActionData<ActionData>();
    const submit = useSubmit();
    const transition = useTransition();
    
    const RESEND_LOCALSTORAGE_KEY = "RESEND_COOLDOWN";
    const RESEND_COOLDOWN_SECONDS = 120;
    const [resendCooldownIntervalId, setResendCooldownIntervalId] = useState(-1);
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
    useEffect(() => {
        const prevCooldown = window.localStorage.getItem(RESEND_LOCALSTORAGE_KEY);
        if (prevCooldown) {
            setResendCooldown(parseInt(prevCooldown));
        }
    }, []);
    useEffect(() => {
        if (resendCooldown === RESEND_COOLDOWN_SECONDS || resendCooldownIntervalId < 0) {
            setResendCooldownIntervalId(window.setInterval(() => {
                setResendCooldown((value) =>  {
                    const newValue = value - 1;
                    
                    window.localStorage.setItem(RESEND_LOCALSTORAGE_KEY, newValue.toString());
                    
                    return newValue;
                });
            }, 1000));
        } 
        
        if (resendCooldown === 0) {
            window.clearInterval(resendCooldownIntervalId);
        }
    }, [resendCooldown]);

    return (
        <Center sx={(theme) => ({
            width: "100vw",
            height: "100vh"
        })}>
            <Container size={"xs"}>
                <Stack align={"center"}>
                    <UserCheck size={96}/>

                    <Title mt={16} order={1}>Verify your account</Title>
                    <Text mt={16} align={"center"}>
                        We need to verify your account before continuing.
                        <br/> Check your email and click on the verification link sent to you.
                    </Text>

                    {!(actionData?.isVerified ?? true) && 
                        <Text color={"red"}>
                            You are still not verified. Try again.
                        </Text>}

                    {(actionData?.isResend ?? false) &&
                        <Text color={"orange"}>
                            We have resent email verification. Please check your spam as well.
                        </Text>}

                    <Group>
                        <Button color={"red"} onClick={() => {
                            submit(null, { method: "post", action: "/account/logout" });
                        }} disabled={transition.state === "submitting"}>
                            Logout
                        </Button>
                        
                        <Button variant={"outline"} onClick={() => {
                            submit({ type: "resend" }, { method: "post" })
                            setResendCooldown(RESEND_COOLDOWN_SECONDS);
                        }} disabled={transition.state === "submitting" || resendCooldown > 0}>
                            Resend{ resendCooldown > 0 ? ` (${resendCooldown}s)` : "" }
                        </Button>

                        <Form method={"post"}>
                            <Button type={"submit"} disabled={transition.state === "submitting"}>Done</Button>
                        </Form>
                    </Group>
                </Stack>
            </Container>
        </Center>
    );
}