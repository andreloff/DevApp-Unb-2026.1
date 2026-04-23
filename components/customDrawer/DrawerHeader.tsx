import { StyleSheet, View } from 'react-native';

export default function DrawerHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: "#88C9BF",
    width: 304,
    height: 172,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 40,
    marginLeft: 16,
    marginBottom: 12,
    backgroundColor: "#4F46E5",
  },
});