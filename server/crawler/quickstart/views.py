from typing import OrderedDict

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
import requests
import json
from django.conf import settings
# Create your views here.
from crawler.quickstart.serializers import ValhallaTripSerializer, ValhallaResponseSerializer


class TripView(APIView):

    def post(self, request, format=None):
        request_data = ValhallaTripSerializer(data=request.data)
        response_data = None
        if request_data.is_valid():
            data: OrderedDict = request_data.validated_data
            out = {}
            for k, v in data.items():
                if issubclass(v.__class__, serializers.Serializer):
                    out[k] = v.data
                    pass
                else:
                    out[k] = v
            url = f"{settings.VALHALLA_ENDPOINT}optimized_route?json={json.dumps(out)}"
            res = requests.get(url)
            if res.status_code == requests.codes.ok:
                response_data = ValhallaResponseSerializer(data=res.json())
                if response_data.is_valid():
                    shapes = [leg.shape for leg in response_data.data.legs]
                    return Response(status=200, data=shapes)
        return Response(status=401, data=request_data.errors or response_data or "")
