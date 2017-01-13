angular.module('CurrencyExchange', []).factory("Currency", function () {
    // type: string
    var name;
    // type: decimal
    var rate;

    function Currency() {;}

    return Currency;
}).factory("CurrencyList", ["Currency", function (Currency) {
    // type: Date
    var date;

    // type: array of Currency
    var currencies;

    function CurrencyList() {;}

    function getRate(name) {
        for (var i = 0; i < currencies.length; i++) {
            if (currencies[i].name == name) {
                return currencies[i].rate;
            }
        }
    }

    return CurrencyList;
}]).factory("currencyManager", ["Currency", "CurrencyList", function (Currency, CurrencyList) {
    var currencyManager = {
        _pool : [],
        _latestDate : new Date("1970-01-01"),
        addCurrencies: function (date, currencies) {
            var currencyList = new CurrencyList;
            currencyList.date = new Date(date);
            currencyList.currencies = currencies;

            if(!this._latestDate) {
                this._latestDate = new Date(date);
            }
            else {
                var currentDate = new Date(date);
                if(currentDate.getTime() > this._latestDate.getTime())
                    this._latestDate = this.currentDate;
            }
            this._pool.push(currencyList);
        },
        getCurrencies: function (date) {
            return this._pool.find(function (poolItem) {
                return poolItem.date.getTime() == date.getTime();
            }).currencies;
        },
        getRateForDate : function (date, name) {
            var currencies = this.getCurrencies(date);
            return currencies.find(function (currency) { return currency.name == name }).rate;
        },
        getRatesforCurrency: function(name) {
            var history = [];
            for (var i = this._pool.length - 1; i > 0; i--)
            {
                var currentDate = this._pool[i];
                history.push(
                    {
                        x: currentDate.date.getTime(),
                        y: this.getRateForDate(currentDate.date, name)
                    }
                );
            }
            return history;
        },
        init: function () {
            this._pool = [];
            this._latestDate = new Date("1970-01-01");
        }
    }
    return currencyManager;
}]).controller('CurrencyExchangeController', ["$scope", "Currency", "CurrencyList", "currencyManager", function ($scope, Currency, CurrencyList, currencyManager) {
    var _exchangerateURL = "/Home/GetCurrencyXml";

    init = function ()  
    {
        currencyManager.init();
        $.get(_exchangerateURL, function (data) {
            var cube = data.children[0].getElementsByTagName("Cube")[0];

            for(var i = 0; i < cube.children.length; i++)
            {
                var dateCurrencies = cube.children[i];
                var date = new Date(dateCurrencies.getAttribute("time"));
                var currencies = [];

                for (var j = 0; j < dateCurrencies.childNodes.length; j++)
                {
                    var cur = new Currency();
                    cur.name = dateCurrencies.childNodes[j].getAttribute("currency");
                    cur.rate = parseFloat(dateCurrencies.childNodes[j].getAttribute("rate"));

                    currencies.push(cur);
                }

                currencyManager.addCurrencies(date, currencies);
            }

            var latestDate = currencyManager._latestDate;

            $scope.$apply(function () {
                $scope.currencies = currencyManager.getCurrencies(latestDate);
            });
        })    
    }

    $scope.$watch('SourceCurrencyList', function (newVal, oldVal) {
        if (newVal) {
            $scope.renderGraph(newVal.name);
        }
    });

    $scope.renderGraph = function (currencyName) {
        clearGraph();
        displayGraph(currencyManager.getRatesforCurrency(currencyName), currencyName);
    }

    clearGraph = function () {
        $('#chart_container').html(
            '<div id="chart"></div><div id="legend_container"><div id="smoother" title="Smoothing"></div><div id="legend"></div></div>'
        );
    }

    displayGraph = function (data, currencyName) {
        var min = Math.min.apply(null, data.map(function (o) { return o.y; }));
        var max = Math.max.apply(null, data.map(function (o) { return o.y; }));
        var graph = new Rickshaw.Graph({
            element: document.querySelector("#chart"),
            width: 960,
            height: 400,
            renderer: 'line',
            series: [{
                data: data,
                color: '#4682b4',
                name: currencyName
            }],
            min: min - (max - min) * 0.1,
            max: max + (max - min) * 0.1
        });

        graph.render();

        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph: graph,

            xFormatter: function (x) {
                var date = new Date(x);
                return date.getFullYear() + " - " + monthNames[date.getMonth()] + " - " + date.getDate();
            },
            yFormatter: function (y) {
                return parseFloat(y).toFixed(4);
            }
        });

        var legend = new Rickshaw.Graph.Legend({
            graph: graph,
            element: document.getElementById('legend')
        });

        var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
            graph: graph,
            legend: legend
        });

        var yAxis = new Rickshaw.Graph.Axis.Y({
            graph: graph,
            tickFormat: function (y) { return parseFloat(y).toFixed(2); }
        });

        yAxis.render();
   }
   init();
}]);

