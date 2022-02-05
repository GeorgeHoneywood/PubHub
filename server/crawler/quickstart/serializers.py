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

    @classmethod
    def decode(cls, encoded):
        inv = 1.0 / 1e6
        decoded = []
        previous = [0, 0]
        i = 0
        # for each byte
        while i < len(encoded):
            # for each coord (lat, lon)
            ll = [0, 0]
            for j in [0, 1]:
                shift = 0
                byte = 0x20
                # keep decoding bytes until you have this coord
                while byte >= 0x20:
                    byte = ord(encoded[i]) - 63
                    i += 1
                    ll[j] |= (byte & 0x1f) << shift
                    shift += 5
                # get the final value adding the previous offset and remember it for the next
                ll[j] = previous[j] + (~(ll[j] >> 1) if ll[j] & 1 else (ll[j] >> 1))
                previous[j] = ll[j]
            # scale by the precision and chop off long coords also flip the positions so
            # its the far more standard lon,lat instead of lat,lon
            decoded.append([float('%.6f' % (ll[1] * inv)), float('%.6f' % (ll[0] * inv))])
        # hand back the list of coordinates
        return decoded
