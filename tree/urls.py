from django.urls import path

from . import views

app_name = 'tree'
urlpatterns = [
    path("", views.index, name="index"),
    path("edit/<int:id>/", views.edit, name="edit"),
    path("add_sibling/<int:id>/", views.add_sibling, name="add_sibling"),
    path("add_child/<int:id>/", views.add_child, name="add_child"),
    path("load/", views.load, name="load"),
    path("clear/", views.clear, name="clear"),
]
