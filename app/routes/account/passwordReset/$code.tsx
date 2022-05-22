import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import {
    checkPasswordResetCode,
    setPasswordReset,
} from "auth";
import { Button, Center, Container, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";

interface LoaderData {
    code: string;
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const code = params.code ?? "";
    const isValid = await checkPasswordResetCode(code);
    
    if (!isValid) {
        throw new Response("Not Found", {
            status: 404,
        });
    }
    
    return json<LoaderData>({
       code: code
    });
}

interface ActionData {
    password?: string;
    confirmPassword?: string;
    isFailed?: boolean;
}

export const action: ActionFunction = async ({ request }) => {
    let formData = Object.fromEntries(await request.formData());

    // Validate form.
    const formDataSchema = z
        .object({
            code: z.string(),
            password: z.string().min(6, "Password must be at least 6 characters."),
            confirmPassword: z.string().min(6, "Password must be at least 6 characters."),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match.",
            path: ["confirmPassword"]
        });

    const parsedFormData = formDataSchema.safeParse(formData);

    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    const { code, password } = parsedFormData.data;
    
    const isSuccess = await setPasswordReset(code, password);
    
    if (isSuccess) {
        return redirect("/account/login");
    }
    
    return json<ActionData>({
        isFailed: true
    });
}

export default function PasswordResetCode() {
    const loaderData = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    
    const transition = useTransition();
    
    return (
        <Center sx={(theme) => ({
            width: "100vw",
            height: "100vh"
        })}>
            <Container size={"xs"}>
                <Title mb={24} order={1}>Enter your new password</Title>
                <Form method="post">
                    <TextInput name="code" hidden defaultValue={loaderData.code} />
                    
                    <PasswordInput mt={16} name="password" label="Password" error={actionData?.password} />
                    <PasswordInput mt={16} name="confirmPassword" label="Confirm Password" error={actionData?.confirmPassword} />

                    <Text hidden={!(actionData?.isFailed)} color={"red"}>Something wrong happened. Try again later.</Text>

                    <Stack align={"end"}>
                        <Button fullWidth mt={16} type="submit" loading={transition.state === "submitting"}>Reset password</Button>
                    </Stack>
                </Form>
            </Container>
        </Center>
    );
}