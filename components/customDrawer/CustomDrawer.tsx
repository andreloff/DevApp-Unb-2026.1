import { DrawerContentScrollView } from "@react-navigation/drawer";
import DrawerHeader from "./DrawerHeader";
import DrawerItem from "./DrawerItem";
import DrawerSection from "./DrawerSection";

export default function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerHeader />

      <DrawerSection title="Perfil">
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

      <DrawerSection title="Atalhos">
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

      <DrawerSection title="Atalhos">
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

      <DrawerSection title="Configurações">
        <DrawerItem
          label="Privacidade"
          onPress={() => props.navigation.navigate("(profile)")}
        />
      </DrawerSection>
    </DrawerContentScrollView>
  );
}
