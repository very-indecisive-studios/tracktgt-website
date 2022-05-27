import { Button, Center, Container, Stack, Text, TextInput, Title, useMantineTheme } from "@mantine/core";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { getUserId } from "~/utils/session.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { sendPasswordResetEmail, verifyHuman } from "auth";

interface LoaderData {
    captchaSitekey: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    // Redirect to home if user is signed in.
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/home")
    }

    return json<LoaderData>({
        captchaSitekey: process.env.HCAPTCHA_SITEKEY ?? ""
    });
}

interface ActionData {
    isEmailSent?: boolean;
    email?: string;
    captcha?: string;
    formError?: string;
}

export const action: ActionFunction = async ({ request }) => {
    let formData = Object.fromEntries(await request.formData());

    // Validate form.
    const formDataSchema = z
        .object({
            email: z.string().email("Invalid email."),
            captcha: z.string().nonempty("Please complete human verification.")
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    const { captcha } = parsedFormData.data;
    const success = await verifyHuman(captcha);
    if (!success) {
        return ({ formError: "Human verification failed. Try again later." });
    }

    const { email } = parsedFormData.data;

    // Login with Firebase.
    await sendPasswordResetEmail(email);

    return json<ActionData>({
        isEmailSent: true
    });
}

export default function PasswordReset() {
    const loaderData = useLoaderData<LoaderData>()
    const actionData = useActionData<ActionData>()
    const transition = useTransition()

    const theme = useMantineTheme();

    const [captchaToken, setCaptchaToken] = useState("");
    const handleVerificationSuccess = (token: string, ekey: string) => {
        setCaptchaToken(token);
    };

    return (
        <Center sx={(theme) => ({
            width: "100vw",
            height: "100vh"
        })}>
            <Container size={"xs"}>
                <Title mb={24} order={1}>Reset your password</Title>
                <Form method="post">
                    <TextInput mt={16} name="email" label="Email address" type="email" error={actionData?.email}/>

                    <TextInput name="captcha" hidden defaultValue={captchaToken}/>
                    <Stack mt={32} align={"center"}>
                        <HCaptcha
                            sitekey={loaderData.captchaSitekey}
                            onVerify={(token, ekey) => handleVerificationSuccess(token, ekey)}
                        />
                    </Stack>
                    <Text hidden={!(actionData?.captcha)} color={"red"}>{actionData?.captcha}</Text>

                    <Text hidden={!(actionData?.formError)} color={"red"}>{actionData?.formError}</Text>

                    <Text hidden={actionData?.isEmailSent === undefined} color={"green"}>
                        Email has been sent to reset your password!
                    </Text>

                    <Stack align={"end"}>
                        <Button mt={16} type="submit" loading={transition.state === "submitting"}>Reset</Button>
                    </Stack>
                </Form>
            </Container>
        </Center>
    );
}