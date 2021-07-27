var dataTable = null;
var companyList = "";

window.onload = loadPortfolio;

/**
 * Function to initialize the google bar chart with Coloumn names
 */
function initializeGoogleChart() {
  dataTable = new google.visualization.DataTable();
  dataTable.addColumn('string', 'Company');
  dataTable.addColumn('number', 'Price');
  dataTable.addColumn({type:'number', role:'annotation'});
}

function loadPortfolio() {
  var storageMeta = JSON.parse(window.localStorage.getItem("stockInfo"));
  var storageCompanyList = "";
  if(storageMeta != null) {
    for(let i = 0; i<storageMeta.length; i++) {
      if(i == 0) {
        storageCompanyList = storageCompanyList.concat(storageMeta[i]['symbol']);
      }
      else {
        storageCompanyList = storageCompanyList.concat(",").concat(storageMeta[i]['symbol']);
      }
      fetch('https://cloud.iexapis.com/stable/stock/'+storageMeta[i]['symbol']+'/quote?token=pk_60969cf2b45b429883fe2db2c75e8832', {
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
      }).then(response => response.json())
        .then(data => {
          updatePortfolioView(storageMeta[i]['symbol'],storageMeta[i]['buyPrice'],data.latestPrice,storageMeta[i]['target']);
        });
      // updatePortfolioView(stockInfo['symbol'],stockInfo['buyPrice'],stockInfo['currentPrice'],stockInfo['target']);
    }
    // if(todayHour>7 && ( todayHour<13 )) {
    //   updateBarDynamically(storageCompanyList);
    // }
  }
}

function deleteStock(symbol, buyPrice, currentPrice, target) {
  console.log("deleteStock function");
  var storageMeta = JSON.parse(window.localStorage.getItem("stockInfo"));
  if(storageMeta != null) {
    console.log("storageMeta.length - "+storageMeta.length);
    for( var i = 0; i < storageMeta.length; i++){ 
    
      if ((storageMeta[i]['symbol'] == symbol) && (storageMeta[i]['buyPrice'] == buyPrice) && (storageMeta[i]['currentPrice'] == currentPrice) && (storageMeta[i]['target'] == target)) { 
        storageMeta.splice(i, 1); 
      }
  
    }
    localStorage.setItem("stockInfo", JSON.stringify(storageMeta));
    location.reload();
    }
}

function updateBarDynamically(storageCompanyList) {
  fetch('https://cloud.iexapis.com/stable/stock/market/batch?symbols='+storageCompanyList+'&types=quote&range=1y&token=pk_60969cf2b45b429883fe2db2c75e8832', {
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

function updatePortfolioView(symbol, buyPrice, currentPrice, target) {
  console.log("updatePortfolioView function");
  var profitLoss = (currentPrice-buyPrice).toFixed(2);
  var profitLossPercent = (100*profitLoss/currentPrice).toFixed(2);

  var barPercent = (100*buyPrice/target).toFixed(2);
  var barProfitPercent = (currentPrice-buyPrice)*100/target;

  //document.getElementById("demo").innerHTML += '<div class="row border-top mt-3 mb-2"><div class="col-4">'+symbol+'</div><div class="col-3">'+currentPrice+'</div><div class="col-2">'+profitLoss+'</div><div class="col-3 d-flex align-items-end profitPercentage">('+profitLossPercent+'%)</div></div>';
  document.getElementById("demo").innerHTML += '<div class="row border-top mt-2 pt-1 mb-2"><div class="col-4">'+symbol+'<span class="pl-2">Avg. '+buyPrice+'</span></div><div class="col-2 border-left">'+target+'</div><div class="col-2 border-left">'+currentPrice+'</div><div class="col-3 border-left">'+profitLoss+'<span>('+profitLossPercent+'%)</span> </div> <i class="fa fa-trash btn btn-danger deleteButton d-flex justify-content-center align-items-center" onclick="deleteStock(\''+symbol+'\','+buyPrice+','+currentPrice+','+target+')"></i>';
  // document.getElementById("demo").innerHTML += '<div class="row border-top mt-2 pt-1 mb-2"><div class="col-4">'+symbol+'<span class="pl-2">Avg. '+buyPrice+'</span></div><div class="col-2 border-left">'+target+'</div><div class="col-2 border-left">'+currentPrice+'</div><div class="col-3 border-left">'+profitLoss+'<span>('+profitLossPercent+'%)</span> </div> <i class="fa fa-trash btn btn-danger deleteButton d-flex justify-content-center align-items-center" onclick="deleteStock()"></i>';

  if(barProfitPercent >= 0) {
    document.getElementById("demo").innerHTML += '<div class="progress"><div class="progress-bar" role="progressbar" style="width: '+barPercent+'%" aria-valuenow="'+barPercent+'" aria-valuemin="0" aria-valuemax="'+target+'"></div><div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: '+barProfitPercent+'%" aria-valuenow="'+barProfitPercent+'" aria-valuemin="0" aria-valuemax="'+target+'"></div></div> ';
  }
  else {
    barProfitPercent = -1*barProfitPercent;
    barPercent = barPercent-barProfitPercent;
    console.log("new percent - "+barProfitPercent);
    document.getElementById("demo").innerHTML += '<div class="progress"><div class="progress-bar" role="progressbar" style="width: '+barPercent+'%" aria-valuenow="'+barPercent+'" aria-valuemin="0" aria-valuemax="'+target+'"></div><div class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" style="width: '+barProfitPercent+'%" aria-valuenow="'+barProfitPercent+'" aria-valuemin="0" aria-valuemax="'+target+'"></div></div>';
  }
}

function buyStock(stockSymbol, currentPrice) {

  console.log("buyStock function");
  var symbol = stockSymbol.textContent.split(" ")[0];
  var buyPrice = document.getElementById("currentData"+symbol).value;
  var target = document.getElementById("targetData"+symbol).value;

  var storageMeta = JSON.parse(window.localStorage.getItem("stockInfo"));
  if(storageMeta == null) {
    var meta = [{'symbol':symbol, 'buyPrice':buyPrice, 'currentPrice':currentPrice, 'target':target}];
    localStorage.setItem("stockInfo", JSON.stringify(meta));
  }
  else {
    var meta = {'symbol':symbol, 'buyPrice':buyPrice, 'currentPrice':currentPrice, 'target':target};
    storageMeta.push(meta);
    localStorage.setItem("stockInfo", JSON.stringify(storageMeta));
  }
  
  updatePortfolioView(symbol,buyPrice,currentPrice,target);

}

/**
 * Function to get stock price data and add to the bar chart data
 */
function getStockInfo(){
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
        li.innerHTML += '<li class="list-group-item">'+companyCode+'<button class="btn btn-primary float-right new_button" type="button" data-toggle="collapse" data-target="#collapse'+companyCode+'" aria-expanded="false" aria-controls="collapse'+companyCode+'"> Buy </button> </li> ';
        li.innerHTML += '<div class="collapse" id="collapse'+companyCode+'"><div class="card card-body"> <div><div class="row"><div class="col-3"><label data-error="wrong" data-success="right" for="buyPrice">Current Price:</label></div><div class="col-9"><input type="number" id="currentData'+companyCode+'" class="form-control validate mb-3" value="'+data.latestPrice+'"></div></div><div class="row"><div class="col-3"><label data-error="wrong" data-success="right" for="buyPrice">Target:</label></div><div class="col-9"><input type="number" id="targetData'+companyCode+'" class="form-control validate mb-3"></div></div><button type="submit" class="btn btn-secondary mb-2 new_button" onclick="buyStock('+companyCode+','+data.latestPrice+')" data-toggle="collapse" data-target="#collapse'+companyCode+'">Submit</button></div> </div></div>'

        ul.appendChild(li);
        if (dataTable.getNumberOfRows() == 1) {
          companyList = companyList.concat(companyCode);
          var todayHour = new Date().getHours();
          var todayMin = new Date().getMinutes();
          if(todayHour>7 && ( todayHour<13 )) {
            updateChart();
          }
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