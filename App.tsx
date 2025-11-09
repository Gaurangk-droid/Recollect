import React from 'react'
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper'
import AppNavigator from './src/navigation/AppNavigator'

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#002B5B',
    secondary: '#FFD700',
    background: '#F5F8FC',
  },
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
)
}