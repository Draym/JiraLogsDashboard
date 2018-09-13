var MainCtrl = function ($scope, RequestApi, Auth, $location) {
    $scope.isBusy = false;
    $scope.GUI = { isNavCollapsed: false };
    $scope.Params = {};
    $scope.Data = {};
    $scope.Data.TeamMembers = [];
    $scope.Parsed = {};
    $scope.Selected = { Personal: {}, Team: {} };
    $scope.currentYear;

    var correctQuote = 80;

    var Charts = {};

    var chartTitles = {
        'TSPT': 'Total Sales of the Team',
        'TSPG': 'Total Sales by Group',
        'TTPG': 'Total Ticket/type by People',
        'TMST': 'Total Money Spread of the Team',
        'TMSG': 'Total Money Spread by Group',
        'TAPT': 'Total Average/h per Team',
        'TAPG': 'Total Average/h per Group',
        'TSAP': 'Total Revenues & Average/h',
        'TPPOSA': 'Total Revenues per People',
        'TPPOD': 'Total Dev hours per People',
        'TPPOSU': 'Total Support hours per People',
        'TPLPOT': 'Total Tickets per People',
        'PLPOT': 'Low Performance on Tickets over the Year in %',
        'PWDA': 'Workload Distribution over the Year',
        'PAOT': 'Average/h over the Year'
    };
    var prettyColors = ['rgba(255, 99, 132, {a})',
        'rgba(54, 162, 235, {a})',
        'rgba(255, 206, 86, {a})',
        'rgba(75, 192, 192, {a})',
        'rgba(153, 102, 255, {a})',
        'rgba(255, 159, 64, {a})'];
    var prettyTeamColor = 'rgba(59,68,75, {a})';

    var monthValues = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    /** PARSING **/
    var addWorklogsToIssues = function () {
        for (var i in $scope.Data.Issues) {
            $scope.Data.Issues[i].Worklogs = {};
            for (var month in $scope.Data.Worklogs) {
                $scope.Data.Issues[i].Worklogs[month] = null;
                for (var i2 in $scope.Data.Worklogs[month]) {
                    if ($scope.Data.Worklogs[month][i2].Lost == null)
                        $scope.Data.Worklogs[month][i2].Lost = true;

                    if ($scope.Data.Worklogs[month][i2].task_name == $scope.Data.Issues[i].Summary
                        || ($scope.Data.Issues[i].Summary.length > 48 && $scope.Data.Issues[i].Summary.indexOf($scope.Data.Worklogs[month][i2].task_name) == 0)) {

                        $scope.Data.Issues[i].Worklogs[month] = $scope.Data.Worklogs[month][i2];
                        $scope.Data.Issues[i].Worklogs[month].length = parseInt($scope.Data.Issues[i].Worklogs[month].length);
                        $scope.Data.Worklogs[month][i2].Lost = false;
                    }
                }
            }
            $scope.Data.Issues[i].WorklogsTotalTime = 0;
            for (var month in $scope.Data.Issues[i].Worklogs) {
                if ($scope.Data.Issues[i].Worklogs[month])
                    $scope.Data.Issues[i].WorklogsTotalTime += $scope.Data.Issues[i].Worklogs[month].length;
            }
            for (var month in $scope.Data.Issues[i].Worklogs) {
                if ($scope.Data.Issues[i].Worklogs[month]) {
                    var average = $scope.Data.Issues[i].Worklogs[month].length * 100 / $scope.Data.Issues[i].WorklogsTotalTime;
                    $scope.Data.Issues[i].Worklogs[month].Profit = Math.round(average * $scope.Data.Issues[i].Price / 100, 1);
                    $scope.Data.Issues[i].Worklogs[month].AverageProfit = average;
                }
            }
        }
    }
    var addNewValuesToIssues = function () {
        for (var i in $scope.Data.Issues) {
            var developer = getObjectById($scope.Data.Issues[i].CustomFields, 'Name', 'Developer');
            if (!developer)
                developer = $scope.Data.Issues[i].Assignee;
            var price = getObjectById($scope.Data.Issues[i].CustomFields, 'Name', 'Price');

            $scope.Data.Issues[i].Developer = (developer ? (developer.Values ? developer.Values[0] : developer) : null);
            $scope.Data.Issues[i].Price = (price ? parseInt(price.Values[0]) : 0);
        }
    }

    var parseIssues = function () {
        $scope.Parsed.Issues = {};
        $scope.Parsed.Support = {};
        $scope.Parsed.ArchivedIssues = [];
        $scope.Parsed.UnassignedIssues = [];
        $scope.Parsed.UnPricedIssues = {};

        for (var i in $scope.Data.Issues) {
            var developer = $scope.Data.Issues[i].Developer;
            var price = getObjectById($scope.Data.Issues[i].CustomFields, 'Name', 'Price');

            if (developer) {
                if ($scope.Data.Issues[i].Status.Name === "Archived") {
                    $scope.Parsed.ArchivedIssues.push($scope.Data.Issues[i]);
                }
                else if ($scope.Data.Issues[i].Summary === 'SUPPORT') {
                    $scope.Parsed.Support[developer] = $scope.Data.Issues[i];
                } else if (price) {
                    initArrayToObject($scope.Parsed.Issues, developer);
                    $scope.Parsed.Issues[developer].push($scope.Data.Issues[i]);
                } else {
                    initArrayToObject($scope.Parsed.UnPricedIssues, developer);
                    $scope.Parsed.UnPricedIssues[developer].push($scope.Data.Issues[i]);
                }
            } else {
                $scope.Parsed.UnassignedIssues.push($scope.Data.Issues[i]);
            }
        }
    };

    /** CREATING VALUE DATA **/
    var getTotalSalePerMonthData = function (id) {
        var result = [];
        var months = {};

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                if (!months[date.getMonth()]) {
                    months[date.getMonth()] = 0.0;
                }
                months[date.getMonth()] += Number($scope.Parsed.Issues[memberId][i].Price);
            }
        }
        for (var key = 0; key < 12; ++key) {
            result[key] = months[key] ? months[key] : 0;
        }
        return result;
    };

    /**
    * Will calculate the money spread per month per user
    * @param {string} id - optionnal - user full_name
    * @returns {array} - array which contains 1 number for each months (12)
    */
    var getTotalMoneySpreadPerMonthData = function (id) {
        var result = [];
        var months = {};

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                for (var month in $scope.Parsed.Issues[memberId][i].Worklogs) {
                    if (!months[month]) {
                        months[month] = 0.0;
                    }
                    if ($scope.Parsed.Issues[memberId][i].Worklogs[month])
                        months[month] += $scope.Parsed.Issues[memberId][i].Worklogs[month].Profit;
                }
            }
        }
        for (var key = 0; key < 12; ++key) {
            result[key] = months[key] ? months[key] : 0;
        }
        return result;
    };

    /**
    * Will calculate the sales of a specific date range
    * @param {object} sales - retrieve it with getTotalSalePerMonthData() for example
    * @param {array} months - optionnal - specify months as int
    * @returns {number}
    */
    var getTotalSaleAtMonth = function (sales, months) {
        var value = 0;
        for (var i in sales) {
            if (months && !contains(months, i))
                continue;
            value += sales[i];
        }
        return value;
    };

    /**
    * Will search the number of ticket type per users
    * @param {object} params - optionnal - use it as follow if needed { month: #for specific month in int#, id: #for specific user#}
    * @returns {object} - as { #type (sql, macro..)# : { #user# : int }, ... }
    */
    var getTotalTicketsPerTypeData = function (params) {
        var result = {};
        if (!params)
            params = {};

        for (var memberId in $scope.Parsed.Issues) {
            if (params.id && memberId != params.id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                if (!$scope.Parsed.Issues[memberId][i].Components || $scope.Parsed.Issues[memberId][i].Components.length == 0)
                    continue;
                var component = $scope.Parsed.Issues[memberId][i].Components[0].Name;
                if (params && params.type != component)
                    continue;
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear
                    || (params.month && params.month != date.getMonth()))
                    continue;
                if (!result[component])
                    result[component] = {};
                if (!result[component][memberId])
                    result[component][memberId] = 1;
                else
                    result[component][memberId] += 1;
            }
        }
        console.log("TotalTickets: ", result, params)
        return result;
    }

    var getTotalQuotesFinalStateData = function (id) {
        var result = { average: [], total: [], success: [], hours: [], errors: [], missQuoted: [] };
        var months = {};

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                var month = date.getMonth();
                if (!months[month])
                    months[month] = 0.0;
                if (!result.total[month])
                    result.total[month] = 0.0;
                if (!result.success[month])
                    result.success[month] = 0.0;
                if (!result.hours[month])
                    result.hours[month] = 0.0;
                var average = $scope.Parsed.Issues[memberId][i].Price / ($scope.Parsed.Issues[memberId][i].WorklogsTotalTime / 3600);
                if (average > 1000) {
                    result.errors.push($scope.Parsed.Issues[memberId][i]);
                }
                months[month] += $scope.Parsed.Issues[memberId][i].Price;
                result.total[month] += 1;
                result.hours[month] += round($scope.Parsed.Issues[memberId][i].WorklogsTotalTime / 3600);
                if (average >= correctQuote)
                    result.success[month] += 1;
                else
                    result.missQuoted.push($scope.Parsed.Issues[memberId][i]);
            }
        }
        for (var key = 0; key < 12; ++key) {
            result.average[key] = months[key] ? round(months[key] / result.hours[key]) : 0;
        }
        return result;
    };
    var getTotalQuotesPerMonthData = function (id) {
        var result = { average: [], total: [], success: [], hours: [], errors: [], missQuoted: [] };
        var months = {};

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                for (var month in $scope.Parsed.Issues[memberId][i].Worklogs) {
                    if (!months[month])
                        months[month] = 0.0;
                    if (!result.total[month])
                        result.total[month] = 0.0;
                    if (!result.success[month])
                        result.success[month] = 0.0;
                    if (!result.hours[month])
                        result.hours[month] = 0.0;
                    if (!$scope.Parsed.Issues[memberId][i].Worklogs[month])
                        continue;
                    var average = $scope.Parsed.Issues[memberId][i].Worklogs[month].Profit / ($scope.Parsed.Issues[memberId][i].Worklogs[month].length / 3600);
                    if (average > 1000) {
                        result.errors.push($scope.Parsed.Issues[memberId][i]);
                        continue;
                    }
                    months[month] += $scope.Parsed.Issues[memberId][i].Worklogs[month].Profit;
                    result.total[month] += 1;
                    result.hours[month] += round($scope.Parsed.Issues[memberId][i].Worklogs[month].length / 3600);
                    if (average >= correctQuote)
                        result.success[month] += 1;
                    else
                        result.missQuoted.push($scope.Parsed.Issues[memberId][i]);
                }
            }
        }
        for (var key = 0; key < 12; ++key) {
            result.average[key] = months[key] ? round(months[key] / result.hours[key]) : 0;
        }
        return result;
    };
    var getTotalQuotesAtMonth = function (quotes, months) {
        var result = { average: 0.0, total: 0.0, success: 0.0, hours: 0.0 };
        var notNullQuotes = 0;

        for (var i in quotes.average) {
            if (months && !contains(months, i))
                continue;
            result.average += quotes.average[i];
            if (quotes.average[i] > 0)
                ++notNullQuotes;
            if (quotes.total[i])
                result.total += quotes.total[i];
            if (quotes.success[i])
                result.success += quotes.success[i];
            if (quotes.hours[i])
                result.hours += quotes.hours[i];
        }
        console.log(result);
        result.average = round(result.average / notNullQuotes);
        return result;
    };

    var getTotalAveragePerMonthData = function (id) {
        return getTotalQuotesPerMonthData(id).average;
    };

    var getTotalRevenuesPerPeople = function (id) {
        var result = 0;

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                result += Number($scope.Parsed.Issues[memberId][i].Price);
            }
        }
        return result;
    };
    var getTotalDevHoursPerPeople = function (id) {
        var result = 0;

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                result += round($scope.Parsed.Issues[memberId][i].TimeTrackingData.timeSpentSeconds / 3600);
            }
        }
        return result;
    };
    var getTotalSupportHoursPerPeople = function (id) {
        var result = 0;

        for (var memberId in $scope.Parsed.Support) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Support[memberId]) {
                var date = new Date($scope.Parsed.Support[memberId].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                result += round($scope.Parsed.Support[memberId].TimeTrackingData.timeSpentSeconds / 3600);
            }
        }
        return result;
    };
    var getTotalTicketsPerPeople = function (id) {
        var result = 0;

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                result += 1;
            }
        }
        return result;
    };

    var getLowPerformancePerMonthData = function (id) {
        var result = [];

        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId !== id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                var date = new Date($scope.Parsed.Issues[memberId][i].Created);
                if (date.getFullYear() != $scope.currentYear)
                    continue;
                var value = { data: [], color: prettyColors[0] };
                var average = round(Number($scope.Parsed.Issues[memberId][i].Price) / ($scope.Parsed.Issues[memberId][i].WorklogsTotalTime / 3600));
                if (average * 100 / correctQuote > 100)
                    continue;
                value.data[date.getMonth()] = average * 100 / correctQuote;
                value.label = $scope.Parsed.Issues[memberId][i].Summary;
                result.push(value);
            }
        }
        return result;
    };

    var getAmountWorkPerMonthData = function (id) {
        var result = {};
        var type = $scope.Params.type;
        /*
        if (!id) {
            console.log("Error no id: can't get all type for all each member. use getAmountWorkPerMonthData");
            return null;
        }*/
        if (!type || type == "SUPPORT") {
            for (var i in $scope.Parsed.Support) {
                if (id && $scope.Parsed.Support[i].Assignee != id)
                    continue;
                if (!$scope.Parsed.Support[i].Components || $scope.Parsed.Support[i].Components.length == 0)
                    continue;
                var component = $scope.Parsed.Support[i].Components[0].Name;
                if (!result["Support"])
                    result["Support"] = { label: "Support", data: [], color: prettyColors[0] };

                for (var month in $scope.Parsed.Support[i].Worklogs) {
                    if (!result["Support"].data[month])
                        result["Support"].data[month] = 0;
                    if ($scope.Parsed.Support[i].Worklogs[month])
                        result["Support"].data[month] += round(($scope.Parsed.Support[i].Worklogs[month].length / 3600));
                }
            }
        }
        var colorId = 1;
        for (var memberId in $scope.Parsed.Issues) {
            if (id && memberId != id)
                continue;
            for (var i in $scope.Parsed.Issues[memberId]) {
                if (!$scope.Parsed.Issues[memberId][i].Components || $scope.Parsed.Issues[memberId][i].Components.length == 0)
                    continue;
                var component = $scope.Parsed.Issues[memberId][i].Components[0].Name;
                if (type && type != component)
                    continue;
                if (!result[component]) {
                    result[component] = { label: component, data: [], color: (colorId > prettyColors.length - 1 ? prettyTeamColor : prettyColors[colorId]) };
                    ++colorId;
                }
                for (var month in $scope.Parsed.Issues[memberId][i].Worklogs) {
                    if (!result[component].data[month])
                        result[component].data[month] = 0;
                    if ($scope.Parsed.Issues[memberId][i].Worklogs[month])
                        result[component].data[month] += round(($scope.Parsed.Issues[memberId][i].Worklogs[month].length / 3600));
                }
            }
            console.log("WLD: ", result);
            $scope.Params.type = null;
            return result;
        }

        $scope.Params.types = null;
        return result;
    }

    /** ISSUES **/
    var InitIssues = function (callbacks) {
        $scope.Data.Issues = [];

        getIssues(100, 1, function () {
            getWorklogs(function () {
                console.log("Worklogs:", $scope.Data.Worklogs);
                filterWorklogs();
                addNewValuesToIssues();
                addWorklogsToIssues();
                parseIssues();
                console.log("Worklogs:", $scope.Data.Worklogs);
                console.log("IgnoredWorklogs:", $scope.Data.IgnoredWorklogs);
                console.log("LostWorklogs:", findLostWorklogs());
                console.log("Issues", $scope.Data.Issues);
                console.log("Support", $scope.Parsed.Support);
                console.log("ParsedIssues", $scope.Parsed.Issues);
                if ($scope.Selected.Func)
                    $scope.Selected.Func();
                else
                    $scope.TotalSalesPerGroup();
                triggerCallback(callbacks);
            });
        });
    };

    var getIssues = function (max, page, callback) {
        $scope.isBusy = true;
        RequestApi.GET("Jira/GetTeamIssues", function (response) {
            ++page;
            if (response.data.ClassName && response.data.ClassName.includes("Exception")) {
                console.log("Error: ", response.data);
                callback();
                return;
            }
            for (var i in response.data) {
                $scope.Data.Issues.push(response.data[i]);
            }
            console.log("GetIssues: ", response);
            if (response.data.length != 0)
                getIssues(max, page, callback);
            else {
                $scope.isBusy = false;
                if (callback)
                    callback();
            }
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        }, { jqlSearch: 'project=CST', maxValues: max, page: page });
    };

    /** WORKLOGS **/

    var findLostWorklogs = function () {
        lostWorklogs = {};

        for (var month in $scope.Data.Worklogs) {
            lostWorklogs[month] = [];
            for (var i in $scope.Data.Worklogs[month]) {
                if ($scope.Data.Worklogs[month][i].Lost)
                    lostWorklogs[month].push($scope.Data.Worklogs[month][i]);
            }
        }
        return lostWorklogs;
    }
    var filterWorklogs = function () {
        $scope.Data.IgnoredWorklogs = {};

        for (var month in $scope.Data.Worklogs) {
            $scope.Data.IgnoredWorklogs[month] = [];
            for (var i = 0; i < $scope.Data.Worklogs[month].length; ++i) {
                if ($scope.Data.Worklogs[month][i].project_name !== "(cst) All Projects") {
                    $scope.Data.IgnoredWorklogs[month].push($scope.Data.Worklogs[month][i]);
                    $scope.Data.Worklogs[month].splice(i, 1);
                    --i;
                } else {
                    console.log($scope.Data.Worklogs[month][i].project_name);
                }
            }
        }
    }

    var getWorklogs = function (callback) {
        $scope.Data.Worklogs = {};

        RequestApi.GET("TimeDoctor/GetTeamUserIds", function (response) {
            var userIds = [];
            for (var i in response.data) {
                userIds.push(response.data[i].user_id);
            }
            getWorklogsForYear($scope.currentYear, 0, userIds, [
                {},
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                getWorklogsForYear,
                callback
            ]);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    }
    // BETTER only use getWorklogs
    var getWorklogsForYear = function (year, month, userIds, callbacks) {
        ++month;
        callbacks.shift();
        if (callbacks.length == 0)
            callbacks = null;
        getWorklogsForDates(year, month, 1, userIds, callbacks);
    }
    // BETTER only use getWorklogs
    var getWorklogsForDates = function (year, month, page, userIds, callbacks) {
        $scope.isBusy = true;
        $scope.Data.Worklogs[month - 1] = [];
        RequestApi.GET("TimeDoctor/GetWorklogs", function (response) {
            ++page;
            $scope.isBusy = false;
            response.data = JSON.parse(response.data);

            if (response.data.ClassName && response.data.ClassName.includes("Exception")) {
                console.log("Error: ", response.data);
                if (callbacks)
                    callbacks[0](year, month, userIds, callbacks);
                return;
            }
            pushArray($scope.Data.Worklogs[month - 1], response.data.worklogs.items);
            if (response.data.worklogs.count === response.data.worklogs.limit)
                getWorklogsForDates(year, month, page, callbacks);
            else if (callbacks)
                callbacks[0](year, month, userIds, callbacks);
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        }, { userIds: userIds, startDate: getMinDate(year, month), endDate: getMaxDate(year, month), limit: 500, page: page });

    }

    /** CHART **/
    $scope.initChartPerMonthPerPeople = function (Func, type, colorShade, member) {
        var datasets = [];

        for (var i in $scope.Data.TeamMembers) {
            if (member && member.full_name != $scope.Data.TeamMembers[i].full_name)
                continue;
            datasets.push({
                type: type,
                label: '# ' + $scope.Data.TeamMembers[i].full_name,
                data: Func($scope.Data.TeamMembers[i].full_name),
                backgroundColor: $scope.Data.TeamMembers[i].color.replace('{a}', colorShade),
                borderColor: $scope.Data.TeamMembers[i].color.replace('{a}', '1'),
                borderWidth: 1
            });
        }
        updateChart("MyChart", { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: datasets, type: type, options: { legend: { display: true } } });
    };

    $scope.initChartPerMonthGlobal = function (Func, type, colorShade) {
        var datasets = [];

        datasets.push({
            type: type,
            label: '# Team',
            data: Func(),
            backgroundColor: prettyTeamColor.replace('{a}', colorShade),
            borderColor: prettyTeamColor.replace('{a}', '1'),
            borderWidth: 1
        });
        updateChart("MyChart", { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: datasets, type: type, options: { legend: { display: true } } });
    };

    $scope.initChartBy2AxesGen = function (Func, type, colorShade, param) {
        var datasets = [];

        var result = Func(param);
        var labels = [];
        var colorId = 0;

        for (var key in result) {
            var values = [];
            for (var key2 in result[key]) {
                if (!labels.includes(key2)) {
                    labels.push(key);
                }
                values.push(result[key][key2]);
            }
            datasets.push({
                type: type,
                label: '# ' + key,
                data: values,
                backgroundColor: (colorId > prettyColors.length - 1 ? prettyTeamColor : prettyColors[colorId]).replace('{a}', colorShade),
                borderColor: (colorId > prettyColors.length - 1 ? prettyTeamColor : prettyColors[colorId]).replace('{a}', '1'),
                borderWidth: 1
            });
            ++colorId;
        }
        updateChart("MyChart", { labels: labels, datasets: datasets, type: type, options: { legend: { display: true } } });
    };

    $scope.initChartBulkPerMonth = function (Func, type, colorShade, member, displayLegend, useColor) {
        var result = Func(member.full_name);
        var datasets = [];
        if (!result) {
            return;
        }
        console.log("ChartBulk: ", result);
        var color = 0;
        for (var i in result) {
            datasets.push({
                type: type,
                label: result[i].label,
                data: result[i].data,
                backgroundColor: result[i].color.replace('{a}', colorShade),
                borderColor: result[i].color.replace('{a}', 1),
                borderWidth: 1
            });
            ++color;
        }
        updateChart("MyChart", { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: datasets, type: type, options: { legend: { display: (displayLegend ? displayLegend : false) } } });
    };

    $scope.initTotalSaleAndAveragePersonalChart = function (member) {
        var datasets = [];

        datasets.push({
            type: 'line',
            label: '# Sales (£)',
            data: getTotalSalePerMonthData(member.full_name),
            backgroundColor: prettyColors[0].replace('{a}', '0.1'),
            borderColor: prettyColors[0].replace('{a}', '1'),
            borderWidth: 1
        });
        datasets.push({
            type: 'line',
            label: '# MoneySpread (£)',
            data: getTotalMoneySpreadPerMonthData(member.full_name),
            backgroundColor: prettyColors[1].replace('{a}', '0.1'),
            borderColor: prettyColors[1].replace('{a}', '1'),
            borderWidth: 1
        });
        datasets.push({
            type: 'line',
            label: '# Average (£/h)',
            data: getTotalQuotesPerMonthData(member.full_name).average,
            backgroundColor: prettyColors[2].replace('{a}', '0.5'),
            borderColor: prettyColors[2].replace('{a}', '1'),
            borderWidth: 1
        });
        updateChart("MyChart", { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: datasets, type: 'line', options: { legend: { display: true } } });
    };

    $scope.initPiePerPeople = function (Func, type, colorShade) {
        var values = [];
        var labels = [];
        var backgroundColors = [];
        var borderColors = [];

        for (var i in $scope.Data.TeamMembers) {
            values.push(Func($scope.Data.TeamMembers[i].full_name));
            labels.push($scope.Data.TeamMembers[i].full_name);

            backgroundColors.push($scope.Data.TeamMembers[i].color.replace('{a}', colorShade));
            borderColors.push($scope.Data.TeamMembers[i].color.replace('{a}', '1'));
        }
        updateChart("MyPie", { labels: labels, datasets: [{ data: values, borderWidth: [1], backgroundColor: backgroundColors, borderColor: borderColors }], type: type, options: { legend: { display: true } } });
    };

    var updateChart = function (chartId, chartValues) {
        $scope.Selected.ActiveChart = chartId;
        if (Charts[chartId]) {
            if (chartValues.labels)
                Charts[chartId].data.labels = chartValues.labels;
            if (chartValues.datasets)
                Charts[chartId].data.datasets = chartValues.datasets;
            if (chartValues.type)
                Charts[chartId].type = chartValues.type;
            if (chartValues.options) {
                for (var id in chartValues.options) {
                    Charts[chartId].options[id] = chartValues.options[id];
                }
            }
            Charts[chartId].update();
        }
    };

    var createCharts = function () {
        var ctx = document.getElementById('MyChart').getContext("2d");
        Charts.MyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: {
                    xAxes: [{
                        stacked: false,
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        stacked: false,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                legend: { display: true }
            }
        });

        ctx = document.getElementById('MyPie').getContext("2d");
        Charts.MyPie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                legend: { display: true }
            }
        });
    };

    /** CHART MANAGER - TEAM **/
    $scope.TotalSalesPerTeam = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TSPT';
        $scope.Selected.Func = $scope.TotalSalesPerTeam;
        $scope.initChartPerMonthGlobal(getTotalSalePerMonthData, 'bar', '0.3');
    };
    $scope.TotalSalesPerGroup = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TSPG';
        $scope.Selected.Func = $scope.TotalSalesPerGroup;
        $scope.initChartPerMonthPerPeople(getTotalSalePerMonthData, 'bar', '0.3');
    };

    $scope.TotalMoneySpreadPerTeam = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TMST';
        $scope.Selected.Func = $scope.TotalMoneySpreadPerTeam;
        $scope.initChartPerMonthGlobal(getTotalMoneySpreadPerMonthData, 'bar', '0.3');
    };
    $scope.TotalMoneySpreadPerGroup = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TMSG';
        $scope.Selected.Func = $scope.TotalMoneySpreadPerGroup;
        $scope.initChartPerMonthPerPeople(getTotalMoneySpreadPerMonthData, 'bar', '0.3');
    };

    $scope.TotalAveragePerTeam = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TAPT';
        $scope.Selected.Func = $scope.TotalAveragePerTeam;
        $scope.initChartPerMonthGlobal(getTotalAveragePerMonthData, 'line', '0.3');
    };
    $scope.TotalAveragePerGroup = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TAPG';
        $scope.Selected.Func = $scope.TotalAveragePerGroup;
        $scope.initChartPerMonthPerPeople(getTotalAveragePerMonthData, 'line', '0.02');
    };

    $scope.TotalTicketPerTypePerGroup = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TTPG';
        $scope.Selected.Func = $scope.TotalTicketPerGroup;

        var currentMonth;
        if ($scope.Selected.Team.currentMonth)
            currentMonth = (parseInt($scope.Selected.Team.currentMonth) ? parseInt($scope.Selected.Team.currentMonth) - 1 : (new Date()).getMonth());
        $scope.initChartBy2AxesGen(getTotalTicketsPerTypeData, 'bar', '0.3', { month: currentMonth, id: $scope.Selected.Personal.currentMember });
    }

    $scope.TotalPerPeopleOfSales = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TPPOSA';
        $scope.Selected.Func = $scope.TotalPerPeopleOfSales;
        $scope.initPiePerPeople(getTotalRevenuesPerPeople, 'pie', '0.2');
    };
    $scope.TotalPerPeopleOfDevHours = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TPPOD';
        $scope.Selected.Func = $scope.TotalPerPeopleOfDevHours;
        $scope.initPiePerPeople(getTotalDevHoursPerPeople, 'pie', '0.2');
    };
    $scope.TotalPerPeopleOfSupportHours = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TPPOSU';
        $scope.Selected.Func = $scope.TotalPerPeopleOfSupportHours;
        $scope.initPiePerPeople(getTotalSupportHoursPerPeople, 'pie', '0.2');
    };
    $scope.TotalPerPeopleOfTickets = function () {
        resetFilter(true, true);
        $scope.Selected.Active = 'TPLPOT';
        $scope.Selected.Func = $scope.TotalPerPeopleOfTickets;
        $scope.initPiePerPeople(getTotalTicketsPerPeople, 'pie', '0.2');
    };

    /** CHART MANAGER - PERSONAL **/
    $scope.PersonalMainDashboard = function () {
        resetFilter(true, false);
        $scope.Selected.Active = 'TSAP';
        $scope.Selected.Func = $scope.PersonalMainDashboard;
        $scope.Selected.Personal.Data = parsePersonalDashboardData($scope.Selected.Personal.currentMember);
        $scope.initTotalSaleAndAveragePersonalChart($scope.Selected.Personal.currentMember);
    };
    var parsePersonalDashboardData = function (member) {
        var currentMonth = (parseInt($scope.Selected.Personal.currentMonth) ? parseInt($scope.Selected.Personal.currentMonth) - 1 : (new Date()).getMonth());
        var data = {};

        var totalRevenues = getTotalSalePerMonthData(member.full_name);
        data.PerMonth = getTotalSaleAtMonth(totalRevenues, [currentMonth]);
        data.PerYear = getTotalSaleAtMonth(totalRevenues);

        var quotes = getTotalQuotesFinalStateData(member.full_name);
        data.QuoteThisM = getTotalQuotesAtMonth(quotes, [currentMonth]);
        data.QuoteThisY = getTotalQuotesAtMonth(quotes);

        data.QuoteThisM.globalAverage = round(data.PerMonth / data.QuoteThisM.hours);
        data.QuoteThisY.globalAverage = round(data.PerYear / data.QuoteThisY.hours);

        console.log("DataPerso: ", data);
        console.log("Quotes", quotes);
        return data;
    };
    $scope.PersonalAverageOnTicket = function () {
        resetFilter(true, false);
        $scope.Selected.Active = 'PAOT';
        $scope.Selected.Func = $scope.PersonalAverageOnTicket;
        $scope.initChartPerMonthPerPeople(getTotalAveragePerMonthData, 'line', '0.3', $scope.Selected.Personal.currentMember);
    };
    $scope.PersonalLowPerformanceOnTickets = function () {
        resetFilter(true, false);
        $scope.Selected.Active = 'PLPOT';
        $scope.Selected.Func = $scope.PersonalPerformanceOnTickets;
        $scope.initChartBulkPerMonth(getLowPerformancePerMonthData, 'bar', '0.2', $scope.Selected.Personal.currentMember);
    };
    $scope.PersonalWorkloadDistributionAverage = function () {
        resetFilter(true, false);
        $scope.Selected.Active = 'PWDA';
        $scope.Selected.Func = $scope.PersonalWorkloadDistributionAverage;
        $scope.initChartBulkPerMonth(getAmountWorkPerMonthData, 'line', '0.001', $scope.Selected.Personal.currentMember, true, true);
    };

    /** CHART ACTIONS **/

    /** REFRESH **/
    var resetFilter = function (team, perso) {
        if (team)
            $scope.Selected.Team = {};
        if (perso)
            $scope.Selected.Personal = {};
    };
    $scope.refresh = function () {
        InitIssues();
    };

    /** GUI GETTERS **/
    $scope.getSearchIcon = function () {
        if ($scope.isBusy)
            return 'fa-refresh fa-spin';
        else
            return 'fa-refresh';
    };
    $scope.getChartTitle = function (id) {
        return chartTitles[id];
    };
    $scope.getDisabled = function (id) {
        if ($scope.isBusy || $scope.Selected.Active === id)
            return true;
        return false;
    };

    /** TOOLS **/
    var triggerCallback = function (callbacks) {
        if (callbacks && callbacks[0]) {
            var callback = callbacks.shift();
            callback(callbacks);
        } else {
            $scope.isBusy = false;
        }
    }

    var getChartConf = function (code) {
        return ChartsAction[code];
    };
    var getObjectById = function (array, id, value) {
        for (var i in array) {
            for (var key in array[i]) {
                if (key === id && array[i][key] === value)
                    return array[i];
            }
        }
        return null;
    };
    var initArrayToObject = function (obj, key) {
        if (!obj[key])
            obj[key] = [];
    };
    var contains = function (obj, value) {
        for (var i in obj) {
            if (obj[i] == value) {
                return true;
            }
        }
        return false;
    };

    var round = function (num) {
        return Math.round(num, 1);
    };

    $scope.getActiveChart = function (id) {
        if (id === $scope.Selected.ActiveChart)
            return true;
        return false;
    };

    var getMinDate = function (year, month) {
        return year + '-' + (month < 10 ? '0' + month : month) + '-01'
    };
    var getMaxDate = function (year, month) {
        return year + '-' + (month < 10 ? '0' + month : month) + '-' + new Date(year, month, 0).getDate();
    };

    var pushArray = function (arr, arr2) {
        arr.push.apply(arr, arr2);
    };

    var getMonthId = function (month) {
        for (var i in monthValues) {
            if (month == monthValues[i])
                return i;
        }
        return 0;
    };

    $.fn.extend({
        animateCss: function (animationName, callback) {
            var animationEnd = (function (el) {
                var animations = {
                    animation: 'animationend',
                    OAnimation: 'oAnimationEnd',
                    MozAnimation: 'mozAnimationEnd',
                    WebkitAnimation: 'webkitAnimationEnd',
                };

                for (var t in animations) {
                    if (el.style[t] !== undefined) {
                        return animations[t];
                    }
                }
            })(document.createElement('div'));

            this.addClass('animated ' + animationName).one(animationEnd, function () {
                $(this).removeClass('animated ' + animationName);

                if (typeof callback === 'function') callback();
            });

            return this;
        },
    });

    /** GUI **/
    $scope.collapseGUI = function () {
        $scope.GUI.isNavCollapsed = !$scope.GUI.isNavCollapsed;
    };
    $scope.moveToConfig = function () {
        $location.path("/config");
    };

    /** DATE **/
    $scope.updateWithCurrentYear = function () {
        InitIssues();
    };
    $scope.updateWithCurrentMonth = function () {
        $scope.Selected.Personal.currentMonth = parseInt(getMonthId($scope.PCurrentMonthUI)) + 1;
        $scope.Selected.Personal.Data = parsePersonalDashboardData($scope.Selected.Personal.currentMember);
    };

    /** INIT **/

    var initTeamMembers = function (callbacks) {
        $scope.isBusy = true;
        RequestApi.GET("Jira/GetProfile", function (response) {

            if (response) {
                $scope.Data.TeamMembers = response.data.selectedUsers;

                for (var i in $scope.Data.TeamMembers) {
                    $scope.Data.TeamMembers[i].color = $scope.Data.TeamMembers[i].color.replace("rgb", "rgba").replace(")", ",{a})");
                }
                console.log("TeamUsers: ", $scope.Data.TeamMembers);
                $scope.isBusy = false;
                triggerCallback(callbacks);
            }
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    };

    var initCore = function (callbacks) {
        $scope.currentYear = (new Date()).getFullYear();
        $scope.PCurrentMonthUI = monthValues[(new Date()).getMonth()];
        $scope.Selected.Personal.currentMonth = (new Date()).getMonth() + 1;
        $("#datepickerYear").datepicker({
            format: 'yyyy',
            viewMode: 'years',
            minViewMode: 'years',
            autoclose: true
        });
        $("#datepickerMonth").datepicker({
            format: 'MM',
            viewMode: 'months',
            minViewMode: 'months',
            maxViewMode: 'months',
            startView: 'months',
            autoclose: true
        });
        createCharts();
        triggerCallback(callbacks);
    };

    var initConfiguration = function (callbacks) {
        $scope.isBusy = true;
        RequestApi.GET("Jira/IsConfigValid", function (responseJira) {
            RequestApi.GET("TimeDoctor/IsConfigValid", function (responseTDoctor) {

                if (responseJira && responseTDoctor) {
                    {
                        if (responseJira.data == true && responseTDoctor.data == true)
                            triggerCallback(callbacks);
                        else {
                            console.log("Configuration not valid > moveToConfig");
                            $scope.isBusy = false;
                            $scope.moveToConfig();
                        }
                    }
                }
            }, function (error) {
                $scope.isBusy = false;
                console.log("error:", error);
            });
        }, function (error) {
            $scope.isBusy = false;
            console.log("error:", error);
        });
    };

    $scope.init = function () {
        initConfiguration([initCore, initTeamMembers, InitIssues]);
    }

    $scope.init();
};