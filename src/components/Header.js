import { StyleSheet, View, Text, Image } from 'react-native';
import { HeaderStyles } from '../Styles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Header() {
  return (
	<SafeAreaView style={HeaderStyles.headerBar}>	
        <View style={HeaderStyles.headerContent}>
          <View style={HeaderStyles.logoContainer}>
            <Image
              source={require('../../assets/SILVER-BEAVERS-LOGO.png')}
              style={HeaderStyles.headerLogo}
            />
          </View>
          <Text style={HeaderStyles.headerTitle}>TICKETMEISTER</Text>
        </View>
	</SafeAreaView>	
  );
}
