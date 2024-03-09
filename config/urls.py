"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from tree import views


urlpatterns = [
    path('admin/', admin.site.urls),
    # Debates
    path("api/<str:argID>/edit/<int:id>/", views.edit),
    path("api/<str:argID>/add_sibling/<int:id>/", views.add_sibling),
    path("api/<str:argID>/add_child/<int:id>/", views.add_child),
    path("api/<str:argID>/load/", views.load),
    path("api/<str:argID>/clear/", views.clear),
    path('api/<str:argID>/delete/<int:id>/', views.delete),
    path('api/<str:argID>/delete_debate/', views.delete_debate),
    path('api/<str:argID>/new_debate/', views.new_debate),
    path('api/<str:argID>/get_debate/', views.get_debate),
    path('api/<str:argID>/get_whole_debate/', views.get_whole_debate),
    path('api/<str:argID>/check_exists/', views.check_exists),
    path('api/get_all_debates/', views.get_all_debates),
    # Definitions
    path('api/<str:argID>/get_defs/', views.get_defs),
    path('api/<str:argID>/clear_defs/', views.clear_defs),
    path('api/<str:argID>/new_def/', views.new_def),
    path('api/<str:argID>/edit_def/<int:idx>/<str:which>/', views.edit_def),
    path('api/<str:argID>/load_defs/', views.load_defs),
    # MISC
    path('api/coffee/', views.i_cant_brew_coffee),
]
