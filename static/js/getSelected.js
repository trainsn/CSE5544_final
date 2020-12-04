
function getSelectedData(selected_ids, data) {
    // select data for vis heatmap
    var length = selected_ids.length; // (selected_ids.length >= 400) ? 400 : selected_ids.length;
    // selected_ids = selected_ids.slice(0,400);
    var heatmap_data = [],
        lat_data = [];

    var hidden_size = data[selected_ids[0].slice(2)]["lat"].length;


    for (var i = 0; i < length; i++){
        // console.log("data[selected_ids[i].slice(2)]", data[selected_ids[i].slice(2)])
        var instrument = data[selected_ids[i].slice(2)]["file_name"].split("_")[0],
            performer = data[selected_ids[i].slice(2)]["file_name"].split("_")[1],
            songName = data[selected_ids[i].slice(2)]["file_name"].split("_")[2],
            // start = data[selected_ids[i].slice(2)]["start"],
            start = data[selected_ids[i].slice(2)]["file_name"].split("_")[3],
            lat = data[selected_ids[i].slice(2)]["lat"],
            pos = data[selected_ids[i].slice(2)]["pos"],
            label = data[selected_ids[i].slice(2)]["label"];
        lat_data.push({
            instrument: instrument,
            performer: performer,
            songName: songName,
            start: start,
            lat: lat,
            label: label,
            pos: pos
        });
        for (var j = 0; j < hidden_size; j++) {
            var value = data[selected_ids[i].slice(2)]["lat"][j];
            heatmap_data.push({
                instrument: instrument,
                performer: performer,
                songName: songName,
                start: start,
                label: label,
                pos: pos,
                pos1: j,
                pos2: i,
                value: value,
            });
        }
    }

    var test = [];
    lat_data.forEach(function (d, i) {
        test[i] = d.lat
    });
    var var_test = [];
    test = d3.transpose(Array.from(test));
    for(i=0;i<hidden_size;i++){
        var_test[i] = d3.variance(test[i]);
    }

    var sortBy = [];
    var temp = var_test.slice(0);
    temp.sort(d3.descending);
    temp.forEach(function (d,i) {
        sortBy[var_test.indexOf(d)] = i;
    });
    console.log(sortBy," sorted by dim_index", var_test, temp);

    Index2Map = function (a, b) {
        var d={};
        d.index = a;
        d.value = b;
        console.log(a,b, d);
        return d;
    };

    var ind = [];
    for(i=0;i<hidden_size;i++){
        ind[i] = Index2Map(sortBy[i],i);
    }
    ind.sort(function(x, y){
        return d3.ascending(x.index, y.index);
    });

    sortBy = [];
    ind.forEach(function (d, i) {
        sortBy[i] = d.value;
    })
    // console.log(sortBy,ind)
    // var temp_lat = lat_data.slice(0);
    //
    // console.log("before",lat_data);
    // lat_data.forEach(function (d, i) {
    //     // var t = d.lat.slice(0);
    //     // let t = d.lat.slice();
    //     // console.log(",d.lat.slice(0)", d.lat, t);
    //     d.lat.sort(function (a, b) {
    //         // console.log(a, b, 'ab');
    //         // console.log(sortBy[temp_lat[i].lat.indexOf(a)],  temp_lat[i].lat.indexOf(a), temp_lat[i].lat, temp_lat[i]);
    //         return (sortBy[temp_lat[i].lat.indexOf(a)] || 0) - (sortBy[temp_lat[i].lat.indexOf(b)] || 0);
    //         // return +(var_test[d.lat.indexOf(a)]) > +(var_test[d.lat.indexOf(b)]);
    //     })
    // });
    // console.log("after",lat_data)


    // method = kmeans, hierarchical, DBSCAN,
    // kmeans:
    // hier linkage: ward, complete, average, single
    //      affinity: euclidean, l1, l2, manhattan, cosine //If linkage is ward, only euclidean is accepted.
    //      n_clusters:
    // DBSCAN min_samples # of points for it be considered as a core point
    //        eps maximum distance between two samples in a cluster

    var runHCBtn = document.getElementById("runHC");
    var runKMeansBtn = document.getElementById("runKMeans");
    var runDBSCANBtn = document.getElementById("runDBSCAN");

    runHCBtn.onclick = function(){
        method = "hierarchical";
        linkage = getRadioBoxValue("linkage");
        affinity = getRadioBoxValue("affinity");
        n_clusters = getInputValue("n_clusters");
        getClustering();
    };
    runKMeansBtn.onclick = function(){
        method = "kmeans";
        k = getInputValue("k");
        getClustering(k);
    };
    runDBSCANBtn.onclick = function(){
        method = "DBSCAN";
        eps = getInputValue("eps");
        min_samples = getInputValue("min_samples");
        getClustering();
    };

    function getClustering(){
        if (method == "kmeans"){
            var str = {
                data: lat_data,
                method: "kmeans",
                k: k
            };
        }
        else if (method == "hierarchical"){
            var str = {
                data: lat_data,
                method: "hierarchical",
                linkage: linkage, // If linkage is “ward”, only “euclidean” is accepted
                affinity: affinity,
                n_clusters: n_clusters
            };
        }
        else if (method == "DBSCAN"){
            var str = {
                data: lat_data,
                method: "DBSCAN",
                eps: eps,
                min_samples: min_samples
            };
        }
        console.log('str', str);

        $.ajax({
            url: '/postmethod',
            data: JSON.stringify(str),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log("response", response);
                dispatch.call("clustering", this, response.labels, response.cosine);
            },
            error: function(error) {
                console.log(error);
            }
        });
    }

    // event.preventDefault();
    // dispatch.on("clustering", function (data) {
    //     console.log(data);
    //     cluster_labels = data;
    // });
    return [heatmap_data, lat_data, selected_ids, sortBy, var_test];
}

function getRadioBoxValue(radioName) {
      var obj = document.getElementsByName(radioName);
      for(i=0; i<obj.length; i++)  {
          if(obj[i].checked)  { return obj[i].value;}
      }
      return "undefined";
}

function  getInputValue(inputName) {
      var obj = document.getElementById(inputName);
      return  obj.value;
}