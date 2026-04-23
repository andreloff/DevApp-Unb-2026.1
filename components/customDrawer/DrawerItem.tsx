import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
}

export default function DrawerItem({label, onPress} : Props) {

  return (
    <View
      style={styles.container}
    >
      <Pressable 
        onPress={onPress}
      >
        <Text style={styles.label}>
          {label}
        </Text>
      </Pressable>
    </View>    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7F7",
    //flex: 1,
  },

  label: {
    paddingLeft: 48,
    paddingTop: 16,
    paddingBottom: 20,
    fontSize: 14,
    fontFamily: "Roboto_400Regular",
  },
});