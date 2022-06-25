import { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Container, Title } from "@mantine/core";
import React from "react";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    return null;
}

//endregion

//region Client

export default function SettingsPricing() {
    const isMobile = useMobileQuery();

    return (
        <Container px={isMobile ? 4 : 16}>
            <Title mt={isMobile ? 16 : 0} mb={16} order={2} sx={(theme) => ({
                color: theme.colors.gray[5]
            })}>
                Account
            </Title>
            
        </Container>
    );
}

//endregion