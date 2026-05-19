import CustomDrawer from "@/components/customDrawer/CustomDrawer";
import { Drawer } from "expo-router/drawer";
import { StyleSheet } from 'react-native';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ 
        headerShown: false,
        drawerStyle: styles.drawerContent,
      }}
      drawerContent={(props) => <CustomDrawer {...props}/>}
    >
      <Drawer.Screen name="(home)" />
      <Drawer.Screen name="(profile)" />
      <Drawer.Screen name="chats" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    borderRightWidth:0,
    elevation:0,
    shadowOpacity:0,
    shadowColor: "transparent",
    padding: 0,
    margin: 0
  },
});