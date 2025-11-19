import React, { useEffect, useState} from 'react'
import { useParams, Link } from "react-router-dom";

export default function DetailPage (){
    const {id} = useParams<{ id: string}>()
    console.log("check id", id );
    const [loading, setLoading] = useState(true)
    const [error,setError] = useState<string | null>(null)
    const [data, setData] = useState<any | null>(null)


    useEffect(() =>{
        if(!id) return
        const controller = new AbortController()
        setLoading(true)
        fetch(`https://api.jikan.moe/v4/anime/${id}`,{signal: controller.signal})
        .then(res =>{
            if(!res.ok) throw new Error(String(res.status))
        return res.json()
  
     
        })
        .then(json=>{
            setData(json.data)
        })
        .catch(err=>{
            if(err.name ==='AbortError') return
            setError(err.message)
        })
        .finally(()=>setLoading(false))
        return () =>controller.abort()
    },[id])

    if(loading) return <div>Loading...</div>
    if(error)return <div style={{color:'red'}}>Error: {error}</div>
    if(!data) return <div>No data</div>

    return (
        <div style={{padding: 20}}>
            <Link to="/"> Back </Link>
            <h1>{data.title}</h1>
            <img src={data.images?.jpg?.image_url} alt={data.title} style={{maxWidth: 200}}/>
            <p>Total Episodes: {data.episodes}</p>
            <p>Status: {data.status}</p>
            <p>Synopsis: {data.synopsis}</p>

            {/* show more metadata */}

        </div>
    
    )
}