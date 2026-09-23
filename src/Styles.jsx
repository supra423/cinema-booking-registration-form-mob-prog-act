import { Platform, StyleSheet, StatusBar } from "react-native";

//kyla added for consistent Ui
const colors = {
  background: '#101010',
  surface: '#1A1A1A',
  text: '#FFFFFF',
  secondaryText: '#CCCCCC',
  accent: '#D62828',
  inputBackground: '#FFFFFF',
  inputText: '#111111',
};

export const LoginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101010', //Kyla changed
    padding: 8,
    //Pat added
    color: 'rgb(144, 51, 51)',
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
  //Kyla replaced
  backButtonText: {
  fontSize: 16,
  color: '#FFFFFF',
},

title: {
  color: '#FFFFFF',
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20,
},

label: {
  marginTop: 10,
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},

field: {
  width: '90%',
  maxWidth: 360,
  backgroundColor: '#FFFFFF',
  color: '#111111',
  borderWidth: 0,
  borderRadius: 6,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginTop: 6,
  fontSize: 16,
},

button_design: {
  width: '90%',
  maxWidth: 360,
  minHeight: 48,
  backgroundColor: '#D62828',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 12,
  padding: 10,
},

buttonText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 'bold',
},
});

export const ShowingScreenStyles = StyleSheet.create({
  mainContainer: {
      flex: 1,
  },
  welcomeMessage: {
    color: '#FFFFFF', //Kyla changed
    backgroundColor: '#101010',
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

  //Kyla added
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  //Kyla added
  label: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  //Kyla repleaced
  field: {
  width: '90%',
  maxWidth: 360,
  backgroundColor: '#FFFFFF',
  color: '#111111',
  borderWidth: 0,
  borderRadius: 6,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginTop: 6,
  fontSize: 16,
},
  box_distance: {
    marginTop: 40,
  },

  //Kyla repleaced
  button_design: {
  width: '90%',
  maxWidth: 360,
  minHeight: 48,
  backgroundColor: '#D62828',
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 12,
  padding: 10,
},
//Kyla replaced
buttonText: {
  color: '#FFFFFF',
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 'bold',
},

//KYLA REPLACED
  successCard: {
  width: '90%',
  maxWidth: 360,
  marginTop: 20,
  padding: 16,
  backgroundColor: '#1A1A1A',
  borderWidth: 1,
  borderColor: '#3FAE5A',
  borderRadius: 6,
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
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: -5,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  othersText: {
    fontSize: 14,
    color: '#d9534f',
    fontWeight: 'bold',
  },
});

export const HeaderStyles = StyleSheet.create({
  headerBar: {
    width: '100%',
    justifyContent: 'flex-end',
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

  logoutButton: {
  backgroundColor: '#D62828',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 5,
},

logoutText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
},

});
