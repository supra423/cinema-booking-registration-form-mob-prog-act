import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ label, color }) {
 return (
   <Text
     style={{
       color: 'red',
       fontSize: 18,
       fontWeight: "800",
     }}
   >
     {label}
   </Text>
 );
}

export default function TabsLayout() {
 const insets = useSafeAreaInsets();

 return (
   <Tabs
     screenOptions={{
       headerShown: false,
       // Transform the standard bar into an absolute floating pill
       tabBarStyle: {
         position: 'absolute',
         bottom: Math.max(insets.bottom, 12),
         left: 20,
         right: 20,
         elevation: 8, // Android shadow
         backgroundColor: '#1E293B', // Slate dark card background
         borderRadius: 28,
         height: 64,
         borderTopWidth: 0, // Removes default iOS top border line
         shadowColor: '#000', // iOS shadow
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 6,
         paddingBottom: 0, 
       },
       tabBarItemStyle: {
         height: 64,
         justifyContent: 'center',
         alignItems: 'center',
       },
       tabBarLabelStyle: {
         fontSize: 11,
         fontWeight: "600",
         marginBottom: 6,
       },
       tabBarActiveTintColor: '#38BDF8', // Bright blue for active tab
       tabBarInactiveTintColor: '#94A3B8', // Muted gray for inactive tabs
     }}
   >
     <Tabs.Screen
       name="index"
       options={{
         title: "Home",
         tabBarIcon: ({ color }) => (
           <TabIcon label="H" color={color} />
         ),
       }}
     />

     <Tabs.Screen
       name="cinemas"
       options={{
         title: "Cinemas",
         tabBarIcon: ({ color }) => (
           <TabIcon label="C" color={color} />
         ),
       }}
     />

     <Tabs.Screen
       name="history"
       color="red"
       options={{
         title: "History",
         tabBarIcon: ({ color }) => (
           <TabIcon label="I" color={color} />
         ),
       }}
     />
   </Tabs>
 );
}