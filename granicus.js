(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();
    myConnector.init = function(initCallback) {
        tableau.authType = tableau.authTypeEnum.basic;
        // tableau.password = tableau.connectionData
        console.log("tableau.password: " + tableau.password)
        initCallback();
    }

    var dateObj = new Date(),
    var month = dateObj.getUTCMonth() + 1, //jan = 0
    var day = dateObj.getUTCDate(),
    var year = dateObj.getUTCFullYear(),
    var newdate = year + "-" + month + "-" + day;

    var fortnightPrior = new Date(Date.now() - 12096e5),
    var fnPmonth = fortnightPrior.getUTCMonth() + 1
    var fnPday = fortnightPrior.getUTCDate(),
    var fnPyear = fortnightPrior.getUTCFullYear(),
    var fnPnewdate = fnPyear + "-" + fnPmonth + "-" + fnPday;

    console.log({
      "newdate" : newdate,
      "fnPnewdate" : fnPnewdate
    })


    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
              id: "code",
              dataType: tableau.dataTypeEnum.string
          }, {
              id: "name",
              // alias: "Bulletins Sent",
              dataType: tableau.dataTypeEnum.string
          }, {
              id: "bulletins_sent_this_period",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "bulletins_sent_to_date",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "new_subscriptions_this_period",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "new_subscriptions_to_date",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "visibility",
              // alias: "",
              dataType: tableau.dataTypeEnum.string
          }, {
              id: "total_subscriptions_to_date",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "deleted_subscriptions_this_period",
              // alias: "",
              dataType: tableau.dataTypeEnum.int
          }, {
              id: "deleted_subscriptions_to_date",
              dataType: tableau.dataTypeEnum.int
          }]
;

    var schemas = {
        id: "Granicus_Subscriptions",
        alias: `Granicus subscriptions, deletions and bulletins for start_date: ${fnPnewdate} - end_date: ${newdate}`,
        columns: cols
    };
        schemaCallback([schemas]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
      tableau.log("inside `getData` tableau.password: " + tableau.password)
        $.ajax({
          url: "https://cors-anywhere.herokuapp.com/https://api.govdelivery.com/api/v2/accounts/11723/reports/topics?end_date="+newdate+"&start_date="+fnPnewdate+"&page=1",
          type: "GET",
          headers: {
            'content-type': 'application/json',
            'x-auth-token': JSON.parse(tableau.password),
            'accept': 'application/hal+json'
          },
          success: function(r) {
            json = r.json()
            var results = json.topic_details
            tableData = []
            for (var i = 0 var l = results.length; i < l; i++) {
              tableData.push({
                "code": results[i].code,
                "name": results[i].name,
                "visibility": results[i].visibility,
                "bulletins_sent_this_period": results[i].bulletins_sent_this_period,
                "bulletins_sent_to_date": results[i].bulletins_sent_to_date,
                "deleted_subscriptions_this_period": results[i].deleted_subscriptions_this_period,
                "deleted_subscriptions_to_date": results[i].deleted_subscriptions_to_date,
                "new_subscriptions_this_period": results[i].new_subscriptions_this_period,
                "new_subscriptions_to_date": results[i].new_subscriptions_to_date,
                "total_subscriptions_to_date": results[i].total_subscriptions_to_date
              })
            }
            table.appendRows(tableData)
            doneCallback();
          },
          error: function (xhr, ajaxOptions, thrownError) {
            tableau.abortWithError("Unable to get data. Make sure you used proper API key");
          }
        })
      }

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {

        $("#submitButton").click(function() {
            var key = $('#key').val();
            if (key) {
                tableau.password = key; // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "Granicus API"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                alert("Enter a valid Granicus API key");
            }
        });
    });
})();
