from django.http import HttpResponse
from anytree import Node, find, find_by_attr, RenderTree, findall_by_attr
from anytree.importer import JsonImporter, DictImporter
from anytree.exporter import JsonExporter, DictExporter
from anytree.search import findall
import json
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from typing import Literal
from django.utils.text import slugify

DEBUG = False
LOGS = True
delete_debate_password = "simon-says"


if DEBUG:
    debates = {'1': Node('premise', id=0, children=[Node('arg1', id=1, children=[])]), slugify('Does Ethan suck?'): Node('Ethan Sucks', id=0, children=[Node('No he doesnt!', id=1, children=[])])}
    definitions = {'1': [{"word": "from Django", "definition": "def"}], slugify('Does Ethan suck?'): []}
else:
    # Structure: {argID: rootNode}
    debates = {}
    # Structure: {argID: [{"word": "", "definition": ""}, ]}
    definitions = {}


if LOGS: print('Top-level running')


def _parse_response(request):
    if len(resp := list(request.data.keys())):
        return resp[0]
    else:
        return

def _countNodes(tree):
    return len(findall(tree, lambda *_: True))

def ensure_debate_exists_and_is_valid(func):
    def inner(request, argID, *args, **kwargs):
        global debates, definitions

        argID = slugify(argID)

        # Check for duplicate ids and remove extras if there are any
        nodes = findall_by_attr(debates[argID], id, 'id')
        if len(nodes) > 1:
            for node in nodes[1::-1]:
                if LOGS: print('Found duplicate nodes, deleting one')
                nodes[i].parent = None

        if argID not in debates:
            if LOGS: print(f'{argID} (of type {type(argID)}) is not a debate')
            return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            rtn = func(request, argID=argID, *args, **kwargs)
            if LOGS: print('Current debate:\n', DictExporter().export(debates[argID]))
            if LOGS: print('Current defs:\n', definitions[argID])
            return rtn
    return inner

def _get_node(argID, id):
    nodes = findall_by_attr(debates[argID], id, 'id')
    if len(nodes):
        return nodes[0]

# Debates
@api_view(['PUT'])
@ensure_debate_exists_and_is_valid
def edit(request, id, argID):
    global debates
    node = _get_node(argID, id)
    if not node:
        if LOGS: print(f'Invalid edit request given: id: {id}, argID: {argID}')
        return Response(status=status.HTTP_400_BAD_REQUEST)
    node.name = _parse_response(request)
    return Response(status=status.HTTP_202_ACCEPTED)

@api_view(['POST'])
@ensure_debate_exists_and_is_valid
def add_sibling(request, id, argID):
    global debates
    node = _get_node(argID, id)
    if not node:
        if LOGS: print(f'Invalid sibling creation request given: id: {id}, argID: {argID}')
        return Response(status=status.HTTP_400_BAD_REQUEST)
    Node('', parent=node.parent, id=_countNodes(debates[argID]))
    return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
@ensure_debate_exists_and_is_valid
def add_child(request, id, argID):
    global debates
    node = _get_node(argID, id)
    if not node:
        if LOGS: print(f'Invalid child creation request given: id: {id}, argID: {argID}')
        return Response(status=status.HTTP_400_BAD_REQUEST)
    Node('', parent=node, id=_countNodes(debates[argID]))
    return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
@ensure_debate_exists_and_is_valid
def load(request, argID):
    global debates
    if LOGS: print(f'Loading new debate into debate {argID}')
    debates[argID] = DictImporter().import_(request.data)
    return Response(status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@ensure_debate_exists_and_is_valid
def clear(request, argID):
    global debates
    if LOGS: print(f'Clearing debate {argID}')
    premise = Node('', id=0)
    Node('', id=1, parent=premise)
    debates[argID] = premise
    return Response(status=status.HTTP_205_RESET_CONTENT)

@api_view(['DELETE'])
@ensure_debate_exists_and_is_valid
def delete(request, id, argID):
    global debates
    node = _get_node(argID, id)
    if not node:
        if LOGS: print(f'Invalid delete request given. argID: {argID}')
        return Response(status=status.HTTP_400_BAD_REQUEST)
    else:
        node.parent = None
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def new_debate(request, argID):
    global debates, definitions
    argID = slugify(argID)
    if argID in debates:
        if LOGS: print(f'New debate requested, but it already exists: {argID}')
        return Response(status=status.HTTP_303_SEE_OTHER)
    else:
        premise = Node('', id=0)
        Node('', id=1, parent=premise)
        debates[argID] = premise
        definitions[argID] = []
    if LOGS: print(f'New debate created: {argID}')
    return Response(status=status.HTTP_201_CREATED)

@api_view(['GET'])
@ensure_debate_exists_and_is_valid
def get_debate(request, argID):
    global debates
    return HttpResponse(JsonExporter().export(debates[argID]))

@api_view(['GET'])
def check_exists(request, argID):
    global debates
    return HttpResponse(slugify(argID) in debates)

@api_view(['GET'])
def get_all_debates(request):
    global debates
    return HttpResponse(json.dumps([[key, premise.name] for key, premise in debates.items()]))

@api_view(['GET'])
@ensure_debate_exists_and_is_valid
def get_whole_debate(request, argID):
    global debates, definitions
    return HttpResponse(json.dumps([DictExporter().export(debates[argID]), definitions[argID]]))

@api_view(['DELETE'])
@ensure_debate_exists_and_is_valid
def delete_debate(request, argID):
    global debates, definitions
    if request.data == delete_debate_password and argID in debates:
        del debates[argID]
        del definitions[argID]
        if LOGS: print(f'Deleted debate: {argID}')
        return Response(status=status.HTTP_202_ACCEPTED)
    else:
        if request.data != delete_debate_password:
            if LOGS: print(f'Invalid password attempt: `{request.data}`')
        else:
            if LOGS: print(f'Cant delete debate, it doesnt exist: {argID}')
        return Response(status=status.HTTP_406_NOT_ACCEPTABLE)



# Definitions
@api_view(['GET'])
@ensure_debate_exists_and_is_valid
def get_defs(request, argID):
    global definitions
    return HttpResponse(json.dumps(definitions[argID]))

@api_view(['DELETE'])
@ensure_debate_exists_and_is_valid
def clear_defs(request, argID):
    global definitions
    if LOGS: print(f'Clearing definitions: {argID}')
    definitions[argID] = []
    return Response(status=status.HTTP_205_RESET_CONTENT)

@api_view(['POST'])
@ensure_debate_exists_and_is_valid
def new_def(request, argID):
    global definitions
    definitions[argID].append({'word': '', 'definition': ''})
    return Response(status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@ensure_debate_exists_and_is_valid
def edit_def(request, argID, idx, which:Literal['word', 'definition']):
    global definitions
    definitions[argID][idx][which] = _parse_response(request)
    return Response(status=status.HTTP_202_ACCEPTED)

@api_view(['POST'])
@ensure_debate_exists_and_is_valid
def load_defs(request, argID):
    global definitions
    definitions[argID] = request.data
    if LOGS: print(f'Definitions added to debate {argID}')
    return Response(status=status.HTTP_201_CREATED)


# Misc
@api_view(['GET'])
def i_cant_brew_coffee(request):
    return Response(status=status.HTTP_418_IM_A_TEAPOT)
