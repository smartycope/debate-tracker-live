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

# premise = Node('Premise!', id=0)
# sub1 = Node('sub1', parent=premise, id=1)
# sub2 = Node('sub2', parent=premise, id=2)
# subsub1 = Node('subsub1', parent=sub1, id=3)

# id_counter = 4

debates = {}

def _countNodes(tree):
    return len(findall(tree, lambda: True))


def index(request, argID):
    global debates
    if argID not in debates:
        premise = Node('', id=0)
        Node('', id=1, parent=premise)
        debates[argID] = premise
    print(debates)
    context = {'premise': debates[argID], 'json': JsonExporter(indent=4).export(debates[argID]), 'argID': argID}
    return render(request, 'tree/index.html', context)


def edit(request, id, argID):
    global debates
    print(type(argID))
    print(debates)
    find_by_attr(debates[argID], id, 'id').name = request.POST['arg']
    return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))


def add_sibling(request, id, argID):
    global debates
    Node('', parent=find_by_attr(debates[argID], id, 'id').parent, id=id_counter)
    id_counter += 1
    return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))


def add_child(request, id, argID):
    global debates
    Node('', parent=find_by_attr(debates[argID], id, 'id'), id=id_counter)
    id_counter += 1
    return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))

def load(request, argID):
    global debates
    debates[argID] = JsonImporter().import_(request.POST['contents'])
    return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))

def clear(request, argID):
    global debates
    debates[argID] = Node("Premise")
    return HttpResponseRedirect(reverse("tree:index", kwargs={"argID": argID}))
