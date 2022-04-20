# Google location bike commute

This repo contains a small node script to extract the days I commute by bike to work, from my google location history (or google timeline).

First, I 'll takeout my location history from google takeout: https://takeout.google.com/settings/takeout
It takes a couple of minutes to get, and it contains a bunch of json file.
Then I'll just run the script on the month from which I want to extract the data:

```bash
$ node index.mjs ~/Downloads/Takeout/Location\ History/Semantic\ Location\ History/2022/2022_MARCH.json Datadog
```

It outputs the day of the month it found bike commute, as well as the sum of bike commute.