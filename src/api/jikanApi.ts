import axios from "axios";
const api = axios.create({baseURL:"https://api.jikan.moe/v4",});
export const searchAnime = (query:string,page=1) => api.get('/anime',{ params:{q:query,page}});

export const getAnimeById = (id: string) => api.get(`/anime/${id}`);

