
# `pulltop`

`pulltop` is a CLI Pub/Sub subscriber and console logger for topics with text-based message payloads.

## Synopsis

Usage: `pulltop [-m <maxMessages>] [-d <ackDeadline>] <topic-name>`

```
$ pulltop projects/pubsub-public-data/topics/taxirides-realtime
{"ride_id":"d3dc1ed1-da73-4ff7-b459-1d384a2c357b","point_idx":176,"latitude":40.748270000000005,"longitude":-74.00376,"timestamp":"2020-10-19T20:41:55.23468-04:00","meter_reading":4.6102653,"meter_increment":0.02619469,"ride_status":"enroute","passenger_count":1}
{"ride_id":"062364d6-89ab-450f-97cd-dffc0d26c20a","point_idx":749,"latitude":40.733830000000005,"longitude":-73.98851,"timestamp":"2020-10-19T20:41:55.23515-04:00","meter_reading":15.112176,"meter_increment":0.02017647,"ride_status":"enroute","passenger_count":1}
{"ride_id":"d1eb9b0b-7639-41bb-a8ef-e0d628bd828b","point_idx":113,"latitude":40.76498,"longitude":-73.98416,"timestamp":"2020-10-19T20:41:55.23564-04:00","meter_reading":5.461667,"meter_increment":0.048333336,"ride_status":"enroute","passenger_count":2}
{"ride_id":"9fe2f0b2-689c-4295-ae10-75f544a1d595","point_idx":1002,"latitude":40.759640000000005,"longitude":-73.95788,"timestamp":"2020-10-19T20:41:55.23296-04:00","meter_reading":21.484406,"meter_increment":0.021441523,"ride_status":"enroute","passenger_count":6}
{"ride_id":"478f0e32-ec35-4ef1-b407-7be1723492a2","point_idx":16,"latitude":40.76003,"longitude":-73.9915,"timestamp":"2020-10-19T20:41:55.23319-04:00","meter_reading":0.7529412,"meter_increment":0.047058824,"ride_status":"enroute","passenger_count":1}
{"ride_id":"486976c7-6b33-4285-86af-81acb9657fc2","point_idx":611,"latitude":40.73969,"longitude":-73.97296,"timestamp":"2020-10-19T20:41:55.23328-04:00","meter_reading":16.896093,"meter_increment":0.02765318,"ride_status":"enroute","passenger_count":2}
{"ride_id":"a926e22e-ade3-4fb8-8fa4-0fa16f0eae54","point_idx":72,"latitude":40.78539000000001,"longitude":-73.98363,"timestamp":"2020-10-19T20:41:55.23599-04:00","meter_reading":1.7949579,"meter_increment":0.02492997,"ride_status":"enroute","passenger_count":1}
{"ride_id":"40f87cac-9c9d-4e45-a8a8-9b69b6488ce2","point_idx":2015,"latitude":40.730290000000004,"longitude":-73.91291000000001,"timestamp":"2020-10-19T20:41:55.23738-04:00","meter_reading":40.031425,"meter_increment":0.019866712,"ride_status":"enroute","passenger_count":2}
...
```

Use with other CLI tools:

```
$ pulltop projects/pubsub-public-data/topics/taxirides-realtime | jq .ride_id > /var/tmp/ride_ids.log 
^C
$ head /var/tmp/ride_ids.log 
"894dee5a-f6ae-4611-835a-233f79605543"
"4d1813d7-2656-49c8-8d7a-0a47ae33dc2c"
"10a15463-2a53-4345-9d91-5b1e4856920b"
"d10506fa-32ad-4366-af51-5002f247df02"
"e5060472-d5c7-484d-b3e1-349c41714678"
"e214f50e-5626-4df8-92ea-2aba709779d3"
"f8dd1f8a-9d79-4447-9f6c-bd27ddf6b194"
"9c5fc757-c531-4ce7-af06-9e8b8763880a"
"2d8f1d3e-a131-493d-be56-782b22332045"
"358a2f15-e52f-4420-8af0-5d08d487ec58"
```

Format for friendlier visual output:

```
$ pulltop projects/pubsub-public-data/topics/taxirides-realtime | jq
{
  "ride_id": "aafbd11f-f257-48f9-8ade-da0f7a9e47a4",
  "point_idx": 356,
  "latitude": 40.757600000000004,
  "longitude": -73.99695000000001,
  "timestamp": "2020-11-05T15:06:30.88008-05:00",
  "meter_reading": 10.380789,
  "meter_increment": 0.02915952,
  "ride_status": "enroute",
  "passenger_count": 1
}
{
  "ride_id": "951e69b5-2ad3-49b1-904d-ab7524e3b7a4",
  "point_idx": 1475,
  "latitude": 40.742520000000006,
  "longitude": -73.99952,
  "timestamp": "2020-11-05T15:06:32.02742-05:00",
  "meter_reading": 22.625082,
  "meter_increment": 0.015339038,
  "ride_status": "enroute",
  "passenger_count": 1
}
{
  "ride_id": "bac66af3-8340-459d-a375-1c8dfed69883",
  "point_idx": 325,
  "latitude": 40.766540000000006,
  "longitude": -73.99683,
  "timestamp": "2020-11-05T15:06:31.77781-05:00",
  "meter_reading": 10.010292,
  "meter_increment": 0.0308009,
  "ride_status": "enroute",
  "passenger_count": 1
}
...
^C
```

## Installation

`npm install -g pulltop`

## Design

`pulltop` creates a subscription as needed to receive messages from a topic. It aspires to delete the subscription upon termination of its CLI process, but if shutdown uncleanly it *will* leave orphaned subscriptions. Depending on how `pulltop` is employed, this could accumulate orphaned subscriptions that consume unnecessary quota if not periodically maintained.

`pulltop` acknowledges messages it receives over the subscription,
but since a new subscription is created by pulltop upon instantiation,
it cannot interfere with the acknowledgement of messages destined for
other subscriptions on the specified topic.

## See also

`pulltop` is used (alongside `websocketd`) to [Stream Pub/Sub messages over Websockets](https://cloud.google.com/solutions/streaming-cloud-pub-sub-messages-over-websockets) and in the package [gke-pubsub-websocket-adapter](https://github.com/GoogleCloudPlatform/gke-pubsub-websocket-adapter).

## Disclaimers

_This is not an officially supported Google product._

`pulltop` is under active development. Interfaces and functionality may change at any time.

## License

This repository  is licensed under the Apache 2 license (see [LICENSE](LICENSE.txt)).

Contributions are welcome. See [CONTRIBUTING](CONTRIBUTING.md) for more information.
