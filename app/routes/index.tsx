import { Button, Header, Image, Text, Title, useMantineTheme, createStyles, Autocomplete, Footer, Group, Center, Box, Stack } from "@mantine/core";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { ArrowRight } from "tabler-icons-react";
import { getUserId } from "~/utils/session.server";
import { InstancedMesh, Mesh, Object3D, TextureLoader, Vector3 } from "three";
import { Suspense, useMemo, useRef, useState } from "react";
import { ClientOnly } from "remix-utils";

export const loader: LoaderFunction = async ({ request }) => {
    // Redirect to home if user is signed in.
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/home")
    }

    return null;
}

interface MediaPostersProps {
	opp: boolean;
	xOffset: number;
	yOffset: number;
}

function MediaPosters({ opp, xOffset, yOffset }: MediaPostersProps) {
	const count = 17;
	const offset = 10;
	const speed = 0.2;
	
	const maps = useLoader(TextureLoader, ["/sample1.jpg", "/sample2.jpg", "/sample3.jpg", "/sample4.jpg"]);
	const ref = useRef<InstancedMesh>(null!);
	const object3D = useMemo<Object3D>(() => new Object3D(), []);
	const xPosArray = useMemo<Array<number>>(() => Array.from(Array(count).keys()).map(i => ((i - offset + xOffset) * 1.2)), []);

	useFrame((state, delta, frame) => {
		for (let i = 0; i < count; i++) {
			let xPos = xPosArray[i];
			
			if (opp) {
				if (xPos < -8) {
					let next = i - 1;
					if (next < 0) {
						next = count - 1
					}
					xPos = xPosArray[next] + 1.2;

				}
				xPosArray[i] = xPos + (-speed * delta);
			}
			else {
				if (xPos > 8) {
					let next = i + 1;
					if (next == count) { 
						next = 0
					}
					xPos = xPosArray[next] - 1.2;
					
				}
				xPosArray[i] = xPos + (speed * delta);
			}
						
			object3D.position.set(xPosArray[i], yOffset, 0)
			object3D.updateMatrix()
			ref.current.setMatrixAt(i, object3D.matrix)
			ref.current.instanceMatrix.needsUpdate = true
		}
	});

	return (
		<instancedMesh ref={ref} args={[null, null, count]} scale={[2.4, 3.6, 1]}>
			<planeGeometry />
			<meshBasicMaterial map={maps[(Math.floor(Math.random() * 4))]} />
		</instancedMesh>
	)
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
				<Canvas style={{
					height: "100%",
					position: "absolute"
				}} camera={{ position: [4, 0, 4], rotation: [0.25, 0.25, 0.25] }}>
					<Suspense fallback={null}>
						<MediaPosters opp={true} xOffset={0.75} yOffset={1.2} />
						<MediaPosters opp={false} xOffset={0} yOffset={0} />
						<MediaPosters opp={true} xOffset={0.75} yOffset={-1.2} />
					</Suspense>
				</Canvas>
				
				<Box sx={(theme) => ({
					height: "100%",
					width: "100%",
					backgroundColor: "rgba(0, 0, 0, 0.85)",
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
