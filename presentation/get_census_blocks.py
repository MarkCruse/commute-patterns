# Establish FTP connection with Census Bureau
ftp = FTP('ftp2.census.gov')
ftp.login()
ftp.cwd('geo/tiger/TIGER2018/TABBLOCK/')

file_list = ftp.nlst()  #list of files in ftp dir

# print a list of all files in the FTP folder
print(file_list)

# Loop through the ftp files, download, extract, 
# load, and save
​
for index, zip_filename in enumerate(file_list):
    
    # create a file path for the download
    zip_path_file = ftpTmp.joinpath(file_list[index])
    
    # write download file to storage area
    fh = open (zip_path_file, "wb")
    print ("STARTED download for file: " + zip_filename)
    ftp.retrbinary("RETR " + zip_filename, fh.write)
    
    # open downloaded file for exdf
    fh = open(zip_path_file, "rb")
    zp = zipfile.ZipFile(fh)
    
    # call df function
    extract_files(zip_path_file)
    
    # assign file handles to each of the files extracted
    cpg, dbf, prj, shp, xml1, xml2, shx = [filename for 
        filename in zp.namelist()]
    
    fh.close
    zp.close
    print(shp)
    
    # add a path to the shapefile
    shape_file = ftpTmp.joinpath(shp)
    
    # call function to create a geodataframe
    df_gdf = get_data(shape_file)
    
    # call function to append the geodataframe to a list
    count_records = append_list(df_gdf, count_records)
    
    #removes files from temp directory
    zip_path_file.unlink()
    shape_file.unlink()
    file_to_rem = ftpTmp.joinpath(cpg)
    file_to_rem.unlink()    
    file_to_rem = ftpTmp.joinpath(dbf)
    file_to_rem.unlink()    
    file_to_rem = ftpTmp.joinpath(xml1)
    file_to_rem.unlink()    
    file_to_rem = ftpTmp.joinpath(xml2)
    file_to_rem.unlink()    
    file_to_rem = ftpTmp.joinpath(shx)
    file_to_rem.unlink()    
    file_to_rem = ftpTmp.joinpath(prj)
    file_to_rem.unlink()
​
    # get the current time on timer
    stop = timeit.default_timer()
    
    #create a numpy array to calculate time
    timer = np.array([(stop-start)/60])
    # call function to calculate minutes and seconds
    min_sec = get_time(timer)
    minutes, seconds = min_sec[0], min_sec[1]
    
def extract_files(zip_path_file):
    unpack_archive(str(zip_path_file), 
        extract_dir=str(ftpTmp))
    fh.close()
    
def get_data(filename):
  gdf = gpd.read_file(filename, 
   dtype={'GEOID10': 'object', 'INTPTLAT10': 'float', 
   'INTPTLON10': 'float'})
return gdf

def append_list(df_gdf, count_records):
    #keep only the rows that are not water
    df_gdf = df_gdf.drop(df_gdf[(df_gdf['AWATER10'] > 0) 
        & (df_gdf['ALAND10'] == 0)].index)
     
    #exclude Puerto Rico and island areas
    if str(df_gdf['STATEFP10'].unique()[0]) in st_list:
        df_list.append(df_gdf)
        count_records = count_records+len(df_gdf)
              
    # drop the columns that are not needed
    cols=['STATEFP10','COUNTYFP10','TRACTCE10','BLOCKCE10',
        'NAME10','MTFCC10','UR10','UACE10','UATYPE',
        'FUNCSTAT10','ALAND10','AWATER10','geometry']
    df_gdf.drop(cols, axis=1, inplace=True)
    # rename columns
    df_gdf.rename(columns={'GEOID10': 'block_geoid', 
        'INTPTLAT10': 'lat', 'INTPTLON10': 'lon'}, 
        inplace=True)

    return count_records
    