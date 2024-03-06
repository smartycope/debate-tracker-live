import './App.css';
import Arg from './Arg';
import { useEffect, useState } from 'react';
// import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import Sidebar from './Sidebar';
import axios from "axios";
import { API_URL } from "./constants"


const debugDefault = {
    name: "Premise!",
    id: 0,
    children: [
        {
            name: "Rebuttal 1",
            id: 1,
            children: [
                {
                    name: "Sub Sub 1",
                    id: 2,
                    children: []
                }
            ]
        },
        {
            name: "Rebuttal 2",
            id: 3,
            children: []
        }
    ]
}
const defaultDebate = {
    name: "",
    id: 0,
    children: [{
        name: "",
        id: 1,
        children: []
    }]
}
const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
// TODO


export default function App() {
    var [debate, setDebate] = useState(DEBUG ? debugDefault : defaultDebate)
    var [defs, setDefs] = useState(DEBUG ? [{'word': 'sign', 'definition': 'uhh, its a sign.'}] : [])
    var [openSidebar, setOpenSidebar] = useState(false)
    const argID = '1'
    const API = API_URL + argID + '/'
    console.log(API);

    function serialize(){
        // TODO just make this a list, and THEN stringify it
        return '[' + JSON.stringify(debate) + ", " + JSON.stringify(defs) + ']'
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
                axios.post(API + 'load/', _debate).then(() => setDebate(_debate))
                axios.post(API + 'load_defs/', _defs).then(() => setDefs(_defs))
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

    // To confirm before reloading or closing
    useEffect(() => {
        axios.get(API + 'get_debate/').then(({data}) => setDebate(JSON.parse(data)))

        const unloadCallback = (event) => {
          event.preventDefault();
          event.returnValue = "";
          return "";
        };

        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, [])

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
                <label  htmlFor="fileInput" className="label-for-file">📂 Load Debate</label>
                <input  className="load-button" type="file" id="fileInput" className="input-for-file" onChange={handleFileSelection}/>
            </div>
            <div className='buttons-group'>
                <button className="expand-button" onClick={handleOpenAll}>📖 Expand All</button>
                <button className="collapse-button" onClick={handleCloseAll}>📕 Collapse All</button>
            </div>
        </div>
    </div>
  )
}
