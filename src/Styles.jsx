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
//CAMANNONG WAS HERE
export const TabScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingBottom: 100, // Extra padding to ensure content is scrollable and not cut off
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
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

export const AdminScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101010',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 120,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#101010',
    padding: 16,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  consoleCard: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 18,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    color: '#111111',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 6,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: 6,
  },
  passwordInput: {
    flex: 1,
    color: '#111111',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  toggleVisibilityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleVisibilityText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: 'bold',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemMeta: {
    color: '#CCCCCC',
    fontSize: 13,
    marginTop: 3,
  },
  primaryButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#D62828',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  secondaryButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#D62828',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});

export const ShowingScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#101010',
    paddingBottom: 100,
  },
  welcomeMessage: {
    color: '#FFFFFF',
    backgroundColor: '#101010',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
  },
  showingScreenContainer: {
    backgroundColor: '#101010',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  imageMiddle: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
  },
  imageEdge: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
  },
  imageTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTouchableWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    backgroundColor: '#101010',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export const RegisterScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101010',
    padding: 8,
  },
    backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 8,
    zIndex: 10,
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
  borderWidth: 1,
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
    paddingBottom: -25,
    paddingTop: 10,
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
    paddingTop: 75,
    resizeMode: 'contain',
    margin: -40,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginLeft: 8,
    marginRight: 8,
  },

  logoutOrLoginRegisterButton: {
  backgroundColor: '#D62828',
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 5,
},

logoutOrLoginRegisterText: {
  color: '#FFFFFF',
  fontWeight: 'bold',
},

});
