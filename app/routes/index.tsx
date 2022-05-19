import { Button, Header, Image, Text, Title, Footer, Group, Box, Stack } from "@mantine/core";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "tabler-icons-react";
import { getUserId } from "~/utils/session.server";
import { ClientOnly } from "remix-utils";
import LandingHeroScene from "~/components/LandingHeroScene";

export const loader: LoaderFunction = async ({ request }) => {
    // Redirect to home if user is signed in.
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/home")
    }

    return null;
}

export function Content() {
	return (
		<>
			<Header fixed height={72} py="md" px="xl" sx={(theme) => ({
				background: "rgba(0, 0, 0, 0)",
				borderColor: "rgba(0, 0, 0, 0)"
			})}>
				<Group position="apart">
					<Image height={32} src="/logo.svg">tracktgt</Image>

					<Group>
						<Button component={Link} to="/account/login" variant="outline">Login</Button>
						<Button component={Link} to="/account/signup">Sign Up</Button>
					</Group>
				</Group>
			</Header>

			<Box sx={(theme) => ({
				height: "100vh",
				maxHeight: "720px",
				position: "relative"
			})}>
				<LandingHeroScene />
				
				<Box sx={(theme) => ({
					height: "100%",
					width: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.85)",
					backdropFilter: "blur(3px)",
					position: "relative"
				})}>
					<Stack mx={32} sx={(theme) => ({
						position: "absolute",
						bottom: "64px",
					})}>
						<Title order={1} sx={(theme) => ({
							fontSize: "64px",
							color: theme.colors.gray[0]
						})}>Keep track of all your<br/>books, shows and games.</Title>
	
						<Group mt={18} >
							<Button size={"lg"} variant={"outline"} sx={(theme) => ({
								width: "fit-content",
								color: theme.colors.gray[5],
								borderColor: theme.colors.gray[5],
							})}>Learn more</Button>
	
							<Button size={"lg"} component={Link} to="/signup" variant={"filled"} rightIcon={<ArrowRight size={20} />} sx={(theme) => ({
								width: "fit-content"
							})}>Get started</Button>
						</Group>
					</Stack>
				</Box>
			</Box>

			<Footer height={60} p="md">
				<Group>
					<Image width={32} height={32} src={"/vis.png"}  sx={() => ({
						cursor: "help"
					})} />
					<Text size={"sm"}>© Very Indecisive Studios, 2022 •  All rights reserved</Text>
				</Group>
			</Footer>
		</>
	);
}

export default function Index() {
	
	return (
		<ClientOnly>
			{() => <Content />}
		</ClientOnly>
	);
}
