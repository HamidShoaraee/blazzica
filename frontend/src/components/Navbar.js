import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Container,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { BiSpa } from 'react-icons/bi';
import blazzicaLogo from '../assets/videos/blazzica_logo_3.png';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme, trigger, transparentPage }) => ({
  boxShadow: trigger ? '0 10px 30px rgba(0, 0, 0, 0.1)' : 'none',
  background: trigger 
    ? theme.palette.background.default 
    : transparentPage
      ? 'transparent' 
      : 'linear-gradient(to right, rgba(106, 17, 203, 0.9), rgba(37, 117, 252, 0.9))',
  color: trigger ? theme.palette.text.primary : '#fff',
  transition: 'all 0.3s ease',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  marginLeft: theme.spacing(2),
  fontWeight: 500,
  position: 'relative',
  color: '#fff',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: active ? '100%' : '0%',
    height: '3px',
    background: active 
      ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` 
      : 'transparent',
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '100%',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginLeft: theme.spacing(1),
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: `linear-gradient(to bottom, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    color: theme.palette.primary.contrastText,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
}));

const DrawerListItem = styled(ListItem)(({ theme, active }) => ({
  margin: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  
  // Check if current page should have transparent navbar
  const transparentPages = ['/', '/login', '/signup'];
  const isTransparentPage = transparentPages.includes(location.pathname);

  // Check if user is a provider
  const isProvider = user && (user.role === 'provider' || user.role === 'pending_provider');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setTrigger(true);
      } else {
        setTrigger(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const drawer = (
    <div>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: 3
        }}
      >
        <img 
          src={blazzicaLogo} 
          alt="Blazzica Logo" 
          style={{ 
            width: 84, 
            height: 'auto',
            mixBlendMode: 'multiply',
            filter: 'brightness(1.2) contrast(1.1)'
          }}
        />
      </Box>
      <List>
        <DrawerListItem 
          button 
          component={Link} 
          to="/" 
          active={location.pathname === '/' ? 1 : 0}
          onClick={handleDrawerToggle}
        >
          <ListItemText primary="Home" />
        </DrawerListItem>
        <DrawerListItem 
          button 
          component={Link} 
          to="/services" 
          active={location.pathname === '/services' ? 1 : 0}
          onClick={handleDrawerToggle}
        >
          <ListItemText primary="Services" />
        </DrawerListItem>
        <DrawerListItem 
          button 
          component={Link} 
          to="/contact" 
          active={location.pathname === '/contact' ? 1 : 0}
          onClick={handleDrawerToggle}
        >
          <ListItemText primary="Contact" />
        </DrawerListItem>
        
        {user ? (
          <>
            <DrawerListItem 
              button 
              component={Link} 
              to={isProvider ? "/provider/dashboard" : "/dashboard"}
              active={location.pathname === (isProvider ? "/provider/dashboard" : "/dashboard") ? 1 : 0}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Dashboard" />
            </DrawerListItem>
            
            {isProvider && (
              <>
                <DrawerListItem 
                  button 
                  component={Link} 
                  to="/provider/services" 
                  active={location.pathname === '/provider/services' ? 1 : 0}
                  onClick={handleDrawerToggle}
                >
                  <ListItemText primary="Manage Services" />
                </DrawerListItem>
                <DrawerListItem 
                  button 
                  component={Link} 
                  to="/provider/requests" 
                  active={location.pathname === '/provider/requests' ? 1 : 0}
                  onClick={handleDrawerToggle}
                >
                  <ListItemText primary="Booking Requests" />
                </DrawerListItem>
              </>
            )}
            
            <DrawerListItem 
              button 
              onClick={onLogout}
            >
              <ListItemText primary="Logout" />
            </DrawerListItem>
          </>
        ) : (
          <>
            <DrawerListItem 
              button 
              component={Link} 
              to="/login" 
              active={location.pathname === '/login' ? 1 : 0}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Login" />
            </DrawerListItem>
            <DrawerListItem 
              button 
              component={Link} 
              to="/signup" 
              active={location.pathname === '/signup' ? 1 : 0}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Sign Up" />
            </DrawerListItem>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      <StyledAppBar 
        position="fixed" 
        trigger={trigger ? 1 : 0}
        transparentPage={isTransparentPage}
        elevation={0}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for all screens */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexGrow: { xs: 1, md: 0 }
              }}
            >
              <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={blazzicaLogo} 
                  alt="Blazzica Logo" 
                  style={{ 
                    width: 98, 
                    height: 'auto',
                    mixBlendMode: 'multiply',
                    filter: 'brightness(1.2) contrast(1.1)'
                  }}
                />
              </Link>
            </Box>

            {/* Mobile menu icon */}
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                {/* Desktop navigation */}
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    justifyContent: 'center' 
                  }}
                >
                  <NavButton 
                    component={Link} 
                    to="/"
                    active={location.pathname === '/' ? 1 : 0}
                  >
                    Home
                  </NavButton>
                  <NavButton 
                    component={Link} 
                    to="/services"
                    active={location.pathname === '/services' ? 1 : 0}
                  >
                    Services
                  </NavButton>
                  <NavButton 
                    component={Link} 
                    to="/contact"
                    active={location.pathname === '/contact' ? 1 : 0}
                  >
                    Contact
                  </NavButton>
                </Box>

                {/* User menu or auth buttons */}
                <Box>
                  {user ? (
                    <>
                      <Button 
                        onClick={handleMenu}
                        startIcon={
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32,
                              background: `linear-gradient(45deg, #7209B7, #F72585)`
                            }}
                          >
                            {user.full_name ? user.full_name[0] : user.email[0]}
                          </Avatar>
                        }
                        sx={{ textTransform: 'none' }}
                      >
                        {user.full_name || user.email}
                      </Button>
                      <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                      >
                        <MenuItem 
                          component={Link} 
                          to={isProvider ? "/provider/dashboard" : "/dashboard"}
                          onClick={handleClose}
                        >
                          Dashboard
                        </MenuItem>
                        
                        {isProvider && (
                          <>
                            <MenuItem 
                              component={Link} 
                              to="/provider/services" 
                              onClick={handleClose}
                            >
                              Manage Services
                            </MenuItem>
                            <MenuItem 
                              component={Link} 
                              to="/provider/requests" 
                              onClick={handleClose}
                            >
                              Booking Requests
                            </MenuItem>
                          </>
                        )}
                        
                        <MenuItem onClick={handleLogout}>
                          Logout
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <>
                      <Button 
                        component={Link} 
                        to="/login"
                        color="inherit"
                      >
                        Login
                      </Button>
                      <Button 
                        component={Link} 
                        to="/signup"
                        variant="contained" 
                        color="primary"
                        sx={{ ml: 2 }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>

        {/* Mobile navigation drawer */}
        <MobileDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
        >
          {drawer}
        </MobileDrawer>
      </StyledAppBar>
    </Slide>
  );
}

export default Navbar; 