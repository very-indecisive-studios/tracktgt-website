import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { useMobileQuery } from "~/utils/hooks";
import { Button, Container, Group, NativeSelect, Title } from "@mantine/core";
import React from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { z } from "zod";
import { badRequest } from "~/utils/response.server";
import { showNotification, useNotifications } from "@mantine/notifications";
import { Check, TrashX } from "tabler-icons-react";

//region Server

interface LoaderData {
    eShopRegion: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    
    let userPrefsPricing = await db.userPrefsPricing.findFirst({
        where: {
            userId: userId
        }
    });
    
    if (!userPrefsPricing) {
        userPrefsPricing = await db.userPrefsPricing.create({
            data: {
                userId: userId,
                eShopRegion: "AU" 
            }
        })
    }

    return json<LoaderData>({
        eShopRegion: userPrefsPricing.eShopRegion
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

    await db.userPrefsPricing.update({
        where: {
            userId: userId
        },
        data: {
            eShopRegion: parsedFormData.data.eShopRegion
        }
    });
    
    return null;
}

//endregion

//region Client

export default function SettingsPricing() {
    const isMobile = useMobileQuery();
    const loaderData = useLoaderData<LoaderData>();

    return (
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
                    data={[
                        { value: 'AU', label: 'Australia' },
                        { value: 'NZ', label: 'New Zealand' },
                        { value: 'GB', label: 'United Kingdom' },
                    ]}
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
    );
}

//endregion