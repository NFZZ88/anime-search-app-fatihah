import { createSlice, createAsyncThunk} from "@reduxjs/toolkit";


export interface Anime { 
    mal_id: number;
    title: string;
    type?: string;
    score?:number;
    episodes?: number;
    images?:{
        jpg?: {image_url?: string}
    };
    synopsis?: string;
}

 interface SearchState {
    query: string;
    page: number;
    results: Anime[];
    totalPages: number;
    loading: boolean;
    error?: string | null;
}

const initialState: SearchState = {
    query: "",
    page: 1,
    results: [],
    totalPages:1,
    loading: false,
    error: null,
   
};

//Async thunk to fetch data
export const fetchSearchResults = createAsyncThunk<
{ results: Anime[]; totalPages: number; page: number},
{ query: string; page: number },
{ rejectValue: string }
>("search/fetch", 
async ({query,page}: { query: string, page: number }, thunkAPI) => {

 console.log("QUERY INPUT", query);

 const encoded =encodeURIComponent(query);

 //if(!encoded) return { results: [], totalPages: 1, page};
//const [input, debouncedInput] = useState("");
const url = `https://api.jikan.moe/v4/anime?q=${encoded}&page=${page}`;
const url2 = 'https://api.jikan.moe/v4/anime?q=Naruto&page=1'//testing purpose to check with url working

console.log("encoded", encoded);
console.log("fetching URL", url);
console.log("fetching URL", url2);//testing purpose



    try {
            const res = await fetch(url);
            if(!res.ok)  return thunkAPI.rejectWithValue('');
            console.log("STATUS:",res.status);

            const json =await res.json();
            console.log("JSON data :",json);
        
            //adapt response to our types -depends on API shape
            const results = (json.data || []).map((item: any) => ({
            mal_id: item.mal_id,
            title: item.title,
            synopsis: item.synopsis,
            image_url: item.images?.jpg?.image_url,
        }));

        //jikan return pagination info in data.pagination sometimes; fallback to page counts calculation

        const totalPages = json.pagination?.last_visible_page || 1;
        return { results, totalPages, page};
    }catch (err: any){
        //if (err.name === "AbortError") return thunkAPI.rejectWithValue("aborted");
        return thunkAPI.rejectWithValue(err.message ?? "unknown error");
    }
 });


const slice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setQuery(state, action){
            state.query = action.payload;
           
        },
        setPage(state, action){
            state.page = action.payload;
        },
        reset(state){
            Object.assign(state, initialState)
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSearchResults.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSearchResults.fulfilled, (state, action) => {
            state.loading=false;
            state.results = action.payload.results;
            state.page = action.payload.page;
            state.totalPages = action.payload.totalPages;
        })
        .addCase(fetchSearchResults.rejected, (state, action ) => {
            state.loading = false;
            state.error = action.payload ?? action.error.message ?? "Unknown";
            if(state.error ==="aborted") state.error = null;
        });
    },
});

export const { setQuery, setPage , reset } = slice.actions;
export default slice.reducer;
