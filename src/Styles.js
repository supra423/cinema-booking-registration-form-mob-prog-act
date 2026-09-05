import { Platform, StyleSheet, StatusBar } from "react-native";

export const LoginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  field: {
    width: 300,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 20,
  },
  box_distance: {
    marginTop: 40,
  },
  button_design: {
    display: 'flex',
    marginTop: 10,
    borderColor: '#000',
    borderWidth: 1,
    padding: 5,
    width: 280,
    height: 48,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export const ShowingScreenStyles = StyleSheet.create({
  mainContainer: {
	  flex: 1,
  },
  welcomeMessage: {
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  showingScreenContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
  },
  imageMiddle: {
    width: 300,
    height: 450,
    resizeMode: 'contain',
  },
  imageEdge: {
    width: 300,
    height: 450,
    resizeMode: 'contain',
  },
  imageTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTouchableWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
	  backgroundColor: '#ffffff',
  },
});

export const RegisterScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  field: {
    width: 300,
    borderWidth: 1,
    borderColor: '#000',
    padding: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 20,
  },
  box_distance: {
    marginTop: 40,
  },
  button_design: {
    display: 'flex',
    marginTop: 10,
    borderColor: '#000',
    borderWidth: 1,
    padding: 5,
    width: 280,
    height: 48,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  successCard: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'green',
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    width: 300,
  },
  successTitle: {
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 5,
  },
  redirectText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555',
  },
});

export const HeaderStyles = StyleSheet.create({
  headerBar: {
    width: '100%',
    justify: 'flex-end',
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
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
