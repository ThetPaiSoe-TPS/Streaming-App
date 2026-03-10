import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to login page as the initial route
  return <Redirect href="/login" />;
}
