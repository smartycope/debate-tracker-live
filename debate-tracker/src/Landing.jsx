import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "./constants";
import { useNavigate } from "react-router";
import "./Landing.css"

export default function Landing(){
    const [valid, setValid] = useState(true)
    const [blocked, setBlocked] = useState(false)
    const [debates, setDebates] = useState(<></>)
    const enterText = useRef()
    const newText = useRef()
    const navigate = useNavigate()

    function check_exists(debate){
        if (debate.length)
            return axios.get(API_URL + debate + '/check_exists/').then(({data}) => data === 'True')
        else
            return false
    }

    function reroute(e){
        check_exists(enterText.current.value).then(exists =>
            exists ?
            navigate(enterText.current.value) :
            setValid(false)
        )
    }

    function start_new(e){
        const text = newText.current.value
        if (text.length){
            check_exists(text).then(exists =>
                exists ?
                setBlocked(true) :
                axios.post(API_URL + text + '/new_debate/').then(() => navigate(text))
            )
        }
    }

    useEffect(() => {
        // This fetches the list of all debates (formatted as [['name', "premise"], ...])
        // and formates them as buttons to be put in the sidebar
        async function fetch_debates(){
            axios.get(API_URL + 'get_all_debates/').then(({data}) =>
                setDebates(data.map(([name, premise]) =>
                    <li key={name}><button title={premise} onClick={e => navigate(name)}>{name}</button></li>
                ))
            )
        }
        fetch_debates()
    }, [navigate])

    return <>
        <p>Please Enter the name of a debate to go to</p>
        <input ref={enterText} type="text" onChange={e => setValid(true)}></input>
        {!valid && <p>That debate does not exist yet. But you can start it</p>}
        <button onClick={reroute}>Enter Debate</button>
        <p>Or Make a new debate</p>
        <input ref={newText} type="text" onChange={e => setBlocked(false)}></input>
        {blocked && <p>That debate already exists, try a different name</p>}
        <button onClick={start_new}>Start Debate</button>
        <div id="sidebar">
            <h1>Current Debates</h1>
            <ul>
                {debates}
            </ul>
        </div>
    </>
}
