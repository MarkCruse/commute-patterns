## Jupyter Notebooks
The Jupyter notebooks retrieve and process the needed data to create the final map. The list below are the processes needed to aquire the data from Census files and generate the tiles to load into Mapbox for display in an interactive map.

****

[Download Census Origin Destination Data](get_od_aux_data.ipynb) - Download each state's od_main_JT01_2015 and od_aux_JT01_2015. Append the data into a single dataframe and output to od_aux.csv.gz 

[Process the Census Bureau TabBlock Dataset for Block Centroid Points](get_census_blocks.ipynb) - Reads every states Census Block Group data file. Extracts the centroid point for each block group. Output single CSV file.   

[Merge origin destination data with centroid](merge_od_aux_centroids_1k-15k.ipynb) - This workbooks joins the output from the previous processes to create a latitude and longitude coordinates for each work location and home location per line record.  The output data is filtered to only include work locations that employ more than 1,000 and less than 15,000.  Dask dataframes are used to chunk the data into smaller memory manageable dataframes.

[Process data for commute length](write_main_and_each_state_od-aux1k-15k.ipynb) - The data from above is filtered in this step to identify all records where the commute distance is between 15 - 60 miles. A single file is output as well as an individual file for each state.

[Create GeoJSON files for the 3 age groups](write_age_to_geojson.ipynb) - Filter the data by age and commute length to generate a GEOJSON dataset for each of the 3 age groups in the origin-destination Census data. Each of the 3 age groups will have a separate GEOJSON file based on the commute lengths previously identified in the project specifications.

[Create GeoJSON files for the 3 earnings groups](write_earnings_to_geojson.ipynb) - Filter the data by earnings and commute length to generate a GEOJSON dataset for each of the 3 earnings groups in the origin-destination Census data. Each of the 3 earnings groups will have a separate GEOJSON file based on the commute lengths previously identified in the project specifications.

[Create GeoJSON files for the 3 industry groups](write_industry_to_geojson.ipynb) - Filter the data by industry and commute length to generate a GEOJSON dataset for each of the 3 industry groups in the origin-destination Census data. Each of the 3 industry groups will have a separate GEOJSON file based on the commute lengths previously identified in the project specifications.

[Create statistics data](write_stats_commute_1k-15k_15-60_miles.ipynb) - Aggregate the data along the work location to create a work location file that contains the information for each work location by the commute length.

