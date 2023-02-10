export interface MetarsTable {
  id?: number;
  wkb_geometry;
  ogc_fid: number;
  station_id;
  auto;
  // 'elevation_ft',
  temp_c;
  dewpoint_c;
  wind_dir_degrees;
  observation_time;
  wind_speed_kt;
  wind_gust_kt;
  flight_category;
  raw_text;
  visibility_statute_mi;
  cloud_base_ft_agl_1;
  sky_cover_1;
  cloud_base_ft_agl_2;
  sky_cover_2;
  cloud_base_ft_agl_3;
  sky_cover_3;
  cloud_base_ft_agl_4;
  sky_cover_4;
  cloud_base_ft_agl_5;
  sky_cover_5;
  cloud_base_ft_agl_6;
  sky_cover_6;
  altim_in_hg;
  // 'sea_level_pressure_mb',
  wx_string;
  vert_vis_ft;
  // 'dewpointdepression',
  relativehumiditypercent;
  densityaltitudefeet;
}
