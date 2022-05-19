import { Button, Header, Image, Text, Title, Footer, Group, Box, Stack, Container, Center } from "@mantine/core";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "tabler-icons-react";
import { getUserId } from "~/utils/session.server";
import { ClientOnly } from "remix-utils";
import LandingHeroScene from "~/components/LandingHeroScene";
import styles from "~/styles/index.css";
import { useEffect, useState } from "react";

export function links() {
	return [{rel: "stylesheet", href: styles}];
}

export const loader: LoaderFunction = async ({ request }) => {
    // Redirect to home if user is signed in.
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/home")
    }

    return null;
}

const LandingHeader = () => {
	const [overlayActive, setOverlayActive] = useState(false);
	
	useEffect(() => {
		const handleScroll = () => {
			setOverlayActive(window.scrollY > 72);
		};
		
		window.addEventListener("scroll", handleScroll, {
			passive: true
		});
		
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [])
	
	return (
		<Header fixed height={72} py="md" px="xl" sx={(theme) => ({
			transition: "background 0.5s ease-in-out",
			background: overlayActive ? "rgba(24, 24, 24, 0.8)": "rgba(0, 0, 0, 0)",
			backdropFilter: overlayActive ? "blur(3px)" : "",
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
	);
}

export function Content() {
	return (
		<main>
			<LandingHeader />

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
							<Button component={"a"} href={"#features"} size={"lg"} variant={"outline"} sx={(theme) => ({
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
			
			<Stack py={128} id="features">
				<Container>
					<Center>
						<Stack align={"center"}>
							<Image src={"/landing_tabs.png"} />
							<Title mt={32} order={1}>One browser tab is all you need</Title>
							<Text size={"lg"} align={"center"}>
								Say goodbye to Ctrl+Tab, tracktgt is your all-in-one companion
								<br/>for tracking your books, shows and games.
							</Text>
						</Stack>
					</Center>
				</Container>

				<Container mt={128}>
					<Center>
						<Stack align={"center"}>
							<Image src={"/landing_organize.png"} />
							<Title mt={32} order={1}>Never lose track and focus on what's next</Title>
							<Text size={"lg"} align={"center"}>
								Organize your queues, backlog, 'watch-later-more-like never' list intuitively
							</Text>
						</Stack>
					</Center>
				</Container>

				<Container mt={128}>
					<Center>
						<Stack align={"center"}>
							<Image src={"/landing_progress.png"} />
							<Title mt={32} order={1}>Track your progress</Title>
							<Text size={"lg"} align={"center"}>
								Update your books, shows and games progress so you will never have to rewind
							</Text>
						</Stack>
					</Center>
				</Container>
			</Stack>
			
			
			<Footer height={60} p="md">
				<Group px={16}>
					<Image width={32} height={32} src={"/vis.png"}  sx={() => ({
						cursor: "help"
					})} />
					<Text size={"sm"}>© Very Indecisive Studios, 2022 •  All rights reserved</Text>
				</Group>
			</Footer>
		</main>
	);
}

export default function Index() {
	return (
		<ClientOnly>
			{() => <Content />}
		</ClientOnly>
	);
}
