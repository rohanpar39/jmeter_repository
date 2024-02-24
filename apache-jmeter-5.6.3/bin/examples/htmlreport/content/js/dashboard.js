/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 70.45530632741881, "KoPercent": 29.544693672581186};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.10612654837629729, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5820668693009119, 500, 1500, "searchdata_get_request-0"], "isController": false}, {"data": [0.0, 500, 1500, "searchdata_get_request-1"], "isController": false}, {"data": [0.0, 500, 1500, "jobsnepal_aboutuspage_get_request-1"], "isController": false}, {"data": [0.0595, 500, 1500, "jobsnepal_aboutuspage_get_request-0"], "isController": false}, {"data": [0.0, 500, 1500, "searchdata_get_request"], "isController": false}, {"data": [0.0, 500, 1500, "jobsnepal_aboutuspage_get_request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5974, 1765, 29.544693672581186, 7007.164713759634, 303, 33990, 3044.0, 20170.0, 26570.0, 32254.5, 117.7583725926948, 4086.8578145327806, 26.584614190534385], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["searchdata_get_request-0", 987, 0, 0.0, 925.6058763931121, 306, 2181, 500.0, 1747.8000000000002, 1819.0, 1996.68, 66.77491374061294, 52.82237860259793, 11.47693829916785], "isController": false}, {"data": ["searchdata_get_request-1", 987, 466, 47.21377912867275, 12050.577507598782, 303, 33660, 12043.0, 29041.000000000007, 31238.79999999999, 32558.24, 21.29771486524394, 1801.6998631468073, 3.7437389411561615], "isController": false}, {"data": ["jobsnepal_aboutuspage_get_request-1", 1000, 410, 41.0, 5987.101000000002, 598, 13628, 5204.0, 11865.5, 12208.449999999999, 13000.110000000004, 61.0016470444702, 1134.7012873253827, 10.186798481058988], "isController": false}, {"data": ["jobsnepal_aboutuspage_get_request-0", 1000, 0, 0.0, 2124.4139999999998, 851, 3988, 2038.0, 3016.0, 3624.0, 3802.99, 194.21246844047388, 151.9329451107011, 31.673322489803844], "isController": false}, {"data": ["searchdata_get_request", 1000, 479, 47.9, 12829.384999999998, 622, 33990, 12940.0, 29294.999999999996, 31493.549999999996, 32872.83, 21.285653469561517, 1794.0936053240741, 7.3514494199659435], "isController": false}, {"data": ["jobsnepal_aboutuspage_get_request", 1000, 410, 41.0, 8112.409000000006, 2890, 16897, 7153.0, 13948.2, 14531.449999999997, 15669.310000000001, 54.88775454196169, 1063.9146461112025, 18.11724710467095], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["520", 29, 1.6430594900849858, 0.4854368932038835], "isController": false}, {"data": ["502/Bad Gateway", 1736, 98.35694050991502, 29.0592567793773], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5974, 1765, "502/Bad Gateway", 1736, "520", 29, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["searchdata_get_request-1", 987, 466, "502/Bad Gateway", 466, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["jobsnepal_aboutuspage_get_request-1", 1000, 410, "502/Bad Gateway", 402, "520", 8, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["searchdata_get_request", 1000, 479, "502/Bad Gateway", 466, "520", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["jobsnepal_aboutuspage_get_request", 1000, 410, "502/Bad Gateway", 402, "520", 8, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
