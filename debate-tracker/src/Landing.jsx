import React, { useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "./constants";
import { useNavigate } from "react-router";

export default function Landing(){
    const [valid, setValid] = useState(true)
    const [blocked, setBlocked] = useState(false)
    const enterText = useRef()
    const newText = useRef()
    const navigate = useNavigate()

    function check_exists(){
        if (enterText.current.value.length)
            return axios.get(API_URL + enterText.current.value + '/check_exists/').then(({data}) => data === 'True')
        else
            return false
        return false
    }

    function reroute(e){
        check_exists().then(rtn => console.log(rtn))
        // if (check_exists())
        //     navigate(enterText.current.value)
        // else
        //     setValid(false)
    }

    function start_new(e){
        check_exists().then(rtn => console.log(rtn))
        return
        if (newText.current.value.length){
            if (!check_exists())
                axios.post(API_URL + newText.current.value + '/new_debate/').then(() =>
                    navigate(newText.current.value)
                )
            else
                setBlocked(true)
        }
    }
    // No idea why this doesn't work
    // const tmp = valid && Boolean(enterText.current.value.length) && <button onClick={reroute}>Enter Debate</button>
    // console.log(tmp);
    // TODO: make the first one work like the 2nd one
    return <>
        <p>Please Enter the name of a debate to go to</p>
        <input ref={enterText} type="text" onChange={e => setValid(true)}></input>
        {!valid && <p>That debate does not exist yet. But you can start it</p>}
        <button onClick={reroute}>Enter Debate</button>
        {/* {tmp} */}
        <p>Or Make a new debate</p>
        <input ref={newText} type="text" onChange={e => setBlocked(false)}></input>
        {blocked && <p>That debate already exists, try a different name</p>}
        <button onClick={start_new}>Start Debate</button>
    </>
}
