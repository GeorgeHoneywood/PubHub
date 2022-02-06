import urllib.parse
from typing import OrderedDict

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
import requests
import json
from django.conf import settings
# Create your views here.
from crawler.quickstart.serializers import ValhallaTripSerializer, ValhallaResponseSerializer, RouteResponseSerializer


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
            out["locations"].append(out["locations"][0])
            res = requests.get(f"{settings.VALHALLA_ENDPOINT}optimized_route?json={json.dumps(out)}")
            if res.status_code == requests.codes.ok:
                response_data = ValhallaResponseSerializer(data=res.json()['trip'])
                if response_data.is_valid():
                    shapes = [leg['shape'] for leg in response_data.validated_data['legs']]
                    locations = response_data.validated_data['locations'][:-1]
                    output_serializer = RouteResponseSerializer(data={'shapes': shapes, 'locations': locations})
                    if output_serializer.is_valid():
                        return Response(status=200, data=output_serializer.data)
            else:
                return Response(status=400, data=res.text)
        return Response(status=401, data=request_data.errors or response_data.errors or "")
