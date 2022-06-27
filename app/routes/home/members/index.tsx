import { Container, Title } from "@mantine/core";
import { LoaderFunction } from "@remix-run/node";
import { useMobileQuery } from "~/utils/hooks";
import { requireUserId } from "~/utils/session.server";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);
    
    return null;
}

//endregion

//region Client

export default function Games() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Members</Title>

        </Container>
    );
}
//endregion
