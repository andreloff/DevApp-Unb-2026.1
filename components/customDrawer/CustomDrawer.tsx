import { DrawerContentScrollView } from "@react-navigation/drawer";
import { StyleSheet } from 'react-native';
import DrawerFooter from "./DrawerFooter";
import DrawerHeader from "./DrawerHeader";
import DrawerItem from "./DrawerItem";
import DrawerSection from "./DrawerSection";

export default function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={styles.drawerScroll}
    >
    
      <DrawerHeader />

      <DrawerSection 
        title="NOME_USUARIO"
        containerStyle={styles.userSectionContainer}
      >
        <DrawerItem
          label="Meu Perfil"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Meus Pets"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Favoritos"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Chat"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerSection 
        icon={{name:"bug-outline"}}
        title="Atalhos"
        containerStyle={styles.shortcutSectionContainer}
      >
        <DrawerItem
          label="Cadastrar um pet"
          onPress={() =>
            props.navigation.navigate("(home)", { screen: "cadastroAnimal" })
          }
        />
        <DrawerItem
          label="Adotar um pet"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Ajudar um pet"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Apadrinhar um pet"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerSection 
        icon={{name:"information-circle-outline"}}
        title="Informações"
        containerStyle={styles.infoSectionContainer}
      >
        <DrawerItem
          label="Dicas"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Eventos"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Legislação"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Termo de adoção"
          onPress={() => props.navigation.navigate("(profile)")}
        />
        <DrawerItem
          label="Histórias de adoção"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerSection 
        icon={{name:"settings-outline"}}
        title="Configurações"
        containerStyle={styles.configSectionContainer}
      >
        <DrawerItem
          label="Privacidade"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>

      <DrawerFooter/>
      
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({

  drawerContent: {
    flex: 1,
    padding: 0,
    margin: 0,
  },

  drawerScroll: {
    paddingHorizontal: 0,
  },

  userSectionContainer: {
    backgroundColor: "#88C9BF",
  },

  shortcutSectionContainer: {
    backgroundColor: "#FEE29B",
  },

  infoSectionContainer: {
    backgroundColor: "#CFE9E5",
  },

  configSectionContainer: {
    backgroundColor: "#E6E7E8",
  },
});
