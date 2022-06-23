import { Button, Group, NativeSelect, Title } from "@mantine/core";
import { Form } from "@remix-run/react";

export default function SettingsPricingTab() {
    return (
        <Form>
            <Title mt={32} order={2} sx={(theme) => ({
                color: theme.colors.gray[6]    
            })}>
                Nintendo Switch
            </Title>
            <NativeSelect
                mt={8}
                label={"EShop Region"}
                description={"The EShop region that will be used to fetch prices for your wishlists and when you're viewing pricing for a game."}
                data={[
                    { value: 'AU', label: 'Australia' },
                    { value: 'NZ', label: 'New Zealand' },
                    { value: 'GB', label: 'United Kingdom' },
                ]}
            />
            <Group mt={16} position={"right"}>
                <Button>Save Changes</Button>
            </Group>
        </Form>
    );
}