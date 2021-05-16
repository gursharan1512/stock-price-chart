var dataTable = null;
var companyList = "";

/**
 * Function to initialize the google bar chart with Coloumn names
 */
function initializeGoogleChart() {
  dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string', 'Company');
  dataTable.addColumn('number', 'Price');
  dataTable.addColumn({type:'number', role:'annotation'});
}

/**
 * Function to get stock price data and add to the bar chart data
 */
function addStockData(){
  let companyCode = document.getElementById("search").value.toUpperCase();
  if (companyList.includes(companyCode)) {
    document.getElementById("errorMessage").innerHTML = companyCode+" stock symbol is already added. Please try other stock symbol";
    document.getElementById('errorMessage').style.display='block';
    setTimeout(function () {document.getElementById('errorMessage').style.display='none';}, 3000);
  }
  else {
    fetch('https://cloud.iexapis.com/stable/stock/'+companyCode+'/quote?token=pk_60969cf2b45b429883fe2db2c75e8832', {
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }).then(response => response.json())
      .then(data => {
        dataTable.addRow([companyCode, data.latestPrice, data.latestPrice]);
        drawBasic();
        let ul = document.getElementById("stockList");
        let li = document.createElement("li");
        li.setAttribute('id',companyCode);
        li.appendChild(document.createTextNode(companyCode));
        ul.appendChild(li);
        if (dataTable.getNumberOfRows() == 1) {
          companyList = companyList.concat(companyCode);
          updateChart();
        }
        else {
          companyList = companyList.concat(",").concat(companyCode);
        }
      }).catch((error) => {
        document.getElementById("errorMessage").innerHTML = "Error while getting data. Please check stock symbol";
        document.getElementById('errorMessage').style.display='block';
        setTimeout(function () {document.getElementById('errorMessage').style.display='none';}, 3000);
      });
  }
}

/**
 * Function to update the existing company stock price in real time
 */
function updateChart() {
  fetch('https://cloud.iexapis.com/stable/stock/market/batch?symbols='+companyList+'&types=quote&range=1y&token=pk_60969cf2b45b429883fe2db2c75e8832', {
    headers : {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }
  }).then(response => response.json())
    .then(data => {
        for (var company in data) {
          for (var j = 0; j < dataTable.getNumberOfRows(); j++) {
             if (company == dataTable.getValue(j,0)) {
                dataTable.setValue(j,1,data[company]["quote"].latestPrice);
                dataTable.setValue(j,2,data[company]["quote"].latestPrice);
                console.log(data[company]["quote"].latestPrice);
             }
          }
        }
    }).catch((error) => {
      console.log(error);
    });
  drawBasic();
  setTimeout(updateChart, 5000);
}

/**
 * Function to draw the bar chart
 */
function drawBasic() {
  let options = {
          title: 'Stock Prices',
          chartArea: {width: '50%'},
          hAxis: {title: 'Price',minValue: 0},
          legend: { position: "none" }
        };
          
  let chart = new google.visualization.BarChart(document.getElementById("barchartValues"));
  chart.draw(dataTable, options);
}