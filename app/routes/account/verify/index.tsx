import { Center, Container, Title, Text, Button, Stack, Group } from "@mantine/core";
import { Form, useActionData, useSubmit, useTransition } from "@remix-run/react";
import { UserCheck } from "tabler-icons-react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { requireAuthInfo } from "~/utils/session.server";
import { checkUserVerification, sendUserVerificationEmail } from "auth";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";

export const loader: LoaderFunction = async ({ request }) => {
    const authInfo = await requireAuthInfo(request);

    const isVerified = await checkUserVerification(authInfo.idToken);

    if (isVerified) {
        return redirect("/home");
    }
    
    return null;
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
    
    const {type} = parsedFormData.data;
    
    if (type === "resend") {
        const authInfo = await requireAuthInfo(request);

        const isResend = await sendUserVerificationEmail(authInfo.idToken);
        
        return json<ActionData>({ isResend: isResend });
    } else {
        const authInfo = await requireAuthInfo(request);

        const isVerified = await checkUserVerification(authInfo.idToken);

        if (isVerified) {
            return redirect("/home");
        }

        return json<ActionData>({ isVerified: isVerified });
    }
}

export default function Verify() {
    const actionData = useActionData<ActionData>();
    const submit = useSubmit();
    const transition = useTransition();

    return (
        <Center sx={(theme) => ({
            width: "100vw",
            height: "100vh"
        })}>
            <Container size={"xs"}>
                <Stack align={"center"}>
                    <UserCheck size={96} />
                    
                    <Title mt={16} order={1}>Verify your account</Title>
                    <Text mt={16} align={"center"}>
                        We need to verify your account before continuing.
                        <br/> Check your email and click on the verification link sent to you.
                    </Text>
                    <Text color={(actionData?.isVerified ?? true) ? "" : "red"}>
                        {(actionData?.isVerified ?? true) ? "Once completed, press on the button below." : "You are still not verified. Try again."}
                    </Text>
                    
                    <Group>
                        <Button variant={"outline"} onClick={() => {
                            submit({type: "resend"}, {method: "post"})
                        }} disabled={transition.state === "submitting"}>Resend</Button>
                        
                        <Form method={"post"}>
                            <Button type={"submit"} disabled={transition.state === "submitting"}>Done</Button>
                        </Form>
                    </Group>
                </Stack>
            </Container>
        </Center>
    );
}