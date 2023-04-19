import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import client from './apollo';
import App from './App';
import "./theme.css";  

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
});

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>
);