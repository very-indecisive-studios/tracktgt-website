import { Center, Container, Title, Text, Button, Stack } from "@mantine/core";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { UserCheck } from "tabler-icons-react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { checkUserVerification } from "auth";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserId(request);

    const isVerified = await checkUserVerification(user);

    if (isVerified) {
        redirect("/home");
    }
    
    return null;
}

interface ActionData {
    isVerified: boolean;
}

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUserId(request);
    
    const isVerified = await checkUserVerification(user);
    
    if (isVerified) {
        return redirect("/home");
    }
    
    return json<ActionData>({ isVerified: isVerified });
}

export default function Verify() {
    const actionData = useActionData<ActionData>();
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
                    
                    <Form method={"post"}>
                        <Button type={"submit"} loading={transition.state === "submitting"}>Done</Button>
                    </Form>
                </Stack>
            </Container>
        </Center>
    );
}