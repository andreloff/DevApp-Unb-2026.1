import { Pressable, Text, View } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
}

export default function DrawerItem({label, onPress} : Props) {

  return (
    <View>
      <Pressable 
        onPress={onPress}
      >
        <Text style={{ padding: 10 }}>
          {label}
        </Text>
      </Pressable>
    </View>    
  );
}