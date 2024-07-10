import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';

const LIST_REPOSITORIES = gql`
  query ListRepositories($token: String!) {
    listRepositories(token: $token) {
      name
      size
      owner
      forkedFrom
    }
  }
`;

const REPOSITORY_DETAILS = gql`
  query GetRepositoryDetails($token: String!, $owner: String!, $repoName: String!) {
    getRepositoryDetails(token: $token, owner: $owner, repoName: $repoName) {
      name
      size
      owner
      isPrivate
      numberOfFiles
      ymlContent
      activeWebhooks
      forkedFrom
    }
  }
`;

const App = () => {
    const [token, setToken] = useState('');
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [selectedOwner, setSelectedOwner] = useState(null);

    const { loading, error, data } = useQuery(LIST_REPOSITORIES, {
        variables: { token },
        skip: !token,
    });

    const handleTokenChange = (e) => {
        setToken(e.target.value);
        localStorage.setItem('githubToken', e.target.value);
    };

    const handleRepoClick = (owner, repoName) => {
        setSelectedOwner(owner);
        setSelectedRepo(repoName);
    };

    return (
        <div>
            <h1>GitHub Scanner</h1>
            <input
                type="text"
                placeholder="Enter GitHub Token"
                value={token}
                onChange={handleTokenChange}
            />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
                <ul>
                    {data.listRepositories.map(repo => (
                        <li key={repo.name} onClick={() => handleRepoClick(repo.owner, repo.name)}>
                            {repo.name} ({repo.size} KB) by {repo.owner}
                            {repo.forkedFrom && <span> (Forked from {repo.forkedFrom})</span>}
                        </li>
                    ))}
                </ul>
            )}
            {selectedRepo && <RepositoryDetails token={token} owner={selectedOwner} repoName={selectedRepo} />}
        </div>
    );
};

const RepositoryDetails = ({ token, owner, repoName }) => {
    const { loading, error, data } = useQuery(REPOSITORY_DETAILS, {
        variables: { token, owner, repoName },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const { name, size, owner: repoOwner, isPrivate, numberOfFiles, ymlContent, activeWebhooks, forkedFrom } = data.getRepositoryDetails;

    return (
        <div>
            <h2>{name}</h2>
            <p>Size: {size} KB</p>
            <p>Owner: {repoOwner}</p>
            <p>Private: {isPrivate ? 'Yes' : 'No'}</p>
            <p>Number of files: {numberOfFiles}</p>
            <h3>YML Content:</h3>
            <pre>{ymlContent}</pre>
            <h3>Active Webhooks:</h3>
            <ul>
                {activeWebhooks.map((hook, index) => (
                    <li key={index}>{hook}</li>
                ))}
            </ul>
            {forkedFrom && <p>Forked from: {forkedFrom}</p>}
        </div>
    );
};

export default App;
