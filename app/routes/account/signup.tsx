import { Button, Center, Container, createStyles, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { createUserSession, getUserId } from "~/utils/session.server";
import { register, sendUserVerificationEmail, verifyHuman } from "auth";
import { z } from "zod";
import { backendAPIClientInstance, BackendAPIException, RegisterUserCommand } from "backend";
import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { badRequest } from "~/utils/response.server";

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
    userName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    captcha?: string;
    formError?: string;
}

export const action: ActionFunction = async ({ request }) => {
    let formData = Object.fromEntries(await request.formData());
    
    // Validate form.
    const formDataSchema = z
        .object({
            userName: z.string(),
            email: z.string().email("Invalid email."),
            password: z.string().min(6, "Password must be at least 6 characters."),
            confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
            captcha: z.string().nonempty("Please complete human verification.")
        })
        .refine((data) => data.password === data.confirmPassword, { 
            message: "Passwords don't match.",
            path: ["confirmPassword"]
        });
    
    const parsedFormData = formDataSchema.safeParse(formData);
    
    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    const {captcha} = parsedFormData.data;
    const success = await verifyHuman(captcha);
    if (!success) {
        return ({formError: "Human verification failed. Try again later."});
    }
    
    const { email, password, userName } = parsedFormData.data;

    // Validate user name and email with server.
    try {
        const backendResult = await backendAPIClientInstance.user_CheckUserExist(
            userName,
            email,
        );

        if (backendResult.status !== 200) {
            return ({ formError: backendResult.result ?? "Error occured while registering." });
        }
        
        const { isUserNameTaken, isEmailTaken } =  backendResult.result;
        
        if (isUserNameTaken || isEmailTaken) {
            return {
                userName: isUserNameTaken ? "Username taken." : null,
                email: isEmailTaken ? "Email taken." : null
            }
        }
    } catch(err) {
        const backendError = err as BackendAPIException

        return ({ formError: backendError.result ?? "Error occured while registering." });
    }
    
    // Register with Firebase.
    const authResult = await register(email, password);
    
    if (!authResult.authInfo || authResult.error) {
        return ({ formError: authResult.error ?? "Error occured while registering." });
    } 
    
    await sendUserVerificationEmail(authResult.authInfo.idToken);
    
    // Register with server.
    try {
        const backendResult = await backendAPIClientInstance.user_RegisterUser(new RegisterUserCommand({
            userRemoteId: authResult.authInfo.userId,
            email: email,
            userName: userName,
        }));

        if (backendResult.status === 200) {
            return createUserSession(authResult.authInfo, "/account/verify");    
        }

        return ({ formError: backendResult.result ?? "Error occured while registering." });

    } catch(err) {
        const backendError = err as BackendAPIException

        return ({ formError: backendError.result ?? "Error occured while registering." });
    }
}

export default function SignUp() {
    const loaderData = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>()
    const transition = useTransition()

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
                <Title mb={24} order={1}>Create a tracktgt account</Title>
                <Form method="post">
                    <TextInput name="captcha" hidden defaultValue={captchaToken} />

                    <TextInput name="userName" label="Username" type="text" error={actionData?.userName}/>
                    <TextInput mt={16} name="email" label="Email address" type="email" error={actionData?.email}/>
                    <PasswordInput mt={16} name="password" label="Password" error={actionData?.password} />
                    <PasswordInput mt={16} name="confirmPassword" label="Confirm Password" error={actionData?.confirmPassword} />
                    
                    <Stack mt={16} align={"center"}>
                        <HCaptcha
                            sitekey={loaderData.captchaSitekey}
                            onVerify={(token, ekey) => handleVerificationSuccess(token, ekey)}
                        />
                    </Stack>
                    <Text hidden={!(actionData?.captcha)} color={"red"}>{actionData?.captcha}</Text>

                    <Text hidden={!(actionData?.formError)} color={"red"}>{actionData?.formError}</Text>
                    
                    <Stack align={"end"}>
                        <Button mt={16} type="submit" loading={transition.state === "submitting"}>Sign up</Button>
                    </Stack>
                </Form>
            </Container>
        </Center>
    );
}