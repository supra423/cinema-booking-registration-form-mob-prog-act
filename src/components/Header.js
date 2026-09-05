import { StyleSheet, View, Text, Image } from 'react-native';

export default function Header() {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/SILVER-BEAVERS-LOGO.png')}
            style={styles.headerLogo}
          />
        </View>
        <Text style={styles.headerTitle}>TICKETMASTER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    width: '100%',
    height: 110,
    justify: 'flex-end',
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 70,
    height: 35,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 140,
    height: 70,
    resizeMode: 'contain',
    margin: -15,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});