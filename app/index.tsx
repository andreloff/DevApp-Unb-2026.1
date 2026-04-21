import { Redirect } from 'expo-router';

export default function Index() {
  const isLogged = true;

  if (isLogged) {
    return <Redirect href="/(drawer)/(home)" />;
  }

  return <Redirect href="/loginScreen" />;
}