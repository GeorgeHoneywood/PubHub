from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lon = serializers.FloatField()


class DirectionOptionsSerializer(serializers.Serializer):
    units = serializers.ChoiceField(choices=['miles', 'kilometers'])


class ValhallaTripSerializer(serializers.Serializer):
    locations = LocationSerializer(many=True, required=True)
    costing = serializers.ChoiceField(choices=['auto', 'bicycle', 'pedestrian'], required=False, default='pedestrian')
    directions_options = DirectionOptionsSerializer(required=False, default=DirectionOptionsSerializer({'units': 'miles'}))
    id = serializers.CharField(required=False)

    class Meta:
        fields = ('locations', 'costing', 'directions_options', 'id')


class LegsSerializers(serializers.Serializer):
    shape = serializers.CharField(required=True)

    class Meta:
        fields = ('shape')


class ValhallaResponseSerializer(serializers.Serializer):
    legs = LegsSerializers(many=True)
    status_message = serializers.CharField(required=False)
    status = serializers.IntegerField(required=False)
    units = serializers.ChoiceField(choices=['miles', 'kilometers'], required=False)

    class Meta:
        fields = ('legs', 'status_message', 'status', 'units')

