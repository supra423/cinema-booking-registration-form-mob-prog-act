import { Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenStyles } from "../../src/Styles";

export default function Profile() {
    return(
        // Use mainContainer (which has flex: 1 and backgroundColor: '#101010')
        <SafeAreaView style={TabScreenStyles.container}>
            <View style={TabScreenStyles.centerContent}>
                <Text style={TabScreenStyles.titleText}>
                    profile tab in development
                </Text>
            </View>
        </SafeAreaView>
    );
}