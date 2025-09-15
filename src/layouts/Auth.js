// chakra imports
import { Box, ChakraProvider, Portal } from '@chakra-ui/react';
import Footer from 'components/Footer/Footer.js';
// core components
import AuthNavbar from 'components/Navbars/AuthNavbar.js';
import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import routes from 'routes.js';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import theme from 'theme/theme.js';

export default function Pages(props) {
	const { ...rest } = props;
	const wrapper = React.createRef();
	
	// Check if user is already authenticated and redirect them
	const token = localStorage.getItem('token');
	const userString = localStorage.getItem('user');
	const user = userString ? JSON.parse(userString) : null;
	
	// If user is authenticated, redirect to their dashboard
	if (token && user) {
		if (user.user_role === 'factory') {
			return <Redirect to="/factory/dashboard" />;
		} else {
			return <Redirect to="/admin/dashboard" />;
		}
	}

	useEffect(() => {
		document.body.style.overflow = 'unset';
	}, []);

	const getActiveRoute = (routes) => {
		let activeRoute = 'Default Brand Text';
		for (let i = 0; i < routes.length; i++) {
			if (routes[i].collapse) {
				let collapseActiveRoute = getActiveRoute(routes[i].views);
				if (collapseActiveRoute !== activeRoute) {
					return collapseActiveRoute;
				}
			} else if (routes[i].category) {
				let categoryActiveRoute = getActiveRoute(routes[i].views);
				if (categoryActiveRoute !== activeRoute) {
					return categoryActiveRoute;
				}
			} else {
				if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
					return routes[i].name;
				}
			}
		}
		return activeRoute;
	};

	const getActiveNavbar = (routes) => {
		let activeNavbar = false;
		for (let i = 0; i < routes.length; i++) {
			if (routes[i].category) {
				let categoryActiveNavbar = getActiveNavbar(routes[i].views);
				if (categoryActiveNavbar !== activeNavbar) {
					return categoryActiveNavbar;
				}
			} else {
				if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
					if (routes[i].secondaryNavbar) {
						return routes[i].secondaryNavbar;
					}
				}
			}
		}
		return activeNavbar;
	};

	const getRoutes = (routes) => {
		return routes.map((prop, key) => {
			if (prop.collapse) {
				return getRoutes(prop.views);
			}
			if (prop.category === 'account') {
				return getRoutes(prop.views);
			}
			if (prop.layout === '/auth') {
				return <Route path={prop.layout + prop.path} component={prop.component} key={key} />;
			} else {
				return null;
			}
		});
	};

	const navRef = React.useRef();
	document.documentElement.dir = 'ltr';

	return (
		<ChakraProvider theme={theme} resetCss={false} w='100%'>
			<Box ref={navRef} w='100%'>
				<Portal containerRef={navRef}>
					<AuthNavbar secondary={getActiveNavbar(routes)} logoText='POS MUGHAL SUPPLIERS' />
				</Portal>
				<Box w='100%'>
					<Box ref={wrapper} w='100%'>
						<Switch>
							{getRoutes(routes)}
							<Redirect from='/auth' to='/auth/signin' />
						</Switch>
					</Box>
				</Box>
				<Box px='24px' mx='auto' width='1044px' maxW='100%'>
					<Footer />
				</Box>
			</Box>
		</ChakraProvider>
	);
}
