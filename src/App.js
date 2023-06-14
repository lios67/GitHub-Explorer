/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [searchType, setSearchType] = useState('organization');
  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState('');
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (selectedRepository !== '') {
      fetchCommits(selectedRepository);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepository]);

  const fetchRepositories = async () => {
    try {
      let response;
      if (searchType === 'organization') {
        response = await axios.get(`https://api.github.com/orgs/${searchQuery}/repos`);
      } else {
        response = await axios.get(`https://api.github.com/users/${searchQuery}/repos`);
      }
      const sortedRepos = response.data.sort((a, b) => b.stargazers_count - a.stargazers_count);
      setRepositories(sortedRepos);
      setError(null);
      setShow(true);
    } catch (error) {
      console.log(error);
      setRepositories([]);
      setError('ORGANIZATION NOT FOUND!');
      setShow(false)
    }
  };

  const fetchCommits = async (repository) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${searchQuery}/${repository}/commits`);
      const sortedCommits = response.data.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date));
      setCommits(sortedCommits);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
    setSearchQuery(''); // Clear the input field
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setSelectedRepository(null); // Reset selected repository
    setCommits([]); // Clear the commits
    setError(null); // Clear the error
  };

  const handleRepositoryClick = (repository) => {
    setSelectedRepository(repository.name);
  };

  const handleHeadingClick = () => {
    window.location.reload();
  };

  return (
    <div className="app-container">
      <a href="#" onClick={handleHeadingClick}>
        <h1 className="github-explorer-heading">GitHub Explorer</h1>
      </a>
      <div className='switch'>
        <label className='switch-org'>
          <input
            type="radio"
            value="organization"
            checked={searchType === 'organization'}
            onChange={handleSearchTypeChange}
          />
          Organization
        </label>
        <label className='switch-user'>
          <input
            type="radio"
            value="user"
            checked={searchType === 'user'}
            onChange={handleSearchTypeChange}
          />
          User
        </label>
      </div>

      <div>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchQueryChange}
        placeholder={searchType === 'organization' ? 'Enter organization name' : 'Enter GitHub username'}
      />
      <button onClick={fetchRepositories}>Fetch Repositories</button>
      </div>

      {error && <div className="alert">{error}</div>}

      {show?<h2>Repositories for {searchQuery}:</h2>:null}
      {show?<div className="scrollable-box">
        <ul>
          {repositories.map((repository) => (
            <li key={repository.id} onClick={() => handleRepositoryClick(repository)}>
              <h3 className="underline">{repository.name}</h3>
              <p><strong>Star Count:</strong> {repository.stargazers_count}</p>
              <p><strong>Language:</strong> {repository.language}</p>
              <p><strong>Description:</strong> {repository.description}</p>
              <p><strong>Fork Count:</strong> {repository.forks_count}</p>
              <p><strong>Date Created:</strong> {repository.created_at}</p>
            </li>
          ))}
        </ul>
      </div>:null}

      {selectedRepository && (
        <>
          <h2>
            Commits for {' '}
            <a href={`https://github.com/${searchQuery}/${selectedRepository}`} target="_blank" rel="noopener noreferrer">
              {selectedRepository}:
            </a>
          </h2>
          <div className="scrollable-box">
            <ul>
              {commits.map((commit) => (
                <li key={commit.sha}>
                  <p><strong>Date Created:</strong> {commit.commit.author ? commit.commit.author.date : 'N/A'}</p>
                  <p><strong>Committer username:</strong> {commit.committer ? commit.committer.login : 'N/A'}</p>  
                  <p><strong>Commit message:</strong> {commit.commit.message}</p>
                  <p><strong>Commit hash:</strong> {commit.sha}</p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
