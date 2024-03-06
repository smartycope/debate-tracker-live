from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from anytree import Node, find, find_by_attr
from anytree.importer import JsonImporter
from anytree.exporter import JsonExporter
from anytree.search import findall
from django.urls import reverse
import json
from django.core.serializers.json import DjangoJSONEncoder
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import *
from typing import Literal



# Structure: {argID: rootNode}
debates = {'1': Node('premise', id=0, children=[Node('arg1', id=1)])}
# Structure: {argID: [{"word": "", "definition": ""}, ]}
definitions = {}

def _countNodes(tree):
    return len(findall(tree, lambda: True))

def ensure_debate_exists(func):
    def inner(request, argID, *args, **kwargs):
        print('current debates:', debates)
        if argID not in debates:
            print(f'{argID} (of type {type(argID)}) is not a debate')
            return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            return func(request, argID=argID, *args, **kwargs)
    return inner


# Debates
@api_view(['PUT'])
@ensure_debate_exists
def edit(request, id, argID):
    global debates
    node = find_by_attr(debates[argID], id, 'id')
    if not node:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    node.name = request.data
    return Response(status=status.HTTP_202_ACCEPTED)

@api_view(['POST'])
@ensure_debate_exists
def add_sibling(request, id, argID):
    global debates
    node = find_by_attr(debates[argID], id, 'id')
    if not node:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    Node('', parent=node.parent, id=_countNodes(debates[argID]))
    return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
@ensure_debate_exists
def add_child(request, id, argID):
    global debates
    node = find_by_attr(debates[argID], id, 'id')
    if not node:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    Node('', parent=node, id=_countNodes(debates[argID]))
    return Response(status=status.HTTP_201_CREATED)

@api_view(['POST'])
@ensure_debate_exists
def load(request, argID):
    global debates
    # TODO: request.POST['contents'] may need to be replaced by reponse.data
    debates[argID] = JsonImporter().import_(request.data)
    # return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))
    return Response(status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@ensure_debate_exists
def clear(request, argID):
    global debates
    # debates[argID] = Node("Premise")
    premise = Node('', id=0)
    Node('', id=1, parent=premise)
    debates[argID] = premise
    return Response(status=status.HTTP_205_RESET_CONTENT)
    # return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))

@api_view(['DELETE'])
@ensure_debate_exists
def delete(request, id, argID):
    global debates
    print('TODO: delete')
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def new_debate(request, argID):
    global debates
    if argID in debates:
        return Response(status=status.HTTP_303_SEE_OTHER)
    else:
        premise = Node('', id=0)
        Node('', id=1, parent=premise)
        debates[argID] = premise
    return Response(status=status.HTTP_201_CREATED)

@api_view(['GET'])
@ensure_debate_exists
def get_debate(request, argID):
    global debates
    # return Response(JsonExporter().export(debates), content_type='application/json')
    return HttpResponse(JsonExporter().export(debates[argID]))


# Definitions
@api_view(['GET'])
@ensure_debate_exists
def get_defs(request, argID):
    global definitions
    return HttpResponse(json.dumps(definitions[argID]))

@api_view(['DELETE'])
@ensure_debate_exists
def clear_defs(request, argID):
    global definitions
    definitions[argID] = []
    return Response(status=status.HTTP_205_RESET_CONTENT)

@api_view(['POST'])
@ensure_debate_exists
def new_def(request, argID):
    global definitions
    definitions[argID].append({'word': '', 'definition': ''})
    return Response(status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@ensure_debate_exists
def edit_def(request, argID, idx, which:Literal['word', 'definition']):
    global definitions
    definitions[argID][idx][which] = request.data
    return Response(status=status.HTTP_202_ACCEPTED)

@api_view(['POST'])
@ensure_debate_exists
def load_defs(request, argID):
    global definitions
    definitions[argID] = request.data
    return Response(status=status.HTTP_201_CREATED)


# Misc
@api_view(['GET'])
def i_cant_brew_coffee(request):
    return Response(status=status.HTTP_418_IM_A_TEAPOT)

@api_view(['GET'])
def debug(request, argID):
    print(JsonExporter().export(debates[argID]))
    return Response(status=status.HTTP_204_NO_CONTENT)
