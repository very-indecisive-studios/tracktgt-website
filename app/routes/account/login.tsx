import {
    Button,
    Center,
    Container, Divider,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
    useMantineTheme
} from "@mantine/core";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { z } from "zod";
import { getUserId, redirectWithUserSession } from "~/utils/session.server";
import { login, verifyHuman } from "auth";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { badRequest } from "~/utils/response.server";
import { LockOpen, Plus } from "tabler-icons-react";
import { useMobileQuery } from "~/utils/hooks";

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
    email?: string;
    password?: string;
    captcha?: string;
    formError?: string;
}

export const action: ActionFunction = async ({ request }) => {
    let formData = Object.fromEntries(await request.formData());

    // Validate form.
    const formDataSchema = z
        .object({
            email: z.string().email("Invalid email."),
            password: z.string().min(6, "Password must be at least 6 characters."),
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

    const { email, password } = parsedFormData.data;

    // Login with Firebase.
    const authResult = await login(email, password);

    if (!authResult.authInfo || authResult.error) {
        return ({ formError: authResult.error ?? "Error occured while logging in." });
    }

    return redirectWithUserSession(authResult.authInfo, "/home");
}

export default function Login() {
    const isMobile = useMobileQuery();
    
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
            <Container px={0} sx={() => ({
                width: 425
            })}>
                <Title mb={24} order={1}>Welcome back to TrackTogether</Title>
                <Form method="post">
                    <TextInput mt={16} name="email" label="Email address" type="email" error={actionData?.email}/>

                    <TextInput name="captcha" hidden defaultValue={captchaToken}/>
                    <PasswordInput mt={16} name="password" label="Password" error={actionData?.password}/>
                    
                    <Text>
                        <Link to={"/account/passwordReset"} style={{
                            color: theme.colors.indigo[6],
                            fontSize: theme.fontSizes.sm
                        }}>
                            Forget password?
                        </Link>
                    </Text>

                    <Stack mt={16} align={"center"}>
                        <HCaptcha
                            theme={"dark"}
                            sitekey={loaderData.captchaSitekey}
                            onVerify={(token, ekey) => handleVerificationSuccess(token, ekey)}
                        />
                    </Stack>
                    <Text hidden={!(actionData?.captcha)} color={"red"}>{actionData?.captcha}</Text>

                    <Text hidden={!(actionData?.formError)} color={"red"}>{actionData?.formError}</Text>

                    <Stack align={"end"}>
                        <Button fullWidth
                                leftIcon={<LockOpen size={18} />}
                                mt={16} 
                                type="submit"
                                loading={transition.state === "submitting"}>
                            Login
                        </Button>
                    </Stack>
                </Form>
                <Divider my={"md"} label={"or"} labelProps={{ size: "md" }} labelPosition={"center"}></Divider>
                <Button fullWidth
                        component={Link}
                        variant={"outline"}
                        to={"/account/signup"}
                        leftIcon={<Plus size={18} />}
                        mt={16}
                        disabled={transition.state === "submitting"}>
                    Create an account
                </Button>
            </Container>
        </Center>
    )
}