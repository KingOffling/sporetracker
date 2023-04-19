import React, { useState, useEffect, useMemo } from "react";
import "./theme.css";
import archivistImage from "./archivist.png"
import { useQuery, gql } from "@apollo/client";
import {
  Box,
  Heading,
  Link,
  Stack,
  Image,
  Flex,
  Text,
  Spinner,
  Input,
  InputGroup
} from "@chakra-ui/react";
import { providers } from 'ethers';



const infectionsQuery = gql`
  query GetInfections {
    infections(
      orderBy: timestamp
      orderDirection: desc
      where: {infectedToken_not_in: ["1218", "375"] }
    ) {
      infectedToken
      sender {
        id
      }
      timestamp
    }
  }
`;

const characterQuery = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      burned
      location {
        name
      }
      owner {
        id
      }
    }
  }
`;


const SporeTracker = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 800);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  const resetState = () => {
    setSearch('');
    setFilteredData([]);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 800);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  const handleChange = (event) => {
    setSearch(event.target.value);
    if (data) {
      const result = data.infections.find(
        (infection) => infection.infectedToken === event.target.value.trim()
      );
      setFilteredData(result ? [result] : []);
    } else {
      setFilteredData([]);
    }
  };

  const { loading, data } = useQuery(infectionsQuery);

  const handleSearch = () => {
    if (data) {
      const result = data.infections.find(
        (infection) => infection.infectedToken === search.trim()
      );
      setFilteredData(result ? [result] : []);
    } else {
      setFilteredData([]);
    }
  };

  const boxwidth = useMemo(
    () => (isSmallScreen ? "400px" : ""),
    [isSmallScreen]
  );

  const displayedData = useMemo(() => {
    if (!data) return [];

    const uniqueInfections = [];
    const displayedTokens = new Set();

    // Exclude the specific character IDs
    const excludedIds = new Set([1812, 375]);

    data.infections
      .filter((infection) => !excludedIds.has(parseInt(infection.infectedToken)))
      .forEach((infection) => {
        if (!displayedTokens.has(infection.infectedToken)) {
          uniqueInfections.push(infection);
          displayedTokens.add(infection.infectedToken);
        }
      });

    if (search !== "") {
      const result = uniqueInfections.find(
        (infection) => infection.infectedToken === search.trim()
      );
      return result ? [result] : [];
    }

    return uniqueInfections;
  }, [data, search]);

  const resetSearch = () => {
    setSearch("");
    setFilteredData(null);
  };

  const abbreviateAddress = (address) => {
    return address.slice(0, 16) + "...";
  };

  const InlineImageFallback = ({ search }) => {
    const [src, setSrc] = useState(`https://storage.googleapis.com/seared-wagdie-images/${search}.png`);

    useEffect(() => {
      const GlobalImage = window.Image;
      const img = new GlobalImage();
      img.src = src;

      img.onload = () => { /* Image loaded successfully */ };
      img.onerror = () => {
        setSrc(`https://storage.googleapis.com/wagdie-images/${search}.png`);
      };
    }, [search, src]);

    return (
      <img src={src} alt="Not Infected" width="200px" mr={4} className="character-image" />
    );
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
        className="background"
      >
        <Text fontSize="2xl" mb={4}>
          LOADING
        </Text>
        <Spinner size="xl" />
      </Box>
    );

    const ENSOwner = ({ owner, isSmallScreen }) => {
      const [displayName, setDisplayName] = useState(null);
    
      // Add this function to get the ENS name using eth-ens-namehash
      const getEnsName = async (address) => {
        const provider = new providers.InfuraProvider("mainnet", "edd1ef15a39f46a495d9441c6bdb9c45");
        const ensName = await provider.lookupAddress(address);
        return ensName;
      };
    
      useEffect(() => {
        (async () => {
          const name = await getEnsName(owner.id);
          setDisplayName(name);
        })();
      }, [owner.id, isSmallScreen]);
    
      return (
        <Link href={`http://opensea.io/${owner.id}`}>
          {displayName || (isSmallScreen ? abbreviateAddress(owner.id) : owner.id)}
        </Link>
      );
    };
    
    

  const CharacterInfo = ({ tokenId }) => {
    const { data: characterData, loading: characterLoading } = useQuery(characterQuery, {
      variables: { id: tokenId },
    });

    const [characterName, setCharacterName] = useState("");
    const [characterHealth, setCharacterHealth] = useState(null);

    useEffect(() => {
      async function fetchCharacterData() {
        try {
          const response = await fetch(`https://fateofwagdie.com/api/characters/${tokenId}`);
          const data = await response.json();
          setCharacterName(data.sheet.name !== "New Character" ? data.sheet.name : "Unknown");
          const healthAttribute = data.rawMetadata.attributes.find(attribute => attribute.trait_type === "Health");
          if (healthAttribute && (healthAttribute.value === "Alive" || healthAttribute.value === "Dead")) {
            setCharacterHealth(healthAttribute.value);
          }
        } catch (error) {
          console.error("Error fetching character data:", error);
        }
      }

      fetchCharacterData();
    }, [tokenId]);

    if (characterLoading) return <Text>Loading...</Text>;

    if (!characterData.character) {
      return (
        <>
          <b>Name: </b> Not Found
          <br />
          <b>Current Location: </b>Unknown
          <br />
          <b>Owner: </b>Unknown
          {characterHealth && (
            <>
              <br />
              <b>Health: </b>{characterHealth}
            </>
          )}
        </>
      );
    }

    const { location, owner } = characterData.character;
    return (
      <>
        <b>Name: </b>
        <Link href={`http://opensea.io/${owner.id}`}>{characterName ? characterName : "Unknown"}</Link>
        {characterHealth && (
          <>
            <br />
            <b>Health:</b> {characterHealth}
          </>
        )}
        <br />
        <b>Current Location: </b>
        {location && location.name !== null ? location.name : "Unknown"}
        <br />
        <b>Owner: </b>
        <ENSOwner owner={owner} isSmallScreen={isSmallScreen} />
      </>
    );
  };


  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const daySuffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    const month = monthNames[date.getMonth()];
    const weekday = dayOfWeek[date.getDay()];
    return `${weekday}, ${month} ${day}${daySuffix}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours();
    const am_pm = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const timezone = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2];
    return `${hours12}:${minutes} ${am_pm} (${timezone})`;
  };

  return (
    <Box className="background">
      <Image src={archivistImage} alt="Archivist" className="archivist-image" position="fixed" bottom="0" left="0" />
      <Heading mb={4}>
        <Flex justifyContent="space-between" alignItems="center" className="header">
          <Link onClick={resetState} style={{ textDecoration: 'none' }}><Text>Chronicle of The Spread</Text></Link>
          <InputGroup width="30%" ml={2}>
            <Input
              value={search}
              onChange={handleChange}
              onKeyPress={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder="Search ID"
              textAlign="center"
            />
          </InputGroup>
        </Flex>
      </Heading>
      {search !== "" && filteredData !== null && filteredData.length === 0 && (
        <Box p={4} boxShadow="md" borderRadius="md" className="databox">
          <Flex className="characters stack-on-small">
            <Link
              href={`http://fateofwagdie.com/characters/${search}`}
            >
              <InlineImageFallback search={search} />
            </Link>
            <Box pl={4}>
              <b>Token ID: </b>
              <Link href={`http://fateofwagdie.com/characters/${search}`}>{`${search}`}</Link>
              <br />
              <CharacterInfo tokenId={search} />

            </Box>
          </Flex>
        </Box>
      )}
      <Stack spacing={-8} width={boxwidth}>
        {displayedData.map(({ infectedToken, sender, timestamp }) => (
          <Box key={infectedToken} p={4} boxShadow="md" borderRadius="md" className="databox">
            <Flex className="characters stack-on-small">
              <Link
                href={`http://fateofwagdie.com/characters/${infectedToken}`}
              >
                <Image
                  src={`https://storage.googleapis.com/infected-wagdie-images/${infectedToken}.png`}
                  width="200px"
                  mr={4}
                  className="character-image"
                />
              </Link>
              <Box>
                <b>Token ID: </b>
                <Link href={`http://fateofwagdie.com/characters/${infectedToken}`}>{`${infectedToken}`}</Link>
                <br />
                <CharacterInfo tokenId={infectedToken} />
                <br />
                <br />
                <b>Infector: </b><Link href={`http://opensea.io/${sender.id}`}>{isSmallScreen ? abbreviateAddress(sender.id) : sender.id}</Link> <br />
                <b>Infection Date: </b>{`${formatDate(timestamp)}`}<br />
                <b>Infection Time: </b>{`${formatTime(timestamp)}`}<br />

              </Box>
            </Flex>
          </Box>
        ))}
      </Stack>
      {filteredData !== null && (
        <Box display="flex" justifyContent="center" mt={4} mb={4}>
          <Link onClick={resetSearch}>Show all infections</Link>
        </Box>
      )}
    </Box>
  );
};

export default SporeTracker;
