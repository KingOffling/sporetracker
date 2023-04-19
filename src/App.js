// src/App.js
import * as React from "react";
import { Container } from "@chakra-ui/react";
import SporeTracker from "./SporeTracker";
import "./theme.css"

function App() {
  return (
    <Container maxW="container.md" pt={4} className="background">
      <SporeTracker />
    </Container>
  );
}

export default App;
