## Jupyter notebooks
A sampling of the notebooks used to complete data acquisition.  These will be improved in late March.
****

[Randomize Points in Polygon](points_within_polygons.ipynb) - A process to read Census Block polygon data and place random points within the polygon. This may come into play in one of the maps.   

[Process the Census Bureau TabBlock Dataset for Block Centroid Points](block_polygons_centroids.ipynb) - Reads all Census Block data files, finds centroid of polygons, output single CSV file.   

[Compare Dask dataframe to Pandas dataframe](compare_dask_pandas.ipynb) - A comparison of Dask & Pandas for processing large datasets.  

[Retrieve Census Tract Data](get_census_tracts.ipynb) - Download, extract, process, save as single CSV file, and remove downloaded and extracted shapefiles.  

[Retrieve Origin-Destintation Data](get_od_data.ipynb) - Download, extract, process, save as single CSV file, and remove downloaded and extracted OD data files.  

[Process OD data for KY](od_data_tracts_ky.ipynb) - Process the 109 million record OD CSV file for Commonwealth of KY.  Merge with the Census Tract data to obtain point data for residence and workplace tract centroids. Create LineString geometry for mapping commute lines. Filter data by commute lengths and only accept blocks with a total number of workers over 3000.

[Process ALL OD and Tract data](od_data_chunkd_test.ipynb) -Process the 109 million record OD CSV file.  Merge with the Census Tract data to obtain point data for residence and workplace tract centroids. Create LineString geometry for mapping commute lines. Filter data by commute lengths and only accept blocks with a total number of workers over 3000.