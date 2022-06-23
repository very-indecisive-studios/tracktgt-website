import { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Container, Tabs, Title } from "@mantine/core";
import tabStyles from "~/styles/tabStyles";
import { CurrencyDollar, User } from "tabler-icons-react";
import React from "react";
import SettingsPricingTab from "~/components/home/settings/SettingsPricingTab";

//region Server

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    return null;
}

//endregion

//region Client

export default function Shows() {
    const isMobile = useMobileQuery();

    return (
        <Container py={16} px={isMobile ? 4 : 16}>
            <Title mb={32} order={1}>Settings</Title>

            <Tabs grow
                  variant={"unstyled"}
                  styles={(theme) => tabStyles(theme, theme.colors.gray[8])}>
                {/*<Tabs.Tab label={isMobile ? "" : "User"}*/}
                {/*          icon={<User size={18}/>}>*/}
                {/*</Tabs.Tab>*/}
                <Tabs.Tab label={isMobile ? "" : "Pricing"}
                          icon={<CurrencyDollar size={18}/>}>
                    <SettingsPricingTab />
                </Tabs.Tab>
            </Tabs>
        </Container>
    );
}

//endregion