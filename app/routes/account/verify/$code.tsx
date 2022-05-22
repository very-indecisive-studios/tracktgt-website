import { LoaderFunction } from "@remix-run/node";
import {
    setUserVerification
} from "auth";
import { Center, Container, Stack, Title, useMantineTheme } from "@mantine/core";
import { Link } from "@remix-run/react";
import { Check } from "tabler-icons-react";

export const loader: LoaderFunction = async ({ params, request }) => {
    const code = params.code ?? "";

    const isSuccess = await setUserVerification(code);
    if (!isSuccess) {
        throw new Response("Not Found", {
            status: 404,
        });
    }

    return null;
}

export default function PasswordResetCode() {
    const theme = useMantineTheme();

    return (
        <Center sx={(theme) => ({
            width: "100vw",
            height: "100vh"
        })}>
            <Container size={"xs"}>
                <Stack align={"center"}>
                    <Check size={96} />
                    
                    <Title mb={24} order={1} align={"center"}>Your account is verified.</Title>
                    <Link to={"/home"} style={{
                        color: theme.colors.indigo[6],
                        fontSize: theme.fontSizes.sm
                    }}>
                        Return back to app
                    </Link>
                </Stack>
            </Container>
        </Center>
    );
}
