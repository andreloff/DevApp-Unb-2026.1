import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
}

export default function DrawerSection({title, children} : Props) {
  const [isOpen, setOpen] = useState(false);

  return (
    <View>
      <Pressable onPress={() => setOpen(!isOpen)}>
        <Text style={{ padding: 15, fontWeight: 'bold' }}>
          {title} {isOpen ? '▲' : '▼'}
        </Text>
      </Pressable>

      {isOpen && 
        <View style={{ paddingLeft: 20 }}>
          {children}
        </View>
      }
    </View>    
  );
}