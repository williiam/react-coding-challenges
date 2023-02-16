import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import '../styles/_discover.scss';

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: [],
      isLoading: false,
      apiToken: '',
    };
  }

  // call spotify api to get new releases, playlists, and categories
  async componentDidMount() {
    try {
      this.setState({ isLoading: true });

      if (!this.state.apiToken) {
        const token = await getSpotifyToken();
        this.setState({ apiToken: token });
      }

      const urls = [
        "https://api.spotify.com/v1/browse/new-releases",
        "https://api.spotify.com/v1/browse/featured-playlists",
        "https://api.spotify.com/v1/browse/categories",
      ];

      const requests = urls.map((url) => fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.state.apiToken}`,
          'Content-Type': 'application/json'
        }
      }));
      const responses = await Promise.all(requests);
      const errors = responses.filter((response) => !response.ok);

      if (errors.length > 0) {
        throw errors.map((response) => Error(response.statusText));
      }

      const json = responses.map((response) => response.json());
      const data = await Promise.all(json);

      this.setState({
        newReleases: data[0].albums.items,
        playlists: data[1].playlists.items,
        categories: data[2].categories.items,
        isLoading: false,
      });
    }
    catch (err) {
      if (Array.isArray(err)) {
        err.forEach((err) => console.error(err));
        // if one of the error is token expired, get new token
        if (err.some((err) => err.message === 'The access token expired')) {
          const newToken = await getSpotifyToken();
          this.setState({ apiToken: newToken });
        }

      }
      else {
        console.error(err);
      }

    }
  }

  render() {
    const { newReleases, playlists, categories, isLoading } = this.state;

    if (isLoading) {
      return <div className="discover">Loading...</div>;
    }

    return (
      <div className="discover">
        <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
        <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={playlists} />
        <DiscoverBlock text="BROWSE" id="browse" data={categories} imagesKey="icons" />
      </div>
    );
  }
}


const getSpotifyToken = async () => {
  const authOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
  };

  return fetch('https://accounts.spotify.com/api/token', authOptions)
    .then(response => response.json())
    .then(data => {
      const token = data.access_token;
      return token;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}