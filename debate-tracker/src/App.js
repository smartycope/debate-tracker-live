import './App.css';
import Arg from './Arg';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import axios from "axios";
import { API_URL } from "./constants"
import { useNavigate, useParams } from 'react-router';


const defaultDebate = {
    name: "",
    id: 0,
    children: [{
        name: "",
        id: 1,
        children: []
    }]
}
// const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'


export default function App() {
    const [debate, setDebate] = useState(defaultDebate)
    const [defs, setDefs] = useState([])
    const [openSidebar, setOpenSidebar] = useState(false)
    const [errMsg, setErrMsg] = useState(null)
    const { argID } = useParams()
    const navigate = useNavigate()
    const API = API_URL + argID + '/'

    function serialize(){
        return JSON.stringify([debate, defs])
    }

    const handleDownload = e => {
        // Create a Blob with the contents and set the MIME type
        const blob = new Blob([serialize()], { type: 'application/json' });

        // Create a link (anchor) element
        const link = document.createElement('a');

        // Set the download attribute and href with the Blob
        link.download = "debate.json";
        link.href = URL.createObjectURL(blob);

        // Append the link to the body and trigger a click event
        document.body.appendChild(link);
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    }

    function handleFileSelection(e) {
        if (e.target.files.length > 0) {
            var reader = new FileReader()
            reader.onload = function(e) {
                const [_debate, _defs] = JSON.parse(e.target.result)
                axios.post(API + 'load/', _debate)
                axios.post(API + 'load_defs/', _defs)
                window.location.reload()
                // TODO: eventually figure out how to overwrite stuff in text boxes with a defaultValue set
                // setDebate(_debate)
                // setDefs(_defs)
            }
            reader.readAsText(e.target.files[0]);
        } else
            alert("Failed to load file");
    }

    const handleClearAll = e => {
        if(window.confirm('⚠️ Clear whole arguement? All unsaved arguements will be lost.')){
            axios.delete(API + 'clear/').then(() => setDebate(defaultDebate))
            axios.delete(API + 'clear_defs/').then(() => setDefs([]))
        }
    }

    function handleOpenAll(e){
        for (const d of document.getElementsByTagName('details'))
            d.setAttribute('open', true)
    }

    function handleCloseAll(e){
        for (const d of document.getElementsByTagName('details'))
            d.removeAttribute('open')
    }

    function setDef(id, key, to){
        var copy = JSON.parse(JSON.stringify(defs))
        copy[id][key] = to
        axios.put(API + `edit_def/${id}/${key}/`, to).then(() => setDefs(copy))
    }

    function newDef(){
        var copy = JSON.parse(JSON.stringify(defs))
        copy.push({'word': '', 'definition': ''})
        axios.post(API + 'new_def/').then(() => setDefs(copy))
    }

    useEffect(() => {
        // Load the debate with the correct data
        axios.get(API + 'get_whole_debate/')
            .then(({data}) => {
                // console.log(data);
                const [_debate, _defs] = data
                setDebate(_debate)
                setDefs(_defs)
            })
            .catch((err) => {
                switch (err.code){
                    case "ERR_BAD_REQUEST":
                        setErrMsg(<>
                            <h2>Invalid Debate</h2>
                            <button onClick={e => navigate('/')}>Go Home</button>
                        </>)
                        break
                    case "ERR_NETWORK":
                        setErrMsg(<h2>Can't find server. Is it on?</h2>)
                        break
                    default:
                        console.log(err)
                        setErrMsg(<h2>Unknown Server Error</h2>)
                }
            })

        // // To confirm before reloading or closing
        // const unloadCallback = (event) => {
        //     event.preventDefault();
        //     event.returnValue = "";
        //     return "";
        // }

        // window.addEventListener("beforeunload", unloadCallback);
        // return () => window.removeEventListener("beforeunload", unloadCallback);
    }, [API, navigate])

    if (errMsg !== null)
        return errMsg

    return (
    <div className="App">
        <Sidebar data={defs} setDef={setDef} newDef={newDef} isOpen={openSidebar} onOpen={e => setOpenSidebar(true)} onClose={e => setOpenSidebar(false)}/>
        <header>Premise:</header>
        <main className='main-content'>
            <Arg node={debate} debate={debate} setDebate={setDebate} argID={argID} key={0} premise={true} />
        </main>
        <hr/>
        <div className='buttons'>
            <div className='buttons-group'>
                <button className="sidebar-button" onClick={e => setOpenSidebar(!openSidebar)}>📜 Show Definitions</button>
                <button className="clear-button" onClick={handleClearAll}>🗑️ Clear Debate</button>
            </div>
            <div className='buttons-group'>
                <button className="download-button" onClick={handleDownload}>💾 Dowload Debate</button>
                <label htmlFor="fileInput" className="label-for-file">📂 Load Debate</label>
                <input type="file" id="fileInput" className="input-for-file" onChange={handleFileSelection}/>
            </div>
            <div className='buttons-group'>
                <button className="expand-button" onClick={handleOpenAll}>📖 Expand All</button>
                <button className="collapse-button" onClick={handleCloseAll}>📕 Collapse All</button>
            </div>
            <div className='buttons-group'>
                <button onClick={e => navigate('/')}>🏠 Go to Home Page</button>
            </div>
        </div>
    </div>
  )
}
