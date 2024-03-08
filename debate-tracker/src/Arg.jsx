import React, { useRef } from "react";
import {getNodeCount, addToTree, editText, removeNode} from "./treeFuncs";
import axios from "axios";
import { API_URL } from "./constants"


export default function Arg({node, debate, setDebate, argID, last=false, premise=false}) {
    var content = useRef()
    const API = API_URL + argID + '/'

    // Recurse
    const childs = node.children?.map(child => <Arg
        key={child.id}
        node={child}
        debate={debate}
        argID={argID}
        setDebate={setDebate}
        last={child === node.children[node.children.length - 1]}
    />)

    var newNode = {
        name: "",
        id: getNodeCount(debate),
        children: []
    }

    function handleAddRebuttal(e){
        axios.post(API + `add_child/${node.id}/`).then(() =>
            setDebate(addToTree(debate, newNode, node.id))
        )
    }

    function handleAddSiblingRebuttal(e){
        axios.post(API + `add_sibling/${node.id}/`).then(() =>
            setDebate(addToTree(debate, newNode, node.id, true))
        )
    }

    function handleEdited(e){
        axios.put(API + `edit/${node.id}/`, content.current.innerText).then(() =>
            setDebate(editText(debate, content.current.innerText, node.id))
        )
    }

    function handleRemove(e){
        if (window.confirm('❕ Delete arguement and rebuttals?'))
            axios.delete(API + `delete/${node.id}/`).then(() =>
                setDebate(removeNode(debate, node.id))
            )
    }


    const area = <pre
        className="editable"
        contentEditable='true'
        onClick={e => e.preventDefault()}
        id={premise ? 'premise' : `text${node.id}`}
        onBlur={handleEdited}
        ref={content}
    >{node.name}</pre>

    if (premise)
        return(<>
            {area}
            {childs}
            </>
        )
    else
        return(
            // This is to prevent details from toggling when space is *released* (not pressed)
            <details open onKeyUp={e => e.preventDefault()}>
                <summary>
                    {area}
                    <button onClick={handleAddRebuttal}>➕ Add Rebuttal</button>
                    {last && <button onClick={handleAddSiblingRebuttal}>➕ Add Sibling Rebuttal</button>}
                    <button onClick={handleRemove}>❌ Delete</button>
                </summary>
                {childs}
            </details>
        )
}
