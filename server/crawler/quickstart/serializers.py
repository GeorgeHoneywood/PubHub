from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lon = serializers.FloatField()
    original_index = serializers.IntegerField(required=False)


class DirectionOptionsSerializer(serializers.Serializer):
    units = serializers.ChoiceField(choices=['miles', 'kilometers'])


class ValhallaTripSerializer(serializers.Serializer):
    locations = LocationSerializer(many=True, required=True)
    costing = serializers.ChoiceField(choices=['auto', 'bicycle', 'pedestrian'], required=False, default='pedestrian')
    directions_options = DirectionOptionsSerializer(required=False, default=DirectionOptionsSerializer({'units': 'kilometers'}))
    id = serializers.CharField(required=False)

    class Meta:
        fields = ('locations', 'costing', 'directions_options', 'id')


class SummarySerializer(serializers.Serializer):
    time = serializers.FloatField()
    length = serializers.FloatField()

    class Meta:
        fields = ('time', 'length')

class LegsSerializers(serializers.Serializer):
    shape = serializers.CharField(required=True)
    # time = serializers.FloatField(required=True)
    # length = serializers.FloatField(required=True)
    summary = SummarySerializer(required=True)
    class Meta:
        fields = ('shape', 'summary')


class ValhallaResponseSerializer(serializers.Serializer):
    legs = LegsSerializers(many=True)
    status_message = serializers.CharField(required=False)
    status = serializers.IntegerField(required=False)
    units = serializers.ChoiceField(choices=['miles', 'kilometers'], required=False)
    locations = LocationSerializer(many=True, required=True)

    class Meta:
        fields = ('legs', 'status_message', 'status', 'units', 'locations')


class RouteResponseSerializer(serializers.Serializer):
    locations = LocationSerializer(many=True, required=True)
    shapes = serializers.ListField(child=serializers.CharField())
    time = serializers.FloatField(required=True)
    distance = serializers.FloatField(required=True)

    class Meta:
        field = ('locations', 'shapes', 'time', 'distance')
