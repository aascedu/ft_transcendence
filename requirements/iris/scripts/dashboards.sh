#!/bin/bash
COLOR_GREEN='\e[1;32m'
COLOR_RED='\e[1;31m'
COLOR_RESET='\e[0m'

# Define the URL for Elasticsearch
KIBANA_URL="localhost:5601"

# Define the path to the CA certificate
CA_CERT="/usr/share/kibana/config/certs/ca/ca.crt"

set -e

# Check Dashboards existance
response=$(curl -X GET "http://$KIBANA_URL/api/kibana/dashboards/export?dashboard=45c31047-8d22-4496-88a1-187eaee249c7" \
                -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
                --cacert "$CA_CERT" \
                -H 'kbn-xsrf: true')

# curl -X GET "http://localhost:5601/api/kibana/dashboards/export?dashboard=45c31047-8d22-4496-88a1-187eaee249c7" \
#                 -u elastic:elastic123 \
#                 --cacert "/usr/share/kibana/config/certs/ca/ca.crt" \
#                 -H 'kbn-xsrf: true'

if [[ "$response" == *"Nginx-Dashboard"* ]]; then
  echo -e "${COLOR_GREEN}All Dashboards creation completed.${COLOR_RESET}"
  exit 0
else
  echo -e "${COLOR_GREEN}Creating Dashboards...${COLOR_RESET}"

# Creating Dashboards
  response=$(curl -X POST "$KIBANA_URL/api/kibana/dashboards/import?exclude=index-pattern" \
  -u ${ELASTIC_USER}:${ELASTIC_PASSWORD} \
  --cacert "$CA_CERT" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d'
  {
    "version": "8.14.1",
    "objects": [
      {
        "id": "45c31047-8d22-4496-88a1-187eaee249c7",
        "type": "dashboard",
        "namespaces": [
          "default"
        ],
        "updated_at": "2024-06-19T12:37:25.223Z",
        "created_at": "2024-06-19T12:03:29.187Z",
        "version": "Wzc5LDJd",
        "attributes": {
          "version": 2,
          "kibanaSavedObjectMeta": {
            "searchSourceJSON": "{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"
          },
          "description": "",
          "refreshInterval": {
            "pause": true,
            "value": 60000
          },
          "timeRestore": true,
          "optionsJSON": "{\"useMargins\":true,\"syncColors\":false,\"syncCursor\":true,\"syncTooltips\":false,\"hidePanelTitles\":false}",
          "panelsJSON": "[{\"type\":\"visualization\",\"gridData\":{\"x\":0,\"y\":0,\"w\":25,\"h\":18,\"i\":\"789bc009-06f7-4672-bd07-f60509544c34\"},\"panelIndex\":\"789bc009-06f7-4672-bd07-f60509544c34\",\"embeddableConfig\":{\"savedVis\":{\"id\":\"\",\"title\":\"\",\"description\":\"\",\"type\":\"markdown\",\"params\":{\"fontSize\":12,\"openLinksInNewTab\":false,\"markdown\":\"# Nginx Logs Dashboard\\n\\n## Overview\\nWelcome to the Nginx Logs Dashboard. This dashboard provides a comprehensive view of the logs generated by our Nginx servers.\\n## Why We Monitor Nginx Logs\\n1. **Performance Monitoring**: Analyzing response times and request rates helps in identifying performance bottlenecks.\\n2. **Error Tracking**: Detecting 4xx and 5xx status codes early helps in troubleshooting client and server errors.\\n3. **Security Analysis**: Monitoring access patterns can reveal unauthorized access attempts and potential security threats.\\n4. **Traffic Insights**: Understanding traffic patterns assists in capacity planning and improving the user experience.\\n\\nRegularly reviewing Nginx logs ensures our web applications run smoothly, securely, and efficiently.\"},\"uiState\":{},\"data\":{\"aggs\":[],\"searchSource\":{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}}},\"enhancements\":{}}},{\"type\":\"lens\",\"gridData\":{\"x\":25,\"y\":0,\"w\":7,\"h\":10,\"i\":\"38ec2c7d-ae73-47e2-b19c-a8e4478815df\"},\"panelIndex\":\"38ec2c7d-ae73-47e2-b19c-a8e4478815df\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"visualizationType\":\"lnsMetric\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-ce778804-d2f1-4a3d-91ed-e848dc179ae7\"}],\"state\":{\"visualization\":{\"layerId\":\"ce778804-d2f1-4a3d-91ed-e848dc179ae7\",\"layerType\":\"data\",\"metricAccessor\":\"8971e598-9a7f-4e81-a6ae-989cd968da19\",\"breakdownByAccessor\":\"0f24c3e0-32d2-4a21-8de6-95d8cb2670b6\",\"palette\":{\"type\":\"palette\",\"name\":\"status\",\"params\":{\"name\":\"status\",\"reverse\":false,\"rangeType\":\"percent\",\"rangeMin\":0,\"rangeMax\":100,\"progression\":\"fixed\",\"stops\":[{\"color\":\"#209280\",\"stop\":33.33},{\"color\":\"#d6bf57\",\"stop\":66.66},{\"color\":\"#cc5642\",\"stop\":100}],\"steps\":3,\"colorStops\":[],\"continuity\":\"all\",\"maxSteps\":5}},\"icon\":\"globe\",\"maxCols\":1,\"collapseFn\":\"max\"},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"ce778804-d2f1-4a3d-91ed-e848dc179ae7\":{\"columns\":{\"0f24c3e0-32d2-4a21-8de6-95d8cb2670b6\":{\"label\":\"Top value of Client IP\",\"dataType\":\"ip\",\"operationType\":\"terms\",\"scale\":\"ordinal\",\"sourceField\":\"client_ip\",\"isBucketed\":true,\"params\":{\"size\":1,\"orderBy\":{\"type\":\"column\",\"columnId\":\"8971e598-9a7f-4e81-a6ae-989cd968da19\"},\"orderDirection\":\"desc\",\"otherBucket\":true,\"missingBucket\":false,\"parentFormat\":{\"id\":\"terms\"},\"include\":[],\"exclude\":[],\"includeIsRegex\":false,\"excludeIsRegex\":false}},\"8971e598-9a7f-4e81-a6ae-989cd968da19\":{\"label\":\"Unique Visitors\",\"dataType\":\"number\",\"operationType\":\"unique_count\",\"scale\":\"ratio\",\"sourceField\":\"client_ip\",\"isBucketed\":false,\"params\":{\"emptyAsNull\":true},\"customLabel\":true}},\"columnOrder\":[\"0f24c3e0-32d2-4a21-8de6-95d8cb2670b6\",\"8971e598-9a7f-4e81-a6ae-989cd968da19\"],\"incompleteColumns\":{},\"sampling\":1}}},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}}},{\"type\":\"lens\",\"gridData\":{\"x\":32,\"y\":0,\"w\":8,\"h\":10,\"i\":\"0f609c7a-402f-4d8d-9767-06b3cc41c5a4\"},\"panelIndex\":\"0f609c7a-402f-4d8d-9767-06b3cc41c5a4\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"visualizationType\":\"lnsPie\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-d859338e-c4f7-452f-83a9-af0c20afbd5f\"}],\"state\":{\"visualization\":{\"shape\":\"pie\",\"layers\":[{\"layerId\":\"d859338e-c4f7-452f-83a9-af0c20afbd5f\",\"primaryGroups\":[\"aecc9449-6cce-4446-8ab1-7f9b55c05e10\"],\"metrics\":[\"a7d787c4-a57c-4fc9-9213-ed6413926627\"],\"numberDisplay\":\"percent\",\"categoryDisplay\":\"default\",\"legendDisplay\":\"default\",\"nestedLegend\":false,\"layerType\":\"data\",\"colorMapping\":{\"assignments\":[],\"specialAssignments\":[{\"rule\":{\"type\":\"other\"},\"color\":{\"type\":\"loop\"},\"touched\":false}],\"paletteId\":\"eui_amsterdam_color_blind\",\"colorMode\":{\"type\":\"categorical\"}}}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"d859338e-c4f7-452f-83a9-af0c20afbd5f\":{\"columns\":{\"aecc9449-6cce-4446-8ab1-7f9b55c05e10\":{\"label\":\"Response Size\",\"dataType\":\"string\",\"operationType\":\"range\",\"sourceField\":\"response_size\",\"isBucketed\":true,\"scale\":\"ordinal\",\"params\":{\"type\":\"range\",\"ranges\":[{\"from\":0,\"to\":10024,\"label\":\"below 10KB\"},{\"from\":10024,\"to\":null,\"label\":\"Above 10KB\"}],\"maxBars\":499.5,\"parentFormat\":{\"id\":\"range\",\"params\":{\"template\":\"arrow_right\",\"replaceInfinity\":true}}}},\"a7d787c4-a57c-4fc9-9213-ed6413926627\":{\"label\":\"Sum of Response Size\",\"dataType\":\"number\",\"operationType\":\"sum\",\"sourceField\":\"response_size\",\"isBucketed\":false,\"scale\":\"ratio\",\"params\":{\"emptyAsNull\":true}}},\"columnOrder\":[\"aecc9449-6cce-4446-8ab1-7f9b55c05e10\",\"a7d787c4-a57c-4fc9-9213-ed6413926627\"],\"sampling\":1,\"ignoreGlobalFilters\":false,\"incompleteColumns\":{}}}},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}},\"title\":\"Sum of bytes from large requests\"},{\"type\":\"lens\",\"gridData\":{\"x\":40,\"y\":0,\"w\":8,\"h\":10,\"i\":\"fd99ba8d-0713-4d7e-b5e6-3d3156cf9ce1\"},\"panelIndex\":\"fd99ba8d-0713-4d7e-b5e6-3d3156cf9ce1\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"visualizationType\":\"lnsXY\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-019f8106-cd23-4423-9f2e-2c856e60f0fa\"}],\"state\":{\"visualization\":{\"title\":\"Empty XY chart\",\"legend\":{\"isVisible\":true,\"position\":\"right\"},\"valueLabels\":\"hide\",\"preferredSeriesType\":\"bar_stacked\",\"layers\":[{\"layerId\":\"019f8106-cd23-4423-9f2e-2c856e60f0fa\",\"accessors\":[\"9a71f6a2-c7bc-4cb2-99ed-2f820562ee57\"],\"position\":\"top\",\"seriesType\":\"bar_stacked\",\"showGridlines\":false,\"layerType\":\"data\",\"colorMapping\":{\"assignments\":[],\"specialAssignments\":[{\"rule\":{\"type\":\"other\"},\"color\":{\"type\":\"loop\"},\"touched\":false}],\"paletteId\":\"eui_amsterdam_color_blind\",\"colorMode\":{\"type\":\"categorical\"}},\"yConfig\":[{\"forAccessor\":\"9a71f6a2-c7bc-4cb2-99ed-2f820562ee57\",\"color\":\"#e7664c\"}],\"xAccessor\":\"dc422b3e-59b6-4664-ae26-9d30c98c740e\"}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"019f8106-cd23-4423-9f2e-2c856e60f0fa\":{\"columns\":{\"9a71f6a2-c7bc-4cb2-99ed-2f820562ee57\":{\"label\":\"Transferred bytes\",\"dataType\":\"number\",\"operationType\":\"sum\",\"sourceField\":\"response_size\",\"isBucketed\":false,\"scale\":\"ratio\",\"params\":{\"emptyAsNull\":true,\"format\":{\"id\":\"bytes\",\"params\":{\"decimals\":2}}},\"customLabel\":true},\"dc422b3e-59b6-4664-ae26-9d30c98c740e\":{\"label\":\"Timestamp\",\"dataType\":\"date\",\"operationType\":\"date_histogram\",\"sourceField\":\"timestamp\",\"isBucketed\":true,\"scale\":\"interval\",\"params\":{\"interval\":\"h\",\"includeEmptyRows\":true,\"dropPartials\":false}}},\"columnOrder\":[\"dc422b3e-59b6-4664-ae26-9d30c98c740e\",\"9a71f6a2-c7bc-4cb2-99ed-2f820562ee57\"],\"sampling\":1,\"ignoreGlobalFilters\":false,\"incompleteColumns\":{}}}},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}},\"title\":\"Website traffic\"},{\"type\":\"lens\",\"gridData\":{\"x\":25,\"y\":10,\"w\":23,\"h\":8,\"i\":\"b35fa94c-5b1a-442c-9446-11852b2fd01f\"},\"panelIndex\":\"b35fa94c-5b1a-442c-9446-11852b2fd01f\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"visualizationType\":\"lnsDatatable\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-e109f163-6e3f-446c-8e77-02b01a901ada\"}],\"state\":{\"visualization\":{\"layerId\":\"e109f163-6e3f-446c-8e77-02b01a901ada\",\"layerType\":\"data\",\"columns\":[{\"columnId\":\"28a8dc62-221f-44c0-abae-fb0f20584539\"},{\"columnId\":\"93079de0-0463-496b-83c9-6bc2a10193d0\",\"alignment\":\"right\",\"colorMode\":\"text\",\"palette\":{\"type\":\"palette\",\"name\":\"complementary\",\"params\":{\"steps\":5,\"stops\":[{\"color\":\"#6092c0\",\"stop\":0},{\"color\":\"#a6c1db\",\"stop\":20},{\"color\":\"#ebeff5\",\"stop\":40},{\"color\":\"#e3bd9d\",\"stop\":60},{\"color\":\"#da8b45\",\"stop\":80}],\"rangeType\":\"percent\",\"rangeMin\":0,\"rangeMax\":null,\"continuity\":\"above\",\"reverse\":false,\"name\":\"complementary\"}}}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"e109f163-6e3f-446c-8e77-02b01a901ada\":{\"columns\":{\"28a8dc62-221f-44c0-abae-fb0f20584539\":{\"label\":\"Page URL\",\"dataType\":\"string\",\"operationType\":\"terms\",\"scale\":\"ordinal\",\"sourceField\":\"request.keyword\",\"isBucketed\":true,\"params\":{\"size\":5,\"orderBy\":{\"type\":\"column\",\"columnId\":\"93079de0-0463-496b-83c9-6bc2a10193d0\"},\"orderDirection\":\"asc\",\"otherBucket\":true,\"missingBucket\":false,\"parentFormat\":{\"id\":\"terms\"},\"include\":[],\"exclude\":[],\"includeIsRegex\":false,\"excludeIsRegex\":false},\"customLabel\":true},\"93079de0-0463-496b-83c9-6bc2a10193d0\":{\"label\":\"Unique Visitors\",\"dataType\":\"number\",\"operationType\":\"unique_count\",\"scale\":\"ratio\",\"sourceField\":\"client_ip\",\"isBucketed\":false,\"params\":{\"emptyAsNull\":true},\"customLabel\":true}},\"columnOrder\":[\"28a8dc62-221f-44c0-abae-fb0f20584539\",\"93079de0-0463-496b-83c9-6bc2a10193d0\"],\"sampling\":1,\"ignoreGlobalFilters\":false,\"incompleteColumns\":{},\"indexPatternId\":\"nginx-data\"}},\"currentIndexPatternId\":\"nginx-data\"},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}},\"title\":\"Top values of request\"},{\"type\":\"lens\",\"gridData\":{\"x\":0,\"y\":18,\"w\":25,\"h\":8,\"i\":\"4722fa32-4a07-472a-bbe4-13fd8a097c85\"},\"panelIndex\":\"4722fa32-4a07-472a-bbe4-13fd8a097c85\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"visualizationType\":\"lnsXY\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-67b4ed42-1376-461f-9ac4-7c6700fa7caa\"}],\"state\":{\"visualization\":{\"legend\":{\"isVisible\":true,\"position\":\"right\"},\"valueLabels\":\"hide\",\"fittingFunction\":\"None\",\"axisTitlesVisibilitySettings\":{\"x\":false,\"yLeft\":false,\"yRight\":true},\"tickLabelsVisibilitySettings\":{\"x\":true,\"yLeft\":true,\"yRight\":true},\"labelsOrientation\":{\"x\":0,\"yLeft\":0,\"yRight\":0},\"gridlinesVisibilitySettings\":{\"x\":true,\"yLeft\":true,\"yRight\":true},\"preferredSeriesType\":\"line\",\"layers\":[{\"layerId\":\"67b4ed42-1376-461f-9ac4-7c6700fa7caa\",\"seriesType\":\"line\",\"xAccessor\":\"8860feb7-063e-4bf5-8b86-1b7371e01c5c\",\"accessors\":[\"59aa03cb-bcd4-466e-96a3-47a8d2c9c8eb\"],\"layerType\":\"data\",\"colorMapping\":{\"assignments\":[],\"specialAssignments\":[{\"rule\":{\"type\":\"other\"},\"color\":{\"type\":\"loop\"},\"touched\":false}],\"paletteId\":\"eui_amsterdam_color_blind\",\"colorMode\":{\"type\":\"categorical\"}}}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"67b4ed42-1376-461f-9ac4-7c6700fa7caa\":{\"columns\":{\"8860feb7-063e-4bf5-8b86-1b7371e01c5c\":{\"label\":\"Timestamp\",\"dataType\":\"date\",\"operationType\":\"date_histogram\",\"sourceField\":\"timestamp\",\"isBucketed\":true,\"scale\":\"interval\",\"params\":{\"interval\":\"5m\",\"includeEmptyRows\":true,\"dropPartials\":false}},\"59aa03cb-bcd4-466e-96a3-47a8d2c9c8eb\":{\"label\":\"Median of Response Size\",\"dataType\":\"number\",\"operationType\":\"median\",\"sourceField\":\"response_size\",\"isBucketed\":false,\"scale\":\"ratio\",\"params\":{\"emptyAsNull\":true}}},\"columnOrder\":[\"8860feb7-063e-4bf5-8b86-1b7371e01c5c\",\"59aa03cb-bcd4-466e-96a3-47a8d2c9c8eb\"],\"incompleteColumns\":{}}}},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}},\"title\":\"Median of bytes\"},{\"type\":\"lens\",\"gridData\":{\"x\":25,\"y\":18,\"w\":23,\"h\":8,\"i\":\"35c6620c-ed46-4e0f-af2a-8bea73233250\"},\"panelIndex\":\"35c6620c-ed46-4e0f-af2a-8bea73233250\",\"embeddableConfig\":{\"attributes\":{\"title\":\"Response Codes Over Time\",\"description\":\"\",\"visualizationType\":\"lnsXY\",\"type\":\"lens\",\"references\":[{\"type\":\"index-pattern\",\"id\":\"nginx-data\",\"name\":\"indexpattern-datasource-layer-75fc7163-ec9c-435e-99b0-cddcccd723f2\"}],\"state\":{\"visualization\":{\"legend\":{\"isVisible\":true,\"position\":\"bottom\"},\"valueLabels\":\"hide\",\"fittingFunction\":\"None\",\"showCurrentTimeMarker\":false,\"valuesInLegend\":false,\"yLeftExtent\":{\"mode\":\"full\",\"niceValues\":true},\"yLeftScale\":\"linear\",\"axisTitlesVisibilitySettings\":{\"x\":true,\"yLeft\":true,\"yRight\":true},\"tickLabelsVisibilitySettings\":{\"x\":true,\"yLeft\":true,\"yRight\":true},\"labelsOrientation\":{\"x\":0,\"yLeft\":0,\"yRight\":0},\"gridlinesVisibilitySettings\":{\"x\":true,\"yLeft\":true,\"yRight\":true},\"preferredSeriesType\":\"area_percentage_stacked\",\"layers\":[{\"layerId\":\"75fc7163-ec9c-435e-99b0-cddcccd723f2\",\"accessors\":[\"7be206aa-18cf-4a15-8077-d98fe555f6a1\"],\"position\":\"top\",\"seriesType\":\"area_percentage_stacked\",\"showGridlines\":false,\"layerType\":\"data\",\"colorMapping\":{\"assignments\":[],\"specialAssignments\":[{\"rule\":{\"type\":\"other\"},\"color\":{\"type\":\"loop\"},\"touched\":false}],\"paletteId\":\"elastic_brand_2023\",\"colorMode\":{\"type\":\"categorical\"}},\"xAccessor\":\"0f65600f-3a27-4e52-8363-9f42b04adf4f\",\"splitAccessor\":\"d95f42b4-9d99-43bf-8671-dccb098dc741\",\"collapseFn\":\"\"}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"formBased\":{\"layers\":{\"75fc7163-ec9c-435e-99b0-cddcccd723f2\":{\"columns\":{\"0f65600f-3a27-4e52-8363-9f42b04adf4f\":{\"label\":\"Timestamp\",\"dataType\":\"date\",\"operationType\":\"date_histogram\",\"sourceField\":\"timestamp\",\"isBucketed\":true,\"scale\":\"interval\",\"params\":{\"interval\":\"auto\",\"includeEmptyRows\":true,\"dropPartials\":false}},\"7be206aa-18cf-4a15-8077-d98fe555f6a1\":{\"label\":\"Count of records\",\"dataType\":\"number\",\"operationType\":\"count\",\"isBucketed\":false,\"scale\":\"ratio\",\"sourceField\":\"___records___\",\"params\":{\"emptyAsNull\":true}},\"d95f42b4-9d99-43bf-8671-dccb098dc741\":{\"label\":\"Filters\",\"dataType\":\"string\",\"operationType\":\"filters\",\"scale\":\"ordinal\",\"isBucketed\":true,\"params\":{\"filters\":[{\"input\":{\"query\":\"status_code >= 200 and status_code < 400\",\"language\":\"kuery\"},\"label\":\"HTTP 2xx HTTP 3xx\"},{\"input\":{\"query\":\"status_code >= 400 and status_code < 500\",\"language\":\"kuery\"},\"label\":\"HTTP 4xx\"},{\"input\":{\"query\":\"status_code >= 500\",\"language\":\"kuery\"},\"label\":\"HTTP 5xx\"}]}}},\"columnOrder\":[\"0f65600f-3a27-4e52-8363-9f42b04adf4f\",\"d95f42b4-9d99-43bf-8671-dccb098dc741\",\"7be206aa-18cf-4a15-8077-d98fe555f6a1\"],\"incompleteColumns\":{},\"sampling\":1}}},\"indexpattern\":{\"layers\":{}},\"textBased\":{\"layers\":{}}},\"internalReferences\":[],\"adHocDataViews\":{}}},\"enhancements\":{}}},{\"type\":\"map\",\"gridData\":{\"x\":0,\"y\":26,\"w\":48,\"h\":19,\"i\":\"734d7029-08c6-481a-be62-e4a368b45b78\"},\"panelIndex\":\"734d7029-08c6-481a-be62-e4a368b45b78\",\"embeddableConfig\":{\"attributes\":{\"title\":\"\",\"description\":\"\",\"layerListJSON\":\"[{\\\"locale\\\":\\\"autoselect\\\",\\\"sourceDescriptor\\\":{\\\"type\\\":\\\"EMS_TMS\\\",\\\"isAutoSelect\\\":true,\\\"lightModeDefault\\\":\\\"road_map_desaturated\\\"},\\\"id\\\":\\\"a5e2cce1-2e0c-4162-9f65-dd1f13fc6e23\\\",\\\"label\\\":null,\\\"minZoom\\\":0,\\\"maxZoom\\\":24,\\\"alpha\\\":1,\\\"visible\\\":true,\\\"style\\\":{\\\"type\\\":\\\"EMS_VECTOR_TILE\\\",\\\"color\\\":\\\"\\\"},\\\"includeInFitToBounds\\\":true,\\\"type\\\":\\\"EMS_VECTOR_TILE\\\"},{\\\"joins\\\":[{\\\"leftField\\\":\\\"iso2\\\",\\\"right\\\":{\\\"type\\\":\\\"ES_TERM_SOURCE\\\",\\\"id\\\":\\\"c643b789-5286-4d0c-aef8-b1f54ab1bdcd\\\",\\\"term\\\":\\\"geoip.country_iso_code\\\",\\\"metrics\\\":[{\\\"type\\\":\\\"count\\\"}],\\\"applyGlobalQuery\\\":true,\\\"applyGlobalTime\\\":true,\\\"applyForceRefresh\\\":true,\\\"indexPatternRefName\\\":\\\"layer_1_join_0_index_pattern\\\"}}],\\\"sourceDescriptor\\\":{\\\"type\\\":\\\"EMS_FILE\\\",\\\"id\\\":\\\"world_countries\\\",\\\"tooltipProperties\\\":[\\\"iso2\\\",\\\"name\\\"]},\\\"style\\\":{\\\"type\\\":\\\"VECTOR\\\",\\\"properties\\\":{\\\"icon\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"value\\\":\\\"marker\\\"}},\\\"fillColor\\\":{\\\"type\\\":\\\"DYNAMIC\\\",\\\"options\\\":{\\\"color\\\":\\\"Greys\\\",\\\"colorCategory\\\":\\\"palette_0\\\",\\\"field\\\":{\\\"name\\\":\\\"__kbnjoin__count__c643b789-5286-4d0c-aef8-b1f54ab1bdcd\\\",\\\"origin\\\":\\\"join\\\"},\\\"fieldMetaOptions\\\":{\\\"isEnabled\\\":true,\\\"sigma\\\":3},\\\"type\\\":\\\"ORDINAL\\\",\\\"useCustomColorRamp\\\":false}},\\\"lineColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#FFF\\\"}},\\\"lineWidth\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":1}},\\\"iconSize\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":6}},\\\"iconOrientation\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"orientation\\\":0}},\\\"labelText\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"value\\\":\\\"\\\"}},\\\"labelColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#000000\\\"}},\\\"labelSize\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":14}},\\\"labelZoomRange\\\":{\\\"options\\\":{\\\"useLayerZoomRange\\\":true,\\\"minZoom\\\":0,\\\"maxZoom\\\":24}},\\\"labelBorderColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#FFFFFF\\\"}},\\\"symbolizeAs\\\":{\\\"options\\\":{\\\"value\\\":\\\"circle\\\"}},\\\"labelBorderSize\\\":{\\\"options\\\":{\\\"size\\\":\\\"SMALL\\\"}},\\\"labelPosition\\\":{\\\"options\\\":{\\\"position\\\":\\\"CENTER\\\"}}},\\\"isTimeAware\\\":true},\\\"id\\\":\\\"309e3c37-064e-413a-b8ed-ee597a7e29e3\\\",\\\"label\\\":\\\"Total Requests by Destination\\\",\\\"minZoom\\\":0,\\\"maxZoom\\\":24,\\\"alpha\\\":0.5,\\\"visible\\\":true,\\\"includeInFitToBounds\\\":true,\\\"type\\\":\\\"GEOJSON_VECTOR\\\",\\\"disableTooltips\\\":false},{\\\"sourceDescriptor\\\":{\\\"geoField\\\":\\\"geoip.location\\\",\\\"scalingType\\\":\\\"LIMIT\\\",\\\"id\\\":\\\"90dbbcfa-7dea-4bd8-a9ed-092e22352db0\\\",\\\"type\\\":\\\"ES_SEARCH\\\",\\\"applyGlobalQuery\\\":true,\\\"applyGlobalTime\\\":true,\\\"applyForceRefresh\\\":true,\\\"filterByMapBounds\\\":true,\\\"tooltipProperties\\\":[\\\"user_agent\\\",\\\"response_size\\\",\\\"client_ip\\\",\\\"request\\\",\\\"timestamp\\\",\\\"status_code\\\"],\\\"sortField\\\":\\\"\\\",\\\"sortOrder\\\":\\\"desc\\\",\\\"topHitsGroupByTimeseries\\\":false,\\\"topHitsSplitField\\\":\\\"\\\",\\\"topHitsSize\\\":1,\\\"indexPatternRefName\\\":\\\"layer_2_source_index_pattern\\\"},\\\"id\\\":\\\"6a70ac97-1fc9-467d-90aa-da86a5b67652\\\",\\\"label\\\":\\\"Actual Requests\\\",\\\"minZoom\\\":9,\\\"maxZoom\\\":24,\\\"alpha\\\":1,\\\"visible\\\":true,\\\"style\\\":{\\\"type\\\":\\\"VECTOR\\\",\\\"properties\\\":{\\\"icon\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"value\\\":\\\"marker\\\"}},\\\"fillColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#2200FF\\\"}},\\\"lineColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#41937c\\\"}},\\\"lineWidth\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":0}},\\\"iconSize\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":6}},\\\"iconOrientation\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"orientation\\\":0}},\\\"labelText\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"value\\\":\\\"\\\"}},\\\"labelColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#000000\\\"}},\\\"labelSize\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":14}},\\\"labelZoomRange\\\":{\\\"options\\\":{\\\"useLayerZoomRange\\\":true,\\\"minZoom\\\":0,\\\"maxZoom\\\":24}},\\\"labelBorderColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#FFFFFF\\\"}},\\\"symbolizeAs\\\":{\\\"options\\\":{\\\"value\\\":\\\"circle\\\"}},\\\"labelBorderSize\\\":{\\\"options\\\":{\\\"size\\\":\\\"SMALL\\\"}},\\\"labelPosition\\\":{\\\"options\\\":{\\\"position\\\":\\\"CENTER\\\"}}},\\\"isTimeAware\\\":true},\\\"includeInFitToBounds\\\":true,\\\"type\\\":\\\"GEOJSON_VECTOR\\\",\\\"joins\\\":[],\\\"disableTooltips\\\":false},{\\\"sourceDescriptor\\\":{\\\"geoField\\\":\\\"geoip.location\\\",\\\"requestType\\\":\\\"point\\\",\\\"resolution\\\":\\\"FINE\\\",\\\"id\\\":\\\"2121efc7-dde3-4d69-b475-a9f8a79b1f63\\\",\\\"type\\\":\\\"ES_GEO_GRID\\\",\\\"applyGlobalQuery\\\":true,\\\"applyGlobalTime\\\":true,\\\"applyForceRefresh\\\":true,\\\"metrics\\\":[{\\\"type\\\":\\\"count\\\"},{\\\"type\\\":\\\"sum\\\",\\\"field\\\":\\\"response_size\\\"}],\\\"indexPatternRefName\\\":\\\"layer_3_source_index_pattern\\\"},\\\"style\\\":{\\\"type\\\":\\\"VECTOR\\\",\\\"properties\\\":{\\\"icon\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"value\\\":\\\"marker\\\"}},\\\"fillColor\\\":{\\\"type\\\":\\\"DYNAMIC\\\",\\\"options\\\":{\\\"color\\\":\\\"Reds\\\",\\\"colorCategory\\\":\\\"palette_0\\\",\\\"field\\\":{\\\"name\\\":\\\"sum_of_response_size\\\",\\\"origin\\\":\\\"source\\\"},\\\"fieldMetaOptions\\\":{\\\"isEnabled\\\":true,\\\"sigma\\\":3},\\\"type\\\":\\\"ORDINAL\\\",\\\"useCustomColorRamp\\\":false}},\\\"lineColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#FFF\\\"}},\\\"lineWidth\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":0}},\\\"iconSize\\\":{\\\"type\\\":\\\"DYNAMIC\\\",\\\"options\\\":{\\\"minSize\\\":7,\\\"maxSize\\\":25,\\\"field\\\":{\\\"name\\\":\\\"doc_count\\\",\\\"origin\\\":\\\"source\\\"},\\\"fieldMetaOptions\\\":{\\\"isEnabled\\\":true,\\\"sigma\\\":3}}},\\\"iconOrientation\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"orientation\\\":0}},\\\"labelText\\\":{\\\"type\\\":\\\"DYNAMIC\\\",\\\"options\\\":{\\\"field\\\":{\\\"name\\\":\\\"doc_count\\\",\\\"origin\\\":\\\"source\\\"}}},\\\"labelColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#000000\\\"}},\\\"labelSize\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"size\\\":14}},\\\"labelZoomRange\\\":{\\\"options\\\":{\\\"useLayerZoomRange\\\":true,\\\"minZoom\\\":0,\\\"maxZoom\\\":24}},\\\"labelBorderColor\\\":{\\\"type\\\":\\\"STATIC\\\",\\\"options\\\":{\\\"color\\\":\\\"#FFFFFF\\\"}},\\\"symbolizeAs\\\":{\\\"options\\\":{\\\"value\\\":\\\"circle\\\"}},\\\"labelBorderSize\\\":{\\\"options\\\":{\\\"size\\\":\\\"SMALL\\\"}},\\\"labelPosition\\\":{\\\"options\\\":{\\\"position\\\":\\\"CENTER\\\"}}},\\\"isTimeAware\\\":true},\\\"id\\\":\\\"7620bd00-d87a-4c79-b1c9-2cbd5f5b5849\\\",\\\"label\\\":\\\"Total Requests and Bytes\\\",\\\"minZoom\\\":0,\\\"maxZoom\\\":9,\\\"alpha\\\":1,\\\"visible\\\":true,\\\"includeInFitToBounds\\\":true,\\\"type\\\":\\\"GEOJSON_VECTOR\\\",\\\"joins\\\":[],\\\"disableTooltips\\\":false}]\",\"mapStateJSON\":\"{\\\"adHocDataViews\\\":[],\\\"zoom\\\":8.06,\\\"center\\\":{\\\"lon\\\":2.40381,\\\"lat\\\":48.79445},\\\"timeFilters\\\":{\\\"from\\\":\\\"now-24h/h\\\",\\\"to\\\":\\\"now\\\"},\\\"refreshConfig\\\":{\\\"isPaused\\\":true,\\\"interval\\\":60000},\\\"query\\\":{\\\"query\\\":\\\"\\\",\\\"language\\\":\\\"kuery\\\"},\\\"filters\\\":[],\\\"settings\\\":{\\\"autoFitToDataBounds\\\":false,\\\"backgroundColor\\\":\\\"#ffffff\\\",\\\"customIcons\\\":[],\\\"disableInteractive\\\":false,\\\"disableTooltipControl\\\":false,\\\"hideToolbarOverlay\\\":false,\\\"hideLayerControl\\\":false,\\\"hideViewControl\\\":false,\\\"initialLocation\\\":\\\"LAST_SAVED_LOCATION\\\",\\\"fixedLocation\\\":{\\\"lat\\\":0,\\\"lon\\\":0,\\\"zoom\\\":2},\\\"browserLocation\\\":{\\\"zoom\\\":2},\\\"keydownScrollZoom\\\":false,\\\"maxZoom\\\":24,\\\"minZoom\\\":0,\\\"showScaleControl\\\":false,\\\"showSpatialFilters\\\":true,\\\"showTimesliderToggleButton\\\":true,\\\"spatialFiltersAlpa\\\":0.3,\\\"spatialFiltersFillColor\\\":\\\"#DA8B45\\\",\\\"spatialFiltersLineColor\\\":\\\"#DA8B45\\\"}}\",\"uiStateJSON\":\"{\\\"isLayerTOCOpen\\\":true,\\\"openTOCDetails\\\":[\\\"309e3c37-064e-413a-b8ed-ee597a7e29e3\\\",\\\"7620bd00-d87a-4c79-b1c9-2cbd5f5b5849\\\"]}\"},\"mapCenter\":{\"lat\":46.34419,\"lon\":12.62613,\"zoom\":4.28},\"mapBuffer\":{\"minLon\":-22.5,\"minLat\":31.95216,\"maxLon\":45,\"maxLat\":55.77657},\"isLayerTOCOpen\":true,\"openTOCDetails\":[\"309e3c37-064e-413a-b8ed-ee597a7e29e3\",\"7620bd00-d87a-4c79-b1c9-2cbd5f5b5849\"],\"hiddenLayers\":[],\"description\":\"\",\"enhancements\":{}},\"title\":\"Total Requests and Bytes\"}]",
          "timeFrom": "now-24h/h",
          "title": "Nginx-Dashboard",
          "timeTo": "now"
        },
        "references": [
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "38ec2c7d-ae73-47e2-b19c-a8e4478815df:indexpattern-datasource-layer-ce778804-d2f1-4a3d-91ed-e848dc179ae7"
          },
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "0f609c7a-402f-4d8d-9767-06b3cc41c5a4:indexpattern-datasource-layer-d859338e-c4f7-452f-83a9-af0c20afbd5f"
          },
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "fd99ba8d-0713-4d7e-b5e6-3d3156cf9ce1:indexpattern-datasource-layer-019f8106-cd23-4423-9f2e-2c856e60f0fa"
          },
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "b35fa94c-5b1a-442c-9446-11852b2fd01f:indexpattern-datasource-layer-e109f163-6e3f-446c-8e77-02b01a901ada"
          },
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "4722fa32-4a07-472a-bbe4-13fd8a097c85:indexpattern-datasource-layer-67b4ed42-1376-461f-9ac4-7c6700fa7caa"
          },
          {
            "type": "index-pattern",
            "id": "nginx-data",
            "name": "35c6620c-ed46-4e0f-af2a-8bea73233250:indexpattern-datasource-layer-75fc7163-ec9c-435e-99b0-cddcccd723f2"
          },
          {
            "name": "734d7029-08c6-481a-be62-e4a368b45b78:layer_1_join_0_index_pattern",
            "type": "index-pattern",
            "id": "nginx-data"
          },
          {
            "name": "734d7029-08c6-481a-be62-e4a368b45b78:layer_2_source_index_pattern",
            "type": "index-pattern",
            "id": "nginx-data"
          },
          {
            "name": "734d7029-08c6-481a-be62-e4a368b45b78:layer_3_source_index_pattern",
            "type": "index-pattern",
            "id": "nginx-data"
          }
        ],
        "managed": false,
        "coreMigrationVersion": "8.8.0",
        "typeMigrationVersion": "10.2.0"
      },
      {
        "id": "nginx-data",
        "type": "index-pattern",
        "namespaces": [
          "default"
        ],
        "updated_at": "2024-06-19T12:16:31.179Z",
        "created_at": "2024-06-19T12:03:23.078Z",
        "version": "WzQ0LDFd",
        "attributes": {
          "fieldAttrs": "{\"client_ip\":{\"customLabel\":\"Client IP\"},\"method\":{\"customLabel\":\"Method\"},\"request\":{\"customLabel\":\"Request\"},\"response_size\":{\"customLabel\":\"Response Size\"},\"status_code\":{\"customLabel\":\"Status Code\"},\"timestamp\":{\"customLabel\":\"Timestamp\"},\"user_agent\":{\"customLabel\":\"User Agent\"}}",
          "title": "nginx-index-*",
          "sourceFilters": "[]",
          "fields": "[]",
          "fieldFormatMap": "{}",
          "runtimeFieldMap": "{}",
          "name": "My Nginx Data View",
          "allowHidden": false
        },
        "references": [],
        "managed": false,
        "coreMigrationVersion": "8.8.0",
        "typeMigrationVersion": "8.0.0"
      }
    ]
  }
  ')
fi

if [[ "$response" == *"Welcome to the Nginx Logs Dashboard"* ]]; then
  echo -e "${COLOR_GREEN}All Dashboards creation completed.${COLOR_RESET}"
else
  echo -e "${COLOR_RED}\nIssue with Dashboards creation.${COLOR_RESET}"
  exit 1;
fi
