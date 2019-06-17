#!/bin/sh

mv /Users/mark/documents/mapping/nmp-final-project/data/od/*.json .

echo 'age1_short'
tippecanoe -o age1_short.mbtiles -zg --drop-densest-as-needed age1_short.json
echo 'age1_medium'
tippecanoe -o age1_medium.mbtiles -zg --drop-densest-as-needed age1_medium.json
echo 'age1_long'
tippecanoe -o age1_long.mbtiles -zg --drop-densest-as-needed age1_long.json

echo 'age2_short'
tippecanoe -o age2_short.mbtiles -zg --drop-densest-as-needed age2_short.json
echo 'age2_medium'
tippecanoe -o age2_medium.mbtiles -zg --drop-densest-as-needed age2_medium.json
echo 'age2_long'
tippecanoe -o age2_long.mbtiles -zg --drop-densest-as-needed age2_long.json

echo 'age3_short'
tippecanoe -o age3_short.mbtiles -zg --drop-densest-as-needed age3_short.json
echo 'age3_medium'
tippecanoe -o age3_medium.mbtiles -zg --drop-densest-as-needed age3_medium.json
echo 'age3_long'
tippecanoe -o age3_long.mbtiles -zg --drop-densest-as-needed age3_long.json	

echo 'earn1_short'
tippecanoe -o earn1_short.mbtiles -zg --drop-densest-as-needed earn1_short.json
echo 'earn1_medium'
tippecanoe -o earn1_medium.mbtiles -zg --drop-densest-as-needed earn1_medium.json
echo 'earn1_long'
tippecanoe -o earn1_long.mbtiles -zg --drop-densest-as-needed earn1_long.json

echo 'earn2_short'
tippecanoe -o earn2_short.mbtiles -zg --drop-densest-as-needed earn2_short.json
echo 'earn2_medium'
tippecanoe -o earn2_medium.mbtiles -zg --drop-densest-as-needed earn2_medium.json
echo 'earn2_long'
tippecanoe -o earn2_long.mbtiles -zg --drop-densest-as-needed earn2_long.json

echo 'earn3_short'
tippecanoe -o earn3_short.mbtiles -zg --drop-densest-as-needed earn3_short.json
echo 'earn3_medium'
tippecanoe -o earn3_medium.mbtiles -zg --drop-densest-as-needed earn3_medium.json	
echo 'earn3_long'
tippecanoe -o earn3_long.mbtiles -zg --drop-densest-as-needed earn3_long.json

echo 'ind1_short'
tippecanoe -o ind1_short.mbtiles -zg --drop-densest-as-needed ind1_short.json
echo 'ind1_medium'
tippecanoe -o ind1_medium.mbtiles -zg --drop-densest-as-needed ind1_medium.json
echo 'ind1_long'
tippecanoe -o ind1_long.mbtiles -zg --drop-densest-as-needed ind1_long.json

echo 'ind2_short'
tippecanoe -o ind2_short.mbtiles -zg --drop-densest-as-needed ind2_short.json
echo 'ind2_medium'
tippecanoe -o ind2_medium.mbtiles -zg --drop-densest-as-needed ind2_medium.json
echo 'ind2_long'
tippecanoe -o ind2_long.mbtiles -zg --drop-densest-as-needed ind2_long.json

echo 'ind3_short'
tippecanoe -o ind3_short.mbtiles -zg --drop-densest-as-needed ind3_short.json
echo 'ind3_medium.'
tippecanoe -o ind3_medium.mbtiles -zg --drop-densest-as-needed ind3_medium.json	
echo 'ind3_long'
tippecanoe -o ind3_long.mbtiles -zg --drop-densest-as-needed ind3_long.json











