import React, { useEffect, useState } from "react";

const TokenListComponent = () => {
  const [tokens, setTokens] = useState([]);
  const [filteredTokens, setFilteredTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadTokens = async () => {
      try {
        console.log("Fetching tokens...");
        const response = await fetch("https://pumpportal.fun/data-api/real-time");

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
          );
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response, but got ${contentType}`);
        }

        const tokenList = await response.json();
        console.log("Fetched tokens:", tokenList);
        setTokens(tokenList);
        setFilteredTokens(tokenList); // Initialize filteredTokens
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);

    const filtered = tokens.filter((token) =>
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );

    setFilteredTokens(filtered);
  };

  if (loading) return <div>Loading tokens...</div>;
  if (error) return <div>Error fetching tokens: {error.message}</div>;

  if (filteredTokens.length === 0)
    return (
      <div>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <div>No tokens found matching "{searchTerm}"</div>
      </div>
    );

  return (
    <div>
      <h1>Token List</h1>
      <input
        type="text"
        placeholder="Search tokens..."
        value={searchTerm}
        onChange={handleSearch}
        style={{
          display: "block",
          margin: "10px auto",
          padding: "10px",
          fontSize: "16px",
          width: "80%",
        }}
      />
      <ul>
        {filteredTokens.map((token) => (
          <li key={token.address}>
            {token.logoURI && (
              <img
                src={token.logoURI}
                alt={token.name}
                width={30}
                height={30}
                style={{ marginRight: "10px" }}
              />
            )}
            {token.name} ({token.symbol}) - Address: {token.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenListComponent;
