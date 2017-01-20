/*
* Browser action panel
*/

// var FurkForChromePanel = (function () {
define(["app/furkAPI"], function (furkAPI) {

    /// Private methods
    function showFinishedList(xhr) {

        var response = xhr.target;

        if (response.statusText !== "OK") {
            return;
        }

        var apiResponse = JSON.parse(response.responseText);

        switch (apiResponse.error) {
            case "access denied":
                //$("#finished-list").append("<p>Please <a href=\"https://www.furk.net/login\">log in</a> to Furk.</p>");
                $("#finished-list").append(make(["p", "Please ",
                    ["a",
                        {
                            href: "#",
                            onclick: "showURL('" + FurkAPI.FurkLoginUrl + "')"
                        },
                        "log in"], " to Furk."]));
                //                $("#finished-list").append("<p>", 
                //                    "Please ",
                //                    $("<a>").click("showURL('" + FurkAPI.FurkLoginUrl + "')")
                //                {
                //                    text: "Please"
                //                };
                break;
        }

        var sortedFiles = [];
        var finishedContainer = document.querySelector('#finished-list');

        if (apiResponse.files !== undefined && apiResponse.files.length > 0) {
            //            sortedFiles = apiResponse.files.sort(function (a, b) {
            //                return a.id - b.id;
            //            });
            sortedFiles = apiResponse.files; //.reverse();

            var list = document.createElement("ol");
            finishedContainer.appendChild(list);

            //var $list = $(document.createElement("ol"));

            //$("#finished-list").append($list);

            for (var i = 0, furkFile; furkFile = sortedFiles[i]; i++) {
                if (i === this.finishedDisplayNum()) {
                    break;
                }
                // var $el = constructSearchResult(furkFile);
                var listItem = constructSearchResult(furkFile);
                list.appendChild(listItem);
            }
        } else {

            finishedContainer.text("No files in your Finished list - download something!");
        }

        //list.appendChild(make(["li", "See all ", ["a", { href: "http://furk.net/users/files/finished" }, "finished files"]]));

        $("#spinner").hide();
    }

    function showActiveList(xhr) {

        var response = xhr.target;

        if (response.statusText !== "OK") {
            return;
        }

        var apiResponse = JSON.parse(response.responseText);

        var filteredTorrents = [];

        if (apiResponse.torrents !== undefined && apiResponse.torrents.length > 0) {
            filteredTorrents = $(apiResponse.torrents).filter(
                function (index) {
                    return (this.dl_status === "active");
                });
        }

        var list = document.createElement("ol");
        //document.body.appendChild(list);
        $("#active-list").append(list);

        for (var i = 0, tor; tor = filteredTorrents[i]; i++) {
            var el = constructActiveTorrent(tor);
            list.appendChild(el);
        }

        $("#spinner").hide();
    }

    this.constructSearchResult = function (file) {

        // TODO: get this working, as it's nicer!
        //return make(["li", "", ["a", { onclick: "showURL('" + file.url_dl + "')" }, file.name]]);

        var item = document.createElement("a");
        item.href = file.url_dl;
        item.title = "Download " + file.url_dl;
        item.appendChild(document.createTextNode(file.name));

        var listItem = document.createElement("li");
        listItem.appendChild(item);

        return listItem;


        // return $("<li/>")
        //             .append($("<a/>", {
        //                 "href": file.url_dl,
        //                 text: file.name
        //             }));
        //"target": "_blank",


    }

    this.constructActiveTorrent = function (tor) {
        //return $("<li/>")
        //            .append([$("<span/>", {
        //                "class": "tor_name",
        //                text: tor.name
        //            }), $("<span/>", {
        //                "class": "tor_complete",
        //                text: tor.have
        //            }), $("<span/>", {
        //                "class": "tor_status",
        //                text: tor.active_status
        //            })]);

        //return make(["li", "", tor.name, " - ", tor.have, " %", " - ", tor.active_status]);
        return make(["li", ["span", { "class": "tor_name" }, tor.name, " - ", tor.have, " %", " - ", tor.active_status]]);
    }

    /// Sort files by ID descending
    //this.furkFileCompare = function (a, b) {
    //    if (a.id < b.id) { return 1; }
    //    if (a.id > b.id) { return -1; }
    //    return 0;
    //}

    return {
        finishedDisplayNum: function () {
            return 10;
        },
        showFinished: function () {
            this.show();

            $("#finished-list").empty();
            furkAPI.getFinished(null, null, showFinishedList, 10, 'ctime', 'desc');

            $("#active").hide();
            $("#finished").show();
        },
        showActive: function () {
            this.show();

            $("#active-list").empty();
            furkAPI.getDownloads(null, showActiveList);

            $("#active").show();
            $("#finished").hide();
        },
        show: function (e) {
            $("#spinner").show();

            //$("#finished").toggle();
            //$("#active").toggle();

            //if ($("#active").is(":visible")) {
            //    FurkForChromePanel.showActive();
            //} else {
            //    FurkForChromePanel.showFinished();
            //}

            //return false;
        },
        init: function () {
            // Bind the event handler to each nav item
            //Array.prototype.slice.call(document.querySelectorAll('.showMenu'), 0).forEach(function () {
            //    this.addEventListener('click', FurkForChromePanel.show);
            //});
            document.querySelector('#showActive').addEventListener('click', this.showActive);
            document.querySelector('#showFinished').addEventListener('click', this.showFinished);

            // show default view
            // TODO: make this an option
            this.showFinished();
        }
    };
});
// } ());

//$(document).ready(function panelHtml() {
//    FurkForChromePanel.show();
//});

// window.addEventListener('DOMContentLoaded', function () {
//     FurkForChromePanel.init();
// });