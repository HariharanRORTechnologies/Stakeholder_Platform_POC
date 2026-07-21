import React from 'react';
import {
  Box,
  AppBar,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Button,
  Stack,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  EventNote as EventIcon,
  People as PeopleIcon,
  Assessment as ReportIcon,
  Feedback as FeedbackIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  School as CertificateIcon,
  EventAvailable as RegistrationIcon,
  SwapHoriz as SwitchRoleIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Close as CloseSearchIcon,
  Security as RolesIcon,
  Lock as PermissionsIcon,
  BarChart as AnalyticsIcon,
  Groups as TeamIcon,
  Assignment as TasksIcon,
  PublicOutlined as CommunityIcon,
  Mic as SpeakerIcon,
  BusinessCenter as SponsorshipIcon,
  SupportAgent as TicketsIcon,
  Help as KnowledgeBaseIcon,
  TrendingUp as OpportunitiesIcon,
  Timer as HoursIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toggleSidebar, setHasSelectedRole, setTheme } from '../features/mockData/store/uiSlice';
import { roleConfig, UserRole } from '../config/roleConfig';

interface MenuItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItemsMap: Record<string, MenuItemConfig> = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  users: { id: 'users', label: 'Users', icon: <PeopleIcon />, path: '/users' },
  roles: { id: 'roles', label: 'Roles', icon: <RolesIcon />, path: '/roles' },
  permissions: { id: 'permissions', label: 'Permissions', icon: <PermissionsIcon />, path: '/permissions' },
  settings: { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  reports: { id: 'reports', label: 'Reports', icon: <ReportIcon />, path: '/reports' },
  analytics: { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  events: { id: 'events', label: 'Events', icon: <EventIcon />, path: '/events' },
  registrations: { id: 'registrations', label: 'Registrations', icon: <RegistrationIcon />, path: '/registrations' },
  attendees: { id: 'attendees', label: 'Attendees', icon: <PeopleIcon />, path: '/attendees' },
  team: { id: 'team', label: 'Team Management', icon: <TeamIcon />, path: '/team' },
  tasks: { id: 'tasks', label: 'Tasks', icon: <TasksIcon />, path: '/tasks' },
  opportunities: { id: 'opportunities', label: 'Opportunities', icon: <OpportunitiesIcon />, path: '/opportunities' },
  my_hours: { id: 'my_hours', label: 'My Hours', icon: <HoursIcon />, path: '/my_hours' },
  certificates: { id: 'certificates', label: 'Certificates', icon: <CertificateIcon />, path: '/certificates' },
  community: { id: 'community', label: 'Community', icon: <CommunityIcon />, path: '/community' },
  my_profile: { id: 'my_profile', label: 'My Profile', icon: <PersonIcon />, path: '/profile' },
  feedback: { id: 'feedback', label: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
  my_talks: { id: 'my_talks', label: 'My Talks', icon: <SpeakerIcon />, path: '/my_talks' },
  audience_analytics: { id: 'audience_analytics', label: 'Audience Analytics', icon: <AnalyticsIcon />, path: '/audience_analytics' },
  profile: { id: 'profile', label: 'Profile', icon: <PersonIcon />, path: '/profile' },
  my_sponsorships: { id: 'my_sponsorships', label: 'My Sponsorships', icon: <SponsorshipIcon />, path: '/my_sponsorships' },
  tickets: { id: 'tickets', label: 'Tickets', icon: <TicketsIcon />, path: '/tickets' },
  knowledge_base: { id: 'knowledge_base', label: 'Knowledge Base', icon: <KnowledgeBaseIcon />, path: '/knowledge_base' },
};

const DRAWER_WIDTH = 280;

export function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const currentRole = useSelector((state: RootState) => state.ui.currentRole) as UserRole;
  const theme = useSelector((state: RootState) => state.ui.theme);
  const notifications = useSelector((state: RootState) => state.mockNotifications.items);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = React.useState<null | HTMLElement>(null);

  const getMenuItemsForRole = React.useMemo(() => {
    const roleConfig_ = roleConfig[currentRole];
    if (!roleConfig_) return [];

    return roleConfig_.menuItems
      .map(itemId => menuItemsMap[itemId])
      .filter((item): item is MenuItemConfig => item !== undefined);
  }, [currentRole]);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleSwitchRole = () => {
    dispatch(setHasSelectedRole(false));
    navigate('/login');
  };

  const handleLogout = () => {
    dispatch(setHasSelectedRole(false));
    navigate('/login');
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', flex: 1 }}>
          Stakeholder Platform
        </Typography>
      </Toolbar>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <List>
          {getMenuItemsForRole.length > 0 ? (
            getMenuItemsForRole.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))
          ) : (
            <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
              No menu items available
            </Typography>
          )}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: '#EF4444',
            borderColor: '#EF4444',
            textTransform: 'none',
            fontWeight: '600',
            mb: 2,
            '&:hover': {
              backgroundColor: '#EF444411',
              borderColor: '#DC2626',
            },
          }}
        >
          Logout
        </Button>

        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
          <strong>Current Role:</strong> {currentRole}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Version: 1.0.0-prototype
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => dispatch(toggleSidebar())}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Desktop Header */}
        <AppBar position="static" sx={{
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: { xs: 'none', md: 'flex' }
        }}>
          <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
            {/* Search Bar */}
            <Box sx={{ flex: 1, maxWidth: 400 }}>
              <TextField
                size="small"
                placeholder="Search events, users, reports..."
                value={searchQuery}
                onChange={handleSearch}
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'white', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={clearSearch}
                        sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}
                      >
                        <CloseSearchIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255,255,255,0.8)',
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                }}
              />
            </Box>

            {/* Header Actions */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Dark Mode Toggle */}
              <Tooltip title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton
                  color="inherit"
                  onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Notification Center */}
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationMenuOpen}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile Dropdown */}
              <Tooltip title="Profile">
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    paddingRight: 2,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <PersonIcon />
                  <Typography sx={{ display: { xs: 'none', lg: 'block' }, fontSize: '14px', textTransform: 'capitalize' }}>
                    {currentRole.replace(/_/g, ' ')}
                  </Typography>
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Mobile Header */}
        <AppBar position="static" sx={{
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          display: { xs: 'flex', md: 'none' }
        }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => dispatch(toggleSidebar())}
              sx={{ mr: 2 }}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1, fontSize: '16px' }}>
              Stakeholder Platform
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
              sx={{ mr: 1 }}
            >
              {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            <IconButton
              color="inherit"
              size="small"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
              {currentRole.replace(/_/g, ' ')}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
            <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={handleSwitchRole}>
            <SwitchRoleIcon fontSize="small" sx={{ mr: 2 }} />
            Switch Role
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationMenuAnchor}
          open={Boolean(notificationMenuAnchor)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ maxWidth: '400px' }}
        >
          <Box sx={{ width: '350px', p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Notifications ({unreadCount} unread)
            </Typography>
            {notifications.length > 0 ? (
              <List sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.slice(0, 5).map((notif) => (
                  <ListItemButton
                    key={notif.id}
                    sx={{
                      backgroundColor: notif.isRead ? 'transparent' : (theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4'),
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: notif.isRead
                          ? (theme === 'dark' ? '#334155' : '#F5F5F5')
                          : (theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                      }
                    }}
                  >
                    <ListItemText
                      primary={notif.message}
                      secondary={new Date(notif.timestamp).toLocaleDateString()}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: notif.isRead ? 'normal' : '600' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No notifications
              </Typography>
            )}
          </Box>
        </Menu>

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: theme === 'dark' ? '#0f172a' : '#fafafa',
          transition: 'background-color 0.3s ease'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
