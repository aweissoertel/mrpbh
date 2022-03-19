import axios from 'axios';
import { URLSearchParams } from 'url';

class spotifyService {
    private token: string = '';

    constructor(){
        this.updateToken();
    }

    private updateToken = async () => {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            params,
            { headers: { Authorization: `Basic ${process.env.SPOTIFY_TOKEN}`, 'content-type': 'application/x-www-form-urlencoded' },}
        );
        this.token = response.data.access_token;
    }

    public getPlaylist = async (id: string) => {
        let response: any;
        try {
            try {
                response = await axios.get(
                    `https://api.spotify.com/v1/playlists/${id}?fields=tracks(items(track(name,artists(name))))`,
                    { headers: { Authorization: `Bearer ${this.token}` } }  
                );
            } catch (error: any) {
                if (error.response?.status === 401) {
                    await this.updateToken();
                    response = await axios.get(
                        `https://api.spotify.com/v1/playlists/${id}?fields=tracks(items(track(name,artists(name))))`,
                        { headers: { Authorization: `Bearer ${this.token}` } }
                    );
                }
            }
        } catch (e: any) {
            response.data = { tracks: { items: [] } };
        }

        return response.data.tracks.items.map(item => {
            return `${item.track.artists[0].name} ${item.track.name}`;
        });
    }

    public getAlbum = async (id: string) => {
        let response: any;
        try {
            try {
                response = await axios.get(
                    `https://api.spotify.com/v1/albums/${id}/tracks`,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
            } catch (error: any) {
                if (error.response?.status === 401) {
                    await this.updateToken();
                    response = await axios.get(
                        `https://api.spotify.com/v1/albums/${id}/tracks`,
                        { headers: { Authorization: `Bearer ${this.token}` } }
                    );
                }
            }
        } catch (e: any) {
            response.data = { items: [] };
        }

        return response.data.items.map(item => {
            return `${item.artists[0].name} ${item.name}`;
        });
    }

    public getTrack = async (id: string) => {
        let response: any;
        try {
            try {
                response = await axios.get(
                    `https://api.spotify.com/v1/tracks/${id}`,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
            } catch (error: any) {
                if (error.response?.status === 401) {
                    await this.updateToken();
                    response = await axios.get(
                        `https://api.spotify.com/v1/tracks/${id}`,
                        { headers: { Authorization: `Bearer ${this.token}` } }
                    );
                }
            }
        } catch (e: any) {
            response.data = {};
        }

        return `${response.data.artists[0].name} ${response.data.name}`;
    }
}
export default spotifyService;
