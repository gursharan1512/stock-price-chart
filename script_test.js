//google.charts.load("current", {packages:["corechart"]});
//google.charts.setOnLoadCallback(drawBasic);

var data = null
var companyCode;
var dat;
var is_initialized = false;

async function sendToPage(){
    
    companyCode = document.getElementById("search").value;
    let response = await fetch('https://sandbox.iexapis.com/stable/stock/'+companyCode+'/quote?token=Tpk_c8d96813050e422ab604da5915d644fd', {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }

    });
    var data1 = await response.json();
    console.log(data1.latestPrice);
    dat = data1.latestPrice

    var ul = document.getElementById("dynamic-list");
    var li = document.createElement("li");
    li.setAttribute('id',companyCode);
    li.appendChild(document.createTextNode(companyCode));
    ul.appendChild(li);

    
    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawBasic1);
    
    if (!is_initialized) {
        updateChart();
    }

}

async function updateChart() {

    var ul = document.getElementById("dynamic-list");
    var listItem = ul.getElementsByTagName("li");
    console.log("ul length - "+listItem.length);

    for (var i=0; i < listItem.length; i++) {
        //console.log(listItem[i].innerHTML);
        var company = listItem[i].innerHTML;
        let response = await fetch('https://sandbox.iexapis.com/stable/stock/'+company+'/quote?token=Tpk_c8d96813050e422ab604da5915d644fd', {
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }

    });
        var new_data = await response.json();
        for (var j = 0; j < data.getNumberOfRows(); j++) {
           if (company == data.getValue(j,0)) {
                data.setValue(j,1,new_data.latestPrice);
                data.setValue(j,2,new_data.latestPrice);
                console.log("new_data - "+new_data.latestPrice);
           }
       }
    }

    var options = {
            title: 'Stock Prices',
            chartArea: {width: '50%'},
            hAxis: {
              title: 'Price',
              minValue: 0
            }
          };
          
      var chart = new google.visualization.BarChart(document.getElementById("barchart_values"));
      chart.draw(data, options);

    setTimeout(updateChart, 5000);
}

function drawBasic1() {

    if (!is_initialized) {
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Company');
        data.addColumn('number', 'Price');
        data.addColumn({type:'number', role:'annotation'});
        is_initialized = true;
    }

    data.addRow([companyCode, dat, dat]);

    var options = {
            title: 'Stock Prices',
            chartArea: {width: '50%'},
            hAxis: {
              title: 'Price',
              minValue: 0
            }
          };
          
      var chart = new google.visualization.BarChart(document.getElementById("barchart_values"));
      chart.draw(data, options);
}