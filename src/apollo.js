// src/apollo.js
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/wagdie/wagdieworld-mainnet",
});


const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
