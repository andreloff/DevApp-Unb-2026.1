import { Redirect } from 'expo-router';

export default function Index() {
  const isLogged = false;

  if (isLogged) {
    return <Redirect href="(app)/homeScreen" />;
  }

  return <Redirect href="(auth)/loginScreen" />;
}