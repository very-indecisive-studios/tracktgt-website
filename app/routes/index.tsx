import { Button, Header, Image, Text, Title, useMantineTheme, createStyles, Autocomplete, Footer, Group, Center, Box, Stack } from "@mantine/core";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "tabler-icons-react";
import { getUserId } from "~/utils/session.server";
import { Mesh, TextureLoader, Vector3 } from "three";
import { Suspense, useRef, useState } from "react";
import { ClientOnly } from "remix-utils";

export const loader: LoaderFunction = async ({ request }) => {
    // Redirect to home if user is signed in.
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/home")
    }

    return null;
}

function MediaPoster(props: JSX.IntrinsicElements['mesh']) {
	const map = useLoader(TextureLoader, "/sample1.jpg");
	const ref = useRef<Mesh>(null!);

	useFrame((state, delta, frame) => {
		ref.current.position.x = ref.current.position.x + 0.075 * delta * (props.opp ? -1 : 1)
	});

	return (
		<mesh ref={ref} scale={[2.4, 3.6, 1]} {...props}>
			<planeGeometry />
			<meshBasicMaterial map={map} />
		</mesh>
	)
}

export function Content() {

	return (
		<>
			<Header fixed height={72} py="md" px="xl" sx={(theme) => ({
				background: "rgba(0, 0, 0, 0.65)",
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
				<Canvas style={{
					height: "100%",
					position: "absolute"
				}} camera={{ position: [4, 0, 4], rotation: [0.25, 0.25, 0.25] }}>
					<Suspense fallback={null}>
						<MediaPoster position={[-9, 0, 0]} />
						<MediaPoster position={[-6, 0, 0]} />
						<MediaPoster position={[-3, 0, 0]} />
						<MediaPoster position={[0, 0, 0]} />
						<MediaPoster position={[3, 0, 0]} />
						<MediaPoster position={[6, 0, 0]} />
						<MediaPoster position={[9, 0, 0]} />						
						
						<MediaPoster position={[-9.25, 4, 0]} opp/>
						<MediaPoster position={[-6.25, 4, 0]} opp/>
						<MediaPoster position={[-3.25, 4, 0]} opp/>
						<MediaPoster position={[0.25, 4, 0]} opp/>
						<MediaPoster position={[3.25, 4, 0]} opp/>
						<MediaPoster position={[6.25, 4, 0]} opp/>
						<MediaPoster position={[9.25, 4, 0]} opp/>

						<MediaPoster position={[-9.25, -4, 0]} opp/>
						<MediaPoster position={[-6.25, -4, 0]} opp/>
						<MediaPoster position={[-3.25, -4, 0]} opp/>
						<MediaPoster position={[0.25,-4, 0]} opp/>
						<MediaPoster position={[3.25, -4, 0]} opp/>
						<MediaPoster position={[6.25, -4, 0]} opp/>
						<MediaPoster position={[9.25, -4, 0]} opp/>
					</Suspense>
				</Canvas>
				<Box sx={(theme) => ({
					height: "100%",
					width: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.8)",
					position: "relative"
				})}>
					<Stack mx={32} sx={(theme) => ({
						position: "absolute",
						bottom: "64px",
					})}>
						<Title order={1} sx={(theme) => ({
							fontSize: "64px",
							color: theme.colors.gray[2]
						})}>Keep track of all your<br/>books, shows and games.</Title>
	
						<Group mt={18} >
							<Button variant={"outline"} sx={(theme) => ({
								width: "fit-content",
								color: theme.colors.gray[5],
								borderColor: theme.colors.gray[5],
							})}>Learn more</Button>
	
							<Button component={Link} to="/signup" variant={"filled"} rightIcon={<ArrowRight size={20} />} sx={(theme) => ({
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
