﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF 
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A 
//// PARTICULAR PURPOSE. 
//// 
//// Copyright (c) Microsoft Corporation. All rights reserved 

(function () {
    // Variable to store the ShareOperation object 
    var shareOperation = null;

    // Variable to store the visibility of the Extended Sharing section 
    var extendedSharingCollapsed = true;

    /// <summary> 
    /// Helper function to display received sharing content 
    /// </summary> 
    /// <param name="type"> 
    /// The type of content received 
    /// </param> 
    /// <param name="value"> 
    /// The value of the content 
    /// </param> 
    function displayContent(label, content, preformatted) {
        var labelNode = document.createElement("strong");
        labelNode.innerText = label;

        document.getElementById("contentValue").appendChild(labelNode);

        if (preformatted) {
            var pre = document.createElement("pre");
            pre.innerHTML = content;
            document.getElementById("contentValue").appendChild(pre);
        }
        else {
            document.getElementById("contentValue").appendChild(document.createTextNode(content));
        }
        document.getElementById("contentValue").appendChild(document.createElement("br"));
    }

    /// <summary> 
    /// Handler executed on activation of the target 
    /// </summary> 
    /// <param name="eventArgs"> 
    /// Arguments of the event. In the case of the Share contract, it has the ShareOperation 
    /// </param> 
    function activatedHandler(eventObject) {
        // In this sample we only do something if it was activated with the Share contract 
        if (eventObject.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
            eventObject.setPromise(WinJS.UI.processAll());

            // We receive the ShareOperation object as part of the eventArgs 
            shareOperation = eventObject.detail.shareOperation;

            // We queue an asychronous event so that working with the ShareOperation object does not 
            // block or delay the return of the activation handler. 
            WinJS.Application.queueEvent({ type: "shareready" });
        }
    }

    /// <summary> 
    /// Handler executed when ready to share; handling the share operation should be performed 
    /// outside the activation handler 
    /// </summary> 
    function shareReady(eventArgs) {
        document.getElementById("title").innerText = shareOperation.data.properties.title;
        document.getElementById("description").innerText = shareOperation.data.properties.description;
    }

    /// <summary> 
    /// Use to simulate that an extended share operation has started 
    /// </summary> 
    function reportStarted() {
        shareOperation.reportStarted();
    }

    /// <summary> 
    /// Use to simulate that an extended share operation has retrieved the data 
    /// </summary> 
    function reportDataRetrieved() {
        shareOperation.reportDataRetrieved();
    }

    /// <summary> 
    /// Use to simulate that an extended share operation has reached the status "submittedToBackgroundManager" 
    /// </summary> 
    function reportSubmittedBackgroundTask() {
        shareOperation.reportSubmittedBackgroundTask();
    }

    /// <summary> 
    /// Submit for extended share operations. Can either report success or failure, and in case of success, can add a quicklink. 
    /// This does NOT take care of all the prerequisites (such as calling reportExtendedShareStatus(started)) before submitting. 
    /// </summary> 
    function reportError() {
        var errorText = document.getElementById("extendedShareErrorMessage").value;
        shareOperation.reportError(errorText);
    }

    /// <summary> 
    /// Call the reportCompleted API with the proper quicklink (if needed) 
    /// </summary> 
    function reportCompleted() {
        var applicationData = Windows.Storage.ApplicationData.current;
        var roamingFolder = applicationData.roamingFolder;
        var filename = "file" + Math.floor(Math.random() * 1024 * 1024);
        var jsonData = JSON.stringify({
            "title": shareOperation.data.properties.title,
        });
        WinJS.Application.roaming.writeText(filename, jsonData).done(
            function success() {
                applicationData.signalDataChanged();
            });

        shareOperation.reportCompleted();
    }

    /// <summary> 
    /// Expand/collapse the Extended Sharing div 
    /// </summary> 
    function expandoClick() {
        if (extendedSharingCollapsed) {
            document.getElementById("extendedSharing").className = "unhidden";
            // Set expando glyph to up arrow 
            document.getElementById("expandoGlyph").innerHTML = "&#57360;";
            extendedSharingCollapsed = false;
        } else {
            document.getElementById("extendedSharing").className = "hidden";
            // Set expando glyph to down arrow 
            document.getElementById("expandoGlyph").innerHTML = "&#57361;";
            extendedSharingCollapsed = true;
        }
    }

    /// <summary> 
    /// Expand/collapse the QuickLink fields 
    /// </summary> 
    function addQuickLinkChanged() {
        if (document.getElementById("addQuickLink").checked) {
            quickLinkFields.className = "unhidden";
        } else {
            quickLinkFields.className = "hidden";
            document.getElementById("quickLinkError").className = "hidden";
        }
    }

    // Initialize the activation handler 
    WinJS.Application.addEventListener("activated", activatedHandler, false);
    WinJS.Application.addEventListener("shareready", shareReady, false);
    WinJS.Application.start();

    function initialize() {
        document.getElementById("reportCompleted").addEventListener("click", /*@static_cast(EventListener)*/reportCompleted, false); 
    }

    document.addEventListener("DOMContentLoaded", initialize, false);
})();