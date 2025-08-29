import { extendTheme } from '@chakra-ui/react';
import { globalStyles } from './styles';
import { breakpoints } from './foundations/breakpoints';
import { buttonStyles } from './components/button';
import { badgeStyles } from './components/badge';
import { linkStyles } from './components/link';
import { drawerStyles } from './components/drawer';
import { CardComponent } from './additions/card/Card';
import { CardBodyComponent } from './additions/card/CardBody';
import { CardHeaderComponent } from './additions/card/CardHeader';
import { MainPanelComponent } from './additions/layout/MainPanel';
import { PanelContentComponent } from './additions/layout/PanelContent';
import { PanelContainerComponent } from './additions/layout/PanelContainer';
// import { mode } from "@chakra-ui/theme-tools";
const colors = {
	brand: {
		50: '#FFF3E9',
		100: '#FFE0C2',
		200: '#FFCC9C',
		300: '#FFB975',
		400: '#FFA54F',
		500: '#FF8D28',
		600: '#E6781F',
		700: '#BF6017',
		800: '#994A10',
		900: '#73350A'
	}
};

const components = {
	Button: {
		defaultProps: { colorScheme: 'brand' }
	},
	Badge: {
		defaultProps: { colorScheme: 'brand' }
	}
};

export default extendTheme(
	{ breakpoints, colors, components }, // Breakpoints and brand colors
	globalStyles,
	buttonStyles, // Button styles
	badgeStyles, // Badge styles
	linkStyles, // Link styles
	drawerStyles, // Sidebar variant for Chakra's drawer
	CardComponent, // Card component
	CardBodyComponent, // Card Body component
	CardHeaderComponent, // Card Header component
	MainPanelComponent, // Main Panel component
	PanelContentComponent, // Panel Content component
	PanelContainerComponent // Panel Container component
);
