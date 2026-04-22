import CustomDrawer from '@/components/customDrawer/CustomDrawer';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer 
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="(home)" options={{ title: 'Home' }} />
      <Drawer.Screen name="(profile)" options={{ title: 'Profile' }} />
    </Drawer>
  );
}