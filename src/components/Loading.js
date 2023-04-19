import React from "react";
import { Box, Text, Spinner } from "@chakra-ui/react";

const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    flexDirection="column"
  >
    <Text fontSize="2xl" mb={4}>
      LOADING
    </Text>
    <Spinner size="xl" />
  </Box>
);

export default Loading;