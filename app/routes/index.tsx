import { useMantineTheme } from "@mantine/core";
import { Button, Header, Image, Text, Title } from "@mantine/core";
import { ArrowRight } from "tabler-icons-react";
import styles from "~/styles/index.css";

export function links() {
	return [{ rel: "stylesheet", href: styles }];
}

function Hero() {
	const theme = useMantineTheme();

	return (
		<div className="index-hero">
			<div className="index-hero-content">
				<Title order={1} align="center">Never miss what you want to watch</Title>
				<Button mt={16} rightIcon={<ArrowRight size={18} />}>Get Started</Button>
			</div>
		</div>
	);
}

export default function Index() {
	return (
		<>
			<div className="index-header">
				<Header height={72} py="md" px="xl">
					<div className="index-header-container">
						<Image height={32} src="/logo.svg">tracktgt</Image>
					
						<div className="index-header-buttons">
							<Button variant="outline">Sign Up</Button>
							<Button>Login</Button>
						</div>
					</div>
				</Header>
			</div>

			<Hero/>
		</>
	);
}
