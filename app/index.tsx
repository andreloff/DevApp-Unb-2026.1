import { Redirect } from 'expo-router';

export default function Index() {
  const isLogged = true;

  if (isLogged) {
    return <Redirect href="(app)/homeScreen" />;
  }

  return <Redirect href="(auth)/loginScreen" />;
}