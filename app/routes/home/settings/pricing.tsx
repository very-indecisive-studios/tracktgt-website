import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Button, Container, Group, NativeSelect, Title } from "@mantine/core";
import React from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { showNotification } from "@mantine/notifications";
import { Check } from "tabler-icons-react";
import { backendAPIClientInstance, UpdatePricingUserPreferenceCommand } from "backend";
import Motion from "~/components/home/Motion";

//region Server

interface LoaderData {
    eShopRegion: string;
    supportedEShopRegions: string[];
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    const userPrefsPricingResponse = await backendAPIClientInstance.user_GetPricingUserPreference(userId);
    
    const eShopRegionsResponse = await backendAPIClientInstance.price_GetSwitchGameStoreRegions();

    return json<LoaderData>({
        eShopRegion: userPrefsPricingResponse.result.eShopRegion,
        supportedEShopRegions: eShopRegionsResponse.result.regions
    });
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ message: "Method not allowed" }, 405);
    }
    
    const userId = await requireUserId(request);

    let formData = Object.fromEntries(await request.formData())
    
    // Validate form.
    const formDataSchema = z
        .object({
            eShopRegion: z.string(),
        });

    const parsedFormData = formDataSchema.safeParse(formData);
    if (!parsedFormData.success) {
        return badRequest(parsedFormData.error.flatten().fieldErrors);
    }

    await backendAPIClientInstance.user_UpdatePricingUserPreferenceCommand(new UpdatePricingUserPreferenceCommand({
        userRemoteId: userId,
        eShopRegion: parsedFormData.data.eShopRegion
    }));
    
    return null;
}

//endregion

//region Client

export default function SettingsPricing() {
    const isMobile = useMobileQuery();
    const loaderData = useLoaderData<LoaderData>();

    return (
        <Motion>
            <Container px={isMobile ? 4 : 16}>
                <Title mt={isMobile ? 16 : 0} mb={16} order={2} sx={(theme) => ({
                    color: theme.colors.gray[5]
                })}>
                    Pricing
                </Title>

                <Form method={"post"} replace>
                    <Title order={3} sx={(theme) => ({
                        color: theme.colors.gray[6]
                    })}>
                        Nintendo Switch
                    </Title>
                    <NativeSelect
                        name={"eShopRegion"}
                        mt={8}
                        label={"EShop Region"}
                        description={"The EShop region that will be used to fetch prices for your wishlists and when you're viewing pricing for a game."}
                        defaultValue={loaderData.eShopRegion}
                        data={loaderData.supportedEShopRegions}
                    />
                    <Group mt={16} position={"right"}>
                        <Button onClick={()=> {
                            showNotification({
                                title: 'Successfully saved your settings.',
                                message: `Your changes have been saved.`,
                                icon: <Check size={16}/>,
                                color: "green"
                            });
                        }} type={"submit"}>
                            Save Changes
                        </Button>
                    </Group>
                </Form>
            </Container>
        </Motion>
    );
}

//endregion